// ui
"use client";
import * as THREE from 'three';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Html } from '@react-three/drei';
import { useEffect, useState, useRef } from 'react';
import PacketCar from './PacketCar';
import Building from './Building';

interface PacketData {
    id: string; src: string; dst: string; type: string; color: string; len: number; flags: string;
    start: [number, number, number]; end: [number, number, number];
}

const BUILDINGS: Record<string, [number, number, number]> = {
  "My PC": [-10, 0, -10],
  "Google": [10, 0, -10],
  "Hacker": [-10, 0, 10],
  "Server": [10, 0, 10],
  "Router": [0, 0, 0]
};

const TOUR_STEPS = [
  {
    target: "My PC",
    title: "WELCOME TO PACKET CITY",
    text: "This is a live simulation. We are currently observing the 'Physical Layer' of your network.",
    mode: "NORMAL"
  },
  {
    target: "Router",
    title: "NORMAL TRAFFIC",
    text: "In a healthy network, traffic flows from 'My PC' to the central 'Router', which sends it to the internet.",
    mode: "NORMAL"
  },
  {
    target: "Hacker",
    title: "DDoS ATTACK",
    text: "The Hacker is flooding the Server with UDP garbage to crash it. Notice the volume of RED packets.",
    mode: "DDOS"
  },
  {
    target: "My PC",
    title: "PORT SCANNING",
    text: "The attacker is probing your ports (doors) to find vulnerabilities. Purple packets indicate a scan.",
    mode: "SCAN"
  },
  {
    target: "Server",
    title: "SQL INJECTION",
    text: "Yellow packets represent malicious database commands (SQLi) trying to bypass the login screen.",
    mode: "SQLI"
  },
  {
    target: "Hacker",
    title: "MAN-IN-THE-MIDDLE",
    text: "Notice the change? Traffic is detouring to the Hacker node before reaching the Router. They are reading your data.",
    mode: "MITM"
  },
  {
    target: "Server",
    title: "ACTIVE DEFENSE",
    text: "You are not helpless! When an attack is detected, read the THREAT INTELLIGENCE LOG (bottom center) to find the correct countermeasure.",
    mode: "DDOS"
  },
  {
    target: "Google",
    title: "YOU HAVE CONTROL",
    text: "Tour complete. You are now the Admin. Good luck.",
    mode: "NORMAL"
  }
];

