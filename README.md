# 🖼️ 图片背景移除工具

使用 Next.js + Tailwind CSS 开发的 AI 图片背景移除工具。

## ✨ 功能特性

- 🚀 拖拽/点击上传图片
- 🎨 实时预览原图和处理结果
- 📥 一键下载透明背景 PNG
- 📱 响应式设计，支持移动端
- 🎯 AI 自动识别并移除背景

## 🛠️ 技术栈

- **前端**: Next.js 14, React, Tailwind CSS
- **后端**: Next.js API Routes
- **AI**: Remove.bg API

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/dongyixin211/image-background-remover.git
cd image-background-remover
```

### 2. 安装依赖

```bash
npm install
```

### 3. 配置环境变量

```bash
cp .env.local.example .env.local
```

编辑 `.env.local`，填入你的 Remove.bg API Key：

```
REMOVE_BG_API_KEY=your_api_key_here
```

获取免费 API Key: https://www.remove.bg/api

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

### 5. 部署

#### Vercel (推荐)

```bash
npm i -g vercel
vercel
```

设置环境变量 `REMOVE_BG_API_KEY` 后即可使用。

## 📝 API

### POST /api/remove-bg

移除图片背景

**请求**:
- Content-Type: `multipart/form-data`
- Body: `file` - 图片文件

**响应**:
- 成功: PNG 图片
- 失败: JSON 错误

## 🎭 截图

![Screenshot](screenshot.png)

## 📄 许可证

MIT

## 🤝 贡献

欢迎提交 Issue 和 PR！
