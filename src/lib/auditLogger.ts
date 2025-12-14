import { supabase } from "@/integrations/supabase/client";

type AuditAction = 
  | "user_created"
  | "user_deleted"
  | "user_updated"
  | "role_changed"
  | "payroll_created"
  | "payroll_updated"
  | "payroll_confirmed"
  | "payroll_sent"
  | "payroll_deleted"
  | "company_created"
  | "company_updated"
  | "company_deleted"
  | "employee_created"
  | "employee_updated"
  | "employee_deleted";

type EntityType = 
  | "user"
  | "role"
  | "payroll"
  | "employee"
  | "company";

interface AuditLogParams {
  action: AuditAction;
  entityType: EntityType;
  entityId?: string;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
}

/**
 * Logs an audit event for sensitive operations.
 * This function is designed to be fire-and-forget - it won't block the main operation.
 */
export async function logAuditEvent(params: AuditLogParams): Promise<void> {
  try {
    const { action, entityType, entityId, oldValue, newValue } = params;

    // Fire and forget - don't await
    supabase.functions.invoke("audit-log", {
      body: {
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_value: oldValue,
        new_value: newValue,
      },
    }).catch((error) => {
      console.error("Failed to log audit event:", error);
    });
  } catch (error) {
    // Silently fail - audit logging should never break the main operation
    console.error("Failed to initiate audit log:", error);
  }
}

/**
 * Sanitizes sensitive data before logging to audit trail.
 * Removes or masks passwords, tokens, and other sensitive fields.
 */
export function sanitizeForAudit(data: Record<string, unknown>): Record<string, unknown> {
  const sensitiveFields = ['password', 'token', 'secret', 'api_key', 'apikey', 'authorization'];
  const sanitized = { ...data };
  
  for (const key of Object.keys(sanitized)) {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = '[REDACTED]';
    }
  }
  
  return sanitized;
}
