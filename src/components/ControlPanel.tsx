import React from 'react'
import { useAppStore } from '../store/appStore'
import { useTranslation } from '../i18n/useTranslation'
import TimeControlPanel from './TimeControlPanel'

const ControlPanel: React.FC = () => {
  const { t } = useTranslation()
  const { 
    showOrbits, 
    setShowOrbits, 
    showLabels, 
    setShowLabels,
    followEarthRotation,
    setFollowEarthRotation,
    useRealScale,
    setUseRealScale,

    timeSpeed,
    isTimeCustom
  } = useAppStore()

  const handleResetScene = () => {
    // 保持语言设置不变
    window.location.reload()
  }

  return (
    <>
      {/* 时间控制面板 - 使用新的可折叠组件 */}
      <TimeControlPanel />

      <div className="control-group">
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '6px' 
        }}>
          <input
            type="checkbox"
            checked={showOrbits}
            onChange={(e) => setShowOrbits(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          {t.showOrbits}
        </label>
      </div>

      <div className="control-group">
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '6px' 
        }}>
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          {t.showLabels}
        </label>
      </div>

      <div className="control-group">
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '6px' 
        }}>
          <input
            type="checkbox"
            checked={useRealScale}
            onChange={(e) => setUseRealScale(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          {t.realScaleOrbits}
        </label>
        <small style={{ display: 'block', marginTop: '4px', color: '#aaa' }}>
          {useRealScale ? t.realScaleDescription : t.beautifulScaleDescription}
        </small>
      </div>

      <div className="control-group">
        <label style={{ 
          display: 'flex', 
          alignItems: 'center', 
          marginBottom: '6px' 
        }}>
          <input
            type="checkbox"
            checked={followEarthRotation}
            onChange={(e) => setFollowEarthRotation(e.target.checked)}
            style={{ marginRight: '8px' }}
          />
          {t.followEarthRotation}
        </label>
        <small style={{ display: 'block', marginTop: '4px', color: '#aaa' }}>
          {followEarthRotation ? t.earthFixedView : t.inertialSpaceView}
        </small>
      </div>

      <div className="control-group">
        <button onClick={handleResetScene}>
          {t.resetScene}
        </button>
      </div>



      {/* TLE轨道状态显示 */}
      <div className="control-group">
        <label>{t.orbitDataStatus}</label>
        <div style={{ 
          fontSize: '11px', 
          color: '#888',
          lineHeight: '1.4'
        }}>
          <div>{t.tleDataLoading}</div>
          <div>{t.waitForRealOrbit}</div>
          <div style={{ marginTop: '4px', color: '#60a5fa' }}>
            {t.realOrbitLabel}
          </div>
          <div style={{ color: '#ffa500' }}>
            {t.simulatedOrbitLabel}
          </div>
        </div>
      </div>

      {/* 显示当前设置 */}
      <div style={{ 
        marginTop: '15px', 
        padding: '8px', 
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '4px',
        fontSize: '12px',
        color: '#888'
      }}>
        <div>{t.orbits}: {showOrbits ? t.show : t.hide}</div>
        <div>{t.labels}: {showLabels ? t.show : t.hide}</div>
        <div>{t.scale}: {useRealScale ? t.real : t.beautiful}</div>
        <div>{t.speed}: {timeSpeed === 0 ? t.paused : `${timeSpeed.toFixed(2)}x`}</div>
        <div>{t.time}: {isTimeCustom ? t.custom : t.realTime}</div>
      </div>

      {/* 轨道半径对比表 */}
      <div style={{ 
        marginTop: '10px', 
        padding: '8px', 
        background: 'rgba(255,255,255,0.03)',
        borderRadius: '4px',
        fontSize: '11px',
        color: '#aaa'
      }}>
        <div style={{ marginBottom: '4px', color: '#60a5fa' }}>
          {t.orbitScaleComparison} ({useRealScale ? t.realMode : t.beautifulMode}):
        </div>
        <div>ISS: {useRealScale ? '5.8' : '6.8'} {t.unit} (×{useRealScale ? '0.85' : '1.0'})</div>
        <div>Hubble: {useRealScale ? '6.1' : '7.2'} {t.unit} (×{useRealScale ? '0.85' : '1.0'})</div>
        <div>Starlink: {useRealScale ? '6.4' : '7.5'} {t.unit} (×{useRealScale ? '0.85' : '1.0'})</div>
        <div style={{ color: useRealScale ? '#ffa500' : '#96ceb4' }}>
          GPS: {useRealScale ? '33.6' : '12.0'} {t.unit} (×{useRealScale ? '2.8' : '1.0'}) {useRealScale ? t.veryFar : ''}
        </div>
        <div>Tiangong: {useRealScale ? '5.4' : '6.4'} {t.unit} (×{useRealScale ? '0.85' : '1.0'})</div>
        <div>Sentinel: {useRealScale ? '10.8' : '9.8'} {t.unit} (×{useRealScale ? '1.1' : '1.0'})</div>
        <div style={{ marginTop: '4px', fontSize: '10px', color: '#666' }}>
          {useRealScale ? t.realScaleDescription : t.beautifulScaleDescription}
        </div>
      </div>

      <div style={{ marginTop: '4px', color: '#a5b4fc', fontSize: '11px', lineHeight: '1.4' }}>
        {t.earthFixedView}：{followEarthRotation ? t.earthFixedView : t.inertialSpaceView}<br/>
        {t.inertialSpaceView}：{!followEarthRotation ? t.inertialSpaceView : t.earthFixedView}
      </div>
    </>
  )
}

export default ControlPanel 