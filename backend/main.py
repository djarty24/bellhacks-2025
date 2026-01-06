# generates traffic data based on the current mode
from fastapi import FastAPI, WebSocket
from scapy.all import IP, TCP, UDP
import asyncio
import random
import uuid
import json

app = FastAPI()

CURRENT_MODE = "NORMAL"

async def packet_generator(websocket: WebSocket):
    """Generates fake traffic based on the current mode"""
    while True:
        await asyncio.sleep(0.1 if CURRENT_MODE == "DDOS" else 0.5)
        
        src, dst, color, type_ = "", "", "", ""
        
        if CURRENT_MODE == "NORMAL":
            src = "My PC"
            dst = "Router"
            is_tcp = random.random() > 0.3
            type_ = "TCP" if is_tcp else "UDP"
            color = "cyan" if is_tcp else "orange"   
                     
        elif CURRENT_MODE == "DDOS":
            src = "Hacker"
            dst = "Server"
            type_ = "UDP"
            color = "red"
            
        elif CURRENT_MODE == "SCAN":
            src = "Hacker"
            dst = "My PC"
            type_ = "TCP (SYN)"
            color = "purple"

        elif CURRENT_MODE == "SQLI":
            src = "Hacker"
            dst = "Server"
            type_ = "HTTP (Malicious)"
            color = "yellow"

        elif CURRENT_MODE == "MITM":
            src = "My PC"
            dst = "Hacker"
            type_ = "HTTPS (Intercepted)"
            color = "magenta"

        packet_data = {
            "id": str(uuid.uuid4()),
            "src": src,
            "dst": dst,
            "type": type_,
            "len": random.randint(64, 1500),
            "flags": "S" if CURRENT_MODE == "SCAN" else "A",
            "color": color
        }
        
        try:
            await websocket.send_json(packet_data)
        except:
            break

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    global CURRENT_MODE
    await websocket.accept()
    
    generator_task = asyncio.create_task(packet_generator(websocket))
    
    try:
        while True:
            data = await websocket.receive_text()
            command = json.loads(data)
            
            if command["action"] == "SET_MODE":
                CURRENT_MODE = command["value"]
                print(f"Switched mode to: {CURRENT_MODE}")
                
    except Exception as e:
        generator_task.cancel()
        print("Client disconnected")