import React, { useEffect, useState, Suspense } from 'react'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useAppStore } from '../store/appStore'
import { tleService, SATELLITE_IDS, SatellitePosition } from '../services/tleService'
import Real3DSatellite from './Real3DSatellite'
import * as THREE from 'three'

const SatelliteInfoPanel: React.FC = () => {
  const { selectedSatellite, setSelectedSatellite } = useAppStore()
  const [realPosition, setRealPosition] = useState<SatellitePosition | null>(null)
  const [orbitalElements, setOrbitalElements] = useState<any>(null)
  const [showLargePreview, setShowLargePreview] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  const satellites = [
    { 
      id: 'iss', 
      name: 'International Space Station', 
      status: 'online', 
      altitude: 408, 
      inclination: 51.6,
      orbitRadius: 6.8,
      description: '低地球轨道空间站',
      modelType: 'iss' as const,
      color: '#ff6b6b',
      noradId: SATELLITE_IDS.ISS
    },
    { 
      id: 'hubble', 
      name: 'Hubble Space Telescope', 
      status: 'online', 
      altitude: 547, 
      inclination: 28.5,
      orbitRadius: 8.5,
      description: '天文观测卫星',
      modelType: 'hubble' as const,
      color: '#4ecdc4',
      noradId: SATELLITE_IDS.HUBBLE
    },
    { 
      id: 'starlink', 
      name: 'Starlink-1007', 
      status: 'online', 
      altitude: 550, 
      inclination: 53.0,
      orbitRadius: 8.8,
      description: '通信卫星星座',
      modelType: 'starlink' as const,
      color: '#45b7d1',
      noradId: SATELLITE_IDS.STARLINK
    },
    { 
      id: 'gps', 
      name: 'GPS BIIR-2', 
      status: 'online', 
      altitude: 20200, 
      inclination: 55.0,
      orbitRadius: 25,
      description: '全球定位系统',
      modelType: 'gps' as const,
      color: '#96ceb4',
      noradId: SATELLITE_IDS.GPS
    },
    { 
      id: 'tiangong', 
      name: 'Tiangong Space Station', 
      status: 'online', 
      altitude: 340, 
      inclination: 41.5,
      orbitRadius: 6.4,
      description: '中国空间站',
      modelType: 'tiangong' as const,
      color: '#ffd93d',
      noradId: SATELLITE_IDS.TIANGONG
    },
    { 
      id: 'sentinel', 
      name: 'Sentinel-2A', 
      status: 'warning', 
      altitude: 786, 
      inclination: 98.6,
      orbitRadius: 12.8,
      description: '地球观测卫星',
      modelType: 'sentinel' as const,
      color: '#6c5ce7',
      noradId: SATELLITE_IDS.SENTINEL
    },
  ]

  const selectedSat = satellites.find(s => s.id === selectedSatellite)

  // 获取选中卫星的真实位置和轨道参数
  useEffect(() => {
    if (!selectedSat) return

    const updateRealData = async () => {
      try {
        // 获取实时位置
        const position = await tleService.calculatePosition(selectedSat.noradId)
        setRealPosition(position)

        // 获取轨道参数
        const elements = await tleService.getOrbitalElements(selectedSat.noradId)
        setOrbitalElements(elements)
      } catch (error) {
        console.warn(`Failed to get real data for ${selectedSat.name}:`, error)
      }
    }

    updateRealData()
    
    // 每30秒更新一次
    const interval = setInterval(updateRealData, 30000)
    return () => clearInterval(interval)
  }, [selectedSat])

  // 计算实时位置（使用真实数据或模拟数据）
  const getCurrentPosition = (sat: any) => {
    if (realPosition) {
      return {
        x: realPosition.longitude.toFixed(4),
        y: realPosition.latitude.toFixed(4),
        z: realPosition.altitude.toFixed(1)
      }
    }
    
    // 备用模拟位置
    const time = Date.now() * 0.001
    const angle = time * 0.5
    const x = Math.cos(angle) * sat.orbitRadius
    const z = Math.sin(angle) * sat.orbitRadius
    const y = Math.sin(angle) * Math.sin(sat.inclination * Math.PI / 180) * 2
    return { x: x.toFixed(2), y: y.toFixed(2), z: z.toFixed(2) }
  }

  return (
    <>
      <div className="satellite-info-content">
        {/* 卫星选择下拉框 */}
        <div className="control-group">
          <label>选择卫星</label>
          <select 
            value={selectedSatellite || ''} 
            onChange={(e) => setSelectedSatellite(e.target.value || null)}
            style={{
              width: '100%',
              padding: '8px 12px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '4px',
              color: '#fff',
              fontSize: '13px',
              outline: 'none',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.6)'
              e.target.style.boxShadow = '0 0 0 2px rgba(59, 130, 246, 0.2)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
              e.target.style.boxShadow = 'none'
            }}
          >
            <option value="" style={{ background: '#333', color: '#fff' }}>
              请选择卫星...
            </option>
            {satellites.map((satellite) => (
              <option 
                key={satellite.id} 
                value={satellite.id}
                style={{ background: '#333', color: '#fff' }}
              >
                {satellite.name} ({satellite.altitude}km)
              </option>
            ))}
          </select>
        </div>

        {selectedSat && (
          <div>
            {/* 卫星详细信息标题 */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              marginBottom: '12px',
              padding: '8px 12px',
              background: 'rgba(59, 130, 246, 0.1)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '6px'
            }}>
              <span 
                className={`status-indicator status-${selectedSat.status}`}
                style={{ marginRight: '8px' }}
              />
              <div>
                <h4 style={{ margin: 0, color: '#60a5fa' }}>{selectedSat.name}</h4>
                <div style={{ fontSize: '11px', color: '#aaa', marginTop: '2px' }}>
                  {selectedSat.description}
                </div>
              </div>
            </div>

            {/* 3D模型预览区域 - 美观太空主题版 */}
            <div className="control-group satellite-model-preview-container">
              <label>卫星模型预览</label>
              <div 
                className={`satellite-model-preview ${isHovering ? 'hover' : ''}`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => setShowLargePreview(true)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: isHovering ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isHovering 
                    ? '0 8px 25px rgba(59, 130, 246, 0.25), 0 0 15px rgba(255, 255, 255, 0.1)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.3)',
                  border: isHovering 
                    ? '2px solid rgba(59, 130, 246, 0.4)' 
                    : '1px solid #333'
                }}
              >
                <Canvas
                  camera={{ position: [2, 1, 2], fov: 50 }}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    background: 'radial-gradient(circle, #1a1a2e 0%, #16213e 50%, #0f0f1e 100%)'
                  }}
                >
                  {/* 强化光照系统 - 太空主题 */}
                  <ambientLight intensity={0.8} color="#ffffff" />
                  <directionalLight position={[3, 3, 3]} intensity={1.5} color="#ffffff" />
                  <directionalLight position={[-3, -3, -3]} intensity={1.0} color="#b3d9ff" />
                  <pointLight position={[2, 2, 2]} intensity={0.8} color="#ffffff" />
                  <pointLight position={[-2, -2, -2]} intensity={0.6} color="#60a5fa" />
                  <spotLight position={[0, 4, 0]} intensity={1.2} angle={0.5} penumbra={0.5} color="#ffffff" />
                  
                  <Suspense fallback={null}>
                    <Real3DSatellite 
                      modelType={selectedSat.modelType} 
                      scale={0.25}
                      color={selectedSat.color}
                    />
                  </Suspense>
                  
                  <OrbitControls
                    enablePan={false}
                    enableZoom={true}
                    enableRotate={true}
                    minDistance={0.5}
                    maxDistance={8}
                    autoRotate={false}
                  />
                </Canvas>
                
                {/* 悬浮提示 */}
                {isHovering && (
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    background: 'rgba(0, 0, 0, 0.8)',
                    color: '#ffffff',
                    padding: '8px 12px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    pointerEvents: 'none',
                    zIndex: 10,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    点击查看大图
                  </div>
                )}
              </div>
              <div style={{ fontSize: '9px', color: '#666', textAlign: 'center', marginBottom: '8px' }}>
                拖拽旋转 • 滚轮缩放 • 点击放大
              </div>
            </div>
            
            <div className="control-group">
              <label>轨道参数 (TLE数据)</label>
              <div style={{ fontSize: '12px' }}>
                {orbitalElements ? (
                  <>
                    高度: {orbitalElements.altitude.toFixed(1)} km<br/>
                    倾角: {orbitalElements.inclination.toFixed(2)}°<br/>
                    偏心率: {orbitalElements.eccentricity.toFixed(6)}<br/>
                    轨道周期: {orbitalElements.period.toFixed(1)} 分钟<br/>
                    平均运动: {orbitalElements.meanMotion.toFixed(8)} 转/天
                  </>
                ) : (
                  <>
                    高度: {selectedSat.altitude} km<br/>
                    倾角: {selectedSat.inclination}°<br/>
                    轨道半径: {selectedSat.orbitRadius.toFixed(1)} 单位<br/>
                    偏心率: 计算中...
                  </>
                )}
              </div>
            </div>

            <div className="control-group">
              <label>实时位置 {realPosition ? '(TLE实时)' : '(模拟)'}</label>
              <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                {(() => {
                  const pos = getCurrentPosition(selectedSat)
                  return (
                    <>
                      {realPosition ? (
                        <>
                          经度: {pos.x}°<br/>
                          纬度: {pos.y}°<br/>
                          高度: {pos.z} km<br/>
                          速度: {realPosition.velocity.toFixed(2)} km/s
                        </>
                      ) : (
                        <>
                          X: {pos.x}<br/>
                          Y: {pos.y}<br/>
                          Z: {pos.z}
                        </>
                      )}
                    </>
                  )
                })()}
              </div>
            </div>

            <div className="control-group">
              <label>轨道特征</label>
              <div style={{ fontSize: '12px' }}>
                {selectedSat.inclination < 30 && '低倾角轨道'}
                {selectedSat.inclination >= 30 && selectedSat.inclination < 60 && '中倾角轨道'}
                {selectedSat.inclination >= 60 && selectedSat.inclination < 90 && '高倾角轨道'}
                {selectedSat.inclination >= 90 && '极地轨道'}
                <br/>
                {selectedSat.altitude < 1000 && '低地球轨道 (LEO)'}
                {selectedSat.altitude >= 1000 && selectedSat.altitude < 35000 && '中地球轨道 (MEO)'}
                {selectedSat.altitude >= 35000 && '地球同步轨道 (GEO)'}
              </div>
            </div>

            <div className="control-group">
              <label>最后更新</label>
              <div style={{ fontSize: '12px', color: '#ccc' }}>
                {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="control-group">
              <label>TLE数据 (NORAD ID: {selectedSat.noradId})</label>
              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#aaa' }}>
                {orbitalElements ? (
                  `实时TLE数据已获取\n轨道周期: ${orbitalElements.period.toFixed(1)}分钟\n平均运动: ${orbitalElements.meanMotion.toFixed(8)}`
                ) : (
                  `1 ${selectedSat.noradId}U 98067A   21001.00000000\n2 ${selectedSat.noradId}  ${selectedSat.inclination.toFixed(4)} 339.2000 0002829`
                )}
              </div>
            </div>
          </div>
        )}

        <div className="control-group">
          <label>快速选择</label>
          <div className="satellite-list-container">
            <div className="satellite-list">
              {satellites.map((satellite) => (
                <div
                  key={satellite.id}
                  className={`satellite-item ${
                    selectedSatellite === satellite.id ? 'selected' : ''
                  }`}
                  onClick={() => {
                    setSelectedSatellite(satellite.id)
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  <span className={`status-indicator status-${satellite.status}`} />
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '12px' }}>{satellite.name}</div>
                    <div style={{ fontSize: '9px', color: '#888' }}>
                      {satellite.altitude}km • {satellite.inclination}°
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 大预览弹窗 */}
      {showLargePreview && selectedSat && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
            background: 'rgba(0, 0, 0, 0.9)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            backdropFilter: 'blur(10px)'
          }}
          onClick={() => setShowLargePreview(false)}
        >
          <div 
            style={{
              width: '80vw',
              height: '80vh',
              maxWidth: '800px',
              maxHeight: '600px',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1e 100%)',
              borderRadius: '16px',
              border: '2px solid rgba(59, 130, 246, 0.3)',
              boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 关闭按钮 */}
            <button
              onClick={() => setShowLargePreview(false)}
              style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                width: '40px',
                height: '40px',
                background: 'rgba(255, 255, 255, 0.1)',
                border: '1px solid rgba(255, 255, 255, 0.2)',
                borderRadius: '50%',
                color: '#fff',
                fontSize: '18px',
                cursor: 'pointer',
                zIndex: 10001,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s ease',
                backdropFilter: 'blur(10px)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
                e.currentTarget.style.transform = 'scale(1.1)'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
                e.currentTarget.style.transform = 'scale(1)'
              }}
            >
              ✕
            </button>

            {/* 标题 */}
            <div style={{
              position: 'absolute',
              top: '16px',
              left: '24px',
              color: '#60a5fa',
              fontSize: '20px',
              fontWeight: 'bold',
              zIndex: 10001,
              textShadow: '0 2px 10px rgba(59, 130, 246, 0.4)'
            }}>
              {selectedSat.name} - 3D模型详细预览
            </div>

            {/* 大预览Canvas */}
            <Canvas
              camera={{ position: [3, 2, 3], fov: 60 }}
              style={{ 
                width: '100%', 
                height: '100%'
              }}
            >
              {/* 增强光照系统 - 大预览专用 */}
              <ambientLight intensity={1.0} color="#ffffff" />
              <directionalLight position={[5, 5, 5]} intensity={2.0} color="#ffffff" />
              <directionalLight position={[-5, -5, -5]} intensity={1.5} color="#b3d9ff" />
              <pointLight position={[3, 3, 3]} intensity={1.2} color="#ffffff" />
              <pointLight position={[-3, -3, -3]} intensity={1.0} color="#60a5fa" />
              <spotLight position={[0, 6, 0]} intensity={1.8} angle={0.6} penumbra={0.4} color="#ffffff" />
              <spotLight position={[0, -6, 0]} intensity={1.0} angle={0.8} penumbra={0.6} color="#3b82f6" />
              
              {/* 星空背景 */}
              <mesh>
                <sphereGeometry args={[50, 32, 32]} />
                <meshBasicMaterial 
                  color="#000011" 
                  side={THREE.BackSide} 
                />
              </mesh>
              
              <Suspense fallback={null}>
                <Real3DSatellite 
                  modelType={selectedSat.modelType} 
                  scale={0.8}
                  color={selectedSat.color}
                />
              </Suspense>
              
              <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={0.5}
                maxDistance={15}
                autoRotate={true}
                autoRotateSpeed={1}
              />
            </Canvas>

            {/* 操作提示 */}
            <div style={{
              position: 'absolute',
              bottom: '16px',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#aaa',
              fontSize: '14px',
              textAlign: 'center',
              background: 'rgba(0, 0, 0, 0.6)',
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              拖拽旋转 • 滚轮缩放 • 右键平移 • 自动旋转
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default SatelliteInfoPanel 