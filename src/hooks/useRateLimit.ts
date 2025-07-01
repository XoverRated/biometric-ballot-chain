
import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

interface RateLimitState {
  attempts: number;
  windowStart: number;
  isBlocked: boolean;
  blockUntil?: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const { maxAttempts, windowMs, blockDurationMs = 300000 } = config; // 5 minutes default block
  const [state, setState] = useState<RateLimitState>({
    attempts: 0,
    windowStart: Date.now(),
    isBlocked: false,
  });
  
  const intervalRef = useRef<NodeJS.Timeout>();

  const checkRateLimit = useCallback((): boolean => {
    const now = Date.now();
    
    // Check if currently blocked
    if (state.isBlocked && state.blockUntil && now < state.blockUntil) {
      return false;
    }
    
    // Reset block if expired
    if (state.isBlocked && state.blockUntil && now >= state.blockUntil) {
      setState(prev => ({
        ...prev,
        isBlocked: false,
        blockUntil: undefined,
        attempts: 0,
        windowStart: now,
      }));
      return true;
    }
    
    // Reset window if expired
    if (now - state.windowStart > windowMs) {
      setState(prev => ({
        ...prev,
        attempts: 0,
        windowStart: now,
      }));
      return true;
    }
    
    // Check if within limits
    return state.attempts < maxAttempts;
  }, [state, maxAttempts, windowMs]);

  const recordAttempt = useCallback(() => {
    const now = Date.now();
    
    setState(prev => {
      const newAttempts = prev.attempts + 1;
      const shouldBlock = newAttempts >= maxAttempts;
      
      return {
        ...prev,
        attempts: newAttempts,
        isBlocked: shouldBlock,
        blockUntil: shouldBlock ? now + blockDurationMs : undefined,
      };
    });
  }, [maxAttempts, blockDurationMs]);

  const getRemainingTime = useCallback((): number => {
    if (!state.isBlocked || !state.blockUntil) return 0;
    return Math.max(0, state.blockUntil - Date.now());
  }, [state]);

  const getRemainingAttempts = useCallback((): number => {
    return Math.max(0, maxAttempts - state.attempts);
  }, [state.attempts, maxAttempts]);

  const reset = useCallback(() => {
    setState({
      attempts: 0,
      windowStart: Date.now(),
      isBlocked: false,
    });
  }, []);

  return {
    canProceed: checkRateLimit(),
    isBlocked: state.isBlocked,
    remainingAttempts: getRemainingAttempts(),
    remainingTime: getRemainingTime(),
    recordAttempt,
    reset,
  };
};
