import React from 'react'
import { useAppStore } from '../store/appStore'
import TimeControlPanel from './TimeControlPanel'

const ControlPanel: React.FC = () => {
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
          显示轨道
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
          显示标签
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
          真实比例轨道
        </label>
        <small style={{ display: 'block', marginTop: '4px', color: '#aaa' }}>
          {useRealScale ? '显示真实轨道尺寸' : '美观优化轨道'}
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
          跟随地球自转
        </label>
        <small style={{ display: 'block', marginTop: '4px', color: '#aaa' }}>
          {followEarthRotation ? '地球固定视角' : '惯性空间视角'}
        </small>
      </div>

      <div className="control-group">
        <button onClick={() => window.location.reload()}>
          重置场景
        </button>
      </div>

      {/* TLE轨道状态显示 */}
      <div className="control-group">
        <label>轨道数据状态</label>
        <div style={{ 
          fontSize: '11px', 
          color: '#888',
          lineHeight: '1.4'
        }}>
          <div>TLE数据加载中...</div>
          <div>请等待真实轨道生效</div>
          <div style={{ marginTop: '4px', color: '#60a5fa' }}>
            ✓ 标签显示 (TLE) 表示真实轨道
          </div>
          <div style={{ color: '#ffa500' }}>
            标签显示 (SIM) 表示简化轨道
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
        <div>轨道: {showOrbits ? '显示' : '隐藏'}</div>
        <div>标签: {showLabels ? '显示' : '隐藏'}</div>
        <div>比例: {useRealScale ? '真实' : '美观'}</div>
        <div>速度: {timeSpeed === 0 ? '暂停' : `${timeSpeed}x`}</div>
        <div>时间: {isTimeCustom ? '自定义' : '实时'}</div>
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
          轨道缩放对比 ({useRealScale ? '真实模式' : '美观模式'}):
        </div>
        <div>ISS: {useRealScale ? '5.8' : '6.8'} 单位 (×{useRealScale ? '0.85' : '1.0'})</div>
        <div>Hubble: {useRealScale ? '6.1' : '7.2'} 单位 (×{useRealScale ? '0.85' : '1.0'})</div>
        <div>Starlink: {useRealScale ? '6.4' : '7.5'} 单位 (×{useRealScale ? '0.85' : '1.0'})</div>
        <div style={{ color: useRealScale ? '#ffa500' : '#96ceb4' }}>
          GPS: {useRealScale ? '33.6' : '12.0'} 单位 (×{useRealScale ? '2.8' : '1.0'}) {useRealScale ? '←极远!' : ''}
        </div>
        <div>Tiangong: {useRealScale ? '5.4' : '6.4'} 单位 (×{useRealScale ? '0.85' : '1.0'})</div>
        <div>Sentinel: {useRealScale ? '10.8' : '9.8'} 单位 (×{useRealScale ? '1.1' : '1.0'})</div>
        <div style={{ marginTop: '4px', fontSize: '10px', color: '#666' }}>
          {useRealScale ? '真实比例：简单缩放，保持轨道形状' : '美观比例：原始设计距离'}
        </div>
      </div>

      <div style={{ marginTop: '4px', color: '#a5b4fc', fontSize: '11px', lineHeight: '1.4' }}>
        地球固定视角：观察者跟随地球旋转，看不到地球自转<br/>
        惯性空间视角：观察者固定，可以看到地球自转和卫星运动
      </div>
    </>
  )
}

export default ControlPanel 