import React, { useRef, useEffect, useMemo } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { TilesRenderer } from '3d-tiles-renderer'
import { Text } from '@react-three/drei'
import { useSatelliteStore } from '../store/satelliteStore'
import { GOOGLE_3D_TILES_CONFIG, isGoogleMapsApiKeySet, getApiKeyInstructions } from '../config/googleMaps'
import * as THREE from 'three'

const RealisticEarth: React.FC = () => {
  const tilesRef = useRef<any>()
  const groupRef = useRef<THREE.Group>(null)
  const { scene, camera, gl } = useThree()
  const { groundStations, selectedGroundStation, setSelectedGroundStation } = useSatelliteStore()

  // 初始化3D Tiles渲染器
  useEffect(() => {
    if (!tilesRef.current && isGoogleMapsApiKeySet()) {
      // 创建3D Tiles渲染器
      const tilesRenderer = new TilesRenderer(GOOGLE_3D_TILES_CONFIG.tilesetUrl)
      tilesRef.current = tilesRenderer

      // 应用配置
      const config = GOOGLE_3D_TILES_CONFIG
      tilesRenderer.errorTarget = config.renderer.errorTarget
      tilesRenderer.maxDepth = config.renderer.maxDepth
      tilesRenderer.displayActiveTiles = config.renderer.displayActiveTiles
      tilesRenderer.autoDisableRendererCulling = config.renderer.autoDisableRendererCulling

      // 配置缓存
      tilesRenderer.lruCache.maxSize = config.cache.maxSize
      tilesRenderer.lruCache.minSize = config.cache.minSize
      tilesRenderer.lruCache.maxBytesSize = config.cache.maxBytesSize
      tilesRenderer.lruCache.minBytesSize = config.cache.minBytesSize

      // 配置队列
      tilesRenderer.downloadQueue.maxJobs = config.queues.downloadMaxJobs
      tilesRenderer.parseQueue.maxJobs = config.queues.parseMaxJobs
      tilesRenderer.processNodeQueue.maxJobs = config.queues.processNodeMaxJobs

      // 设置相机和渲染器
      tilesRenderer.setCamera(camera)
      tilesRenderer.setResolutionFromRenderer(camera, gl)

      // 监听瓦片集加载事件
      tilesRenderer.addEventListener('load-tile-set', () => {
        console.log('Google Photorealistic 3D Tiles 加载完成')
        
        // 可选：将瓦片集居中
        const sphere = new THREE.Sphere()
        tilesRenderer.getBoundingSphere(sphere)
        if (sphere.radius > 0) {
          tilesRenderer.group.position.copy(sphere.center).multiplyScalar(-1)
        }
      })

      // 监听加载错误
      tilesRenderer.addEventListener('load-error', (event: any) => {
        console.error('3D Tiles加载错误:', event.error)
        console.log('请检查你的Google Maps Platform API密钥设置')
        console.log(getApiKeyInstructions())
      })

      // 将瓦片组添加到场景中
      if (groupRef.current) {
        groupRef.current.add(tilesRenderer.group)
      }
    } else if (!isGoogleMapsApiKeySet()) {
      console.warn('Google Maps Platform API密钥未设置')
      console.log(getApiKeyInstructions())
    }

    return () => {
      // 清理
      if (tilesRef.current) {
        tilesRef.current.dispose()
        tilesRef.current = undefined
      }
    }
  }, [camera, gl, scene])

  // 更新瓦片渲染器
  useFrame(() => {
    if (tilesRef.current) {
      camera.updateMatrixWorld()
      tilesRef.current.update()
    }
  })

  // Convert lat/lng to 3D position on sphere (保持与原地球组件的兼容性)
  const latLngTo3D = (lat: number, lng: number, radius: number = 5.02) => {
    const phi = (90 - lat) * (Math.PI / 180)
    const theta = (lng + 180) * (Math.PI / 180)
    
    return [
      -(radius * Math.sin(phi) * Math.cos(theta)),
      radius * Math.cos(phi),
      radius * Math.sin(phi) * Math.sin(theta)
    ] as [number, number, number]
  }

  // 生成后备的简单地球（当API密钥未设置时）
  const fallbackEarth = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 512
    canvas.height = 256
    const ctx = canvas.getContext('2d')!
    
    // 创建一个简单的地球纹理
    const gradient = ctx.createLinearGradient(0, 0, 0, 256)
    gradient.addColorStop(0, '#1e3c72')
    gradient.addColorStop(0.5, '#2a5298')
    gradient.addColorStop(1, '#1e3c72')
    
    ctx.fillStyle = gradient
    ctx.fillRect(0, 0, 512, 256)
    
    // 添加一些陆地图案
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

  return (
    <group ref={groupRef}>
      {/* 如果API密钥未设置，显示后备地球 */}
      {!isGoogleMapsApiKeySet() && (
        <>
          <mesh>
            <sphereGeometry args={[5, 64, 32]} />
            <meshPhongMaterial map={fallbackEarth} />
          </mesh>
          
          {/* 显示提示文本 */}
          <Text
            position={[0, 8, 0]}
            fontSize={0.5}
            color="#ff6b6b"
            anchorX="center"
            anchorY="middle"
          >
            请设置Google API密钥
          </Text>
          <Text
            position={[0, 7, 0]}
            fontSize={0.3}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            以使用Photorealistic 3D Tiles
          </Text>
        </>
      )}

      {/* 地面站标记 */}
      {groundStations.map((station) => {
        const position = latLngTo3D(station.position[1], station.position[0])
        const isSelected = selectedGroundStation?.id === station.id
        
        return (
          <group key={station.id} position={position}>
            {/* 站点标记 */}
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

            {/* 站点标签 */}
            <Text
              position={[0, 0.5, 0]}
              fontSize={0.15}
              color="#ffffff"
              anchorX="center"
              anchorY="middle"
            >
              {station.name}
            </Text>

            {/* 连接线 */}
            <mesh>
              <cylinderGeometry args={[0.01, 0.01, 0.15]} />
              <meshBasicMaterial color="#00ff00" transparent opacity={0.6} />
            </mesh>
          </group>
        )
      })}

      {/* 大气层光晕（只在后备模式下显示） */}
      {!isGoogleMapsApiKeySet() && (
        <mesh>
          <sphereGeometry args={[5.1, 64, 32]} />
          <meshBasicMaterial 
            color="#4FC3F7" 
            transparent 
            opacity={0.1} 
            side={THREE.BackSide}
          />
        </mesh>
      )}
    </group>
  )
}

export default RealisticEarth 