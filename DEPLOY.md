# 🚀 部署指南

## Cloudflare Pages 部署

### 1. 在 GitHub 设置环境变量

1. 打开 https://github.com/dongyixin211/image-background-remover-next/settings/secrets/actions
2. 点击 **New repository secret**
3. 添加：
   - **Name**: `REMOVE_BG_API_KEY`
   - **Value**: 你的 Remove.bg API Key

### 2. 配置 Cloudflare

在 Cloudflare Dashboard 中启用 GitHub 集成：

1. 打开 https://dash.cloudflare.com/15a550370cc674a51f7aa466a0f9dbef/pages/view/image-background-remover-next
2. 点击 **Set up Git** → **Connect to GitHub**
3. 选择仓库 `dongyixin211/image-background-remover-next`
4. 设置：
   - **Production branch**: `main`
   - **Build command**: `npm run build`
   - **Build output directory**: (留空)

### 3. 自动部署

每次 push 代码到 main 分支会自动部署。
