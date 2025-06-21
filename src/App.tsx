import React, { Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls, Stars } from '@react-three/drei'
import { useAppStore } from './store/appStore'
import { LanguageProvider } from './i18n/useTranslation'
import SatelliteScene from './components/SatelliteScene'
import ControlPanel from './components/ControlPanel'
import SatelliteInfoPanel from './components/SatelliteInfoPanel'
import GroundStationPanel from './components/GroundStationPanel'
import DraggablePanel from './components/DraggablePanel'
import LanguageToggle from './components/LanguageToggle'

function AppContent() {
  const { setSelectedSatellite } = useAppStore()

  // 处理点击空白区域取消选中
  const handleCanvasClick = (event: any) => {
    // 检查是否点击的是Canvas本身（而不是其中的3D对象）
    if (event.eventObject === event.object) {
      setSelectedSatellite(null)
    }
  }

  return (
    <div style={{ width: '100vw', height: '100vh' }}>
      {/* 3D Scene */}
      <Canvas
        camera={{ position: [20, 10, 20], fov: 60 }}
        style={{ background: '#000011' }}
        gl={{ 
          antialias: true, 
          alpha: false,
          powerPreference: 'high-performance'
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#000011')
        }}
        onClick={handleCanvasClick}
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[30, 30, 30]} intensity={2} />
        <pointLight position={[-30, -30, -30]} intensity={1} />
        <directionalLight position={[10, 10, 10]} intensity={1} />
        
        <Suspense fallback={
          <mesh>
            <sphereGeometry args={[5, 32, 32]} />
            <meshBasicMaterial color="#4a90e2" />
          </mesh>
        }>
          <SatelliteScene />
          <Stars 
            radius={300} 
            depth={100} 
            count={8000} 
            factor={3} 
            saturation={0} 
            fade 
            speed={0.5} 
          />
        </Suspense>
        
        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={8}
          maxDistance={100}
          autoRotate={false}
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* UI Panels - 可拖拽版本 */}
      <div onClick={(e) => e.stopPropagation()}>
        <DraggablePanel
          titleKey="timeAndDisplayControl"
          defaultPosition={{ x: 20, y: 20 }}
        >
          <ControlPanel />
        </DraggablePanel>

        <DraggablePanel
          titleKey="satelliteInfo"
          defaultPosition={{ x: typeof window !== 'undefined' ? window.innerWidth - 350 : 1000, y: 20 }}
          className="satellite-info-panel-wrapper"
        >
          <SatelliteInfoPanel />
        </DraggablePanel>

        <DraggablePanel
          titleKey="groundStationControl"
          defaultPosition={{ x: 20, y: typeof window !== 'undefined' ? window.innerHeight - 20 - 300 : 500 }}
        >
          <GroundStationPanel />
        </DraggablePanel>
      </div>

      {/* 语言切换按钮 */}
      <LanguageToggle />
    </div>
  )
}

function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  )
}

export default App