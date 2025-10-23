/**
 * Active Session Tracking System
 * 
 * Tracks active users in real-time for:
 * - Security dashboard metrics
 * - Concurrent user monitoring
 * - Session analytics
 * - Suspicious activity detection
 * 
 * Uses in-memory store (Redis-ready for production)
 */

import { createAuditLog } from "@/lib/security/audit-logger";

// Session data structure
interface ActiveSession {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  lastActivity: Date;
  loginTime: Date;
  deviceInfo?: {
    browser?: string;
    os?: string;
    device?: string;
  };
}

// In-memory store (replace with Redis in production)
class SessionStore {
  private sessions: Map<string, ActiveSession> = new Map();
  private userSessions: Map<string, Set<string>> = new Map(); // userId -> sessionIds
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup inactive sessions every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupInactiveSessions();
    }, 5 * 60 * 1000);
  }

  /**
   * Add or update session
   */
  async upsertSession(session: ActiveSession): Promise<void> {
    // Add to sessions map
    this.sessions.set(session.sessionId, session);

    // Add to user sessions map
    if (!this.userSessions.has(session.userId)) {
      this.userSessions.set(session.userId, new Set());
    }
    this.userSessions.get(session.userId)!.add(session.sessionId);

    // Detect multiple sessions (potential account sharing)
    const userSessionCount = this.userSessions.get(session.userId)!.size;
    if (userSessionCount > 3) {
      await this.detectMultipleSessions(session.userId, userSessionCount);
    }
  }

  /**
   * Update session activity timestamp
   */
  updateActivity(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.lastActivity = new Date();
      this.sessions.set(sessionId, session);
    }
  }

  /**
   * Remove session
   */
  async removeSession(sessionId: string): Promise<void> {
    const session = this.sessions.get(sessionId);
    if (session) {
      // Remove from user sessions map
      const userSessions = this.userSessions.get(session.userId);
      if (userSessions) {
        userSessions.delete(sessionId);
        if (userSessions.size === 0) {
          this.userSessions.delete(session.userId);
        }
      }
    }

    // Remove from sessions map
    this.sessions.delete(sessionId);
  }

  /**
   * Get all active sessions
   */
  getAllSessions(): ActiveSession[] {
    return Array.from(this.sessions.values());
  }

  /**
   * Get sessions for specific user
   */
  getUserSessions(userId: string): ActiveSession[] {
    const sessionIds = this.userSessions.get(userId);
    if (!sessionIds) return [];

    return Array.from(sessionIds)
      .map(id => this.sessions.get(id))
      .filter((s): s is ActiveSession => s !== undefined);
  }

  /**
   * Get active user count
   */
  getActiveUserCount(): number {
    return this.userSessions.size;
  }

  /**
   * Get total session count
   */
  getTotalSessionCount(): number {
    return this.sessions.size;
  }

  /**
   * Get session by ID
   */
  getSession(sessionId: string): ActiveSession | undefined {
    return this.sessions.get(sessionId);
  }

  /**
   * Cleanup inactive sessions (>30 minutes inactive)
   */
  private cleanupInactiveSessions(): void {
    const now = Date.now();
    const inactiveThreshold = 30 * 60 * 1000; // 30 minutes

    for (const [sessionId, session] of this.sessions.entries()) {
      const inactiveTime = now - session.lastActivity.getTime();
      if (inactiveTime > inactiveThreshold) {
        this.removeSession(sessionId);
      }
    }
  }

  /**
   * Detect multiple concurrent sessions (security alert)
   */
  private async detectMultipleSessions(userId: string, count: number): Promise<void> {
    if (count >= 5) {
      await createAuditLog({
        action: "SUSPICIOUS_ACTIVITY",
        userId,
        severity: "high",
        metadata: {
          after: {
            type: "multiple_concurrent_sessions",
            sessionCount: count,
            threshold: 3,
          },
        },
      });
    }
  }

  /**
   * Stop cleanup interval (for graceful shutdown)
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
  }
}

// Global session store instance
export const sessionStore = new SessionStore();

/**
 * Track user login
 */
export async function trackLogin(params: {
  userId: string;
  sessionId: string;
  ipAddress: string;
  userAgent: string;
  deviceInfo?: ActiveSession["deviceInfo"];
}): Promise<void> {
  const session: ActiveSession = {
    userId: params.userId,
    sessionId: params.sessionId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    loginTime: new Date(),
    lastActivity: new Date(),
    deviceInfo: params.deviceInfo,
  };

  await sessionStore.upsertSession(session);

  // Log to audit trail
  await createAuditLog({
    action: "LOGIN_SUCCESS",
    userId: params.userId,
    ipAddress: params.ipAddress,
    userAgent: params.userAgent,
    severity: "low",
    metadata: {
      after: {
        sessionId: params.sessionId,
        deviceInfo: params.deviceInfo,
      },
    },
  });
}

/**
 * Track user logout
 */
