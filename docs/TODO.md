# 待完成事项

## 当前代码状态

- 前端项目位于仓库根目录，技术栈是 Vite + React + Three.js。
- 手势识别使用 `@mediapipe/tasks-vision` 的 Gesture Recognizer，并在点击“启动摄像头”时按需加载。
- 主视觉是多色爱心粒子：中心为大爱心，右侧为半环旋转粒子。
- 拖尾已改成固定长度轨迹，只保留最近 6 帧，避免无限累积光污染。
- 在公网 HTTP 环境下点击摄像头会显示 HTTPS/localhost 提示，不再抛出 `getUserMedia` undefined 错误。

## 已完成部署

- 云服务器 IP：`106.14.249.119`
- 系统：CentOS 7
- Web 服务：Nginx
- 静态文件目录：`/var/www/gesture-heart`
- 当前访问地址：`http://106.14.249.119/`

## 后续必须完成

1. 等域名备案完成。
2. 在 DNS 控制台添加 A 记录，指向 `106.14.249.119`。
3. 把 Nginx 的 `server_name` 从 IP 改成备案后的域名。
4. 申请 HTTPS 证书，例如使用 Certbot。
5. 使用 `https://域名` 访问页面，验证浏览器能弹出摄像头授权。
6. 在 HTTPS 环境下测试真实手势：
   - 张开手掌：粒子扩散
   - 握拳：粒子聚合
   - 捏合：抓取/加速
   - 双手：缩放

## 建议的 HTTPS 配置步骤

备案完成并解析域名后，在服务器执行：

```bash
yum -y install certbot python2-certbot-nginx || yum -y install certbot python-certbot-nginx
certbot --nginx -d your-domain.com
```

如果 Certbot 在 CentOS 7 上不可用，可以改用 acme.sh 或 Caddy。

## 安全事项

- 远程服务器 root 密码曾经在聊天中出现过，建议尽快修改。
- 推荐后续改成 SSH key 登录，并关闭密码登录。
- 不要把服务器密码、私钥、API Key 写入仓库。

## 常用命令

本地构建：

```powershell
npm run build
```

上传静态文件到服务器：

```bash
scp -r dist/* root@106.14.249.119:/var/www/gesture-heart/
```

服务器重载 Nginx：

```bash
nginx -t
systemctl reload nginx
```
