import React, { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import * as THREE from 'three'

interface Text3DProps {
  position: [number, number, number]
  fontSize: number
  color: string
  children: React.ReactNode
  billboard?: boolean // 是否始终面向相机
  maxWidth?: number
}

const Text3D: React.FC<Text3DProps> = ({ 
  position, 
  fontSize, 
  color, 
  children,
  billboard = true,
  maxWidth = 200
}) => {
  const textRef = useRef<THREE.Mesh>(null)
  
  // Billboard效果 - 文字始终面向相机
  useFrame(({ camera }) => {
    if (billboard && textRef.current) {
      textRef.current.lookAt(camera.position)
    }
  })
  
  return (
    <Text
      ref={textRef}
      position={position}
      fontSize={fontSize}
      color={color}
      anchorX="center"
      anchorY="middle"
      maxWidth={maxWidth}
      textAlign="center"
      font="/fonts/helvetiker_regular.typeface.json" // 需要添加字体文件
      // 材质配置
      material-depthTest={true} // 启用深度测试，实现正确遮挡
      material-depthWrite={true}
      material-transparent={true}
      material-opacity={0.9}
      // 文字描边效果
      outlineWidth={0.005}
      outlineColor="#000000"
      // 阴影效果
      material-fog={true}
    >
      {children}
    </Text>
  )
}

export default Text3D 