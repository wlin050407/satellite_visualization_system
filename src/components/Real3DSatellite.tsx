import React, { useRef, useEffect, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// NASA官方3D模型路径 - 使用本地下载的真实模型
const SATELLITE_MODELS = {
  // 使用真实的NASA GLB模型文件
  iss: '/models/iss_nasa_official.glb', // 真实的NASA ISS官方模型 (166KB)
  hubble: '/models/hubble.glb',          // 真实的NASA哈勃望远镜模型 (11MB)
  cassini: '/models/cassini.glb',        // 真实的NASA卡西尼探测器模型 (5.6MB)
  
  // 未来可添加的模型
  starlink: null,  // 暂时使用简化模型，等待真实Starlink模型
  tiangong: null,  // 暂时使用ISS模型，等待真实天宫模型
  
  // 备用简化模型（当真实模型不可用时）
  fallback: {
    iss: '/models/iss_simple.glb',
    hubble: '/models/hubble_simple.glb'
  }
}

interface Real3DSatelliteProps {
  modelType: 'iss' | 'hubble' | 'starlink' | 'gps' | 'tiangong' | 'sentinel'
  scale?: number
  color?: string
}

// 简单测试组件 - 直接加载hubble模型
const TestHubbleModel: React.FC<{ scale: number }> = ({ scale }) => {
  const groupRef = useRef<THREE.Group>(null)
  
  console.log(`🧪 TestHubbleModel: 直接加载哈勃模型，缩放=${scale}`)
  
  const { scene } = useGLTF('/models/hubble.glb')
  console.log(`TestHubbleModel: 哈勃模型加载成功`)
  
  // 自动旋转
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {/* 调试用红色方块 */}
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[0.2, 0.2, 0.2]} />
        <meshBasicMaterial color="#ff0000" />
      </mesh>
      {/* 真实NASA模型 */}
      <primitive object={scene} />
    </group>
  )
}

// 3D模型加载组件 - 修复资源抢占问题
const LoadedSatelliteModel: React.FC<{ 
  modelUrl: string
  scale: number
  color: string
  instanceId: string
}> = ({ modelUrl, scale, color, instanceId }) => {
  const groupRef = useRef<THREE.Group>(null)
  const [clonedScene, setClonedScene] = useState<THREE.Group | null>(null)
  
  console.log(`LoadedSatelliteModel[${instanceId}]: 开始加载模型 ${modelUrl}`)
  
  const { scene } = useGLTF(modelUrl)
  
  // 创建模型的独立副本，避免多个实例冲突
  useEffect(() => {
    if (scene) {
      console.log(`LoadedSatelliteModel[${instanceId}]: 克隆模型场景`)
      
      // 深度克隆场景，确保每个实例都有独立的材质和几何体
      const cloned = scene.clone(true)
      
      // 为每个实例优化材质
      cloned.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          // 克隆材质，避免共享
          if (child.material) {
            if (Array.isArray(child.material)) {
              child.material = child.material.map(mat => mat.clone())
            } else {
              child.material = child.material.clone()
              
              const material = child.material as THREE.MeshStandardMaterial
              // 增强NASA模型的视觉效果
              if (material.emissive) {
                material.emissive.setHex(0x222222)
              }
              if (material.metalness !== undefined) {
                material.metalness = Math.max(material.metalness, 0.3)
              }
              if (material.roughness !== undefined) {
                material.roughness = Math.min(material.roughness, 0.7)
              }
            }
          }
        }
      })
      
      setClonedScene(cloned)
      console.log(`LoadedSatelliteModel[${instanceId}]: 模型克隆和优化完成`)
    }
  }, [scene, instanceId, color])

  // 自动旋转
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  if (!clonedScene) {
    return (
      <group ref={groupRef} scale={[scale, scale, scale]}>
        {/* 加载中的占位符 */}
        <mesh>
          <boxGeometry args={[0.1, 0.1, 0.1]} />
          <meshBasicMaterial color="#666666" />
        </mesh>
      </group>
    )
  }

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      <primitive object={clonedScene} />
    </group>
  )
}

