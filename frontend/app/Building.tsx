import { Text } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRef } from 'react';

interface BuildingProps {
	pos: [number, number, number];
	name: string;
	isTarget?: boolean;
	hasFirewall?: boolean;
}

export default function Building({ pos, name, isTarget, hasFirewall }: BuildingProps) {
	const shieldRef = useRef<THREE.Mesh>(null);
	const isRouter = name === "Router";

	useFrame(({ clock }) => {
		if (shieldRef.current && hasFirewall) {
			shieldRef.current.scale.setScalar(1.2 + Math.sin(clock.getElapsedTime() * 3) * 0.05);
			shieldRef.current.rotation.y += 0.01;
		}
	});

	return (
		<group position={new THREE.Vector3(...pos)}>
			
			<mesh position={[0, isRouter ? 0.25 : 2, 0]}>
				<boxGeometry args={isRouter ? [1.5, 0.5, 1.5] : [2, 4, 2]} />
				<meshStandardMaterial 
					color={isRouter ? "#0066cc" : (name === "Hacker" ? "#331111" : "#1a1a1a")} 
					emissive={isRouter ? "#0088ff" : (name === "Hacker" ? "red" : isTarget ? "red" : "blue")}
					emissiveIntensity={isRouter ? 0.8 : (isTarget ? 0.5 : 0.1)}
				/>
			</mesh>
			
			<mesh position={[0, isRouter ? 0.25 : 2, 0]}>
				<boxGeometry args={isRouter ? [1.6, 0.6, 1.6] : [2.05, 4.05, 2.05]} />
				<meshStandardMaterial 
						color={isTarget ? "red" : isRouter ? "#00ffff" : "#00ff00"} 
						wireframe 
				/>
			</mesh>

			{/* --- FIREWALL SHIELD --- */}
			{hasFirewall && (
				<mesh ref={shieldRef} position={[0, 2, 0]}>
					<sphereGeometry args={[2.5, 32, 32]} />
					<meshStandardMaterial 
						color="#0088ff" 
						transparent 
						opacity={0.3} 
						wireframe
						emissive="#0088ff"
						emissiveIntensity={0.5}
						depthWrite={false}
					/>
				</mesh>
			)}

			{/* --- FLOATING LABEL --- */}
			<Text 
				position={[0, isRouter ? 1.5 : 5, 0]}
				fontSize={0.8} 
				color="white" 
				anchorX="center" 
				anchorY="middle"
				outlineWidth={0.05}
				outlineColor="#000000"
			>
				{name}
			</Text>
		</group>
	);
}