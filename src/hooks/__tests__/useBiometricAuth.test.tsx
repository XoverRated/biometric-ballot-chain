
import { renderHook, act } from '@testing-library/react';
import { useBiometricAuth } from '../biometric/useBiometricAuth';
import { mockUser } from '@/test-utils/test-utils';
import * as AuthContext from '@/contexts/AuthContext';

jest.mock('@/contexts/AuthContext');
jest.mock('@/workers/biometricWorker', () => ({
  biometricWorker: {
    authenticate: jest.fn().mockResolvedValue({
      success: true,
      similarity: 0.85,
    }),
  },
}));

describe('useBiometricAuth', () => {
  const mockFrameHistoryRef = { current: [] };
  const mockVideoRef = { current: document.createElement('video') };

  beforeEach(() => {
    (AuthContext.useAuth as jest.Mock).mockReturnValue({
      user: mockUser,
    });
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() =>
      useBiometricAuth(mockFrameHistoryRef, mockVideoRef)
    );

    expect(result.current.isAuthenticating).toBe(false);
    expect(result.current.authProgress).toBe(0);
    expect(result.current.authSuccess).toBe(false);
    expect(result.current.securityChecks).toHaveLength(0);
  });

  it('should handle successful authentication', async () => {
    const { result } = renderHook(() =>
      useBiometricAuth(mockFrameHistoryRef, mockVideoRef)
    );

    await act(async () => {
      await result.current.handleAuthenticate();
    });

    expect(result.current.authSuccess).toBe(true);
    expect(result.current.isAuthenticating).toBe(false);
  });

  it('should update security checks during authentication', () => {
    const { result } = renderHook(() =>
      useBiometricAuth(mockFrameHistoryRef, mockVideoRef)
    );

    act(() => {
      result.current.setSecurityChecks([
        {
          name: 'Test Check',
          status: 'pending',
          description: 'Testing',
          icon: <div>Icon</div>,
        },
      ]);
    });

    expect(result.current.securityChecks).toHaveLength(1);
    expect(result.current.securityChecks[0].status).toBe('pending');
  });

  it('should handle authentication failure', async () => {
    const { biometricWorker } = require('@/workers/biometricWorker');
    biometricWorker.authenticate.mockRejectedValue(new Error('Auth failed'));

    const { result } = renderHook(() =>
      useBiometricAuth(mockFrameHistoryRef, mockVideoRef)
    );

    await act(async () => {
      try {
        await result.current.handleAuthenticate();
      } catch (error) {
        expect(error.message).toBe('Auth failed');
      }
    });

    expect(result.current.isAuthenticating).toBe(false);
  });
});
