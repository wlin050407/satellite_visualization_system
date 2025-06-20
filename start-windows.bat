@echo off
chcp 65001 >nul
setlocal enabledelayedexpansion

cd /d "%~dp0"

if not exist "package.json" (
    echo 错误: 未在项目根目录中找到 package.json
    echo 请确保在正确的项目目录中运行此脚本
    pause
    exit /b 1
)

echo.
echo    卫星可视化系统启动器
echo    ===================
echo.

REM 检查Node.js是否安装
where node >nul 2>&1
if %errorlevel% neq 0 (
    echo 未检测到Node.js，请先安装Node.js
    echo 下载地址：https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM 获取Node.js版本
for /f "tokens=*" %%i in ('node --version 2^>nul') do set NODE_VERSION=%%i
echo Node.js版本: %NODE_VERSION%

REM 检查npm是否可用
where npm >nul 2>&1
if %errorlevel% neq 0 (
    echo npm不可用
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('npm --version 2^>nul') do set NPM_VERSION=%%i
echo npm版本: %NPM_VERSION%

REM 检查是否需要安装依赖
if not exist "node_modules" (
    echo 首次运行，正在安装依赖包...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo 依赖安装失败
        pause
        exit /b 1
    )
    echo 依赖安装完成
) else (
    echo 依赖已存在
)

REM 设置端口
set PORT=3001

REM 检查端口是否被占用
netstat -an | find ":%PORT%" >nul
if %errorlevel% equ 0 (
    echo 端口3001已被占用，Vite会自动选择其他端口
) else (
    echo 端口3001可用
)

echo.
echo.
echo 系统正在启动，请稍候...
echo 系统将在浏览器中自动打开
echo 访问地址: http://localhost:%PORT%
echo.
echo 提示：
echo - 如果浏览器没有自动打开，请手动访问上述地址
echo - 按 Ctrl+C 可以停止服务器
echo - 如遇到问题，请检查防火墙设置
echo.

REM 启动开发服务器
npm run dev

pause 