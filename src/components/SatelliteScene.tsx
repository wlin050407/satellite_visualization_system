import React, { useRef, useMemo, Suspense, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Text, Html } from '@react-three/drei'
import { useAppStore } from '../store/appStore'
import { SATELLITE_IDS, tleService } from '../services/tleService'
import Real3DSatellite from './Real3DSatellite'
import * as THREE from 'three'
import * as satellite from 'satellite.js'

// NASA地球组件 - 地球本身不自转，通过场景旋转来模拟
const NASAEarth: React.FC<{ timeSpeed: number }> = ({ timeSpeed }) => {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)

  // 使用可靠的地球纹理
  const textures = useMemo(() => {
    const loader = new THREE.TextureLoader()
    const dayTexture = loader.load('https://threejs.org/examples/textures/planets/earth_atmos_2048.jpg')
    const cloudTexture = loader.load('https://threejs.org/examples/textures/planets/earth_clouds_1024.png')
    return { dayTexture, cloudTexture }
  }, [])

  // 地球材质
  const earthMaterial = useMemo(() => {
    return new THREE.MeshPhongMaterial({
      map: textures.dayTexture,
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

  // 云层独立旋转以产生动态效果
  useFrame((state, delta) => {
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y += delta * 0.03 * timeSpeed // 云层相对地球缓慢移动，速度受timeSpeed控制
    }
  })

  return (
    <group>
      {/* 地球主体 - 不自转 */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[5, 64, 64]} />
        <primitive object={earthMaterial} />
      </mesh>

      {/* 云层 - 独立缓慢旋转 */}
      <mesh ref={cloudsRef}>
        <sphereGeometry args={[5.02, 64, 64]} />
        <primitive object={cloudMaterial} />
      </mesh>
      
      {/* 大气层光晕 */}
      <mesh>
        <sphereGeometry args={[5.3, 32, 32]} />
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

// 自定义Billboard文字组件 - 确保文字始终正确朝向
const BillboardText: React.FC<{
  position: [number, number, number]
  fontSize: number
  color: string
  children: React.ReactNode
}> = ({ position, fontSize, color, children }) => {
  const textRef = useRef<any>(null)
  const { camera } = useThree()
  
  useFrame(() => {
    if (textRef.current && camera) {
      // 让文字面向摄像机
      textRef.current.lookAt(camera.position)
      // 修正文字的上方向，防止倒置
      textRef.current.up.set(0, 1, 0)
    }
  })
  
  return (
    <group position={position}>
      <Text
        ref={textRef}
        fontSize={fontSize}
        color={color}
        anchorX="center"
        anchorY="middle"
        outlineWidth={0.02}
        outlineColor="#000000"
        material-transparent={true}
        material-depthWrite={false}
        renderOrder={1000}
      >
        {children}
      </Text>
    </group>
  )
}

// 卫星组件 - 使用真实的TLE轨道数据
const Satellite: React.FC<{
  orbitRadius: number
  orbitInclination: number
  name: string
  color: string
  speed: number
  id: string
  initialAngle: number
  modelType: 'iss' | 'hubble' | 'starlink' | 'gps' | 'tiangong' | 'sentinel'
  noradId: number
  timeSpeed: number
  showLabels: boolean
}> = ({ orbitRadius, orbitInclination, name, color, speed, id, initialAngle, modelType, noradId, timeSpeed, showLabels }) => {
  const meshRef = useRef<THREE.Group>(null)
  const orbitRef = useRef<THREE.Group>(null)
  const selectedRingRef = useRef<THREE.Mesh>(null)
  const { selectedSatellite, setSelectedSatellite } = useAppStore()
  
  // 累积时间系统 - 避免timeSpeed改变时的跳跃
  const accumulatedTimeRef = useRef(0)
  const lastFrameTimeRef = useRef(0)
  const lastTimeSpeedRef = useRef(timeSpeed)
  
  // 真实轨道计算状态
  const [satrec, setSatrec] = useState<any>(null)
  const [realOrbitPath, setRealOrbitPath] = useState<THREE.Vector3[]>([])
  const [useRealOrbit, setUseRealOrbit] = useState(false)
  
  // 运动状态指示器
  const [currentAngle, setCurrentAngle] = useState(0)
  const [positionInfo, setPositionInfo] = useState('')
  
  // 检查当前卫星是否被选中
  const isSelected = selectedSatellite === id

  // 改进的高度缩放函数
  const calculateRadius = (alt: number) => {
    const earthRadius = 5
    
    if (alt <= 1000) {
      // 低地球轨道 (LEO): 200-1000km
      return earthRadius + (alt / 400) * 1.0 // 400km对应1.0单位
    } else if (alt <= 2000) {
      // 中低轨道: 1000-2000km
      return earthRadius + 1.0 + ((alt - 1000) / 1000) * 1.5
    } else if (alt <= 25000) {
      // 中地球轨道 (MEO): 2000-25000km，包括GPS
      return earthRadius + 2.5 + ((alt - 2000) / 23000) * 6.0 // GPS约在8.5单位
    } else {
      // 地球同步轨道 (GEO): >25000km
      return earthRadius + 8.5 + ((alt - 25000) / 10000) * 2.0
    }
  }

  // 加载真实TLE数据并计算轨道
  useEffect(() => {
    const loadTLEData = async () => {
      try {
        console.log(`${name}: 开始加载TLE数据...`)
        const tleString = await tleService.getTLE(noradId)
        if (tleString) {
          console.log(`${name}: TLE数据获取成功`)
          const tleLine1 = tleString.split('\n')[0]
          const tleLine2 = tleString.split('\n')[1]
          const satrec = satellite.twoline2satrec(tleLine1, tleLine2)
          
          if (satrec) {
            setSatrec(satrec)
            console.log(`${name}: TLE解析成功`)
            
            // 计算真实轨道路径 - 使用ECI坐标系避免扭曲
            const path: THREE.Vector3[] = []
            const now = new Date()
            
            // 根据卫星类型确定轨道周期 - 使用准确的真实数据
            let orbitPeriod = 90 * 60 // 默认90分钟（秒）
            if (name.includes('GPS')) {
              orbitPeriod = 12 * 60 * 60 // GPS: 12小时 (真实数据)
            } else if (name.includes('Sentinel')) {
              orbitPeriod = 100 * 60 // Sentinel: 100分钟（太阳同步轨道）
            } else if (name.includes('Starlink')) {
              orbitPeriod = 95 * 60 // Starlink: 95分钟 (真实数据)
            } else if (name.includes('Hubble')) {
              orbitPeriod = 95 * 60 // Hubble: 95分钟 (修正为准确数据)
            } else if (name.includes('ISS')) {
              orbitPeriod = 93 * 60 // ISS: 93分钟 (真实数据)
            } else if (name.includes('Tiangong')) {
              orbitPeriod = 93 * 60 // 天宫: 93分钟 (与ISS类似高度)
            }
            
            const step = Math.max(60, orbitPeriod / 100) // 确保至少100个点，但不少于60秒间隔
            const totalPoints = Math.floor(orbitPeriod / step)
            
            console.log(`${name}: 计算轨道路径，周期=${orbitPeriod/60}分钟，${totalPoints}个点`)
            
            // 计算完整轨道周期的路径点
            for (let i = 0; i < totalPoints; i++) {
              const time = new Date(now.getTime() + i * step * 1000)
              const positionAndVelocity = satellite.propagate(satrec, time)
              
              if (positionAndVelocity && typeof positionAndVelocity.position !== 'boolean') {
                const position = positionAndVelocity.position
                
                // 直接使用ECI坐标系，避免地理坐标转换导致的扭曲
                const eciX = position.x // km
                const eciY = position.y // km
                const eciZ = position.z // km
                
                // 检查ECI坐标有效性
                if (!isNaN(eciX) && !isNaN(eciY) && !isNaN(eciZ)) {
                  // 计算距离地心的距离
                  const distance = Math.sqrt(eciX * eciX + eciY * eciY + eciZ * eciZ)
                  
                  // 更严格的距离检查，防止异常轨道
                  if (distance > 6000 && distance < 50000) { // 6000km到50000km之间
                    // 缩放到场景尺度（地球半径为5个单位）
                    // 增加视觉高度因子，让轨道看起来不那么贴近地球
                    const earthRadiusKm = 6371.0
                    const sceneEarthRadius = 5.0
                    
                    // 计算轨道高度
                    const altitude = distance - earthRadiusKm
                    
                    // 应用视觉高度增强因子
                    let visualAltitude = altitude
                    if (altitude < 1000) {
                      // 低地球轨道：增强2倍视觉高度
                      visualAltitude = altitude * 2.0 + 300 // 最小视觉间距300km
                    } else if (altitude < 2000) {
                      // 中低轨道：增强1.5倍
                      visualAltitude = altitude * 1.5 + 500
                    } else {
                      // 高轨道：保持真实比例
                      visualAltitude = altitude
                    }
                    
                    const visualDistance = earthRadiusKm + visualAltitude
                    const scale = sceneEarthRadius / earthRadiusKm
                    const visualRadius = visualDistance * scale
                    
                    // ECI到场景坐标系的转换：
                    // ECI_X -> Scene_X, ECI_Z -> Scene_Y, ECI_Y -> Scene_Z
                    // 使用单位向量乘以视觉半径
                    const unitX = eciX / distance
                    const unitY = eciY / distance  
                    const unitZ = eciZ / distance
                    
                    const sceneX = unitX * visualRadius
                    const sceneY = unitZ * visualRadius  // ECI的Z轴（北极方向）对应场景的Y轴（向上）
                    const sceneZ = unitY * visualRadius  // ECI的Y轴对应场景的Z轴
                    
                    // 检查场景坐标的合理性
                    const sceneDistance = Math.sqrt(sceneX * sceneX + sceneY * sceneY + sceneZ * sceneZ)
                    if (sceneDistance > 5.5 && sceneDistance < 50) { // 调整合理范围
                      path.push(new THREE.Vector3(sceneX, sceneY, sceneZ))
                    } else {
                      console.warn(`${name}: 场景坐标超出范围，距离=${sceneDistance.toFixed(2)}`)
                    }
                  } else {
                    console.warn(`${name}: 轨道距离异常，距离=${distance.toFixed(0)}km`)
                  }
                }
              }
            }
            
            // 验证轨道路径质量
            if (path.length > totalPoints * 0.8) { // 至少80%的点有效
              // 闭合轨道路径 - 连接最后一点到第一点
              path.push(path[0].clone())
              
              // 检查轨道路径的连续性
              let maxDistance = 0
              for (let i = 1; i < path.length; i++) {
                const dist = path[i].distanceTo(path[i-1])
                maxDistance = Math.max(maxDistance, dist)
              }
              
              // 根据轨道类型设置不同的连续性标准
              let maxAllowedDistance = 1.5 // 降低默认标准，因为轨道更分散了
              if (name.includes('GPS')) {
                maxAllowedDistance = 8.0 // GPS高轨道，允许更大间距
              } else if (name.includes('Sentinel')) {
                maxAllowedDistance = 2.5 // 极地轨道，稍微宽松
              }
              
              if (maxDistance < maxAllowedDistance) {
                setRealOrbitPath(path)
                setUseRealOrbit(true)
                console.log(`${name}: 真实轨道数据加载成功，${path.length} 个轨道点，最大间距=${maxDistance.toFixed(3)}`)
              } else {
                console.warn(`${name}: 轨道路径不连续（最大间距=${maxDistance.toFixed(3)} > ${maxAllowedDistance}），使用简化轨道`)
                setUseRealOrbit(false)
              }
            } else {
              console.warn(`${name}: 轨道路径质量不佳（${path.length}/${totalPoints} 点有效），使用简化轨道`)
              setUseRealOrbit(false)
            }
          } else {
            console.warn(`${name}: TLE解析失败，使用简化轨道`)
            setUseRealOrbit(false)
          }
        } else {
          console.warn(`${name}: TLE数据获取失败，使用简化轨道`)
          setUseRealOrbit(false)
        }
      } catch (error) {
        console.warn(`${name}: TLE数据加载失败，使用简化轨道`, error)
        setUseRealOrbit(false)
      }
      
      // 确保最终状态明确
      console.log(`${name}: 最终模式 - useRealOrbit=${useRealOrbit}`)
    }
    
    loadTLEData()
  }, [noradId, name])
  
  // 创建轨道线几何体 - 使用真实轨道或简化轨道
  const orbitGeometry = useMemo(() => {
    // 优先使用真实轨道路径
    if (useRealOrbit && realOrbitPath.length > 0) {
      console.log(`${name}: 使用真实TLE轨道路径，${realOrbitPath.length} 个点`)
      return new THREE.BufferGeometry().setFromPoints(realOrbitPath)
    } else {
      // 备用简化轨道
      const points = []
      for (let i = 0; i <= 64; i++) {
        const angle = (i / 64) * Math.PI * 2
        // 简单的圆形轨道，确保在地球外部
        const x = Math.cos(angle) * orbitRadius
        const y = 0
        const z = Math.sin(angle) * orbitRadius
        points.push(new THREE.Vector3(x, y, z))
      }
      console.log(`${name}: 使用简化圆形轨道，半径=${orbitRadius}`)
      return new THREE.BufferGeometry().setFromPoints(points)
    }
  }, [orbitRadius, useRealOrbit, realOrbitPath, name])

  // 创建高质量的真实卫星模型 - 使用NASA官方3D模型
  const satelliteModel = useMemo(() => (
    <Real3DSatellite 
      modelType={modelType}
      scale={0.03}
      color={color}
    />
  ), [modelType, color])

  // 真实轨道运动计算
  useFrame((state, delta) => {
    if (orbitRef.current && meshRef.current) {
      // 累积时间计算 - 平滑处理timeSpeed变化
      const currentFrameTime = state.clock.elapsedTime
      
      // 如果timeSpeed改变了，重置时间基准
      if (lastTimeSpeedRef.current !== timeSpeed) {
        lastTimeSpeedRef.current = timeSpeed
      }
      
      // 计算这一帧的时间增量
      const frameTimeDelta = currentFrameTime - lastFrameTimeRef.current
      lastFrameTimeRef.current = currentFrameTime
      
      // 累积加速时间
      accumulatedTimeRef.current += frameTimeDelta * timeSpeed
      
      // 启用真实轨道系统
      if (useRealOrbit && satrec && realOrbitPath.length > 0) {
        // 使用实时TLE计算当前位置
        try {
          const now = new Date()
          const accelerationFactor = 60 // 基础加速倍数
          const acceleratedTime = new Date(now.getTime() + accumulatedTimeRef.current * 1000 * accelerationFactor)
          
          // 使用SGP4模型计算实时位置
          const positionAndVelocity = satellite.propagate(satrec, acceleratedTime)
          
          if (positionAndVelocity && typeof positionAndVelocity.position !== 'boolean') {
            const position = positionAndVelocity.position
            
            // 直接使用ECI坐标系，与轨道路径计算保持一致
            const eciX = position.x // km
            const eciY = position.y // km
            const eciZ = position.z // km
            
            // 检查ECI坐标有效性
            if (!isNaN(eciX) && !isNaN(eciY) && !isNaN(eciZ)) {
              // 计算距离地心的距离
              const distance = Math.sqrt(eciX * eciX + eciY * eciY + eciZ * eciZ)
              
              if (distance > 6000) { // 确保在地球外部
                // 缩放到场景尺度（地球半径为5个单位）
                // 增加视觉高度因子，让轨道看起来不那么贴近地球
                const earthRadiusKm = 6371.0
                const sceneEarthRadius = 5.0
                
                // 计算轨道高度
                const altitude = distance - earthRadiusKm
                
                // 应用视觉高度增强因子
                let visualAltitude = altitude
                if (altitude < 1000) {
                  // 低地球轨道：增强2倍视觉高度
                  visualAltitude = altitude * 2.0 + 300 // 最小视觉间距300km
                } else if (altitude < 2000) {
                  // 中低轨道：增强1.5倍
                  visualAltitude = altitude * 1.5 + 500
                } else {
                  // 高轨道：保持真实比例
                  visualAltitude = altitude
                }
                
                const visualDistance = earthRadiusKm + visualAltitude
                const scale = sceneEarthRadius / earthRadiusKm
                const visualRadius = visualDistance * scale
                
                // ECI到场景坐标系的转换（与轨道路径计算一致）
                const unitX = eciX / distance
                const unitY = eciY / distance  
                const unitZ = eciZ / distance
                
                const sceneX = unitX * visualRadius
                const sceneY = unitZ * visualRadius  // ECI的Z轴（北极方向）对应场景的Y轴（向上）
                const sceneZ = unitY * visualRadius  // ECI的Y轴对应场景的Z轴
                
                // 设置卫星位置
                meshRef.current.position.set(sceneX, sceneY, sceneZ)
                meshRef.current.lookAt(0, 0, 0)
                
                // 计算地理坐标用于显示（可选）
                const gmst = satellite.gstime(acceleratedTime)
                const geodeticCoords = satellite.eciToGeodetic(position, gmst)
                const lat = (geodeticCoords.latitude * 180 / Math.PI) // 手动转换弧度到度数
                const lng = (geodeticCoords.longitude * 180 / Math.PI) // 手动转换弧度到度数
                const alt = geodeticCoords.height
                
                // 更新位置信息
                setPositionInfo(`${lat.toFixed(1)}°,${lng.toFixed(1)}°,${alt.toFixed(0)}km`)
                
                // 调试信息
                if (Math.floor(state.clock.elapsedTime) % 5 === 0 && Math.floor(state.clock.elapsedTime * 10) % 10 === 0) {
                  console.log(`${name} ECI轨道: 距离=${distance.toFixed(0)}km, 场景坐标=(${sceneX.toFixed(2)}, ${sceneY.toFixed(2)}, ${sceneZ.toFixed(2)})`)
                }
              }
            }
          } else {
            // SGP4计算失败，回退到路径插值
            console.warn(`${name}: SGP4计算失败，使用路径插值`)
            usePathInterpolation(state, realOrbitPath)
          }
        } catch (error) {
          console.warn(`${name}: 实时计算失败，使用路径插值`, error)
          usePathInterpolation(state, realOrbitPath)
        }
      } else {
        // 简化轨道模式 - 卫星在轨道坐标系中运动
        const angle = accumulatedTimeRef.current * speed + initialAngle
        
        // 简单的圆形轨道运动
        const x = Math.cos(angle) * orbitRadius
        const z = Math.sin(angle) * orbitRadius
        const y = 0 // 在轨道平面内
        
        // 设置卫星在轨道坐标系中的位置
        meshRef.current.position.set(x, y, z)
        meshRef.current.lookAt(0, 0, 0)
        
        // 更新运动状态
        setCurrentAngle(angle * 180 / Math.PI)
        setPositionInfo(`${(angle * 180 / Math.PI).toFixed(0)}°`)
        
        // 简化模式的调试信息
        if (Math.floor(state.clock.elapsedTime) % 5 === 0 && Math.floor(state.clock.elapsedTime * 10) % 10 === 0) {
          console.log(`${name} 圆形轨道: 角度=${(angle * 180 / Math.PI).toFixed(1)}°, 半径=${orbitRadius}`)
        }
      }
      
      // 选中状态特效
      if (isSelected) {
        // 非常微妙的放大效果
        const scale = 1.05 + Math.sin(state.clock.elapsedTime * 1.0) * 0.02
        meshRef.current.scale.setScalar(scale)
        
        // 选中光环缓慢旋转
        if (selectedRingRef.current) {
          selectedRingRef.current.rotation.z += delta * 0.4
        }
      } else {
        // 恢复正常大小
        meshRef.current.scale.setScalar(1.0)
      }
    }
  })

  // 路径插值方法（备用）
  const usePathInterpolation = (state: any, path: THREE.Vector3[]) => {
    if (path.length === 0 || !meshRef.current) return
    
    // 计算当前应该在轨道路径上的哪个点
    const orbitPeriod = 90 * 60 // 90分钟轨道周期（秒）
    const accelerationFactor = 60 // 基础加速倍数
    const acceleratedTime = accumulatedTimeRef.current * accelerationFactor
    
    // 计算在轨道周期中的位置（0-1）
    const orbitPosition = (acceleratedTime % orbitPeriod) / orbitPeriod
    
    // 计算精确的轨道点位置（支持插值）
    const exactIndex = orbitPosition * path.length
    const pathIndex1 = Math.floor(exactIndex) % path.length
    const pathIndex2 = (pathIndex1 + 1) % path.length
    const t = exactIndex - Math.floor(exactIndex) // 插值参数
    
    const point1 = path[pathIndex1]
    const point2 = path[pathIndex2]
    
    if (point1 && point2) {
      // 线性插值获得平滑位置
      const currentPoint = new THREE.Vector3()
      currentPoint.lerpVectors(point1, point2, t)
      
      // 直接使用预计算的轨道点
      meshRef.current.position.copy(currentPoint)
      meshRef.current.lookAt(0, 0, 0)
      
      // 计算显示用的地理坐标（近似）
      const distance = currentPoint.length()
      const lat = Math.asin(currentPoint.y / distance) * 180 / Math.PI
      const lng = Math.atan2(currentPoint.z, currentPoint.x) * 180 / Math.PI
      
      // 更新位置信息
      setPositionInfo(`${lat.toFixed(1)}°,${lng.toFixed(1)}°`)
    }
  }

  return (
    <group ref={orbitRef} rotation={useRealOrbit ? [0, 0, 0] : [0, 0, orbitInclination * Math.PI / 180]}>
      {/* 轨道线 - 修复断开问题，使用正确的Line对象 */}
      <primitive object={new THREE.Line(orbitGeometry, new THREE.LineBasicMaterial({ 
        color: color, 
        transparent: true, 
        opacity: isSelected ? 0.9 : (orbitRadius > 15 ? 0.8 : 0.7),
        linewidth: isSelected ? 4 : 2
      }))} />
      
      {/* 卫星模型 */}
      <group 
        ref={meshRef}
        onClick={(e) => {
          e.stopPropagation()
          setSelectedSatellite(id)
        }}
        onPointerOver={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'pointer'
        }}
        onPointerOut={(e) => {
          e.stopPropagation()
          document.body.style.cursor = 'default'
        }}
      >
        <Suspense fallback={
          <mesh>
            <boxGeometry args={[0.5, 0.3, 0.8]} />
            <meshStandardMaterial color={color} />
          </mesh>
        }>
          {satelliteModel}
        </Suspense>
        
        {/* 选中状态的特效 - 低调版本 */}
        {isSelected && (
          <>
            {/* 低调的选中光环 */}
            <mesh ref={selectedRingRef}>
              <ringGeometry args={[0.55, 0.65, 32]} />
              <meshBasicMaterial 
              color={color} 
                transparent
                opacity={0.6}
                side={THREE.DoubleSide}
            />
          </mesh>

            {/* 外层淡光环 */}
            <mesh>
              <ringGeometry args={[0.7, 0.8, 32]} />
              <meshBasicMaterial 
                color={color}
                transparent
                opacity={0.25}
                side={THREE.DoubleSide}
            />
          </mesh>

            {/* 低调的选中指示线框 */}
            <mesh>
              <boxGeometry args={[1.0, 1.0, 1.0]} />
              <meshBasicMaterial 
                color="#ffffff"
                transparent 
                opacity={0.2}
                wireframe
            />
          </mesh>
          </>
        )}

        {/* 卫星标签 - 显示轨道模式 */}
        {showLabels && (
          <BillboardText position={[0, 1.0, 0]} fontSize={isSelected ? 0.17 : 0.16} color={isSelected ? '#ffffff' : color}>
            {name} {useRealOrbit ? '(TLE)' : '(SIM)'} {positionInfo}
          </BillboardText>
        )}

        {/* 信号发射效果 - 只在选中时显示 */}
          {isSelected && (
          <>
            <mesh>
              <sphereGeometry args={[0.052, 8, 8]} />
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0.65} 
              />
            </mesh>
            
            {/* 信号波纹效果 */}
            <mesh>
              <sphereGeometry args={[0.082, 8, 8]} />
              <meshBasicMaterial 
                color={color} 
                transparent 
                opacity={0.17}
                wireframe
              />
            </mesh>
          </>
          )}
      </group>
    </group>
  )
}

const SatelliteScene: React.FC = () => {
  const { selectedSatellite, showOrbits, showLabels, followEarthRotation, setSelectedSatellite, timeSpeed } = useAppStore()
  const earthSystemRef = useRef<THREE.Group>(null) // 地球系统（地球+卫星）
  const sceneRef = useRef<THREE.Group>(null) // 整个场景

  // 卫星数据 - 使用正确的NORAD ID
  const satellites = [
    { 
      id: 'iss', 
      name: 'ISS', 
      orbitRadius: 6.8, 
      orbitInclination: 51.6, 
      color: '#ff6b6b', 
      speed: 1.0, // 基准速度 (93分钟轨道周期)
      initialAngle: 0,
      modelType: 'iss' as const,
      noradId: SATELLITE_IDS.ISS // 25544
    },
    { 
      id: 'hubble', 
      name: 'Hubble', 
      orbitRadius: 7.2, 
      orbitInclination: 28.5, 
      color: '#4ecdc4', 
      speed: 0.98, // 稍慢于ISS (95分钟 vs 93分钟)
      initialAngle: Math.PI,
      modelType: 'hubble' as const,
      noradId: SATELLITE_IDS.HUBBLE // 20580
    },
    { 
      id: 'starlink', 
      name: 'Starlink', 
      orbitRadius: 7.5, 
      orbitInclination: 53, 
      color: '#45b7d1', 
      speed: 0.98, // 与哈勃相似 (95分钟)
      initialAngle: Math.PI/2,
      modelType: 'starlink' as const,
      noradId: SATELLITE_IDS.STARLINK // 44713
    },
    { 
      id: 'gps', 
      name: 'GPS', 
      orbitRadius: 12, // 调整GPS简化轨道半径
      orbitInclination: 55, 
      color: '#96ceb4', 
      speed: 0.13, // 非常慢 (12小时 vs 93分钟 = 93/720 ≈ 0.13)
      initialAngle: Math.PI * 1.5,
      modelType: 'gps' as const,
      noradId: SATELLITE_IDS.GPS // 32711
    },
    { 
      id: 'tiangong', 
      name: 'Tiangong', 
      orbitRadius: 6.4, 
      orbitInclination: 41.5, 
      color: '#ffd93d', 
      speed: 1.0, // 与ISS相同速度 (93分钟)
      initialAngle: Math.PI * 0.25,
      modelType: 'tiangong' as const, // 使用天宫专用模型
      noradId: SATELLITE_IDS.TIANGONG
    },
    { 
      id: 'sentinel', 
      name: 'Sentinel', 
      orbitRadius: 9.8, 
      orbitInclination: 98.6, 
      color: '#6c5ce7', 
      speed: 0.93, // 稍慢 (100分钟)
      initialAngle: Math.PI * 0.75,
      modelType: 'sentinel' as const, // 使用Sentinel模型作为观测卫星
      noradId: SATELLITE_IDS.SENTINEL
    }
  ]

  // 地球系统旋转（模拟地球自转）
  useFrame((state, delta) => {
    if (earthSystemRef.current) {
      // 地球系统始终自转，速度受timeSpeed控制
      earthSystemRef.current.rotation.y += delta * 0.05 * timeSpeed
    }
    
    if (sceneRef.current) {
      if (followEarthRotation) {
        // 地球固定视角：观察者跟随地球旋转
        // 整个场景反向旋转，抵消地球自转效果
        sceneRef.current.rotation.y -= delta * 0.05 * timeSpeed
      }
      // 惯性空间视角：观察者固定，可以看到地球自转
    }
  })

  return (
    <group ref={sceneRef}>
      {/* 隐形背景平面 - 捕获点击事件以取消选中 */}
      <mesh
        position={[0, 0, 0]}
        onClick={(event) => {
          event.stopPropagation()
          setSelectedSatellite(null)
        }}
      >
        <sphereGeometry args={[200, 32, 32]} />
        <meshBasicMaterial 
          transparent 
          opacity={0} 
          side={THREE.BackSide}
        />
      </mesh>

      {/* 惯性空间中的真实轨道卫星 - 不受地球自转影响 */}
      {showOrbits && satellites.map((satellite) => (
        <group key={`inertial-${satellite.id}`}>
        <Satellite
            key={satellite.id}
            orbitRadius={satellite.orbitRadius}
            orbitInclination={satellite.orbitInclination}
            name={satellite.name}
            color={satellite.color}
            speed={satellite.speed}
            id={satellite.id}
            initialAngle={satellite.initialAngle}
            modelType={satellite.modelType}
            noradId={satellite.noradId}
            timeSpeed={timeSpeed}
            showLabels={showLabels}
          />
        </group>
      ))}

      <group ref={earthSystemRef}>
        {/* NASA地球 */}
        <NASAEarth timeSpeed={timeSpeed} />

        {/* 简化轨道卫星系统 - 与地球在同一旋转系统中（备用） */}
        {/* 当TLE数据不可用时，这些卫星会跟随地球旋转 */}
      </group>
    </group>
  )
}

export default SatelliteScene 