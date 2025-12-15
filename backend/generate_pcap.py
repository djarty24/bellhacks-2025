from scapy.all import wrpcap, Ether, IP, TCP, UDP
import random

def generate_traffic():
    packets = []
    print("Generating normal traffic...")
    
    # 1. Generate normal background traffic (HTTP/HTTPS)
    for _ in range(50):
        # Random normal web browsing
        pkt = Ether()/IP(src="192.168.1.5", dst="142.250.1.1")/TCP(sport=random.randint(1024,65535), dport=443, flags="A")
        packets.append(pkt)

    print("Generating ATTACK traffic...")
    # 2. Generate a "Port Scan" (One IP hitting many ports)
    attacker_ip = "10.0.0.66"
    target_ip = "192.168.1.5"
    
    for port in range(20, 100):
        # SYN packets (Red flag for scanning)
        pkt = Ether()/IP(src=attacker_ip, dst=target_ip)/TCP(dport=port, flags="S")
        packets.append(pkt)

    # 3. Generate a "DDoS" burst (Many IPs hitting one target)
    print("Generating DDoS burst...")
    for _ in range(100):
        fake_ip = f"1.1.{random.randint(1,255)}.{random.randint(1,255)}"
        pkt = Ether()/IP(src=fake_ip, dst=target_ip)/UDP(dport=80)/("X"*100) # Payload padding
        packets.append(pkt)

    print(f"Saving {len(packets)} packets to demo.pcap...")
    wrpcap("demo.pcap", packets)
    print("Done! You can now run main.py in REPLAY mode.")

if __name__ == "__main__":
    generate_traffic()