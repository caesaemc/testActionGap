function isLocalHost(location) {
  return ['localhost', '127.0.0.1', '::1'].includes(location?.hostname);
}

export function getCameraSupportError({
  isSecureContext = globalThis.isSecureContext,
  mediaDevices = globalThis.navigator?.mediaDevices,
  location = globalThis.location,
} = {}) {
  if (mediaDevices?.getUserMedia) return '';

  if (!isSecureContext && !isLocalHost(location)) {
    return '摄像头需要 HTTPS 或 localhost。当前是公网 HTTP 地址，浏览器不会开放 getUserMedia。请绑定域名并配置 HTTPS 后再启动摄像头。';
  }

  return '当前浏览器不支持摄像头访问，或摄像头权限被系统/浏览器禁用。';
}
