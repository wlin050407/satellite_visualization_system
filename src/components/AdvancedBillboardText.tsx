import React, { useRef, useState, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'

interface AdvancedBillboardTextProps {
  position: [number, number, number]
  fontSize: number
  color: string
  children: React.ReactNode
  occludeObjects?: THREE.Object3D[] // 指定哪些对象可以遮挡文字
}

const AdvancedBillboardText: React.FC<AdvancedBillboardTextProps> = ({ 
  position, 
  fontSize, 
  color, 
  children,
  occludeObjects = []
}) => {
  const { camera, scene } = useThree()
  const [isVisible, setIsVisible] = useState(true)
  const raycaster = useRef(new THREE.Raycaster())
  const worldPosition = useRef(new THREE.Vector3())
  
  // 每帧检测遮挡
  useFrame(() => {
    if (occludeObjects.length === 0) {
      setIsVisible(true)
      return
    }
    
    // 设置世界坐标
    worldPosition.current.set(position[0], position[1], position[2])
    
    // 计算从相机到文字位置的方向
    const direction = worldPosition.current.clone().sub(camera.position).normalize()
    const distance = camera.position.distanceTo(worldPosition.current)
    
    // 设置射线
    raycaster.current.set(camera.position, direction)
    
    // 检测是否被指定对象遮挡
    const intersections = raycaster.current.intersectObjects(occludeObjects, true)
    
    // 如果有交点且距离小于文字距离，说明被遮挡
    const occluded = intersections.length > 0 && intersections[0].distance < distance - 0.1
    
    setIsVisible(!occluded)
  })
  
  return (
    <Html
      position={position}
      center
      distanceFactor={8}
      transform
      sprite
      style={{
        color: color,
        fontSize: `${Math.max(12, fontSize * 40)}px`,
        fontWeight: 'bold',
        textShadow: '1px 1px 3px rgba(0,0,0,0.9)',
        pointerEvents: 'none',
        userSelect: 'none',
        whiteSpace: 'nowrap',
        fontFamily: 'Arial, sans-serif',
        transition: 'opacity 0.3s ease',
        opacity: isVisible ? 1 : 0, // 根据遮挡状态控制透明度
        backfaceVisibility: 'hidden',
        WebkitBackfaceVisibility: 'hidden',
        minWidth: 'max-content'
      }}
    >
      {children}
    </Html>
  )
}

export default AdvancedBillboardText 