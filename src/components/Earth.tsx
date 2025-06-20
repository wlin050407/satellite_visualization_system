import React, { useRef, useMemo } from 'react'
import { useFrame, useLoader } from '@react-three/fiber'
import { TextureLoader } from 'three'
import { Sphere, Text } from '@react-three/drei'
import { useSatelliteStore } from '../store/satelliteStore'
import * as THREE from 'three'

const Earth: React.FC = () => {
  const meshRef = useRef<THREE.Mesh>(null)
  const { groundStations, selectedGroundStation, setSelectedGroundStation } = useSatelliteStore()

  // Load Earth textures (using placeholder colors for now, can be replaced with actual NASA textures)
  const earthTexture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // Create a simple Earth-like texture
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#1e3c72')
    gradient.addColorStop(0.5, '#2a5298')
    gradient.addColorStop(1, '#1e3c72')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 256)
    
    // Add some landmass-like patterns
    ctx.fillStyle = '#3a5f3a'
    for (let i = 0; i < 20; i++) {
      const x = Math.random() * 512
      const y = Math.random() * 256
      const w = Math.random() * 100 + 20
      const h = Math.random() * 50 + 10
      ctx.fillRect(x, y, w, h)
    }
    
    return new THREE.CanvasTexture(canvas)
  }, [])

  // Rotate Earth
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1
    }
  })

  // Convert lat/lng to 3D position on sphere
  const latLngTo3D = (lat: number, lng: number, radius: number = 5.02) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    return [
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ] as [number, number, number]
  }

  return (
    <group>
      {/* Earth Sphere */}
      <mesh ref={meshRef}>
        <sphereGeometry args={[5, 64, 32]} />
        <meshPhongMaterial map={earthTexture} />
      </mesh>

      {/* Ground Stations */}
      {groundStations.map((station) => {
        const position = latLngTo3D(station.position[1], station.position[0])
        const isSelected = selectedGroundStation?.id === station.id
        
        return (
          <group key={station.id} position={position}>
            {/* Station Marker */}
            <mesh
              onClick={() => setSelectedGroundStation(station)}
              onPointerOver={(e) => {
                e.stopPropagation()
                document.body.style.cursor = 'pointer'
              }}
              onPointerOut={() => {
                document.body.style.cursor = 'auto'
              }}
            >
              <coneGeometry args={[0.1, 0.3, 8]} />
              <meshPhongMaterial 
                color={station.status === 'active' ? '#00ff00' : '#ff0000'}
                emissive={isSelected ? '#ffffff' : '#000000'}
                emissiveIntensity={isSelected ? 0.3 : 0}
              />
            </mesh>

            {/* Station Label */}
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.15}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {station.name}
            </Text>

            {/* Connection Line to Earth */}
            <mesh>
              <cylinderGeometry args={[0.01, 0.01, 0.15]} />
              <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
            </mesh>
          </group>
        )
      })}

      {/* Atmosphere Glow */}
      <mesh>
        <sphereGeometry args={[5.1, 64, 32]} />
        <meshBasicMaterial 
          color="#4FC3F7" 
          transparent 
          opacity={0.1} 
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

export default Earth 