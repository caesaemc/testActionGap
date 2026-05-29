import { ParticleGlobe } from './ParticleGlobe.jsx';
import { useGestureRecognizer } from './useGestureRecognizer.js';

const statusText = {
  idle: '未连接摄像头',
  'loading-model': '正在加载手势模型',
  'requesting-camera': '等待摄像头授权',
  tracking: '正在追踪手势',
  simulated: '模拟手势中',
  error: '摄像头不可用',
};

export function App() {
  const { error, gestureState, simulate, startCamera, status, stopCamera, videoRef } =
    useGestureRecognizer();

  return (
    <main className="app-shell">
      <ParticleGlobe gestureState={gestureState} />

      <section className="topbar" aria-label="应用状态">
        <div>
          <h1>Gesture Heart Field</h1>
          <p>用手势旋转、缩放和扰动半环爱心粒子</p>
        </div>
        <div className={`status-dot status-${status}`} aria-label={statusText[status]}>
          <span />
          {statusText[status]}
        </div>
      </section>

      <aside className="control-panel" aria-label="手势控制">
        <video ref={videoRef} className="camera-feed" muted playsInline aria-label="摄像头预览" />
        <div className="gesture-readout">
          <span className="label">当前映射</span>
          <strong>{gestureState.label}</strong>
        </div>
        <dl className="metrics">
          <div>
            <dt>手数</dt>
            <dd>{gestureState.hands}</dd>
          </div>
          <div>
            <dt>缩放</dt>
            <dd>{gestureState.scale.toFixed(2)}</dd>
          </div>
          <div>
            <dt>扩散</dt>
            <dd>{gestureState.expansion.toFixed(2)}</dd>
          </div>
        </dl>
        {error && <p className="error-text">{error}</p>}
        <div className="primary-actions">
          {status === 'tracking' ? (
            <button type="button" onClick={stopCamera}>
              停止摄像头
            </button>
          ) : (
            <button type="button" onClick={startCamera}>
              启动摄像头
            </button>
          )}
        </div>
        <div className="sim-actions" aria-label="模拟手势">
          <button type="button" onClick={() => simulate('open')}>
            张开
          </button>
          <button type="button" onClick={() => simulate('fist')}>
            握拳
          </button>
          <button type="button" onClick={() => simulate('pinch')}>
            捏合
          </button>
          <button type="button" onClick={() => simulate('zoom')}>
            双手缩放
          </button>
        </div>
      </aside>
    </main>
  );
}
