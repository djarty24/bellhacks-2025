// moving 3d packet car component to react-three-fiber
"use client";
import { useRef, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface PacketCarProps {
	startPos: [number, number, number];
	endPos: [number, number, number];
	color: string;
	data: any;
	firewallRules: string[];
	onArrive: () => void;
	onClick: (data: any) => void;
}

const BRIGHT_COLORS: Record<string, string> = {
	"purple": "#d946ef", "red": "#ff0000", "cyan": "#00ffff",
	"orange": "#ffaa00", "yellow": "#ffff00", "magenta": "#ff00ff"
};

export default function PacketCar({ startPos, endPos, color, data, firewallRules, onArrive, onClick }: PacketCarProps) {
	const meshRef = useRef<THREE.Mesh>(null);
	const [progress, setProgress] = useState(0);
	const [blocked, setBlocked] = useState(false);
	const SPEED = 0.02;
	const finalColor = BRIGHT_COLORS[color] || color;

	useFrame(() => {
		if (!meshRef.current || blocked) return;

		const newProgress = progress + SPEED;

		// FIREWALL LOGIC
		if (newProgress > 0.8 && !blocked) {
			const isUDP = data.type.includes("UDP");
			const isICMP = data.color === "purple";
			const isFromHacker = data.src === "Hacker";

			if (
				(firewallRules.includes("BLOCK_UDP") && isUDP) ||
				(firewallRules.includes("BLOCK_ICMP") && isICMP) ||
				(firewallRules.includes("BLOCK_ALL") && isFromHacker)
			) {
				setBlocked(true);
				meshRef.current.scale.setScalar(0);
				setTimeout(onArrive, 200);
				return;
			}
		}

		if (newProgress >= 1) {
			onArrive();
		} else {
			setProgress(newProgress);
			meshRef.current.position.lerpVectors(
				new THREE.Vector3(...startPos),
				new THREE.Vector3(...endPos),
				newProgress
			);
			meshRef.current.lookAt(new THREE.Vector3(...endPos));
		}
	});

	return (
		<mesh
			ref={meshRef}
			position={new THREE.Vector3(...startPos)}
			onClick={(e) => { e.stopPropagation(); onClick(data); }}
		>
			<boxGeometry args={[0.6, 0.3, 0.3]} />
			<meshStandardMaterial color={finalColor} emissive={finalColor} emissiveIntensity={1.5} />
		</mesh>
	);
}