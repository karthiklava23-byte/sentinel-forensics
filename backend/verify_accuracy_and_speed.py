import sys
import os
import time
import struct

backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

from app.services.pcap_forensics import parse_pcap_file
from app.database import db

def create_synthetic_pcap_with_dns_only():
    """Generates a binary PCAP file containing ONLY DNS queries and NO HTTP traffic."""
    pcap_header = struct.pack('<IHHIIII', 0xa1b2c3d4, 2, 4, 0, 0, 65535, 1) # Ethernet
    
    # Simple Ethernet + IP + UDP + DNS Packet
    # Eth (14) + IP (20) + UDP (8) + DNS (12 + payload)
    eth_header = b'\x00\x11\x22\x33\x44\x55\x66\x77\x88\x99\xaa\xbb\x08\x00'
    ip_header = b'\x45\x00\x00\x38\x00\x01\x00\x00\x40\x11\x00\x00\xc0\xa8\x01\x69\x08\x08\x08\x08'
    udp_header = b'\xc0\x00\x00\x35\x00\x24\x00\x00'
    dns_payload = b'\x12\x34\x01\x00\x00\x01\x00\x00\x00\x00\x00\x00\x07example\x03com\x00\x00\x01\x00\x01'
    
    packet_data = eth_header + ip_header + udp_header + dns_payload
    pkt_header = struct.pack('<IIII', 1700000000, 0, len(packet_data), len(packet_data))
    
    return pcap_header + pkt_header + packet_data

def test_pcap_accuracy():
    print("=== TESTING PCAP 100% GENUINE BINARY ACCURACY ===")
    
    dns_only_pcap_bytes = create_synthetic_pcap_with_dns_only()
    result = parse_pcap_file(dns_only_pcap_bytes, "dns_only_test.pcap")
    
    print(f"Total Packets Parsed: {result['total_packets']}")
    print(f"Protocol Ratios: {result['protocols']}")
    print(f"HTTP Requests Found: {len(result['http_requests'])}")
    print(f"DNS Queries Found: {result['dns_queries']}")
    
    # Assertions
    assert result['total_packets'] == 1, f"Expected 1 packet, got {result['total_packets']}"
    assert result['protocols']['HTTP'] == 0, f"Expected 0 HTTP count, got {result['protocols']['HTTP']}"
    assert len(result['http_requests']) == 0, f"Expected 0 HTTP requests, got {len(result['http_requests'])}"
    assert result['protocols']['DNS'] == 1, f"Expected 1 DNS count, got {result['protocols']['DNS']}"
    assert "example.com" in result['dns_queries'], f"Expected 'example.com' in DNS queries, got {result['dns_queries']}"
    
    print("\n[SUCCESS] PCAP Binary Parsing Accuracy Verified! ZERO fake HTTP data generated on non-HTTP capture.")

def test_database_speed():
    print("\n=== TESTING DB & AUTH SPEED ===")
    start_t = time.time()
    user = db.find_one("users", {"email": "karthiklava23@gmail.com"})
    elapsed = (time.time() - start_t) * 1000
    print(f"[+] User lookup time: {elapsed:.2f} ms")
    assert elapsed < 100.0, f"DB lookup too slow ({elapsed:.2f} ms)"
    print("[SUCCESS] Fast database performance confirmed!")

if __name__ == "__main__":
    test_pcap_accuracy()
    test_database_speed()
