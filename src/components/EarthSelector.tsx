import React from 'react'
import CesiumEarth from './CesiumEarth'
import NASAEarth from './NASAEarth'
import RealisticEarth from './RealisticEarth'

export type EarthType = 'cesium' | 'nasa' | 'google' | 'simple'

interface EarthSelectorProps {
  earthType: EarthType
}

const EARTH_MODELS = {
  cesium: {
    component: CesiumEarth,
    name: 'Cesium World Terrain',
    description: '免费高精度全球地形数据',
    features: ['1米精度地形', '全球覆盖', '无需API密钥', '3D建筑物'],
    pros: ['完全免费', '高性能3D Tiles', '实时加载'],
    cons: ['需要网络连接', '首次加载较慢']
  },
  nasa: {
    component: NASAEarth,
    name: 'NASA Blue Marble',
    description: '最高质量免费地球纹理',
    features: ['日夜变化', '云层动画', '地形细节', '大气效果'],
    pros: ['视觉效果极佳', '完全免费', '支持自定义shader'],
    cons: ['纹理文件较大', '需要下载完成才显示']
  },
  google: {
    component: RealisticEarth,
    name: 'Google Photorealistic 3D Tiles',
    description: '真实感最强的3D地球模型',
    features: ['照片级真实感', '详细建筑物', '全球2500+城市'],
    pros: ['最真实的视觉效果', '包含详细建筑'],
    cons: ['需要API密钥', '有使用限制', '费用较高']
  },
  simple: {
    component: () => (
      <mesh>
        <sphereGeometry args={[5, 32, 32]} />
        <meshPhongMaterial color="#4a90e2" emissive="#001122" />
      </mesh>
    ),
    name: '简单地球',
    description: '基础几何体地球',
    features: ['极轻量', '无网络依赖', '性能最佳'],
    pros: ['加载极快', '性能最好', '无依赖'],
    cons: ['视觉效果基础', '无真实纹理']
  }
}

const EarthSelector: React.FC<EarthSelectorProps> = ({ earthType }) => {
  const EarthComponent = EARTH_MODELS[earthType].component

  return <EarthComponent />
}

export default EarthSelector
export { EARTH_MODELS } 