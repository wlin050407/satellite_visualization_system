import React, { useRef, useEffect, useState, Suspense } from 'react'
import { useFrame } from '@react-three/fiber'
import { useGLTF } from '@react-three/drei'
import * as THREE from 'three'

// 根据环境设置base路径 - 修复版本
const BASE_PATH = '/satellite_visualization_system';

// 开发环境检测 - 修复判断逻辑
const isDevelopment = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || 
   window.location.hostname === '127.0.0.1' ||
   window.location.hostname.includes('192.168.') ||
   window.location.port !== '');

// 获取正确的模型路径 - 根据环境动态设置
const getModelPath = (modelFile: string) => {
  let path;
  if (isDevelopment) {
    path = modelFile; // 开发环境直接使用相对路径
  } else {
    path = BASE_PATH + modelFile; // 生产环境使用带base路径的完整路径
  }
  
  // 添加调试日志
  console.log(`🔧 模型路径配置: ${modelFile} -> ${path} (开发环境: ${isDevelopment})`);
  
  return path;
};

// 模型文件大小配置 - 用于加载策略优化
const MODEL_FILE_SIZES = {
  hubble: 11.5,      // MB - SMALL
  starlink: 4.4,     // MB - SMALL (修正为实际文件大小)
  iss: 34.4,         // MB - MEDIUM (修正为实际文件大小)
  gps: 2.5,          // MB - SMALL (修正为实际文件大小)
  tiangong: 10.0,    // MB - SMALL (Draco压缩后)
}

// 根据文件大小确定加载策略
const getLoadingStrategy = (modelType: string) => {
  const size = MODEL_FILE_SIZES[modelType as keyof typeof MODEL_FILE_SIZES] || 0
  
  if (size < 15) {
    return { 
      priority: 'high', 
      preload: true, 
      showProgress: false,
      category: 'SMALL',
      loadingTime: '< 2秒'
    }
  } else if (size < 30) {
    return { 
      priority: 'medium', 
      preload: false, 
      showProgress: true,
      category: 'MEDIUM',
      loadingTime: '2-5秒'
    }
  } else if (size < 60) {
    return { 
      priority: 'low', 
      preload: false, 
      showProgress: true,
      category: 'LARGE',
      loadingTime: '5-15秒'
    }
  } else {
    return { 
      priority: 'critical', 
      preload: false, 
      showProgress: true,
      category: 'HUGE',
      loadingTime: '15-30秒',
      requiresOptimization: true
    }
  }
}

// NASA官方3D模型路径 - 使用本地下载的真实模型
const SATELLITE_MODELS = {
  // 使用真实的NASA GLB模型文件 - 包含所有可用模型
  hubble: getModelPath('/models/hubble.glb'),              // 真实的NASA哈勃望远镜模型 (11.5MB)
  iss: getModelPath('/models/ISS_stationary.glb'),         // 真实的NASA国际空间站模型 (34.4MB)
  starlink: getModelPath('/models/starlink.glb'),          // 真实的Starlink卫星模型 (4.4MB)
  gps: getModelPath('/models/gps_satellite.glb'),          // 真实的GPS卫星模型 (2.5MB)
  tiangong: getModelPath('/models/tiangong.glb'),          // 真实的天宫空间站模型 (10.0MB - Draco压缩)
  
  // 其他模型使用简化几何模型
  // cassini: 暂时移除，使用简化模型
  // sentinel: 使用SimpleSatelliteModel
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
  
  const { scene } = useGLTF(SATELLITE_MODELS.hubble)
  console.log(`TestHubbleModel: 哈勃模型加载成功`)
  
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
  const [loadingError, setLoadingError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  
  console.log(`LoadedSatelliteModel[${instanceId}]: 开始加载模型 ${modelUrl}`)
  
  // useGLTF本身会处理加载错误，我们通过Suspense边界来捕获
  const { scene } = useGLTF(modelUrl)
  
  // 创建模型的独立副本，避免多个实例冲突
  useEffect(() => {
    if (scene) {
      setIsLoading(true)
      console.log(`LoadedSatelliteModel[${instanceId}]: 克隆模型场景`)
      
      try {
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
        
        // 为GPS和Starlink自动赋主色和高光
        cloned.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            if (instanceId.split('-')[0] === 'gps') {
              // 主体默认银灰色
              child.material = new THREE.MeshStandardMaterial({
                color: '#b0b7bd',
                metalness: 0.85,
                roughness: 0.25,
                emissive: '#222222',
              });
            } else if (instanceId.split('-')[0] === 'starlink') {
              // 主体默认银白色
              child.material = new THREE.MeshStandardMaterial({
                color: '#dbe3ea',
                metalness: 0.9,
                roughness: 0.18,
                emissive: '#222222',
              });
            }
            // 太阳能板自动赋深蓝色/黑色
            if (child.name && /solar|panel|wing/i.test(child.name)) {
              child.material.color.set(instanceId.split('-')[0] === 'gps' ? '#1a237e' : '#222831');
              child.material.metalness = 0.7;
              child.material.roughness = 0.3;
            }
          }
        });
        
        setClonedScene(cloned)
        setIsLoading(false)
        console.log(`LoadedSatelliteModel[${instanceId}]: 模型克隆和优化完成`)
      } catch (error) {
        console.error(`LoadedSatelliteModel[${instanceId}]: 模型处理失败`, error)
        setLoadingError(`模型处理失败: ${error}`)
        setIsLoading(false)
      }
    }
  }, [scene, instanceId, color])

  // 如果有加载错误，显示错误信息并降级到简化模型
  if (loadingError) {
    console.warn(`LoadedSatelliteModel[${instanceId}]: 降级到简化模型，原因: ${loadingError}`)
    return (
      <SimpleSatelliteModel 
        modelType="hubble" 
        scale={scale} 
        color="#ff6b6b" // 用红色表示这是降级模型
      />
    )
  }

  // 加载中状态 - 增强版，根据文件大小显示不同加载指示
  if (isLoading || !clonedScene) {
    const strategy = getLoadingStrategy(instanceId.split('-')[0])
    const fileSize = MODEL_FILE_SIZES[instanceId.split('-')[0] as keyof typeof MODEL_FILE_SIZES]
    
    return (
      <group ref={groupRef} scale={[scale, scale, scale]}>
        {/* 主加载指示器 - 根据文件大小类别显示不同颜色 */}
        <mesh>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshBasicMaterial color={color} />
        </mesh>
        
        {/* 旋转的加载指示 - 动画组件 */}
        <LoadingSpinner category={strategy.category} />
        
        {/* 文件大小指示器 */}
        {strategy.showProgress && fileSize && (
          <>
            {/* 进度条背景 */}
            <mesh position={[0, -0.4, 0]}>
              <boxGeometry args={[0.4, 0.02, 0.05]} />
              <meshBasicMaterial color="#333333" />
            </mesh>
            
            {/* 进度条（模拟） */}
            <mesh position={[-0.1, -0.39, 0.01]}>
              <boxGeometry args={[0.2, 0.015, 0.03]} />
              <meshBasicMaterial color={
                strategy.category === 'MEDIUM' ? "#ffaa00" :
                strategy.category === 'LARGE' ? "#ff6600" :
                "#ff3333"
              } />
            </mesh>
            
            {/* 大文件警告指示 */}
            {strategy.requiresOptimization && (
              <mesh position={[0, -0.6, 0]}>
                <sphereGeometry args={[0.03, 6, 6]} />
                <meshBasicMaterial color="#ff0000" />
              </mesh>
            )}
          </>
        )}
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

// 错误边界组件
class ModelErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: React.ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; fallback: React.ReactNode }) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error) {
    console.error('ModelErrorBoundary: 捕获到模型加载错误', error)
    return { hasError: true }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ModelErrorBoundary: 详细错误信息', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      console.warn('ModelErrorBoundary: 显示降级模型')
      return this.props.fallback
    }

    return this.props.children
  }
}

