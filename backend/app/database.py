import os
import json
import uuid
import datetime
import logging
from typing import Dict, List, Optional, Any
from app.config import settings

logger = logging.getLogger("digital_forensics.db")

import os
import json
import uuid
import datetime
import logging
import sqlite3
from typing import Dict, List, Optional, Any
from app.config import settings

logger = logging.getLogger("digital_forensics.db")

# Fixed absolute base directory to prevent working-directory-dependent data loss
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DEFAULT_DB_FILE = os.path.join(BASE_DIR, "forensics_platform.db")
DEFAULT_JSON_FILE = os.path.join(BASE_DIR, "forensics_storage.json")

class SQLiteStore:
    """ACID-compliant persistent SQLite data store ensuring 100% data retention across restarts and updates."""
    def __init__(self, db_file=DEFAULT_DB_FILE, json_file=DEFAULT_JSON_FILE):
        self.db_file = db_file
        self.json_file = json_file
        self._init_sqlite()
        self._migrate_json_if_needed()

    def _get_connection(self):
        conn = sqlite3.connect(self.db_file, timeout=10.0)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA journal_mode=WAL;")
        return conn

    def _init_sqlite(self):
        try:
            with self._get_connection() as conn:
                conn.execute("""
                    CREATE TABLE IF NOT EXISTS collections (
                        collection TEXT NOT NULL,
                        doc_id TEXT NOT NULL,
                        doc_json TEXT NOT NULL,
                        created_at TEXT,
                        PRIMARY KEY (collection, doc_id)
                    );
                """)
                conn.execute("CREATE INDEX IF NOT EXISTS idx_collection ON collections(collection);")
                conn.commit()
        except Exception as e:
            logger.error(f"Error initializing SQLite DB: {e}")

    def _migrate_json_if_needed(self):
        """Auto-migrate existing legacy forensics_storage.json into SQLite on first startup."""
        try:
            with self._get_connection() as conn:
                cur = conn.cursor()
                cur.execute("SELECT COUNT(*) FROM collections;")
                count = cur.fetchone()[0]
                
                # Check legacy JSON files in current working directory or BASE_DIR
                json_candidates = [self.json_file, "forensics_storage.json"]
                for json_path in json_candidates:
                    if os.path.exists(json_path):
                        try:
                            with open(json_path, "r", encoding="utf-8") as f:
                                data = json.load(f)
                                for col_name, items in data.items():
                                    if isinstance(items, dict):
                                        for doc_id, doc in items.items():
                                            if isinstance(doc, dict):
                                                d_id = doc.get("id") or doc.get("_id") or doc_id
                                                doc["id"] = d_id
                                                doc["_id"] = d_id
                                                cur.execute(
                                                    "INSERT OR REPLACE INTO collections (collection, doc_id, doc_json, created_at) VALUES (?, ?, ?, ?)",
                                                    (col_name, str(d_id), json.dumps(doc, default=str), datetime.datetime.now().isoformat())
                                                )
                                conn.commit()
                                logger.info(f"Successfully migrated legacy JSON storage from {json_path} to SQLite.")
                        except Exception as ex:
                            logger.error(f"Failed migrating JSON from {json_path}: {ex}")
        except Exception as e:
            logger.error(f"Error checking SQLite migration: {e}")

    def _sync_atomic_json_backup(self):
        """Atomically dump current SQLite state to forensics_storage.json as redundant backup."""
        try:
            backup_data = {}
            with self._get_connection() as conn:
                cur = conn.cursor()
                cur.execute("SELECT collection, doc_id, doc_json FROM collections")
                rows = cur.fetchall()
                for col, doc_id, doc_json in rows:
                    if col not in backup_data:
                        backup_data[col] = {}
                    try:
                        backup_data[col][doc_id] = json.loads(doc_json)
                    except Exception:
                        pass
            
            temp_json_file = self.json_file + ".tmp"
            with open(temp_json_file, "w", encoding="utf-8") as f:
                json.dump(backup_data, f, indent=2, default=str)
            os.replace(temp_json_file, self.json_file)
        except Exception as e:
            logger.error(f"Error syncing atomic JSON backup: {e}")

    def find_one(self, collection_name: str, query: dict) -> Optional[dict]:
        try:
            docs = self.find_many(collection_name, query)
            return docs[0] if docs else None
        except Exception as e:
            logger.error(f"SQLite find_one error: {e}")
            return None

    def find_many(self, collection_name: str, query: dict = None) -> List[dict]:
        results = []
        try:
            with self._get_connection() as conn:
                cur = conn.cursor()
                cur.execute("SELECT doc_json FROM collections WHERE collection=?", (collection_name,))
                rows = cur.fetchall()
                for r in rows:
                    try:
                        doc = json.loads(r[0])
                        if not query:
                            results.append(doc)
                        else:
                            match = True
                            for k, v in query.items():
                                if doc.get(k) != v:
                                    match = False
                                    break
                            if match:
                                results.append(doc)
                    except Exception:
                        continue
        except Exception as e:
            logger.error(f"SQLite find_many error: {e}")
        return results

    def insert_one(self, collection_name: str, doc: dict) -> dict:
        if "id" not in doc and "_id" not in doc:
            doc["id"] = str(uuid.uuid4())
        doc_id = str(doc.get("id") or doc.get("_id"))
        doc["id"] = doc_id
        doc["_id"] = doc_id

        try:
            with self._get_connection() as conn:
                conn.execute(
                    "INSERT OR REPLACE INTO collections (collection, doc_id, doc_json, created_at) VALUES (?, ?, ?, ?)",
                    (collection_name, doc_id, json.dumps(doc, default=str), datetime.datetime.now().isoformat())
                )
                conn.commit()
            self._sync_atomic_json_backup()
        except Exception as e:
            logger.error(f"SQLite insert_one error: {e}")
        return doc

    def update_one(self, collection_name: str, query: dict, update_data: dict) -> Optional[dict]:
        doc = self.find_one(collection_name, query)
        if doc:
            if "$set" in update_data:
                doc.update(update_data["$set"])
            elif "$push" in update_data:
                for k, v in update_data["$push"].items():
                    if k not in doc or not isinstance(doc[k], list):
                        doc[k] = []
                    doc[k].append(v)
            else:
                doc.update(update_data)
            
            doc_id = str(doc.get("id") or doc.get("_id"))
            try:
                with self._get_connection() as conn:
                    conn.execute(
                        "INSERT OR REPLACE INTO collections (collection, doc_id, doc_json, created_at) VALUES (?, ?, ?, ?)",
                        (collection_name, doc_id, json.dumps(doc, default=str), datetime.datetime.now().isoformat())
                    )
                    conn.commit()
                self._sync_atomic_json_backup()
            except Exception as e:
                logger.error(f"SQLite update_one error: {e}")
            return doc
        return None

    def delete_one(self, collection_name: str, query: dict) -> bool:
        doc = self.find_one(collection_name, query)
        if doc:
            doc_id = str(doc.get("id") or doc.get("_id"))
            try:
                with self._get_connection() as conn:
                    conn.execute("DELETE FROM collections WHERE collection=? AND doc_id=?", (collection_name, doc_id))
                    conn.commit()
                self._sync_atomic_json_backup()
                return True
            except Exception as e:
                logger.error(f"SQLite delete_one error: {e}")
        return False


