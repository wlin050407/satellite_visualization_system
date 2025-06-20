import React, { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { TilesRenderer } from '3d-tiles-renderer'
import { Text } from '@react-three/drei'
import { useSatelliteStore } from '../store/satelliteStore'
import * as THREE from 'three'

// Cesium Ion免费资源配置
const CESIUM_ION_CONFIG = {
  // Cesium World Terrain (免费)
  worldTerrain: {
    url: 'https://assets.cesium.com/1/tileset.json',
    name: 'Cesium World Terrain',
    description: '全球高精度地形，最高1米精度'
  },
  
  // Cesium OSM Buildings (免费)
  osmBuildings: {
    url: 'https://assets.ion.cesium.com/96188/tileset.json', 
    name: 'Cesium OSM Buildings',
    description: '全球OpenStreetMap 3D建筑物'
  },

  // 如果用户有Cesium Ion账户，可以使用这些资源
  // 需要用户自己注册免费账户并获取access token
  bingImagery: {
    url: 'https://api.cesium.com/v1/imagery/bing/aerial',
    requiresToken: true,
    name: 'Bing航空影像',
    description: '15cm分辨率全球卫星图像'
  }
}

const CesiumEarth: React.FC = () => {
  const tilesRef = useRef<TilesRenderer>()
  const groupRef = useRef<THREE.Group>(null)
  const { scene, camera, gl } = useThree()
  const { groundStations, selectedGroundStation, setSelectedGroundStation } = useSatelliteStore()

  // 后备地球纹理
  const fallbackEarth = React.useMemo(() => {
    const loader = new THREE.TextureLoader()
    // NASA Blue Marble纹理（免费）
    return loader.load('https://visibleearth.nasa.gov/images/57723/the-blue-marble/57723_lrg.jpg')
  }, [])

  // 初始化Cesium 3D Tiles
  useEffect(() => {
    let tilesRenderer: TilesRenderer

    const initializeTiles = async () => {
      try {
        // 首先尝试Cesium World Terrain（无需token）
        tilesRenderer = new TilesRenderer(CESIUM_ION_CONFIG.worldTerrain.url)
        
        // 配置渲染器参数
        tilesRenderer.setCamera(camera)
        tilesRenderer.setResolutionFromRenderer(camera, gl)
        
        // 设置加载完成回调
        tilesRenderer.addEventListener('load-tile-set', () => {
          console.log('Cesium地形加载成功')
          // 调整地球大小以匹配场景
          tilesRenderer.group.scale.setScalar(5)
        })

        tilesRenderer.addEventListener('load-model', (event: any) => {
          // 可以在这里对每个瓦片进行自定义处理
          console.log('瓦片加载:', event)
        })

        tilesRenderer.addEventListener('dispose-model', (event: any) => {
          // 清理资源
        })

        if (groupRef.current) {
          groupRef.current.add(tilesRenderer.group)
        }
        
        tilesRef.current = tilesRenderer

      } catch (error) {
        console.warn('Cesium 3D Tiles加载失败，使用后备地球:', error)
        // 如果3D Tiles加载失败，显示后备地球
      }
    }

    initializeTiles()

    return () => {
      if (tilesRenderer) {
        tilesRenderer.dispose()
      }
    }
  }, [camera, gl])

  // 每帧更新
  useFrame((state, delta) => {
    if (tilesRef.current) {
      tilesRef.current.update()
    }
    
    // 旋转地球
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05
    }
  })

  // 地面站标记
  const renderGroundStations = () => {
    return groundStations.map((station, index) => {
      // GroundStation.position 是 [longitude, latitude] 格式
      const [lng, lat] = station.position
      const phi = (90 - lat) * (Math.PI / 180)
      const theta = (lng + 180) * (Math.PI / 180)
      const radius = 5.1 // 稍微高于地球表面

      const x = -(radius * Math.sin(phi) * Math.cos(theta))
      const z = radius * Math.sin(phi) * Math.sin(theta)
      const y = radius * Math.cos(phi)

      return (
        <group key={station.id}>
          <mesh
            position={[x, y, z]}
            onClick={() => setSelectedGroundStation(station)}
          >
            <sphereGeometry args={[0.05, 8, 8]} />
            <meshBasicMaterial 
              color={selectedGroundStation?.id === station.id ? '#ff6b6b' : '#4ecdc4'} 
            />
          </mesh>
          
          <Text
            position={[x, y + 0.2, z]}
            fontSize={0.1}
            color="#ffffff"
            anchorX="center"
            anchorY="middle"
          >
            {station.name}
          </Text>
        </group>
      )
    })
  }

  return (
    <group ref={groupRef}>
      {/* 信息提示 */}
      <Text
        position={[0, 8, 0]}
        fontSize={0.4}
        color="#4ecdc4"
        anchorX="center"
        anchorY="middle"
      >
        Cesium World Terrain
      </Text>
      
      <Text
        position={[0, 7.5, 0]}
        fontSize={0.25}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        免费高精度全球地形数据
      </Text>

      {/* 后备地球（当3D Tiles未加载时显示） */}
      <mesh>
        <sphereGeometry args={[5, 64, 32]} />
        <meshPhongMaterial 
          map={fallbackEarth}
          transparent
          opacity={tilesRef.current ? 0 : 1}
        />
      </mesh>

      {/* 地面站 */}
      {renderGroundStations()}

      {/* 大气层效果 */}
      <mesh>
        <sphereGeometry args={[5.2, 32, 32]} />
        <meshBasicMaterial
          color="#87ceeb"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
        />
      </mesh>
    </group>
  )
}

export default CesiumEarth 