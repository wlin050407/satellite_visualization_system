import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

const NASAEarth: React.FC = () => {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)

  // 使用简化的纹理加载
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    
    // 使用可靠的纹理源
    const dayTexture = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg')
    const bumpTexture = loader.load('https://threejs.org/examples/textures/planets/earth_normal_2048.jpg')
    const cloudTexture = loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png')
    
    return { dayTexture, bumpTexture, cloudTexture }
  }, [])

  // 地球材质
  const earthMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      map: textures.dayTexture,
      bumpMap: textures.bumpTexture,
      bumpScale: 0.05,
      shininess: 100
    })
  }, [textures])

  // 云层材质
  const cloudMaterial = useMemo(() => {
    return new THREE.MeshLambertMaterial({
      map: textures.cloudTexture,
      transparent: true,
      opacity: 0.2
    })
  }, [textures.cloudTexture])

  // 动画更新
  useFrame((state, delta) => {
    // 地球自转
    if (earthRef.current) {
      earthRef.current.rotation.y += delta * 0.05
    }
    
    // 云层独立旋转
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.08
    }
  })

  return (
    <group>
      {/* 地球主体 */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <primitive object={earthMaterial} />
      </mesh>

      {/* 云层 */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[5.02, 64, 64]} />
        <primitive object={cloudMaterial} />
      </mesh>

      {/* 大气层光晕 */}
      <mesh>
        <sphereGeometry args={[5.5, 32, 32]} />
        <meshBasicMaterial 
          color="#60a5fa" 
          transparent 
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

export default NASAEarth 