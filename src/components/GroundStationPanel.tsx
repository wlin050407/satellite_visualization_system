import React, { useState } from 'react'
import { useAppStore } from '../store/appStore'

const GroundStationPanel: React.FC = () => {
  const { selectedGroundStation, setSelectedGroundStation } = useAppStore()
  const [command, setCommand] = useState('')
  
  const groundStations = [
    { id: 'singapore', name: 'Singapore Ground Station', status: 'active', lat: 1.3521, lng: 103.8198 },
    { id: 'kennedy', name: 'Kennedy Space Center', status: 'active', lat: 28.5721, lng: -80.6041 },
    { id: 'beijing', name: 'Beijing Aerospace Control', status: 'active', lat: 39.9042, lng: 116.4074 },
  ]

  const telemetryData = [
    { parameter: '电源电压', value: '28.4V', status: '正常' },
    { parameter: '温度', value: '23.5°C', status: '正常' },
    { parameter: '信号强度', value: '-85dBm', status: '良好' },
    { parameter: '数据传输率', value: '2.048 Mbps', status: '正常' }
  ]

  const handleSendCommand = () => {
    if (command.trim() && selectedGroundStation) {
      alert(`指令已发送至卫星:\n${command}`)
      setCommand('')
    }
  }

  const selectedStationData = groundStations.find(s => s.id === selectedGroundStation)

  return (
    <div className="ui-panel ground-station-panel">
      <h3>地面站TT&C控制</h3>
      
      <div className="control-group">
        <label>选择地面站</label>
        <select 
          value={selectedGroundStation}
          onChange={(e) => {
            setSelectedGroundStation(e.target.value)
          }}
        >
          <option value="">请选择地面站</option>
          {groundStations.map((station) => (
            <option key={station.id} value={station.id}>{station.name}</option>
          ))}
        </select>
      </div>

      {selectedStationData && (
        <>
          <div className="control-group">
            <label>地面站状态</label>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <span 
                className={`status-indicator status-${
                  selectedStationData.status === 'active' ? 'online' : 'offline'
                }`}
              />
              {selectedStationData.status.toUpperCase()}
            </div>
          </div>

          <div className="control-group">
            <label>位置信息</label>
            <div style={{ fontSize: '12px' }}>
              经度: {selectedStationData.lng.toFixed(4)}°<br/>
              纬度: {selectedStationData.lat.toFixed(4)}°<br/>
              海拔: 15m
            </div>
          </div>

          <div className="control-group">
            <label>下次过境</label>
            <div style={{ fontSize: '12px' }}>
              时间: {new Date(Date.now() + 2 * 60 * 60 * 1000).toLocaleString()}<br/>
              持续时间: 10分钟<br/>
              最大仰角: 45°
            </div>
          </div>
        </>
      )}

      {selectedGroundStation && (
        <>
          <div className="control-group">
            <label>遥测数据</label>
            <table className="data-table">
              <thead>
                <tr>
                  <th>参数</th>
                  <th>数值</th>
                  <th>状态</th>
                </tr>
              </thead>
              <tbody>
                {telemetryData.map((data, index) => (
                  <tr key={index}>
                    <td>{data.parameter}</td>
                    <td>{data.value}</td>
                    <td style={{ 
                      color: data.status === '正常' ? '#00ff00' : 
                             data.status === '良好' ? '#ffff00' : '#ff0000'
                    }}>
                      {data.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="control-group">
            <label>指令发送</label>
            <input
              type="text"
              placeholder="输入指令..."
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendCommand()}
            />
            <button 
              onClick={handleSendCommand}
              style={{ marginTop: '8px' }}
              disabled={!command.trim()}
            >
              发送指令
            </button>
          </div>
        </>
      )}

      {!selectedGroundStation && (
        <div style={{ color: '#888', fontSize: '12px', marginTop: '20px' }}>
          请选择地面站以启用TT&C功能
        </div>
      )}
    </div>
  )
}

export default GroundStationPanel 