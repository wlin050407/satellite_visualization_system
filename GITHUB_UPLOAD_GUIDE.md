# GitHub上传指南

这是一个完整的卫星可视化系统，可以直接上传到GitHub。

## 包含的文件

- **源代码**: `src/` 目录下的所有React组件和TypeScript文件
- **公共资源**: `public/` 目录下的3D模型文件和静态资源
- **配置文件**: 所有必要的配置文件已包含

### 配置文件
- `package.json` - 项目依赖和脚本
- `vite.config.ts` - Vite构建配置
- `tsconfig.json` - TypeScript配置
- `tailwind.config.js` - Tailwind CSS配置
- `.gitignore` - Git忽略文件配置

### 启动脚本
- `start-windows.bat` - Windows一键启动脚本
- `start-linux.sh` - Linux/Mac启动脚本（需要创建）
- `docker-compose.yml` - Docker容器化部署

### 文档
- `README.md` - 项目说明文档
- `README_3D_MODELS.md` - 3D模型详细说明
- 各种测试页面和说明文档

## 已排除的文件

- `node_modules/` - 依赖包目录（通过.gitignore排除）
- `dist/` - 构建输出目录
- `.env` - 环境变量文件（如果有敏感信息）
- 各种临时文件和缓存文件

## 上传到GitHub

1. **创建新仓库**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: 卫星可视化系统"
   ```

2. **添加远程仓库**
   ```bash
   git remote add origin https://github.com/你的用户名/satellite-visualization.git
   git branch -M main
   git push -u origin main
   ```

3. **设置仓库描述**
   - 仓库名称: `satellite-visualization-system`
   - 描述: `实时卫星轨道可视化系统 - 3D地球、真实轨道、NASA模型`
   - 标签: `satellite`, `3d`, `visualization`, `nasa`, `orbit`, `space`

4. **README.md内容建议**
   - 项目简介和特性
   - 安装和运行说明
   - 功能截图
   - 技术栈说明
   - 贡献指南

## 使用建议

1. **克隆后的操作**
   - 运行 `npm install` 安装依赖
   - 运行 `npm run dev` 启动开发服务器
   - 或者直接运行 `start-windows.bat`

2. **部署建议**
   - 使用 `npm run build` 构建生产版本
   - 部署到Vercel、Netlify或GitHub Pages
   - 确保静态资源路径正确

## 项目亮点

- 真实的卫星轨道模拟
- 3D地球渲染和大气层效果
- 地面站控制系统
- 交互式控制面板
- 实时数据更新
- 跨平台启动脚本
- Docker支持 