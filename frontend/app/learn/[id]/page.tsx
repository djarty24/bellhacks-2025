"use client";
import Link from 'next/link';
import { useParams } from 'next/navigation';

const ARTICLES: Record<string, { title: string; content: string; prevention: string; color: string }> = {
  "normal": {
    title: "Normal Network Traffic",
    color: "text-green-400",
    content: "The internet works by breaking data into small chunks called 'packets'. In a healthy network, traffic flows evenly between clients (PCs) and servers. Routers act as traffic cops, directing these packets to their destination.",
    prevention: "N/A - This is how the internet should work!"
  },
  "ddos": {
    title: "Distributed Denial of Service (DDoS)",
    color: "text-red-500",
    content: "A DDoS attack attempts to crash a web server by flooding it with too much traffic. Hackers use a 'Botnet' (thousands of infected computers) to send millions of fake requests at once.",
    prevention: "1. Rate Limiting (Blocking too many requests from one IP).\n2. Content Delivery Networks (CDNs).\n3. Blackholing (Dropping traffic from bad regions)."
  },
  "scan": {
    title: "Port Scanning",
    color: "text-purple-400",
    content: "Think of your computer as a house with 65,535 doors (ports). A Port Scan is like a burglar walking around your house checking every doorknob. Hackers use tools like 'Nmap' to find open services.",
    prevention: "1. Firewalls (Close ports you don't use).\n2. Intrusion Detection Systems (IDS).\n3. Change default ports."
  },
  "sqli": {
    title: "SQL Injection (SQLi)",
    color: "text-yellow-400",
    content: "Websites use SQL databases to store passwords. If a website doesn't check user input, a hacker can type database commands into a login box (e.g., ' OR 1=1 --) to trick the database into logging them in as Admin.",
    prevention: "1. Sanitize all user inputs.\n2. Use Prepared Statements (Parameterized Queries).\n3. Never trust data sent from the browser."
  },
  "mitm": {
    title: "Man-in-the-Middle (MitM)",
    color: "text-pink-500",
    content: "This occurs when a hacker sits between you and the Wi-Fi router. They broadcast a fake Wi-Fi network. When you connect, all your emails and passwords pass through their computer before going to the real internet.",
    prevention: "1. Always use HTTPS (Look for the lock icon).\n2. Avoid public unsecured Wi-Fi.\n3. Use a VPN."
  },

  "tcp": {
    title: "TCP (Transmission Control Protocol)",
    color: "text-cyan-400",
    content: "TCP is the polite perfectionist of the internet. Before sending data, it performs a 'Handshake' (SYN, SYN-ACK, ACK) to establish a connection. If a packet is lost, TCP notices and resends it. This guarantees 100% data integrity.",
    prevention: "Used for: Websites, Emails, File Transfers (where missing data = broken file)."
  },
  "udp": {
    title: "UDP (User Datagram Protocol)",
    color: "text-orange-400",
    content: "UDP is the speed demon. It fires packets as fast as possible without checking if they arrive. It has no handshake and no error checking. If a packet is lost, the video just glitches for a millisecond and keeps going.",
    prevention: "Used for: Live Video, Online Gaming, Voice Calls (where speed > perfection)."
  },
  "icmp": {
    title: "ICMP (Ping)",
    color: "text-gray-400",
    content: "ICMP is the diagnostic tool of the internet. It is used for 'Ping' commands to see if a computer is online. It doesn't carry data, just status messages like 'Echo Request' and 'Destination Unreachable'.",
    prevention: "Used for: Network troubleshooting (Ping, Traceroute)."
  },
  "malicious": {
    title: "Malicious Payloads",
    color: "text-red-600",
    content: "These are packets that contain harmful code or excessive requests. In our simulator, Red packets represent traffic that has been flagged by a firewall rule as dangerous.",
    prevention: "Blocked by: Firewalls, WAFs (Web Application Firewalls)."
  }
};

export default function LearnPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;
  const topic = id ? ARTICLES[id] : null;

  if (!topic) return <div className="p-10 text-white">Topic not found.</div>;

  return (
    <div className="min-h-screen bg-gray-900 text-white font-mono p-10 flex flex-col items-center">
      <div className="max-w-2xl w-full border border-gray-700 bg-black/50 p-8 rounded-lg shadow-[0_0_30px_rgba(0,0,0,0.5)]">
        
        {/* Header */}
        <h1 className={`text-4xl font-bold mb-6 ${topic.color} border-b border-gray-800 pb-4`}>
          {topic.title}
        </h1>

        {/* Main Content */}
        <div className="space-y-6 text-lg text-gray-300 leading-relaxed">
          <p>{topic.content}</p>
          
          <div className="bg-gray-800/50 p-6 rounded border-l-4 border-blue-500">
            <h3 className="text-blue-400 font-bold mb-2 uppercase tracking-widest">How to Prevent It</h3>
            <ul className="list-disc pl-5 space-y-2">
              {topic.prevention.split('\n').map((line, i) => (
                <li key={i}>{line}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-10">
          <Link 
            href="/"
            className="inline-block bg-gray-700 hover:bg-white hover:text-black text-white px-6 py-3 rounded transition-all font-bold"
          >
            ← RETURN TO SIMULATOR
          </Link>
        </div>

      </div>
    </div>
  );
}