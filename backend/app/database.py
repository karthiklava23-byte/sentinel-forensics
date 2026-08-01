import os
import json
import uuid
import datetime
import logging
from typing import Dict, List, Optional, Any
from app.config import settings

logger = logging.getLogger("digital_forensics.db")

class MemoryStore:
    """Fallback in-memory and persistent JSON data store when MongoDB is not active."""
    def __init__(self, data_file="forensics_storage.json"):
        self.data_file = data_file
        self.collections: Dict[str, Dict[str, dict]] = {
            "users": {},
            "cases": {},
            "evidence": {},
            "logs": {}
        }
        self.load_from_disk()

    def load_from_disk(self):
        if os.path.exists(self.data_file):
            try:
                with open(self.data_file, "r", encoding="utf-8") as f:
                    data = json.load(f)
                    for col, items in data.items():
                        self.collections[col] = items
            except Exception as e:
                logger.error(f"Error loading disk storage: {e}")

    def save_to_disk(self):
        try:
            with open(self.data_file, "w", encoding="utf-8") as f:
                json.dump(self.collections, f, indent=2, default=str)
        except Exception as e:
            logger.error(f"Error writing to disk storage: {e}")

    def find_one(self, collection_name: str, query: dict) -> Optional[dict]:
        col = self.collections.get(collection_name, {})
        for doc in col.values():
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                return doc
        return None

    def find_many(self, collection_name: str, query: dict = None) -> List[dict]:
        col = self.collections.get(collection_name, {})
        if not query:
            return list(col.values())
        results = []
        for doc in col.values():
            match = True
            for k, v in query.items():
                if doc.get(k) != v:
                    match = False
                    break
            if match:
                results.append(doc)
        return results

    def insert_one(self, collection_name: str, doc: dict) -> dict:
        if "id" not in doc and "_id" not in doc:
            doc["id"] = str(uuid.uuid4())
        doc_id = doc.get("id") or str(doc.get("_id"))
        doc["_id"] = doc_id
        if collection_name not in self.collections:
            self.collections[collection_name] = {}
        self.collections[collection_name][doc_id] = doc
        self.save_to_disk()
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
            self.collections[collection_name][doc["_id"]] = doc
            self.save_to_disk()
            return doc
        return None

    def delete_one(self, collection_name: str, query: dict) -> bool:
        doc = self.find_one(collection_name, query)
        if doc:
            doc_id = doc["_id"]
            if doc_id in self.collections[collection_name]:
                del self.collections[collection_name][doc_id]
                self.save_to_disk()
                return True
        return False


class DatabaseManager:
    def __init__(self):
        self.use_mongo = False
        self.mongo_client = None
        self.db = None
        self.memory_store = MemoryStore()
        self._try_init_mongo()

    def _try_init_mongo(self):
        try:
            from pymongo import MongoClient
            self.mongo_client = MongoClient(settings.MONGO_URI, serverSelectionTimeoutMS=1500)
            # Check connection
            self.mongo_client.admin.command('ping')
            self.db = self.mongo_client[settings.DB_NAME]
            self.use_mongo = True
            print("Successfully connected to MongoDB server!")
        except Exception as e:
            self.use_mongo = False
            print(f"MongoDB not reachable ({e}). Using embedded local JSON forensics storage store.")

    def find_one(self, collection: str, query: dict):
        if self.use_mongo:
            try:
                res = self.db[collection].find_one(query)
                if res and "_id" in res:
                    res["_id"] = str(res["_id"])
                return res
            except Exception:
                return self.memory_store.find_one(collection, query)
        return self.memory_store.find_one(collection, query)

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
                return self.memory_store.find_many(collection, query)
        return self.memory_store.find_many(collection, query)

    def insert_one(self, collection: str, doc: dict):
        if self.use_mongo:
            try:
                doc_copy = dict(doc)
                res = self.db[collection].insert_one(doc_copy)
                doc["_id"] = str(res.inserted_id)
                return doc
            except Exception:
                return self.memory_store.insert_one(collection, doc)
        return self.memory_store.insert_one(collection, doc)

    def update_one(self, collection: str, query: dict, update_data: dict):
        if self.use_mongo:
            try:
                self.db[collection].update_one(query, update_data)
                return self.find_one(collection, query)
            except Exception:
                return self.memory_store.update_one(collection, query, update_data)
        return self.memory_store.update_one(collection, query, update_data)

    def delete_one(self, collection: str, query: dict):
        if self.use_mongo:
            try:
                res = self.db[collection].delete_one(query)
                return res.deleted_count > 0
            except Exception:
                return self.memory_store.delete_one(collection, query)
        return self.memory_store.delete_one(collection, query)

db = DatabaseManager()
