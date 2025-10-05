export const TICKET_STATUS = {
  OPEN: 'open',
  IN_PROGRESS: 'in-progress',
  RESOLVED: 'resolved',
  CLOSED: 'closed'
};

export const TICKET_PRIORITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

export const TICKET_CATEGORY = {
  TECHNICAL: 'technical',
  BILLING: 'billing',
  GENERAL: 'general',
  FEATURE_REQUEST: 'feature-request'
};

export const USER_ROLES = {
  USER: 'user',
  AGENT: 'agent',
  ADMIN: 'admin'
};

export const SLA_STATUS = {
  SAFE: 'safe',
  WARNING: 'warning',
  CRITICAL: 'critical',
  BREACHED: 'breached'
};

export const STATUS_COLORS = {
  [TICKET_STATUS.OPEN]: '#17a2b8',
  [TICKET_STATUS.IN_PROGRESS]: '#ffc107',
  [TICKET_STATUS.RESOLVED]: '#28a745',
  [TICKET_STATUS.CLOSED]: '#6c757d'
};

export const PRIORITY_COLORS = {
  [TICKET_PRIORITY.LOW]: '#28a745',
  [TICKET_PRIORITY.MEDIUM]: '#ffc107',
  [TICKET_PRIORITY.HIGH]: '#fd7e14',
  [TICKET_PRIORITY.CRITICAL]: '#dc3545'
};

export const SLA_COLORS = {
  [SLA_STATUS.SAFE]: '#28a745',
  [SLA_STATUS.WARNING]: '#ffc107',
  [SLA_STATUS.CRITICAL]: '#fd7e14',
  [SLA_STATUS.BREACHED]: '#dc3545'
};
