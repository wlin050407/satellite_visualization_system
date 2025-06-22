export interface Translations {
  // 面板标题
  timeAndDisplayControl: string
  satelliteInfo: string
  groundStationControl: string
  
  // 时间控制
  timeControl: string
  timeSpeed: string
  pause: string
  play: string
  reverse: string
  forward: string
  resetToRealTime: string
  customTime: string
  realTime: string
  enterCustomTime: string
  setTime: string
  invalidTimeFormat: string
  timeFormatError: string
  
  // 显示控制
  showOrbits: string
  showLabels: string
  realScaleOrbits: string
  followEarthRotation: string
  resetScene: string
  
  // 状态描述
  paused: string
  reversing: string
  forwarding: string
  realScaleDescription: string
  beautifulScaleDescription: string
  earthFixedView: string
  inertialSpaceView: string
  
  // 轨道数据
  orbitDataStatus: string
  tleDataLoading: string
  waitForRealOrbit: string
  realOrbitLabel: string
  simulatedOrbitLabel: string
  
  // 当前设置
  currentSettings: string
  orbits: string
  labels: string
  scale: string
  speed: string
  time: string
  show: string
  hide: string
  real: string
  beautiful: string
  custom: string
  
  // 轨道对比
  orbitScaleComparison: string
  realMode: string
  beautifulMode: string
  unit: string
  veryFar: string
  
  // 地面站控制
  selectGroundStation: string
  pleaseSelectGroundStation: string
  groundStationStatus: string
  positionInfo: string
  stationLongitude: string
  stationLatitude: string
  stationAltitude: string
  nextPass: string
  passTime: string
  duration: string
  maxElevation: string
  minutes: string
  degrees: string
  
  // 遥测数据
  telemetryData: string
  parameter: string
  value: string
  status: string
  powerVoltage: string
  temperature: string
  signalStrength: string
  dataRate: string
  normal: string
  good: string
  warning: string
  error: string
  
  // 指令控制
  commandSend: string
  enterCommand: string
  sendCommand: string
  commandSent: string
  
  // 地面站名称
  singaporeStation: string
  kennedyStation: string
  beijingStation: string
  
  // 状态
  active: string
  inactive: string
  online: string
  offline: string
  
  // 卫星信息
  satelliteAltitude: string
  satelliteVelocity: string
  period: string
  inclination: string
  eccentricity: string
  
  // 通用
  expand: string
  collapse: string
  loading: string
  selectToEnable: string
  
  // 面板尺寸提示
  panelSizeNote: string
  
  // 卫星信息面板
  selectSatellite: string
  pleaseSelectSatellite: string
  quickSelection: string
  satelliteDetails: string
  orbitParameters: string
  tleData: string
  realTimePosition: string
  tleRealTime: string
  simulation: string
  orbitCharacteristics: string
  lastUpdate: string
  clickToEnlarge: string
  dragRotateZoomClick: string
  closeButton: string
  operationTips: string
  satelliteModelPreview: string
  clickToViewLarge: string
  dragRotate: string
  wheelZoom: string
  clickToZoom: string
  orbitalParameters: string
  realPosition: string
  lastUpdated: string
  quickSelect: string
  rightClickToPan: string
  autoRotate: string
  geostationaryOrbit: string
  orbitRadius: string
  realTimeTleDataObtained: string
  orbitPeriodMinutes: string
  meanMotionPerDay: string
  satelliteModelDetailPreview: string
  
  // 轨道特征
  lowInclinationOrbit: string
  mediumInclinationOrbit: string
  highInclinationOrbit: string
  polarOrbit: string
  lowEarthOrbit: string
  mediumEarthOrbit: string
  geosynchronousOrbit: string
  
  // 位置信息
  positionLongitude: string
  positionLatitude: string
  positionAltitude: string
  positionVelocity: string
  meanMotion: string
  orbitPeriod: string
  calculating: string
  
  // 卫星描述
  lowEarthOrbitStation: string
  astronomicalObservationSatellite: string
  communicationSatelliteConstellation: string
  globalPositioningSystem: string
  chineseSpaceStation: string
  earthObservationSatellite: string
}