// 简化几何模型（备用）
const SimpleSatelliteModel: React.FC<{
  modelType: string
  scale: number
  color: string
}> = ({ modelType, scale, color }) => {
  const groupRef = useRef<THREE.Group>(null)

  // 自动旋转
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.5
    }
  })

  // 创建简化模型
  const createSimpleModel = () => {
    switch (modelType) {
      case 'iss':
      case 'tiangong':
        return (
          <group>
            {/* 核心舱 - 放大尺寸 */}
            <mesh>
              <cylinderGeometry args={[0.4, 0.4, 3.0, 16]} />
              <meshStandardMaterial 
                color="#f0f0f0" 
                metalness={0.7} 
                roughness={0.3}
                emissive="#111111"
              />
            </mesh>
            
            {/* 主太阳能板阵列 - 放大尺寸 */}
            <mesh position={[5.5, 0, 0]}>
              <boxGeometry args={[6.0, 0.05, 2.5]} />
              <meshStandardMaterial 
                color="#1a3d7a" 
                transparent 
                opacity={0.9}
                emissive="#001122"
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[-5.5, 0, 0]}>
              <boxGeometry args={[6.0, 0.05, 2.5]} />
              <meshStandardMaterial 
                color="#1a3d7a" 
                transparent 
                opacity={0.9}
                emissive="#001122"
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
        
      case 'hubble':
        return (
          <group>
            {/* 主镜筒 - 放大尺寸 */}
            <mesh>
              <cylinderGeometry args={[0.35, 0.4, 2.5, 20]} />
              <meshStandardMaterial 
                color="#c8d0d8" 
                metalness={0.8} 
                roughness={0.2}
                emissive="#111111"
              />
            </mesh>
            
            {/* 太阳能板 - 放大尺寸 */}
            <mesh position={[2.2, 0, 0]}>
              <boxGeometry args={[3.5, 0.05, 1.5]} />
              <meshStandardMaterial 
                color="#1a3d7a" 
                transparent 
                opacity={0.9}
                emissive="#001122"
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[-2.2, 0, 0]}>
              <boxGeometry args={[3.5, 0.05, 1.5]} />
              <meshStandardMaterial 
                color="#1a3d7a" 
                transparent 
                opacity={0.9}
                emissive="#001122"
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
        
      case 'sentinel':
        return (
          <group>
            {/* 主体 - 地球观测卫星，放大尺寸 */}
            <mesh>
              <boxGeometry args={[2.0, 1.5, 3.0]} />
              <meshStandardMaterial 
                color="#e8e8e8" 
                metalness={0.6} 
                roughness={0.4}
                emissive="#111111"
              />
            </mesh>
            
            {/* 雷达天线 - 放大尺寸 */}
            <mesh position={[0, 1.0, 0]}>
              <boxGeometry args={[3.0, 0.12, 2.0]} />
              <meshStandardMaterial 
                color="#444444" 
                metalness={0.8} 
                roughness={0.3}
              />
            </mesh>
            
            {/* 太阳能板 - 放大尺寸 */}
            <mesh position={[3.7, 0, 0]}>
              <boxGeometry args={[5.0, 0.05, 2.5]} />
              <meshStandardMaterial 
                color="#1a3d7a" 
                transparent 
                opacity={0.9}
                emissive="#001122"
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[-3.7, 0, 0]}>
              <boxGeometry args={[5.0, 0.05, 2.5]} />
              <meshStandardMaterial 
                color="#1a3d7a" 
                transparent 
                opacity={0.9}
                emissive="#001122"
                side={THREE.DoubleSide}
              />
            </mesh>
          </group>
        )
        
      case 'starlink':
        return (
          <group>
            {/* Starlink扁平主体 - 放大尺寸 */}
            <mesh>
              <boxGeometry args={[0.8, 0.25, 2.0]} />
              <meshStandardMaterial 
                color="#f0f0f0" 
                metalness={0.7} 
                roughness={0.3}
                emissive="#111111"
              />
            </mesh>
            
            {/* 单个太阳能板 - 放大尺寸 */}
            <mesh position={[0, 0, 2.5]}>
              <boxGeometry args={[1.0, 0.025, 3.0]} />
              <meshStandardMaterial 
                color="#1a3d7a" 
                transparent 
                opacity={0.9}
                emissive="#001122"
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* 通信天线 - 放大尺寸 */}
            <mesh position={[0, 0.25, -0.8]}>
              <boxGeometry args={[0.5, 0.05, 0.5]} />
              <meshStandardMaterial 
                color="#666666" 
                metalness={0.8} 
                roughness={0.2}
              />
            </mesh>
          </group>
        )
        
      case 'gps':
        return (
          <group>
            {/* GPS主体 - 六角形，放大尺寸 */}
            <mesh>
              <cylinderGeometry args={[1.0, 1.0, 1.5, 6]} />
              <meshStandardMaterial 
                color="#d4d4d4" 
                metalness={0.6} 
                roughness={0.4}
                emissive="#111111"
              />
            </mesh>
            
            {/* 太阳能板 - GPS特有的双翼设计，放大尺寸 */}
            <mesh position={[3.0, 0, 0]}>
              <boxGeometry args={[4.5, 0.05, 3.0]} />
              <meshStandardMaterial 
                color="#1a3d7a" 
                transparent 
                opacity={0.9}
                emissive="#001122"
                side={THREE.DoubleSide}
              />
            </mesh>
            <mesh position={[-3.0, 0, 0]}>
              <boxGeometry args={[4.5, 0.05, 3.0]} />
              <meshStandardMaterial 
                color="#1a3d7a" 
                transparent 
                opacity={0.9}
                emissive="#001122"
                side={THREE.DoubleSide}
              />
            </mesh>
            
            {/* GPS天线阵列 - 放大尺寸 */}
            <mesh position={[0, 1.0, 0]}>
              <cylinderGeometry args={[0.75, 0.75, 0.25, 8]} />
              <meshStandardMaterial 
                color="#333333" 
                metalness={0.8} 
                roughness={0.2}
              />
            </mesh>
          </group>
        )
        
      default:
        return (
          <mesh>
            <boxGeometry args={[1.2, 0.8, 2.0]} />
            <meshStandardMaterial 
              color={color} 
              metalness={0.6} 
              roughness={0.4}
              emissive="#111111"
            />
          </mesh>
        )
    }
  }

  return (
    <group ref={groupRef} scale={[scale, scale, scale]}>
      {createSimpleModel()}
    </group>
  )
}

