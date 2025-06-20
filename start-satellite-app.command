#!/bin/bash

# macOS双击启动脚本
# 自动切换到脚本所在目录
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# 清屏
clear

echo -e "${CYAN}======================================"
echo -e "   卫星可视化系统启动器"
echo -e "======================================${NC}"
echo

# 检查是否在正确的项目目录中
if [ ! -f "package.json" ]; then
    echo -e "${RED}错误: 未在项目根目录中找到 package.json${NC}"
    echo -e "${YELLOW}请确保脚本位于项目根目录中${NC}"
    read -p "按回车键退出..."
    exit 1
fi

# 检查Node.js是否安装
echo -e "${BLUE}检查Node.js环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}未检测到Node.js，请先安装Node.js${NC}"
    echo -e "${YELLOW}下载地址：https://nodejs.org/${NC}"
    echo -e "${YELLOW}或使用Homebrew安装：brew install node${NC}"
    read -p "按回车键退出..."
    exit 1
fi

NODE_VERSION=$(node --version)
echo -e "${GREEN}Node.js版本: $NODE_VERSION${NC}"

# 检查npm是否可用
if ! command -v npm &> /dev/null; then
    echo -e "${RED}npm不可用${NC}"
    read -p "按回车键退出..."
    exit 1
fi

NPM_VERSION=$(npm --version)
echo -e "${GREEN}npm版本: $NPM_VERSION${NC}"

# 检查是否已安装依赖
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}首次运行，正在安装依赖包...${NC}"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}依赖安装失败${NC}"
        read -p "按回车键退出..."
        exit 1
    fi
    echo -e "${GREEN}依赖安装完成${NC}"
else
    echo -e "${GREEN}依赖已存在${NC}"
fi

# 检查端口是否被占用
echo -e "${BLUE}检查端口可用性...${NC}"
PORT=3001
if command -v lsof >/dev/null 2>&1; then
    if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1; then
        echo -e "${YELLOW}端口3001已被占用，Vite会自动选择其他端口${NC}"
    fi
elif command -v netstat >/dev/null 2>&1; then
    if netstat -an | grep :3001 >/dev/null 2>&1; then
        echo -e "${YELLOW}端口3001已被占用，Vite会自动选择其他端口${NC}"
    fi
else
    echo -e "${YELLOW}无法检查端口状态，如有冲突Vite会自动选择其他端口${NC}"
fi

# 启动开发服务器
echo ""
echo -e "${GREEN}系统正在启动，请稍候...${NC}"
echo -e "${GREEN}系统将在浏览器中自动打开${NC}"
echo -e "${GREEN}访问地址: http://localhost:$PORT${NC}"
echo ""
echo -e "${PURPLE}提示：${NC}"
echo -e "${PURPLE}   - 按Ctrl+C可停止服务器${NC}"
echo -e "${PURPLE}   - 关闭此终端也会停止服务器${NC}"
echo ""

# 延迟打开浏览器
(sleep 3 && open "http://localhost:$PORT" 2>/dev/null || xdg-open "http://localhost:$PORT" 2>/dev/null) &

# 启动Vite开发服务器
npm run dev

echo ""
echo -e "${RED}服务器已停止${NC}"
read -p "按回车键退出..." 