export const translations: Record<'zh' | 'en', Translations> = {
  zh: {
    // 面板标题
    timeAndDisplayControl: '时间与显示控制',
    satelliteInfo: '卫星信息',
    groundStationControl: '地面站TT&C控制',
    
    // 时间控制
    timeControl: '时间控制',
    timeSpeed: '时间速度',
    pause: '暂停',
    play: '播放',
    reverse: '倒退',
    forward: '前进',
    resetToRealTime: '重置到实时',
    customTime: '自定义时间',
    realTime: '实时',
    enterCustomTime: '输入自定义时间',
    setTime: '设置时间',
    invalidTimeFormat: '请输入有效的时间格式',
    timeFormatError: '时间格式错误',
    
    // 显示控制
    showOrbits: '显示轨道',
    showLabels: '显示标签',
    realScaleOrbits: '真实比例轨道',
    followEarthRotation: '跟随地球自转',
    resetScene: '重置场景',
    
    // 状态描述
    paused: '暂停',
    reversing: '倒退',
    forwarding: '前进',
    realScaleDescription: '显示真实轨道尺寸',
    beautifulScaleDescription: '美观优化轨道',
    earthFixedView: '地球固定视角',
    inertialSpaceView: '惯性空间视角',
    
    // 轨道数据
    orbitDataStatus: '轨道数据状态',
    tleDataLoading: 'TLE数据加载中...',
    waitForRealOrbit: '请等待真实轨道生效',
    realOrbitLabel: '✓ 标签显示 (TLE) 表示真实轨道',
    simulatedOrbitLabel: '标签显示 (SIM) 表示简化轨道',
    
    // 当前设置
    currentSettings: '当前设置',
    orbits: '轨道',
    labels: '标签',
    scale: '比例',
    speed: '速度',
    time: '时间',
    show: '显示',
    hide: '隐藏',
    real: '真实',
    beautiful: '美观',
    custom: '自定义',
    
    // 轨道对比
    orbitScaleComparison: '轨道缩放对比',
    realMode: '真实模式',
    beautifulMode: '美观模式',
    unit: '单位',
    veryFar: '←极远!',
    
    // 地面站控制
    selectGroundStation: '选择地面站',
    pleaseSelectGroundStation: '请选择地面站',
    groundStationStatus: '地面站状态',
    positionInfo: '位置信息',
    stationLongitude: '经度',
    stationLatitude: '纬度',
    stationAltitude: '海拔',
    nextPass: '下次过境',
    passTime: '时间',
    duration: '持续时间',
    maxElevation: '最大仰角',
    minutes: '分钟',
    degrees: '°',
    
    // 遥测数据
    telemetryData: '遥测数据',
    parameter: '参数',
    value: '数值',
    status: '状态',
    powerVoltage: '电源电压',
    temperature: '温度',
    signalStrength: '信号强度',
    dataRate: '数据传输率',
    normal: '正常',
    good: '良好',
    warning: '警告',
    error: '错误',
    
    // 指令控制
    commandSend: '指令发送',
    enterCommand: '输入指令...',
    sendCommand: '发送指令',
    commandSent: '指令已发送至卫星',
    
    // 地面站名称
    singaporeStation: 'Singapore Ground Station',
    kennedyStation: 'Kennedy Space Center',
    beijingStation: 'Beijing Aerospace Control',
    
    // 状态
    active: '激活',
    inactive: '未激活',
    online: '在线',
    offline: '离线',
    
    // 卫星信息
    satelliteAltitude: '高度',
    satelliteVelocity: '速度',
    period: '周期',
    inclination: '倾角',
    eccentricity: '偏心率',
    
    // 通用
    expand: '展开',
    collapse: '收起',
    loading: '加载中...',
    selectToEnable: '请选择地面站以启用TT&C功能',
    
    // 面板尺寸提示
    panelSizeNote: '面板尺寸已统一',
    
    // 卫星信息面板
    selectSatellite: '选择卫星',
    pleaseSelectSatellite: '请选择卫星',
    quickSelection: '快速选择',
    satelliteDetails: '卫星详情',
    orbitParameters: '轨道参数',
    tleData: 'TLE数据',
    realTimePosition: '实时位置',
    tleRealTime: 'TLE实时',
    simulation: '模拟',
    orbitCharacteristics: '轨道特征',
    lastUpdate: '最后更新',
    clickToEnlarge: '点击放大',
    dragRotateZoomClick: '拖动旋转缩放点击',
    closeButton: '关闭按钮',
    operationTips: '操作提示',
    satelliteModelPreview: '卫星模型预览',
    clickToViewLarge: '点击查看大图',
    dragRotate: '拖拽旋转',
    wheelZoom: '滚轮缩放',
    clickToZoom: '点击聚焦',
    orbitalParameters: '轨道参数',
    realPosition: '实际位置',
    lastUpdated: '最后更新',
    quickSelect: '快速选择',
    rightClickToPan: '右键平移',
    autoRotate: '自动旋转',
    geostationaryOrbit: '地球同步轨道',
    orbitRadius: '轨道半径',
    realTimeTleDataObtained: 'TLE数据已获取',
    orbitPeriodMinutes: '轨道周期分钟',
    meanMotionPerDay: '平均运动每天',
    satelliteModelDetailPreview: '卫星模型详细预览',
    
    // 轨道特征
    lowInclinationOrbit: '低倾角轨道',
    mediumInclinationOrbit: '中倾角轨道',
    highInclinationOrbit: '高倾角轨道',
    polarOrbit: '极地轨道',
    lowEarthOrbit: '低地球轨道 (LEO)',
    mediumEarthOrbit: '中地球轨道 (MEO)',
    geosynchronousOrbit: '地球同步轨道 (GEO)',
    
    // 位置信息
    positionLongitude: '经度',
    positionLatitude: '纬度',
    positionAltitude: '高度',
    positionVelocity: '速度',
    meanMotion: '平均运动',
    orbitPeriod: '轨道周期',
    calculating: '计算中',
    
    // 卫星描述
    lowEarthOrbitStation: '低地球轨道站',
    astronomicalObservationSatellite: '天文观测卫星',
    communicationSatelliteConstellation: '通信卫星星座',
    globalPositioningSystem: '全球定位系统',
    chineseSpaceStation: '中国空间站',
    earthObservationSatellite: '地球观测卫星'
  },
  
  en: {
    // 面板标题
    timeAndDisplayControl: 'Time & Display Control',
    satelliteInfo: 'Satellite Information',
    groundStationControl: 'Ground Station TT&C Control',
    
    // 时间控制
    timeControl: 'Time Control',
    timeSpeed: 'Time Speed',
    pause: 'Pause',
    play: 'Play',
    reverse: 'Reverse',
    forward: 'Forward',
    resetToRealTime: 'Reset to Real Time',
    customTime: 'Custom Time',
    realTime: 'Real Time',
    enterCustomTime: 'Enter Custom Time',
    setTime: 'Set Time',
    invalidTimeFormat: 'Please enter a valid time format',
    timeFormatError: 'Time format error',
    
    // 显示控制
    showOrbits: 'Show Orbits',
    showLabels: 'Show Labels',
    realScaleOrbits: 'Real Scale Orbits',
    followEarthRotation: 'Follow Earth Rotation',
    resetScene: 'Reset Scene',
    
    // 状态描述
    paused: 'Paused',
    reversing: 'Reversing',
    forwarding: 'Forwarding',
    realScaleDescription: 'Show real orbit dimensions',
    beautifulScaleDescription: 'Optimized beautiful orbits',
    earthFixedView: 'Earth-fixed perspective',
    inertialSpaceView: 'Inertial space perspective',
    
    // 轨道数据
    orbitDataStatus: 'Orbit Data Status',
    tleDataLoading: 'TLE data loading...',
    waitForRealOrbit: 'Wait for real orbits to take effect',
    realOrbitLabel: '✓ Label shows (TLE) indicates real orbit',
    simulatedOrbitLabel: 'Label shows (SIM) indicates simplified orbit',
    
    // 当前设置
    currentSettings: 'Current Settings',
    orbits: 'Orbits',
    labels: 'Labels',
    scale: 'Scale',
    speed: 'Speed',
    time: 'Time',
    show: 'Show',
    hide: 'Hide',
    real: 'Real',
    beautiful: 'Beautiful',
    custom: 'Custom',
    
    // 轨道对比
    orbitScaleComparison: 'Orbit Scale Comparison',
    realMode: 'Real Mode',
    beautifulMode: 'Beautiful Mode',
    unit: 'units',
    veryFar: '←Very Far!',
    
    // 地面站控制
    selectGroundStation: 'Select Ground Station',
    pleaseSelectGroundStation: 'Please select a ground station',
    groundStationStatus: 'Ground Station Status',
    positionInfo: 'Position Information',
    stationLongitude: 'Longitude',
    stationLatitude: 'Latitude',
    stationAltitude: 'Altitude',
    nextPass: 'Next Pass',
    passTime: 'Time',
    duration: 'Duration',
    maxElevation: 'Max Elevation',
    minutes: 'minutes',
    degrees: '°',
    
    // 遥测数据
    telemetryData: 'Telemetry Data',
    parameter: 'Parameter',
    value: 'Value',
    status: 'Status',
    powerVoltage: 'Power Voltage',
    temperature: 'Temperature',
    signalStrength: 'Signal Strength',
    dataRate: 'Data Rate',
    normal: 'Normal',
    good: 'Good',
    warning: 'Warning',
    error: 'Error',
    
    // 指令控制
    commandSend: 'Command Send',
    enterCommand: 'Enter command...',
    sendCommand: 'Send Command',
    commandSent: 'Command sent to satellite',
    
    // 地面站名称
    singaporeStation: 'Singapore Ground Station',
    kennedyStation: 'Kennedy Space Center',
    beijingStation: 'Beijing Aerospace Control',
    
    // 状态
    active: 'Active',
    inactive: 'Inactive',
    online: 'Online',
    offline: 'Offline',
    
    // 卫星信息
    satelliteAltitude: 'Altitude',
    satelliteVelocity: 'Velocity',
    period: 'Period',
    inclination: 'Inclination',
    eccentricity: 'Eccentricity',
    
    // 通用
    expand: 'Expand',
    collapse: 'Collapse',
    loading: 'Loading...',
    selectToEnable: 'Please select a ground station to enable TT&C functions',
    
    // 面板尺寸提示
    panelSizeNote: 'Panel sizes unified',
    
    // 卫星信息面板
    selectSatellite: 'Select Satellite',
    pleaseSelectSatellite: 'Please select a satellite',
    quickSelection: 'Quick Selection',
    satelliteDetails: 'Satellite Details',
    orbitParameters: 'Orbit Parameters',
    tleData: 'TLE Data',
    realTimePosition: 'Real Time Position',
    tleRealTime: 'TLE Real Time',
    simulation: 'Simulation',
    orbitCharacteristics: 'Orbit Characteristics',
    lastUpdate: 'Last Update',
    clickToEnlarge: 'Click to Enlarge',
    dragRotateZoomClick: 'Drag Rotate Zoom Click',
    closeButton: 'Close | 关闭',
    operationTips: 'Operation Tips',
    satelliteModelPreview: 'Satellite Model Preview',
    clickToViewLarge: 'Click to view large preview',
    dragRotate: 'Drag to rotate',
    wheelZoom: 'Wheel to zoom',
    clickToZoom: 'Click to focus',
    orbitalParameters: 'Orbital Parameters',
    realPosition: 'Real Position',
    lastUpdated: 'Last Updated',
    quickSelect: 'Quick Select',
    rightClickToPan: 'Right-click to pan',
    autoRotate: 'Auto rotate',
    geostationaryOrbit: 'Geostationary Orbit',
    orbitRadius: 'Orbit Radius',
    realTimeTleDataObtained: 'TLE data obtained',
    orbitPeriodMinutes: 'Orbit Period Minutes',
    meanMotionPerDay: 'Mean Motion Per Day',
    satelliteModelDetailPreview: 'Satellite Model Detail Preview',
    
    // 轨道特征
    lowInclinationOrbit: 'Low Inclination Orbit',
    mediumInclinationOrbit: 'Medium Inclination Orbit',
    highInclinationOrbit: 'High Inclination Orbit',
    polarOrbit: 'Polar Orbit',
    lowEarthOrbit: 'Low Earth Orbit',
    mediumEarthOrbit: 'Medium Earth Orbit',
    geosynchronousOrbit: 'Geosynchronous Orbit',
    
    // 位置信息
    positionLongitude: 'Longitude',
    positionLatitude: 'Latitude',
    positionAltitude: 'Altitude',
    positionVelocity: 'Velocity',
    meanMotion: 'Mean Motion',
    orbitPeriod: 'Orbit Period',
    calculating: 'Calculating',
    
    // 卫星描述
    lowEarthOrbitStation: 'Low Earth Orbit Station',
    astronomicalObservationSatellite: 'Astronomical Observation Satellite',
    communicationSatelliteConstellation: 'Communication Satellite Constellation',
    globalPositioningSystem: 'Global Positioning System',
    chineseSpaceStation: 'Chinese Space Station',
    earthObservationSatellite: 'Earth Observation Satellite'
  }
} 