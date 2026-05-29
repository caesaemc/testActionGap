import { describe, expect, it } from 'vitest';
import { getCameraSupportError } from './cameraSupport.js';

describe('getCameraSupportError', () => {
  it('explains that camera access requires HTTPS or localhost when mediaDevices is missing', () => {
    const error = getCameraSupportError({
      isSecureContext: false,
      mediaDevices: undefined,
      location: { hostname: '106.14.249.119', protocol: 'http:' },
    });

    expect(error).toContain('HTTPS');
    expect(error).toContain('localhost');
  });

  it('returns an empty error when getUserMedia is available', () => {
    const error = getCameraSupportError({
      isSecureContext: true,
      mediaDevices: { getUserMedia: () => {} },
      location: { hostname: 'example.com', protocol: 'https:' },
    });

    expect(error).toBe('');
  });
});
