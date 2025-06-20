# Google 3D Tiles 集成指南

## 什么是 Google Photorealistic 3D Tiles？

Google Photorealistic 3D Tiles 是一项先进的地理空间技术，提供全球范围内的高精度3D地形和建筑物数据。这项技术基于Google Earth的数据，为开发者提供了前所未有的地球表面细节。

### 主要特点
- **全球覆盖**: 覆盖全球主要城市和地区
- **高精度**: 亚米级精度的3D几何数据
- **真实纹理**: 基于卫星图像和航拍照片的真实纹理
- **实时更新**: 定期更新以反映最新的地理变化

## 快速开始

### 1. 获取 Google Maps Platform API 密钥

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建新项目或选择现有项目
3. 启用以下API：
   - Maps JavaScript API
   - Maps SDK for Android (如果需要)
   - Maps SDK for iOS (如果需要)

4. 创建API密钥：
   - 转到 "APIs & Services" > "Credentials"
   - 点击 "Create Credentials" > "API Key"
   - 复制生成的API密钥

### 2. 配置API密钥

在项目根目录创建 `.env` 文件：

```env
VITE_GOOGLE_MAPS_API_KEY=你的API密钥
```

**重要**: 不要将API密钥提交到版本控制系统！

### 3. 启用3D地球模式

在应用中，你可以通过以下方式启用Google 3D Tiles：

```typescript
// 在环境变量中设置
VITE_GOOGLE_MAPS_API_KEY=your_api_key_here

// 或者在代码中直接设置（不推荐用于生产环境）
const GOOGLE_MAPS_API_KEY = 'your_api_key_here'
```

## 配置选项

### API密钥限制（推荐）

为了安全起见，建议对API密钥进行限制：

1. **HTTP引用限制**:
   - 添加你的域名，例如：`https://yourdomain.com/*`
   - 对于开发环境：`http://localhost:*`

2. **API限制**:
   - 只启用必要的API服务
   - Maps JavaScript API
   - 3D Tiles API

### 性能优化

```typescript
// 在RealisticEarth组件中的配置选项
const tilesetOptions = {
  maximumScreenSpaceError: 16, // 降低可提高质量但影响性能
  maximumMemoryUsage: 256,     // MB，根据设备调整
  skipLevelOfDetail: false,    // 启用LOD可提高性能
}
```

## 安全建议

### API密钥保护

1. **使用环境变量**: 永远不要在代码中硬编码API密钥
2. **设置引用限制**: 限制API密钥的使用域名
3. **定期轮换**: 定期更新API密钥
4. **监控使用量**: 在Google Cloud Console中监控API使用情况

### 示例安全配置

```typescript
// 正确的方式
const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

// 错误的方式 - 不要这样做！
const apiKey = 'AIzaSyC...' // 硬编码密钥
```

## 费用说明

Google 3D Tiles 是付费服务，费用基于使用量：

- **免费额度**: 每月$200的免费使用额度
- **计费方式**: 按瓦片请求次数计费
- **优化建议**: 
  - 合理设置缓存策略
  - 调整LOD参数
  - 限制渲染范围

## 故障排除

### 常见问题

1. **API密钥无效**
   - 检查密钥是否正确设置
   - 确认API已启用
   - 检查引用限制设置

2. **加载缓慢**
   - 检查网络连接
   - 调整maximumScreenSpaceError参数
   - 考虑使用CDN

3. **内存不足**
   - 降低maximumMemoryUsage设置
   - 启用skipLevelOfDetail
   - 限制渲染范围

### 调试技巧

```typescript
// 启用详细日志
console.log('Google Maps API Key:', apiKey ? '已设置' : '未设置')

// 监听加载事件
tilesRenderer.addEventListener('load-tile-set', () => {
  console.log('3D Tiles加载完成')
})

tilesRenderer.addEventListener('load-error', (event) => {
  console.error('3D Tiles加载错误:', event.error)
})
```

## 技术实现

### 核心组件

- **RealisticEarth.tsx**: 主要的3D地球组件
- **3d-tiles-renderer**: 用于渲染Google 3D Tiles的库
- **Three.js**: 3D渲染引擎

### 集成流程

1. 检查API密钥可用性
2. 初始化3D Tiles渲染器
3. 设置相机和场景
4. 加载瓦片数据
5. 处理用户交互

## 从简单地球切换

如果你想从简单地球模型切换到Google 3D Tiles：

1. 设置API密钥
2. 在SatelliteScene中启用RealisticEarth组件
3. 调整相机位置和缩放级别
4. 测试性能和视觉效果

## 更多资源

- [Google 3D Tiles 文档](https://developers.google.com/maps/documentation/tile)
- [3d-tiles-renderer GitHub](https://github.com/NASA-AMMOS/3DTilesRendererJS)
- [Three.js 文档](https://threejs.org/docs/)
- [Google Maps Platform 定价](https://cloud.google.com/maps-platform/pricing) 