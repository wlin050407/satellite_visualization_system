import React, { useEffect, useState, Suspense } from 'react'
import { createPortal } from 'react-dom'
import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useAppStore } from '../store/appStore'
import { useTranslation } from '../i18n/useTranslation'
import { tleService, SATELLITE_IDS, SatellitePosition } from '../services/tleService'
import Real3DSatellite from './Real3DSatellite'
import * as THREE from 'three'

const SatelliteInfoPanel: React.FC = () => {
  const { t } = useTranslation()
  const { selectedSatellite, setSelectedSatellite, timeSpeed, getCurrentEffectiveTime, showLabels, setShowLabels } = useAppStore()
  const [realPosition, setRealPosition] = useState<SatellitePosition | null>(null)
  const [orbitalElements, setOrbitalElements] = useState<any>(null)
  const [showLargePreview, setShowLargePreview] = useState(false)
  const [isHovering, setIsHovering] = useState(false)
  
  // 记录弹窗打开前的标签显示状态
  const [previousLabelsState, setPreviousLabelsState] = useState<boolean>(true)

  // 处理大预览弹窗的显示/隐藏，防止页面滚动，并自动控制标签显示
  const handleShowLargePreview = (show: boolean) => {
    if (show) {
      // 弹窗打开时：记录当前标签状态并关闭标签
      setPreviousLabelsState(showLabels)
      setShowLabels(false)
      document.body.classList.add('modal-open')
    } else {
      // 弹窗关闭时：恢复之前的标签状态
      setShowLabels(previousLabelsState)
      document.body.classList.remove('modal-open')
    }
    
    setShowLargePreview(show)
  }

  // 组件卸载时清理body类名
  useEffect(() => {
    return () => {
      document.body.classList.remove('modal-open')
    }
  }, [])

  const satellites = [
    { 
      id: 'iss', 
      name: 'International Space Station', 
      status: 'online', 
      altitude: 408, 
      inclination: 51.6,
      orbitRadius: 6.8,
      description: t.lowEarthOrbitStation,
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
      description: t.astronomicalObservationSatellite,
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
      description: t.communicationSatelliteConstellation,
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
      description: t.globalPositioningSystem,
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
      description: t.chineseSpaceStation,
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
      description: t.earthObservationSatellite,
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

  // 以ISS为基准，scale=0.035
  const issScale = 0.003;
  const baseScale = 0.035;
  const sceneScales: Record<string, number> = {
    iss: 0.003,
    tiangong: 0.04,
    gps: 0.00001,
    starlink: 0.008,
    hubble: 0.01,
  };
  const getPreviewScale = (modelType: string) => baseScale * (sceneScales[modelType] / issScale);

  return (
    <>
      <div className="satellite-info-content">
        {/* 卫星选择下拉框 */}
        <div className="control-group">
          <label>{t.selectSatellite}</label>
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
              {t.pleaseSelectSatellite}...
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
              <label>{t.satelliteModelPreview}</label>
              <div 
                className={`satellite-model-preview ${isHovering ? 'hover' : ''}`}
                onMouseEnter={() => setIsHovering(true)}
                onMouseLeave={() => setIsHovering(false)}
                onClick={() => handleShowLargePreview(true)}
                style={{ 
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  transform: isHovering ? 'scale(1.02)' : 'scale(1)',
                  boxShadow: isHovering 
                    ? '0 8px 25px rgba(59, 130, 246, 0.25), 0 0 15px rgba(255, 255, 255, 0.1)' 
                    : '0 4px 15px rgba(0, 0, 0, 0.3)',
                  border: isHovering 
                    ? '2px solid rgba(59, 130, 246, 0.4)' 
                    : '1px solid #333',
                  position: 'relative'
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
                      scale={getPreviewScale(selectedSat.modelType)}
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
                    {t.clickToViewLarge}
                  </div>
                )}
              </div>
              <div style={{ fontSize: '9px', color: '#666', textAlign: 'center', marginBottom: '8px' }}>
                {t.dragRotate} • {t.wheelZoom} • {t.clickToZoom}
              </div>
            </div>
            
            <div className="control-group">
              <label>{t.orbitalParameters}</label>
              <div style={{ fontSize: '12px' }}>
                {orbitalElements ? (
                  <>
                    {t.positionAltitude}: {orbitalElements.altitude.toFixed(1)} km<br/>
                    {t.inclination}: {orbitalElements.inclination.toFixed(2)}°<br/>
                    {t.eccentricity}: {orbitalElements.eccentricity.toFixed(6)}<br/>
                    {t.orbitPeriod}: {orbitalElements.period.toFixed(1)} {t.minutes}<br/>
                    {t.meanMotion}: {orbitalElements.meanMotion.toFixed(8)} 转/天
                  </>
                ) : (
                  <>
                    {t.positionAltitude}: {selectedSat.altitude} km<br/>
                    {t.inclination}: {selectedSat.inclination}°<br/>
                    {t.orbitRadius}: {selectedSat.orbitRadius.toFixed(1)} {t.unit}<br/>
                    {t.eccentricity}: {t.calculating}...
                  </>
                )}
              </div>
            </div>

            <div className="control-group">
              <label>{t.realPosition} {realPosition ? `(${t.tleRealTime})` : `(${t.simulation})`}</label>
              <div style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                {(() => {
                  const pos = getCurrentPosition(selectedSat)
                  return (
                    <>
                      {realPosition ? (
                        <>
                          {t.positionLongitude}: {pos.x}°<br/>
                          {t.positionLatitude}: {pos.y}°<br/>
                          {t.positionAltitude}: {pos.z} km<br/>
                          {t.positionVelocity}: {realPosition.velocity.toFixed(2)} km/s
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
              <label>{t.orbitCharacteristics}</label>
              <div style={{ fontSize: '12px' }}>
                {selectedSat.inclination < 30 && t.lowInclinationOrbit}
                {selectedSat.inclination >= 30 && selectedSat.inclination < 60 && t.mediumInclinationOrbit}
                {selectedSat.inclination >= 60 && selectedSat.inclination < 90 && t.highInclinationOrbit}
                {selectedSat.inclination >= 90 && t.polarOrbit}
                <br/>
                {selectedSat.altitude < 1000 && t.lowEarthOrbit}
                {selectedSat.altitude >= 1000 && selectedSat.altitude < 35000 && t.mediumEarthOrbit}
                {selectedSat.altitude >= 35000 && t.geostationaryOrbit}
              </div>
            </div>

            <div className="control-group">
              <label>{t.lastUpdated}</label>
              <div style={{ fontSize: '12px', color: '#ccc' }}>
                {getCurrentEffectiveTime().toISOString().replace('T', ' ').replace('.000Z', ' GMT')}
              </div>
            </div>

            <div className="control-group">
              <label>{t.tleData} (NORAD ID: {selectedSat.noradId})</label>
              <div style={{ fontSize: '10px', fontFamily: 'monospace', color: '#aaa' }}>
                {orbitalElements ? (
                  `${t.realTimeTleDataObtained}\n${t.orbitPeriod}: ${orbitalElements.period.toFixed(1)}${t.minutes}\n${t.meanMotion}: ${orbitalElements.meanMotion.toFixed(8)}`
                ) : (
                  `1 ${selectedSat.noradId}U 98067A   21001.00000000\n2 ${selectedSat.noradId}  ${selectedSat.inclination.toFixed(4)} 339.2000 0002829`
                )}
              </div>
            </div>
          </div>
        )}

        <div className="control-group">
          <label>{t.quickSelect}</label>
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
        createPortal(
          <div 
            className="satellite-model-large-preview"
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              background: 'rgba(0, 0, 0, 0.95)',
              backdropFilter: 'blur(10px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 10000,
              padding: '20px',
              boxSizing: 'border-box'
            }}
            onClick={() => handleShowLargePreview(false)}
          >
            <div 
              className="satellite-model-dialog"
              style={{
                width: 'min(80vw, 800px)',
                height: 'min(80vh, 600px)',
                minWidth: '300px',
                minHeight: '200px',
                background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f1e 100%)',
                borderRadius: '16px',
                border: '2px solid rgba(59, 130, 246, 0.3)',
                boxShadow: '0 20px 60px rgba(59, 130, 246, 0.15)',
                overflow: 'hidden',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column'
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* 关闭按钮 */}
              <button
                onClick={() => handleShowLargePreview(false)}
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
                title={t.closeButton}
              >
                ✕
              </button>

              {/* 标题 */}
              <div style={{
                position: 'absolute',
                top: '16px',
                left: '24px',
                right: '70px',
                color: '#60a5fa',
                fontSize: '20px',
                fontWeight: 'bold',
                zIndex: 10001,
                textShadow: '0 2px 10px rgba(59, 130, 246, 0.4)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {selectedSat.name} - {t.satelliteModelDetailPreview}
              </div>

              {/* Canvas容器 - 确保占满整个弹窗 */}
              <div style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                zIndex: 1
              }}>
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
                  
                  <Suspense fallback={null}>
                    <Real3DSatellite 
                      modelType={selectedSat.modelType} 
                      scale={getPreviewScale(selectedSat.modelType)}
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
              </div>

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
                backdropFilter: 'blur(10px)',
                whiteSpace: 'nowrap',
                maxWidth: 'calc(100% - 32px)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                zIndex: 10001
              }}>
                {t.dragRotate} • {t.wheelZoom} • {t.rightClickToPan} • {t.autoRotate}
              </div>
            </div>
          </div>,
          document.body
        )
      )}
    </>
  )
}

export default SatelliteInfoPanel 