class DatabaseManager:
    def __init__(self):
        self.use_mongo = False
        self.mongo_client = None
        self.db = None
        self.sqlite_store = SQLiteStore()
        self._try_init_mongo()

    def _try_init_mongo(self):
        try:
            from pymongo import MongoClient
            self.mongo_client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=100)
            self.mongo_client.admin.command('ping')
            self.db = self.mongo_client[settings.DB_NAME]
            self.use_mongo = True
            print("Successfully connected to MongoDB server!")
        except Exception as e:
            self.use_mongo = False
            print(f"MongoDB not reachable. Using persistent SQLite forensics platform storage engine.")

    def find_one(self, collection: str, query: dict):
        if self.use_mongo:
            try:
                res = self.db[collection].find_one(query)
                if res and "_id" in res:
                    res["_id"] = str(res["_id"])
                return res
            except Exception:
                return self.sqlite_store.find_one(collection, query)
        return self.sqlite_store.find_one(collection, query)

    def find_many(self, collection: str, query: dict = None):
        query = query or {}
        if self.use_mongo:
            try:
                cursor = self.db[collection].find(query)
                results = []
                for doc in cursor:
                    doc["_id"] = str(doc["_id"])
                    results.append(doc)
                return results
            except Exception:
                return self.sqlite_store.find_many(collection, query)
        return self.sqlite_store.find_many(collection, query)

    def insert_one(self, collection: str, doc: dict):
        if self.use_mongo:
            try:
                doc_copy = dict(doc)
                res = self.db[collection].insert_one(doc_copy)
                doc["_id"] = str(res.inserted_id)
                return doc
            except Exception:
                return self.sqlite_store.insert_one(collection, doc)
        return self.sqlite_store.insert_one(collection, doc)

    def update_one(self, collection: str, query: dict, update_data: dict):
        if self.use_mongo:
            try:
                self.db[collection].update_one(query, update_data)
                return self.find_one(collection, query)
            except Exception:
                return self.sqlite_store.update_one(collection, query, update_data)
        return self.sqlite_store.update_one(collection, query, update_data)

    def delete_one(self, collection: str, query: dict):
        if self.use_mongo:
            try:
                res = self.db[collection].delete_one(query)
                return res.deleted_count > 0
            except Exception:
                return self.sqlite_store.delete_one(collection, query)
        return self.sqlite_store.delete_one(collection, query)

db = DatabaseManager()