export default function Home() {
  // STATE
  const [packets, setPackets] = useState<PacketData[]>([]);
  const [mode, setMode] = useState("NORMAL");
  const [isConnected, setIsConnected] = useState(false);
  
  const [firewallRules, setFirewallRules] = useState<string[]>([]);
  const [alertMessage, setAlertMessage] = useState(""); 
  const [alertStatus, setAlertStatus] = useState<"neutral" | "warning" | "success">("neutral");
  
  const [tourStep, setTourStep] = useState(0); 
  const [showTour, setShowTour] = useState(true); 
  
  const [selectedPacket, setSelectedPacket] = useState<PacketData | null>(null);

  const wsRef = useRef<WebSocket | null>(null);

  const switchMode = (newMode: string) => {
    setMode(newMode);
    
    if (newMode === "NORMAL") {
        setFirewallRules([]);
    }
    
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ action: "SET_MODE", value: newMode }));
    }
  };

  useEffect(() => {
    if (mode === "NORMAL") {
        setAlertMessage("SYSTEM NORMAL. Monitoring traffic flow...");
        setAlertStatus("neutral");
        return;
    }

    if (mode === "DDOS") {
        if (firewallRules.includes("BLOCK_UDP")) {
            setAlertMessage("✅ THREAT MITIGATED: UDP Flood blocked by Firewall.\n>> Server Load: Stabilizing to 12%.");
            setAlertStatus("success");
        } else {
            setAlertMessage("⚠️ CRITICAL: UDP FLOOD DETECTED. Server load at 99%. \n>> RECOMMENDATION: Enable UDP Blocking immediately.");
            setAlertStatus("warning");
        }
    } 
    
    else if (mode === "SCAN") {
        if (firewallRules.includes("BLOCK_ICMP")) {
            setAlertMessage("✅ THREAT MITIGATED: Port Scan signature dropped.\n>> Attacker IP has been blacklisted.");
            setAlertStatus("success");
        } else {
            setAlertMessage("⚠️ WARNING: SUSPICIOUS ACTIVITY. Sequential port access detected. \n>> RECOMMENDATION: Block ICMP/SYN requests.");
            setAlertStatus("warning");
        }
    } 
    
    // Other Attacks (No firewall fix)
    else if (mode === "SQLI") {
        setAlertMessage("⚠️ ALERT: MALICIOUS PAYLOAD (SQLi). \n>> NOTE: Firewalls cannot stop this. You must patch the code.");
        setAlertStatus("warning");
    } 
    else if (mode === "MITM") {
        setAlertMessage("⚠️ PRIVACY BREACH: Man-in-the-Middle detected. \n>> NOTE: Network layer compromised. Use VPN.");
        setAlertStatus("warning");
    }

  }, [mode, firewallRules]);


  // 3. Tour Handler
  const nextTourStep = () => {
    const next = tourStep + 1;
    if (next < TOUR_STEPS.length) {
      setTourStep(next);
      switchMode(TOUR_STEPS[next].mode);
    } else {
      setShowTour(false); 
    }
  };

  // 4. Firewall Toggle
  const toggleFirewallRule = (rule: string) => {
    setFirewallRules(prev => 
      prev.includes(rule) ? prev.filter(r => r !== rule) : [...prev, rule]
    );
  };

  // 5. WebSocket Connection
  useEffect(() => {
    const ws = new WebSocket("ws://localhost:8000/ws");
    wsRef.current = ws;

    ws.onopen = () => setIsConnected(true);
    ws.onclose = () => setIsConnected(false);

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      const startPos = BUILDINGS[data.src] || [0,0,0];
      const endPos = BUILDINGS[data.dst] || [0,0,0];

      setPackets(prev => {
         if (prev.find(p => p.id === data.id)) return prev;
         return [...prev, { ...data, start: startPos, end: endPos }];
      });
    };

    return () => ws.close();
  }, []);

  const currentTourPos = BUILDINGS[TOUR_STEPS[tourStep].target];

  return (
    <div className="flex h-screen w-screen bg-black text-white font-mono overflow-hidden relative">
      
      {/* --- LEFT SIDEBAR --- */}
      <div className="w-64 bg-gray-900 border-r border-gray-800 p-4 z-10 flex flex-col gap-6">
        <div>
            <h1 className="text-xl font-bold text-green-500 mb-1">PACKET CITY v1</h1>
            <div className="flex items-center gap-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className={isConnected ? "text-green-400" : "text-red-400"}>{isConnected ? "SYSTEM ONLINE" : "DISCONNECTED"}</span>
            </div>
        </div>

        {/* SCENARIO SELECTOR */}
        <div className="space-y-2">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Scenarios</h2>
            {[
              { id: "NORMAL", label: "🟢 Normal Traffic" },
              { id: "DDOS", label: "🔴 DDoS Attack" },
              { id: "SCAN", label: "🟣 Port Scan" },
              { id: "SQLI", label: "🟡 SQL Injection" },
              { id: "MITM", label: "💗 Man-in-Middle" }
            ].map((item) => (
              <div key={item.id} className="flex gap-1">
                  <button 
                      onClick={() => switchMode(item.id)}
                      className={`flex-1 text-left px-3 py-2 text-sm border transition-all ${mode === item.id ? "border-green-500 bg-green-500/20 text-white" : "border-gray-700 text-gray-400 hover:border-gray-500"}`}
                  >
                      {item.label}
                  </button>
                  <a href={`/learn/${item.id.toLowerCase()}`} target="_blank" className="px-3 py-2 border border-gray-700 hover:bg-gray-800 text-xs flex items-center justify-center text-gray-400 hover:text-white transition-colors" title="Read Guide">
                    ?
                  </a>
              </div>
            ))}
        </div>
        
        {/* Restart Tour */}
        <button onClick={() => { setTourStep(0); setShowTour(true); switchMode("NORMAL"); }} className="border border-gray-600 text-gray-400 text-xs py-2 hover:bg-gray-800 transition-colors">
           ? RESTART TOUR
        </button>

        {/* PROTOCOL GUIDE (UPDATED) */}
        <div className="mt-auto space-y-3 border-t border-gray-800 pt-4">
            <h2 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Protocol Guide</h2>
            {/* TCP */}
            <div className="group relative flex items-center gap-2">
                <a href="/learn/tcp" target="_blank" className="flex items-center gap-2 text-xs text-gray-300 hover:text-cyan-400 transition-colors cursor-pointer w-full">
                    <div className="w-3 h-3 bg-cyan-400 rounded-[1px]"></div>
                    <span>TCP (Web/Email)</span>
                    <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100">↗</span>
                </a>
                <div className="absolute left-full bottom-0 ml-2 w-48 bg-gray-900 border border-cyan-500 p-3 text-xs hidden group-hover:block z-50 shadow-xl pointer-events-none">
                    <strong className="block text-cyan-400 mb-1">Reliable Transport</strong>
                    Like a certified letter. Guarantees delivery. Click to learn more.
                </div>
            </div>
            {/* UDP */}
            <div className="group relative flex items-center gap-2">
                <a href="/learn/udp" target="_blank" className="flex items-center gap-2 text-xs text-gray-300 hover:text-orange-400 transition-colors cursor-pointer w-full">
                    <div className="w-3 h-3 bg-orange-400 rounded-[1px]"></div>
                    <span>UDP (Streaming)</span>
                    <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100">↗</span>
                </a>
                <div className="absolute left-full bottom-0 ml-2 w-48 bg-gray-900 border border-orange-500 p-3 text-xs hidden group-hover:block z-50 shadow-xl pointer-events-none">
                    <strong className="block text-orange-400 mb-1">Fast Transport</strong>
                    Fast but unreliable. Click to learn more.
                </div>
            </div>
            {/* MALICIOUS */}
            <div className="group relative flex items-center gap-2">
                <a href="/learn/malicious" target="_blank" className="flex items-center gap-2 text-xs text-gray-300 hover:text-red-500 transition-colors cursor-pointer w-full">
                    <div className="w-3 h-3 bg-red-600 rounded-[1px]"></div>
                    <span>Malicious</span>
                    <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100">↗</span>
                </a>
                <div className="absolute left-full bottom-0 ml-2 w-48 bg-gray-900 border border-red-500 p-3 text-xs hidden group-hover:block z-50 shadow-xl pointer-events-none">
                    <strong className="block text-red-500 mb-1">Attack Signature</strong>
                    High-volume floods or unauthorized scans. Click to learn more.
                </div>
            </div>
            {/* MITM / INTERCEPTED (NEW) */}
            <div className="group relative flex items-center gap-2">
                <a href="/learn/mitm" target="_blank" className="flex items-center gap-2 text-xs text-gray-300 hover:text-pink-500 transition-colors cursor-pointer w-full">
                    <div className="w-3 h-3 bg-pink-500 rounded-[1px] shadow-[0_0_5px_#ec4899]"></div>
                    <span>Intercepted</span>
                    <span className="ml-auto text-[10px] opacity-0 group-hover:opacity-100">↗</span>
                </a>
                <div className="absolute left-full bottom-0 ml-2 w-48 bg-gray-900 border border-pink-500 p-3 text-xs hidden group-hover:block z-50 shadow-xl pointer-events-none">
                    <strong className="block text-pink-500 mb-1">Compromised Data</strong>
                    Traffic being secretly rerouted through a hacker node. Click to learn more.
                </div>
            </div>
        </div>
      </div>

      {/* --- INTELLIGENCE LOG (Dynamic Colors) --- */}
      {alertMessage && (
        <div className={`absolute bottom-32 left-1/2 transform -translate-x-1/2 w-[500px] bg-black/80 border-l-4 p-4 font-mono text-xs shadow-lg backdrop-blur-md z-30 transition-colors duration-500
            ${alertStatus === "success" ? "border-green-500" : "border-yellow-500"}
        `}>
            <h3 className={`font-bold mb-1 flex items-center gap-2
                ${alertStatus === "success" ? "text-green-400" : "text-yellow-500"}
            `}>
                <span className={alertStatus === "warning" ? "animate-pulse" : ""}>
                    {alertStatus === "success" ? "🛡️" : "●"}
                </span> 
                {alertStatus === "success" ? "SYSTEM SECURED" : "THREAT INTELLIGENCE"}
            </h3>
            <p className="text-gray-300 whitespace-pre-line leading-relaxed">
                {alertMessage}
            </p>
        </div>
      )}

      {/* --- FIREWALL CONTROL PANEL --- */}
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900/90 border-2 border-blue-500 p-4 rounded-xl shadow-[0_0_20px_rgba(0,100,255,0.3)] z-40">
        <div className="flex items-center gap-4 mb-2">
          <h2 className="text-blue-400 font-bold text-lg uppercase tracking-widest">🛡️ Active Defense System</h2>
          <div className={`text-xs px-2 py-1 rounded ${firewallRules.length > 0 ? 'bg-blue-600 text-white' : 'bg-gray-700 text-gray-400'}`}>
            STATUS: {firewallRules.length > 0 ? "PROTECTED" : "VULNERABLE"}
          </div>
        </div>

        <div className="flex gap-2">
           {/* Rule 1: Block UDP */}
           <button 
             onClick={() => toggleFirewallRule("BLOCK_UDP")}
             className={`px-4 py-2 text-xs font-bold rounded border transition-all ${
               firewallRules.includes("BLOCK_UDP") 
               ? "bg-blue-600 border-blue-400 text-white shadow-[0_0_10px_#0088ff]" 
               : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700"
             }`}
           >
             [X] BLOCK UDP FLOOD
           </button>

           {/* Rule 2: Block ICMP */}
           <button 
             onClick={() => toggleFirewallRule("BLOCK_ICMP")}
             className={`px-4 py-2 text-xs font-bold rounded border transition-all ${
               firewallRules.includes("BLOCK_ICMP") 
               ? "bg-purple-600 border-purple-400 text-white shadow-[0_0_10px_#d946ef]" 
               : "bg-gray-800 border-gray-600 text-gray-400 hover:bg-gray-700"
             }`}
           >
             [X] BLOCK PORT SCANS
           </button>
        </div>
      </div>

      {/* --- 3D SCENE --- */}
      <div className="flex-1 relative">
        <Canvas camera={{ position: [0, 15, 20], fov: 60 }}>
          <ambientLight intensity={0.5} />
          <pointLight position={[10, 10, 10]} />
          <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
          <OrbitControls enablePan={false} maxPolarAngle={Math.PI / 2} />

          {/* Render Buildings */}
          {Object.entries(BUILDINGS).map(([name, pos]) => {
            // SMART SHIELD LOGIC
            const showShield = 
              (name === "Server" && firewallRules.includes("BLOCK_UDP")) ||
              (name === "My PC" && firewallRules.includes("BLOCK_ICMP"));

            return (
              <Building 
                  key={name} 
                  pos={pos} 
                  name={name} 
                  // Target highlighting logic
                  isTarget={(mode === "DDOS" && name === "Server") || (mode === "SCAN" && name === "My PC")} 
                  // Smart Shield
                  hasFirewall={showShield}
              />
            );
          })}

          {/* Render Packets */}
          {packets.map(p => (
            <PacketCar 
              key={p.id} 
              data={p}
              startPos={p.start} 
              endPos={p.end} 
              color={p.color}
              firewallRules={firewallRules} 
              onArrive={() => setPackets(prev => prev.filter(x => x.id !== p.id))}
              onClick={(data) => setSelectedPacket(data)}
            />
          ))}

          {/* --- THE FLOATING TOUR GUIDE --- */}
          {showTour && (
            <Html 
              position={[currentTourPos[0], currentTourPos[1] + 6, currentTourPos[2]]} 
              center 
              zIndexRange={[100, 0]}
            >
              <div className="w-96 bg-black/90 border border-green-500 p-5 shadow-[0_0_30px_rgba(0,255,0,0.3)] backdrop-blur-md rounded-lg animate-bounce-slow relative">
                
                {/* SKIP BUTTON */}
                <button 
                  onClick={() => setShowTour(false)}
                  className="absolute top-2 right-2 text-[10px] text-gray-500 hover:text-white border border-gray-700 px-2 py-1 rounded transition-colors"
                >
                  SKIP INTRO ✕
                </button>

                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-4 h-4 bg-black border-r border-b border-green-500 rotate-45"></div>

                <div className="flex justify-between items-start mb-3">
                   <h3 className="text-green-400 font-bold text-xl">{TOUR_STEPS[tourStep].title}</h3>
                   <span className="text-xs text-gray-500 pt-1">{tourStep + 1}/{TOUR_STEPS.length}</span>
                </div>
                
                <p className="text-gray-300 text-sm mb-5 leading-relaxed">
                  {TOUR_STEPS[tourStep].text}
                </p>

                <div className="flex gap-2">
                  <a 
                    href={`/learn/${TOUR_STEPS[tourStep].mode.toLowerCase()}`}
                    target="_blank"
                    className="flex-1 bg-gray-800 hover:bg-gray-700 text-white text-xs font-bold py-3 rounded border border-gray-600 transition text-center flex items-center justify-center"
                  >
                    READ GUIDE ↗
                  </a>

                  <button 
                    onClick={nextTourStep}
                    className="flex-1 bg-green-600 hover:bg-green-500 text-black text-xs font-bold py-3 rounded shadow-[0_0_15px_rgba(0,255,0,0.4)] transition-all transform hover:scale-105"
                  >
                    {tourStep === TOUR_STEPS.length - 1 ? "START SIMULATION" : "NEXT >>"}
                  </button>
                </div>
              </div>
            </Html>
          )}

        </Canvas>
      </div>

      {/* --- PACKET INSPECTOR --- */}
      {selectedPacket && (
        <div className="absolute top-4 right-4 w-80 bg-gray-900 border border-green-500 p-4 text-green-400 font-mono z-50 shadow-lg rounded">
          <h2 className="text-xl font-bold mb-2 border-b border-green-700 pb-2">PACKET INSPECTOR</h2>
          <div className="space-y-3">
            <div>
              <span className="text-gray-400 block text-xs">PROTOCOL</span>
              <span className="text-lg font-bold">{selectedPacket.type}</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div><span className="text-gray-400 block text-xs">SOURCE</span>{selectedPacket.src}</div>
              <div><span className="text-gray-400 block text-xs">DEST</span>{selectedPacket.dst}</div>
            </div>
            <div>
              <span className="text-gray-400 block text-xs">SIZE</span>
              {selectedPacket.len} bytes
            </div>
          </div>
          <button 
            className="mt-4 w-full bg-green-900 hover:bg-green-800 text-white py-1 text-sm rounded transition"
            onClick={() => setSelectedPacket(null)}
          >
            CLOSE
          </button>
        </div>
      )}
    </div>
  );
}