export async function trackLogout(params: {
  userId: string;
  sessionId: string;
}): Promise<void> {
  await sessionStore.removeSession(params.sessionId);

  await createAuditLog({
    action: "LOGOUT",
    userId: params.userId,
    severity: "low",
    metadata: {
      after: {
        sessionId: params.sessionId,
      },
    },
  });
}

/**
 * Update session activity (call on each request)
 */
export function updateSessionActivity(sessionId: string): void {
  sessionStore.updateActivity(sessionId);
}

/**
 * Get active user statistics
 */
export function getActiveUserStats(): {
  activeUsers: number;
  totalSessions: number;
  averageSessionsPerUser: number;
  recentLogins: number; // Last 15 minutes
} {
  const allSessions = sessionStore.getAllSessions();
  const now = Date.now();
  const recentThreshold = 15 * 60 * 1000; // 15 minutes

  const recentLogins = allSessions.filter(
    s => now - s.loginTime.getTime() < recentThreshold
  ).length;

  const activeUsers = sessionStore.getActiveUserCount();
  const totalSessions = sessionStore.getTotalSessionCount();

  return {
    activeUsers,
    totalSessions,
    averageSessionsPerUser: activeUsers > 0 ? totalSessions / activeUsers : 0,
    recentLogins,
  };
}

/**
 * Get detailed session information for a user
 */
export function getUserSessionDetails(userId: string): {
  sessions: ActiveSession[];
  totalSessions: number;
  oldestSession: Date | null;
  newestSession: Date | null;
} {
  const sessions = sessionStore.getUserSessions(userId);

  return {
    sessions,
    totalSessions: sessions.length,
    oldestSession: sessions.length > 0
      ? new Date(Math.min(...sessions.map(s => s.loginTime.getTime())))
      : null,
    newestSession: sessions.length > 0
      ? new Date(Math.max(...sessions.map(s => s.loginTime.getTime())))
      : null,
  };
}

/**
 * Force logout user from all sessions
 */
export async function forceLogoutUser(userId: string, reason: string): Promise<void> {
  const sessions = sessionStore.getUserSessions(userId);

  for (const session of sessions) {
    await sessionStore.removeSession(session.sessionId);
  }

  await createAuditLog({
    action: "LOGOUT",
    userId,
    severity: "high",
    metadata: {
      after: {
        type: "force_logout_all_sessions",
        reason,
        sessionCount: sessions.length,
      },
    },
  });
}

/**
 * Detect session hijacking attempts
 */
export async function detectSessionAnomaly(params: {
  sessionId: string;
  currentIp: string;
  currentUserAgent: string;
}): Promise<{ suspicious: boolean; reason?: string }> {
  const session = sessionStore.getSession(params.sessionId);

  if (!session) {
    return { suspicious: false };
  }

  // Check if IP address changed
  if (session.ipAddress !== params.currentIp) {
    await createAuditLog({
      action: "SUSPICIOUS_ACTIVITY",
      userId: session.userId,
      ipAddress: params.currentIp,
      severity: "high",
      metadata: {
        before: { ipAddress: session.ipAddress },
        after: {
          type: "ip_address_change",
          newIpAddress: params.currentIp,
        },
      },
    });

    return {
      suspicious: true,
      reason: "IP address changed during session",
    };
  }

  // Check if user agent changed significantly
  if (session.userAgent !== params.currentUserAgent) {
    const significantChange = !session.userAgent.includes(params.currentUserAgent.split('/')[0]);
    
    if (significantChange) {
      await createAuditLog({
        action: "SUSPICIOUS_ACTIVITY",
        userId: session.userId,
        userAgent: params.currentUserAgent,
        severity: "medium",
        metadata: {
          before: { userAgent: session.userAgent },
          after: {
            type: "user_agent_change",
            newUserAgent: params.currentUserAgent,
          },
        },
      });

      return {
        suspicious: true,
        reason: "User agent changed significantly",
      };
    }
  }

  return { suspicious: false };
}

/**
 * Parse user agent for device info
 */
export function parseUserAgent(userAgent: string): ActiveSession["deviceInfo"] {
  const info: ActiveSession["deviceInfo"] = {};

  // Browser detection
  if (userAgent.includes("Chrome")) info.browser = "Chrome";
  else if (userAgent.includes("Firefox")) info.browser = "Firefox";
  else if (userAgent.includes("Safari")) info.browser = "Safari";
  else if (userAgent.includes("Edge")) info.browser = "Edge";
  else info.browser = "Unknown";

  // OS detection
  if (userAgent.includes("Windows")) info.os = "Windows";
  else if (userAgent.includes("Mac")) info.os = "macOS";
  else if (userAgent.includes("Linux")) info.os = "Linux";
  else if (userAgent.includes("Android")) info.os = "Android";
  else if (userAgent.includes("iOS")) info.os = "iOS";
  else info.os = "Unknown";

  // Device detection
  if (userAgent.includes("Mobile")) info.device = "Mobile";
  else if (userAgent.includes("Tablet")) info.device = "Tablet";
  else info.device = "Desktop";

  return info;
}