// 主组件
const Real3DSatellite: React.FC<Real3DSatelliteProps> = ({ 
  modelType, 
  scale = 0.1,
  color = '#ffffff' 
}) => {
  // 生成唯一的实例ID，避免多个相同模型冲突
  const instanceId = React.useMemo(() => 
    `${modelType}-${Math.random().toString(36).substr(2, 9)}`, 
    [modelType]
  )
  
  console.log(`Real3DSatellite[${instanceId}]: 渲染 ${modelType} 模型，缩放=${scale}`)
  
  // 只有Hubble使用真实NASA哈勃模型
  if (modelType === 'hubble') {
    return (
      <Suspense fallback={
        <SimpleSatelliteModel 
          modelType={modelType} 
          scale={scale} 
          color={color} 
        />
      }>
        <LoadedSatelliteModel 
          modelUrl={SATELLITE_MODELS.hubble}
          scale={scale}
          color={color}
          instanceId={instanceId}
        />
      </Suspense>
    )
  }
  
  // 其他所有模型都使用对应的简化几何模型
  // 不盗用别人的模型，每种卫星都有自己独特的外观
  return (
    <SimpleSatelliteModel 
      modelType={modelType} 
      scale={scale} 
      color={color} 
    />
  )
}

export default Real3DSatellite

// 预加载NASA模型
useGLTF.preload(SATELLITE_MODELS.hubble);
useGLTF.preload(SATELLITE_MODELS.cassini); 