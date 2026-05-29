import { useCallback, useEffect, useRef, useState } from 'react';
import {
  createIdleGestureState,
  createSimulatedResults,
  mapHandResultsToGlobeState,
} from './gestureMath.js';
import { getCameraSupportError } from './cameraSupport.js';

const MODEL_URL =
  'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

export function useGestureRecognizer() {
  const videoRef = useRef(null);
  const recognizerRef = useRef(null);
  const streamRef = useRef(null);
  const stateRef = useRef(createIdleGestureState());
  const frameRef = useRef(0);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState('');
  const [gestureState, setGestureState] = useState(stateRef.current);

  const publishState = useCallback((nextState) => {
    stateRef.current = nextState;
    setGestureState(nextState);
  }, []);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(frameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStatus('idle');
  }, []);

  const tick = useCallback(() => {
    const video = videoRef.current;
    const recognizer = recognizerRef.current;

    if (video && recognizer && video.readyState >= 2) {
      const results = recognizer.recognizeForVideo(video, performance.now());
      publishState(mapHandResultsToGlobeState(results, stateRef.current));
    }

    frameRef.current = requestAnimationFrame(tick);
  }, [publishState]);

  const startCamera = useCallback(async () => {
    try {
      setError('');
      const supportError = getCameraSupportError();
      if (supportError) {
        setStatus('error');
        setError(supportError);
        return;
      }

      setStatus('loading-model');

      if (!recognizerRef.current) {
        const { FilesetResolver, GestureRecognizer } = await import('@mediapipe/tasks-vision');
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.22-rc.20250304/wasm',
        );
        recognizerRef.current = await GestureRecognizer.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: MODEL_URL,
            delegate: 'GPU',
          },
          runningMode: 'VIDEO',
          numHands: 2,
        });
      }

      setStatus('requesting-camera');
      streamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      });

      const video = videoRef.current;
      video.srcObject = streamRef.current;
      await video.play();
      setStatus('tracking');
      frameRef.current = requestAnimationFrame(tick);
    } catch (cameraError) {
      setStatus('error');
      setError(cameraError?.message ?? '摄像头或模型初始化失败');
      stopCamera();
    }
  }, [stopCamera, tick]);

  const simulate = useCallback(
    (kind) => {
      publishState(mapHandResultsToGlobeState(createSimulatedResults(kind), stateRef.current));
      setStatus('simulated');
      setError('');
    },
    [publishState],
  );

  useEffect(() => stopCamera, [stopCamera]);

  return {
    error,
    gestureState,
    simulate,
    startCamera,
    status,
    stopCamera,
    videoRef,
  };
}
