# Gesture Heart Field

> 一个基于 React、Three.js 和 MediaPipe 的手势互动爱心粒子网页。  
> A gesture-controlled heart particle web experience built with React, Three.js, and MediaPipe.

![Vite](https://img.shields.io/badge/Vite-7.x-646CFF?logo=vite&logoColor=white)
![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=111)
![Three.js](https://img.shields.io/badge/Three.js-WebGL-000000?logo=three.js&logoColor=white)
![MediaPipe](https://img.shields.io/badge/MediaPipe-Gesture%20Recognizer-4285F4)

## 中文说明

Gesture Heart Field 是一个可部署为静态网页的互动视觉应用。页面主体是由多色小爱心粒子组成的大爱心，右侧有半环轨道粒子围绕旋转，并带有固定长度拖尾效果。用户可以通过摄像头手势控制粒子的旋转、缩放、扩散和聚合。

当前项目已经支持：

- 多色小爱心粒子组成的大爱心主体
- 右侧半环粒子轨道，不再铺满整圆
- 有长度限制的拖尾效果，避免长时间运行后光污染
- MediaPipe Gesture Recognizer 手势识别
- 摄像头不可用或 HTTP 公网环境下的友好提示
- 模拟手势按钮，方便在没有摄像头/HTTPS 时调试视觉效果
- 静态构建，可部署到 Nginx、GitHub Pages、Vercel、Netlify、Cloudflare Pages 等平台

## 在线部署状态

当前已部署到云服务器，具体地址请在私有部署记录中维护：

```text
http://<SERVER_IP>/
```

注意：公网 HTTP 页面可以展示粒子效果和模拟手势，但浏览器不会开放真实摄像头权限。真实摄像头手势识别需要：

- `localhost` / `127.0.0.1`
- 或公网 `https://` 域名

备案完成并配置 HTTPS 后，摄像头按钮才能在正式线上地址正常工作。

## 技术栈

- Vite
- React
- Three.js
- MediaPipe Tasks Vision / Gesture Recognizer
- Vitest
- Nginx 静态部署

## 本地运行

确保本机已安装 Node.js 和 npm。

```powershell
npm install
npm run dev
```

打开：

```text
http://127.0.0.1:5173/
```

本地 `127.0.0.1` 属于浏览器安全上下文，可以测试真实摄像头权限。

## 构建

```powershell
npm run build
```

构建产物会生成到：

```text
dist/
```

`dist/` 是纯静态文件，可以直接上传到 Web 服务器。

## 测试

```powershell
npm test
```

当前测试覆盖：

- 手势状态映射
- 爱心粒子生成
- 固定长度拖尾配置
- 摄像头安全上下文提示

## 部署到服务器

本项目不需要后端服务。推荐方式是在本地构建后上传 `dist/`：

```powershell
npm run build
```

上传：

```bash
scp -r dist/* root@<SERVER_IP>:/var/www/gesture-heart/
```

Nginx 示例配置：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    root /var/www/gesture-heart;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|wasm)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }
}
```

重载 Nginx：

```bash
nginx -t
systemctl reload nginx
```

## 备案后续事项

备案完成后建议继续完成：

- 将域名 A 记录解析到你的云服务器公网 IP
- 把 Nginx `server_name` 改为正式域名
- 使用 Certbot、acme.sh 或 Caddy 配置 HTTPS
- 通过 `https://your-domain.com` 测试摄像头授权
- 修改服务器 root 密码，或改用 SSH key 登录

详细待办见 [docs/TODO.md](docs/TODO.md)。

## 目录结构

```text
.
├── docs/
│   └── TODO.md
├── src/
│   ├── App.jsx
│   ├── ParticleGlobe.jsx
│   ├── cameraSupport.js
│   ├── gestureMath.js
│   ├── heartParticles.js
│   ├── renderConfig.js
│   └── useGestureRecognizer.js
├── index.html
├── package.json
└── vite.config.js
```

## English

Gesture Heart Field is a static, browser-based interactive visual app. It renders a large heart made of colorful heart particles, with a rotating half-orbit particle trail on the side. Users can control the visual field with camera-based hand gestures.

## Features

- Large heart body built from colorful heart-shaped particles
- Right-side half-orbit particle ring instead of a full sphere
- Bounded trail rendering, so particles leave short trails without accumulating permanent glow
- MediaPipe Gesture Recognizer integration
- Friendly error messaging when camera access is unavailable
- Gesture simulation buttons for HTTP or camera-less environments
- Static build output suitable for Nginx, GitHub Pages, Vercel, Netlify, Cloudflare Pages, and similar hosts

## Live Deployment

Current server deployment is maintained outside this public README:

```text
http://<SERVER_IP>/
```

Public HTTP can render the visual effect and simulated gestures, but real camera access requires a secure browser context:

- `localhost` / `127.0.0.1`
- or a public `https://` domain

After domain registration and HTTPS setup, real camera gesture tracking can be tested online.

## Tech Stack

- Vite
- React
- Three.js
- MediaPipe Tasks Vision / Gesture Recognizer
- Vitest
- Nginx static hosting

## Local Development

```powershell
npm install
npm run dev
```

Open:

```text
http://127.0.0.1:5173/
```

Localhost is a secure browser context, so camera permissions can be tested locally.

## Build

```powershell
npm run build
```

The static site is generated into:

```text
dist/
```

## Test

```powershell
npm test
```

The test suite covers gesture mapping, heart particle generation, bounded trail config, and camera support messaging.

## Deployment

This project does not require a backend service. Build locally and upload `dist/` to any static web server.

Example:

```bash
scp -r dist/* root@<SERVER_IP>:/var/www/gesture-heart/
```

For real camera access in production, serve the site over HTTPS.

## Next Steps

- Point a registered domain to your cloud server public IP
- Update Nginx `server_name`
- Configure HTTPS
- Test real camera permissions on the HTTPS domain
- Rotate the exposed root password and switch to SSH key authentication

See [docs/TODO.md](docs/TODO.md) for the deployment checklist.
