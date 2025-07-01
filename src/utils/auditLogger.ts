
export interface AuditEvent {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details: Record<string, any>;
  timestamp: Date;
  ipAddress?: string;
  userAgent?: string;
  sessionId?: string;
}

export interface AuditConfig {
  enableConsoleLogging?: boolean;
  enableRemoteLogging?: boolean;
  sensitiveFields?: string[];
}

class AuditLogger {
  private config: AuditConfig;
  private events: AuditEvent[] = [];

  constructor(config: AuditConfig = {}) {
    this.config = {
      enableConsoleLogging: true,
      enableRemoteLogging: false,
      sensitiveFields: ['password', 'biometric_data', 'face_embedding'],
      ...config,
    };
  }

  private sanitizeDetails(details: Record<string, any>): Record<string, any> {
    const sanitized = { ...details };
    
    this.config.sensitiveFields?.forEach(field => {
      if (field in sanitized) {
        sanitized[field] = '[REDACTED]';
      }
    });

    return sanitized;
  }

  private generateEventId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async logEvent(
    userId: string,
    action: string,
    resource: string,
    details: Record<string, any> = {},
    resourceId?: string
  ): Promise<void> {
    const event: AuditEvent = {
      id: this.generateEventId(),
      userId,
      action,
      resource,
      resourceId,
      details: this.sanitizeDetails(details),
      timestamp: new Date(),
      ipAddress: await this.getClientIP(),
      userAgent: navigator.userAgent,
      sessionId: this.getSessionId(),
    };

    // Store locally
    this.events.push(event);

    // Console logging
    if (this.config.enableConsoleLogging) {
      console.log('🔍 Audit Event:', {
        action: event.action,
        resource: event.resource,
        userId: event.userId,
        timestamp: event.timestamp.toISOString(),
        details: event.details,
      });
    }

    // Remote logging (in production, this would send to a logging service)
    if (this.config.enableRemoteLogging) {
      try {
        // await this.sendToRemoteLogger(event);
        console.log('📤 Audit event would be sent to remote logger:', event.id);
      } catch (error) {
        console.error('Failed to send audit event to remote logger:', error);
      }
    }
  }

  private async getClientIP(): Promise<string> {
    try {
      // In production, this would get the real client IP
      return 'localhost';
    } catch {
      return 'unknown';
    }
  }

  private getSessionId(): string {
    // In production, this would get the actual session ID
    return sessionStorage.getItem('session_id') || 'unknown';
  }

  getEvents(filters?: {
    userId?: string;
    action?: string;
    resource?: string;
    startDate?: Date;
    endDate?: Date;
  }): AuditEvent[] {
    let filteredEvents = [...this.events];

    if (filters) {
      if (filters.userId) {
        filteredEvents = filteredEvents.filter(e => e.userId === filters.userId);
      }
      if (filters.action) {
        filteredEvents = filteredEvents.filter(e => e.action === filters.action);
      }
      if (filters.resource) {
        filteredEvents = filteredEvents.filter(e => e.resource === filters.resource);
      }
      if (filters.startDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        filteredEvents = filteredEvents.filter(e => e.timestamp <= filters.endDate!);
      }
    }

    return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  clearEvents(): void {
    this.events = [];
  }

  // Convenience methods for common audit events
  async logAuthentication(userId: string, success: boolean, method: string): Promise<void> {
    await this.logEvent(
      userId,
      success ? 'AUTH_SUCCESS' : 'AUTH_FAILURE',
      'authentication',
      { method, success }
    );
  }

  async logVoteCast(userId: string, electionId: string, candidateId: string): Promise<void> {
    await this.logEvent(
      userId,
      'VOTE_CAST',
      'vote',
      { electionId, candidateId },
      electionId
    );
  }

  async logBiometricRegistration(userId: string, success: boolean): Promise<void> {
    await this.logEvent(
      userId,
      success ? 'BIOMETRIC_REGISTRATION_SUCCESS' : 'BIOMETRIC_REGISTRATION_FAILURE',
      'biometric',
      { success }
    );
  }

  async logElectionAccess(userId: string, electionId: string): Promise<void> {
    await this.logEvent(
      userId,
      'ELECTION_ACCESS',
      'election',
      { electionId },
      electionId
    );
  }

  async logAdminAction(userId: string, action: string, targetResource: string, details: Record<string, any>): Promise<void> {
    await this.logEvent(
      userId,
      `ADMIN_${action.toUpperCase()}`,
      targetResource,
      details
    );
  }
}

export const auditLogger = new AuditLogger();
