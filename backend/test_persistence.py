import sys
import os
import time

# Ensure backend root is in sys.path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.database import db

def test_system_persistence():
    print("=== STARTING SYSTEM PERSISTENCE VERIFICATION TEST ===")

    # Step 1: Create test records across collections
    unique_marker = f"PERSIST_TEST_{int(time.time())}"
    
    test_case = {
        "title": f"Persistence Test Case {unique_marker}",
        "description": "Testing live data persistence across server restarts and updates.",
        "category": "Persistence Audit",
        "created_by": "karthiklava23@gmail.com",
        "created_at": "2026-08-12 21:00:00",
        "status": "OPEN",
        "priority": "HIGH"
    }
    inserted_case = db.insert_one("cases", test_case)
    case_id = inserted_case["id"]
    print(f"[+] Created test case ID: {case_id}")

    test_log = {
        "user_email": "karthiklava23@gmail.com",
        "action": "PERSISTENCE_TEST_EXECUTION",
        "details": f"Verified atomic persistence engine for marker {unique_marker}",
        "timestamp": "2026-08-12 21:00:01"
    }
    db.insert_one("logs", test_log)
    print("[+] Recorded test security audit log entry.")

    test_alert = {
        "id": f"ALT-PERSIST-{int(time.time())}",
        "title": f"Test Persistence Alert {unique_marker}",
        "source": "EDR Persistence Test",
        "severity": "CRITICAL",
        "status": "TRIAGED",
        "triaged_by": "karthiklava23@gmail.com"
    }
    db.insert_one("analyst_alerts", test_alert)
    print(f"[+] Recorded test analyst alert ID: {test_alert['id']}")

    # Step 2: Re-instantiate DatabaseManager to simulate complete server update / restart
    print("\n[...] Simulating server update / restart by re-initializing DatabaseManager...")
    from app.database import DatabaseManager
    restarted_db = DatabaseManager()

    # Step 3: Verify records survived restart
    found_case = restarted_db.find_one("cases", {"id": case_id})
    found_logs = restarted_db.find_many("logs", {"action": "PERSISTENCE_TEST_EXECUTION"})
    found_alert = restarted_db.find_one("analyst_alerts", {"id": test_alert["id"]})

    assert found_case is not None, "FAILED: Test case lost after restart!"
    assert found_case["title"] == test_case["title"], "FAILED: Case title mismatch after restart!"
    assert len(found_logs) > 0, "FAILED: Security audit log lost after restart!"
    assert found_alert is not None, "FAILED: Analyst alert status lost after restart!"
    assert found_alert["status"] == "TRIAGED", "FAILED: Alert triage status corrupted!"

    print("\n[SUCCESS] 100% Data Persistence Verified!")
    print(f"  - Case History Preserved: {found_case['title']}")
    print(f"  - Audit Log Preserved: {found_logs[0]['details']}")
    print(f"  - Alert State Preserved: {found_alert['id']} (Status: {found_alert['status']})")
    print(f"  - Database SQLite File: {restarted_db.sqlite_store.db_file}")

if __name__ == "__main__":
    test_system_persistence()
