// Google Maps Platform API 配置
// 请在Google Cloud Console中启用Map Tiles API并获取API密钥
// 使用指南：https://developers.google.com/maps/documentation/tile/get-api-key

// 方法1：直接在这里设置API密钥（不推荐用于生产环境）
export const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY || 'YOUR_GOOGLE_API_KEY_HERE'

// 方法2：从环境变量获取（推荐）
// 在项目根目录创建 .env 文件，并添加：
// REACT_APP_GOOGLE_MAPS_API_KEY=你的API密钥

// 检查API密钥是否设置
export const isGoogleMapsApiKeySet = () => {
  return GOOGLE_MAPS_API_KEY && GOOGLE_MAPS_API_KEY !== 'YOUR_GOOGLE_API_KEY_HERE'
}

// 3D Tiles相关配置
export const GOOGLE_3D_TILES_CONFIG = {
  // Google Photorealistic 3D Tiles的根瓦片集URL
  tilesetUrl: `https://tile.googleapis.com/v1/3dtiles/root.json?key=${GOOGLE_MAPS_API_KEY}`,
  
  // 渲染器配置
  renderer: {
    errorTarget: 6, // 屏幕空间误差目标（像素）
    maxDepth: Infinity, // 最大加载深度
    displayActiveTiles: false, // 是否显示非可见的活动瓦片
    autoDisableRendererCulling: true, // 自动禁用渲染器剔除
  },
  
  // 缓存配置
  cache: {
    maxSize: 800, // 最大缓存项目数
    minSize: 600, // 最小缓存项目数
    maxBytesSize: 0.3 * 2**30, // 最大缓存字节数（约300MB）
    minBytesSize: 0.2 * 2**30, // 最小缓存字节数（约200MB）
  },
  
  // 队列配置
  queues: {
    downloadMaxJobs: 10, // 最大下载任务数
    parseMaxJobs: 1, // 最大解析任务数
    processNodeMaxJobs: 25, // 最大节点处理任务数
  }
}

// 获取API密钥的说明
export const getApiKeyInstructions = () => {
  return `
如何获取Google Maps Platform API密钥：

1. 访问 Google Cloud Console: https://console.cloud.google.com/
2. 创建新项目或选择现有项目
3. 启用 Map Tiles API
4. 创建 API 密钥
5. 限制 API 密钥（可选但推荐）

设置API密钥的两种方法：

方法1：环境变量（推荐）
- 在项目根目录创建 .env 文件
- 添加: REACT_APP_GOOGLE_MAPS_API_KEY=你的API密钥

方法2：直接配置
- 编辑 src/config/googleMaps.ts 文件
- 将 'YOUR_GOOGLE_API_KEY_HERE' 替换为你的实际API密钥

注意：
- 请不要将API密钥提交到版本控制系统
- 在生产环境中请使用环境变量
- 建议为API密钥设置使用限制
`
} 