// 加载动画组件
const LoadingSpinner: React.FC<{ category: string }> = ({ category }) => {
  const meshRef = useRef<THREE.Mesh>(null)
  
  useFrame((state) => {
    if (meshRef.current) {
      const speed = category === 'HUGE' ? 0.5 : 2
      meshRef.current.rotation.y = state.clock.elapsedTime * speed
    }
  })
  
  return (
    <mesh ref={meshRef} position={[0.3, 0, 0]}>
      <sphereGeometry args={[0.05, 8, 8]} />
      <meshBasicMaterial color="#ffffff" />
    </mesh>
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
  
  // 决定使用哪个模型
  let modelUrl: string | null = null
  if (modelType === 'hubble') {
    modelUrl = SATELLITE_MODELS.hubble
  } else if (modelType === 'iss') {
    modelUrl = SATELLITE_MODELS.iss
  } else if (modelType === 'starlink') {
    modelUrl = SATELLITE_MODELS.starlink
  } else if (modelType === 'gps') {
    modelUrl = SATELLITE_MODELS.gps
  } else if (modelType === 'tiangong') {
    modelUrl = SATELLITE_MODELS.tiangong
  }
  
  // 如果有真实3D模型，使用LoadedSatelliteModel
  if (modelUrl) {
    return (
      <ModelErrorBoundary fallback={
        <SimpleSatelliteModel 
          modelType={modelType} 
          scale={scale} 
          color="#ff6b6b" // 红色表示降级模型
        />
      }>
        <Suspense fallback={
          <SimpleSatelliteModel 
            modelType={modelType} 
            scale={scale} 
            color="#ffff00" // 黄色表示加载中
          />
        }>
          <LoadedSatelliteModel 
            modelUrl={modelUrl}
            scale={scale}
            color={color}
            instanceId={instanceId}
          />
        </Suspense>
      </ModelErrorBoundary>
    )
  }
  
  // 其他所有模型都使用对应的简化几何模型
  return (
    <SimpleSatelliteModel 
      modelType={modelType} 
      scale={scale} 
      color={color} 
    />
  )
}

export default Real3DSatellite

// 智能预加载NASA模型 - 根据文件大小选择性预加载
const hubbleStrategy = getLoadingStrategy('hubble')
const starLinkStrategy = getLoadingStrategy('starlink')
const issStrategy = getLoadingStrategy('iss')
const gpsStrategy = getLoadingStrategy('gps')
const tiangongStrategy = getLoadingStrategy('tiangong')

// 只预加载小文件（<15MB），大文件按需加载以节省带宽和内存
if (hubbleStrategy.preload) {
  useGLTF.preload(SATELLITE_MODELS.hubble);
}
if (gpsStrategy.preload) {
  useGLTF.preload(SATELLITE_MODELS.gps);
}
if (starLinkStrategy.preload) {
  useGLTF.preload(SATELLITE_MODELS.starlink);
}
if (tiangongStrategy.preload) {
  useGLTF.preload(SATELLITE_MODELS.tiangong);
}
// 中等和大文件不预加载，按需加载
console.log('模型加载策略:', {
  hubble: `${hubbleStrategy.category} - ${hubbleStrategy.loadingTime}`,
  starlink: `${starLinkStrategy.category} - ${starLinkStrategy.loadingTime}`,
  iss: `${issStrategy.category} - ${issStrategy.loadingTime}`,
  gps: `${gpsStrategy.category} - ${gpsStrategy.loadingTime}`,
  tiangong: `${tiangongStrategy.category} - ${tiangongStrategy.loadingTime}`
}); 