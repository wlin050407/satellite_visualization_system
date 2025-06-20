import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text, Line } from '@react-three/drei'
import { useSatelliteStore } from '../store/satelliteStore'
import * as THREE from 'three'

const Satellite: React.FC<{ 
  satellite: any
  isSelected: boolean
  onClick: () => void 
}> = ({ satellite, isSelected, onClick }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      // Simple orbital animation
      const time = state.clock.getElapsedTime()
      const speed = 0.5 + Math.random() * 0.5
      
      const radius = Math.sqrt(
        satellite.position[0] ** 2 + 
        satellite.position[1] ** 2 + 
        satellite.position[2] ** 2
      )
      
      meshRef.current.position.x = Math.cos(time * speed) * radius
      meshRef.current.position.z = Math.sin(time * speed) * radius
      meshRef.current.position.y = satellite.position[1] + Math.sin(time * speed * 0.3) * 0.5
      
      // Update store with new position
      // This would be more efficient with a dedicated animation system
    }
  })

  // Generate orbit path
  const orbitPoints = useMemo(() => {
    const points = []
    const radius = Math.sqrt(
      satellite.position[0] ** 2 + 
      satellite.position[1] ** 2 + 
      satellite.position[2] ** 2
    )
    
    for (let i = 0; i <= 64; i++) {
      const angle = (i / 64) * Math.PI * 2
      points.push(
        new THREE.Vector3(
          Math.cos(angle) * radius,
          satellite.position[1] + Math.sin(angle * 0.3) * 0.5,
          Math.sin(angle) * radius
        )
      )
    }
    return points
  }, [satellite.position])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return '#00ff00'
      case 'warning': return '#ffff00'
      case 'offline': return '#ff0000'
      default: return '#ffffff'
    }
  }

  return (
    <group>
      {/* Orbit Path */}
      <Line
        points={orbitPoints}
        color={isSelected ? '#ffffff' : '#444444'}
        lineWidth={isSelected ? 2 : 1}
        transparent
        opacity={0.3}
      />

      {/* Satellite Model */}
      <mesh
        ref={meshRef}
        position={satellite.position as [number, number, number]}
        onClick={onClick}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={() => {
          document.body.style.cursor = 'auto'
        }}
      >
        {/* Main Body */}
        <boxGeometry args={[0.2, 0.1, 0.3]} />
        <meshPhongMaterial 
          color={getStatusColor(satellite.status)}
          emissive={isSelected ? '#ffffff' : '#000000'}
          emissiveIntensity={isSelected ? 0.2 : 0}
        />
      </mesh>

      {/* Solar Panels */}
      <mesh position={[satellite.position[0] + 0.3, satellite.position[1], satellite.position[2]]}>
        <boxGeometry args={[0.4, 0.02, 0.2]} />
        <meshPhongMaterial color="#1565C0" />
      </mesh>
      <mesh position={[satellite.position[0] - 0.3, satellite.position[1], satellite.position[2]]}>
        <boxGeometry args={[0.4, 0.02, 0.2]} />
        <meshPhongMaterial color="#1565C0" />
      </mesh>

      {/* Satellite Label */}
      <Text
        position={[
          satellite.position[0], 
          satellite.position[1] + 0.4, 
          satellite.position[2]
        ]}
        fontSize={0.12}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {satellite.name}
      </Text>

      {/* Signal Beam (for selected satellite) */}
      {isSelected && (
        <mesh
          position={satellite.position as [number, number, number]}
        >
          <coneGeometry args={[1, 8, 8]} />
          <meshBasicMaterial 
            color="#00ff00" 
            transparent 
            opacity={0.1}
            side={THREE.DoubleSide}
          />
        </mesh>
      )}
    </group>
  )
}

const SatelliteSystem: React.FC = () => {
  const { 
    satellites, 
    selectedSatellite, 
    setSelectedSatellite, 
    showOrbits,
    initializeDemoData 
  } = useSatelliteStore()

  // Initialize demo data on mount
  useEffect(() => {
    if (satellites.length === 0) {
      initializeDemoData()
    }
  }, [satellites.length, initializeDemoData])

  return (
    <group>
      {satellites.map((satellite) => (
        <Satellite
          key={satellite.id}
          satellite={satellite}
          isSelected={selectedSatellite?.id === satellite.id}
          onClick={() => setSelectedSatellite(satellite)}
        />
      ))}
    </group>
  )
}

export default SatelliteSystem 