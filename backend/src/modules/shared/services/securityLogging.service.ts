     1|/**
     2| * Security Logging Service
     3| * Comprehensive security event logging for authentication and security events
     4| *
     5| * @requirement SEC-LOG-001
     6| */
     7|
     8|import db from '../../../config/database';
     9|
    10|// Security event types
    11|export enum SecurityEventType {
    12|  // Authentication
    13|  LOGIN_ATTEMPT = 'login_attempt',
    14|  LOGIN_SUCCESS = 'login_success',
    15|  LOGIN_FAILED = 'login_failed',
    16|  LOGOUT = 'logout',
    17|
    18|  // Token Management
    19|  TOKEN_REFRESH = 'token_refresh',
    20|  TOKEN_REFRESH_FAILED = 'token_refresh_failed',
    21|  TOKEN_REVOKED = 'token_revoked',
    22|
    23|  // Account Management
    24|  PASSWORD_CHANGED = 'password_changed',
    25|  EMAIL_CHANGED = 'email_changed',
    26|  ACCOUNT_LOCKED = 'account_locked',
    27|  ACCOUNT_UNLOCKED = 'account_unlocked',
    28|
    29|  // CSRF
    30|  CSRF_TOKEN_GENERATED = 'csrf_token_generated',
    31|  CSRF_VALIDATION_FAILED = 'csrf_validation_failed',
    32|
    33|  // Suspicious Activity
    34|  SUSPICIOUS_LOGIN_PATTERN = 'suspicious_login_pattern',
    35|  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',
    36|  BRUTE_FORCE_DETECTED = 'brute_force_detected',
    37|}
    38|
    39|export interface SecurityEvent {
    40|  id: string;
    41|  action: SecurityEventType | string;
    42|  user_id: string | null;
    43|  email: string | null;
    44|  ip_address: string | null;
    45|  user_agent: string | null;
    46|  entity_type: string | null;
    47|  entity_id: string | null;
    48|  details: Record<string, unknown> | null;
    49|  success: boolean;
    50|  failure_reason: string | null;
    51|  created_at: Date;
    52|}
    53|
    54|export interface LogEventInput {
    55|  action: SecurityEventType | string;
    56|  userId?: string;
    57|  email?: string;
    58|  ipAddress?: string;
    59|  userAgent?: string;
    60|  success?: boolean;
    61|  failureReason?: string;
    62|  details?: Record<string, unknown>;
    63|  entityType?: string;
    64|  entityId?: string;
    65|}
    66|
    67|export interface SecurityStats {
    68|  totalEvents: number;
    69|  failedLogins: number;
    70|  successfulLogins: number;
    71|  tokenRefreshes: number;
    72|  rateLimitBreaches: number;
    73|  suspiciousActivities: number;
    74|}
    75|
    76|/**
    77| * Log a security event
    78| */
    79|export async function logSecurityEvent(input: LogEventInput): Promise<SecurityEvent> {
    80|  const [event] = await db<SecurityEvent>('audit_log')
    81|    .insert({
    82|      action: input.action,
    83|      user_id: input.userId || null,
    84|      email: input.email || null,
    85|      ip_address: input.ipAddress || null,
    86|      user_agent: input.userAgent || null,
    87|      success: input.success !== false,
    88|      failure_reason: input.failureReason || null,
    89|      details: input.details || null,
    90|      entity_type: input.entityType || null,
    91|      entity_id: input.entityId || null,
    92|    })
    93|    .returning('*');
    94|
    95|  return event;
    96|}
    97|
    98|/**
    99| * Log login attempt
   100| */
   101|export async function logLoginAttempt(
   102|  email: string,
   103|  success: boolean,
   104|  metadata: {
   105|    ipAddress?: string;
   106|    userAgent?: string;
   107|    userId?: string;
   108|    failureReason?: string;
   109|  } = {},
   110|): Promise<SecurityEvent> {
   111|  return logSecurityEvent({
   112|    action: success ? SecurityEventType.LOGIN_SUCCESS : SecurityEventType.LOGIN_FAILED,
   113|    email,
   114|    success,
   115|    userId: metadata.userId,
   116|    ipAddress: metadata.ipAddress,
   117|    userAgent: metadata.userAgent,
   118|    failureReason: metadata.failureReason,
   119|  });
   120|}
   121|
   122|/**
   123| * Log logout event
   124| */
   125|export async function logLogout(
   126|  userId: string,
   127|  metadata: {
   128|    ipAddress?: string;
   129|    userAgent?: string;
   130|  } = {},
   131|): Promise<SecurityEvent> {
   132|  return logSecurityEvent({
   133|    action: SecurityEventType.LOGOUT,
   134|    userId,
   135|    ipAddress: metadata.ipAddress,
   136|    userAgent: metadata.userAgent,
   137|  });
   138|}
   139|
   140|/**
   141| * Log logout event (alias for logLogout for compatibility)
   142| */
   143|export async function logLogoutEvent(
   144|  userId: string,
   145|  metadata: { ipAddress?: string; userAgent?: string } = {},
   146|): Promise<SecurityEvent> {
   147|  return logLogout(userId, metadata);
   148|}
   149|
   150|/**
   151| * Log token refresh event
   152| */
   153|export async function logTokenRefresh(
   154|  userId: string,
   155|  success: boolean,
   156|  metadata: {
   157|    ipAddress?: string;
   158|    userAgent?: string;
   159|    failureReason?: string;
   160|  } = {},
   161|): Promise<SecurityEvent> {
   162|  return logSecurityEvent({
   163|    action: success ? SecurityEventType.TOKEN_REFRESH : SecurityEventType.TOKEN_REFRESH_FAILED,
   164|    userId,
   165|    success,
   166|    ipAddress: metadata.ipAddress,
   167|    userAgent: metadata.userAgent,
   168|    failureReason: metadata.failureReason,
   169|  });
   170|}
   171|
   172|/**
   173| * Log token revocation
   174| */
   175|export async function logTokenRevocation(
   176|  userId: string,
   177|  metadata: {
   178|    ipAddress?: string;
   179|    reason?: string;
   180|  } = {},
   181|): Promise<SecurityEvent> {
   182|  return logSecurityEvent({
   183|    action: SecurityEventType.TOKEN_REVOKED,
   184|    userId,
   185|    ipAddress: metadata.ipAddress,
   186|    details: metadata.reason ? { reason: metadata.reason } : undefined,
   187|  });
   188|}
   189|
   190|/**
   191| * Log password change
   192| */
   193|export async function logPasswordChange(
   194|  userId: string,
   195|  metadata: {
   196|    ipAddress?: string;
   197|    userAgent?: string;
   198|  } = {},
   199|): Promise<SecurityEvent> {
   200|  return logSecurityEvent({
   201|    action: SecurityEventType.PASSWORD_CHANGED,
   202|    userId,
   203|    ipAddress: metadata.ipAddress,
   204|    userAgent: metadata.userAgent,
   205|  });
   206|}
   207|
   208|/**
   209| * Log CSRF validation failure
   210| */
   211|export async function logCSRFValidationFailed(
   212|  ipAddress: string,
   213|  metadata: {
   214|    userAgent?: string;
   215|    endpoint?: string;
   216|  } = {},
   217|): Promise<SecurityEvent> {
   218|  return logSecurityEvent({
   219|    action: SecurityEventType.CSRF_VALIDATION_FAILED,
   220|    ipAddress,
   221|    userAgent: metadata.userAgent,
   222|    success: false,
   223|    failureReason: 'Invalid or missing CSRF token',
   224|    details: metadata.endpoint ? { endpoint: metadata.endpoint } : undefined,
   225|  });
   226|}
   227|
   228|/**
   229| * Log rate limit exceeded
   230| */
   231|export async function logRateLimitExceeded(
   232|  ipAddress: string,
   233|  endpoint: string,
   234|  metadata: {
   235|    userAgent?: string;
   236|    userId?: string;
   237|  } = {},
   238|): Promise<SecurityEvent> {
   239|  return logSecurityEvent({
   240|    action: SecurityEventType.RATE_LIMIT_EXCEEDED,
   241|    ipAddress,
   242|    userId: metadata.userId,
   243|    userAgent: metadata.userAgent,
   244|    success: false,
   245|    failureReason: `Rate limit exceeded for ${endpoint}`,
   246|    details: { endpoint },
   247|  });
   248|}
   249|
   250|/**
   251| * Log suspicious activity
   252| */
   253|export async function logSuspiciousActivity(
   254|  type: string,
   255|  details: Record<string, unknown>,
   256|  metadata: {
   257|    userId?: string;
   258|    ipAddress?: string;
   259|    userAgent?: string;
   260|  } = {},
   261|): Promise<SecurityEvent> {
   262|  return logSecurityEvent({
   263|    action: type,
   264|    userId: metadata.userId,
   265|    ipAddress: metadata.ipAddress,
   266|    userAgent: metadata.userAgent,
   267|    success: false,
   268|    details,
   269|  });
   270|}
   271|
   272|/**
   273| * Get failed login attempts count for an email
   274| */
   275|export async function getFailedLoginCount(
   276|  email: string,
   277|  since: Date = new Date(Date.now() - 15 * 60 * 1000), // Default: 15 minutes
   278|): Promise<number> {
   279|  const result = await db('audit_log')
   280|    .where('email', email)
   281|    .where('action', SecurityEventType.LOGIN_FAILED)
   282|    .where('created_at', '>=', since)
   283|    .count('* as count')
   284|    .first();
   285|
   286|  return Number(result?.count || 0);
   287|}
   288|
   289|/**
   290| * Get failed login attempts for an IP address
   291| */
   292|export async function getFailedLoginCountByIP(
   293|  ipAddress: string,
   294|  since: Date = new Date(Date.now() - 15 * 60 * 1000),
   295|): Promise<number> {
   296|  const result = await db('audit_log')
   297|    .where('ip_address', ipAddress)
   298|    .whereIn('action', [SecurityEventType.LOGIN_FAILED, SecurityEventType.LOGIN_ATTEMPT])
   299|    .where('success', false)
   300|    .where('created_at', '>=', since)
   301|    .count('* as count')
   302|    .first();
   303|
   304|  return Number(result?.count || 0);
   305|}
   306|
   307|/**
   308| * Get security events for a user
   309| */
   310|export async function getEventsByUser(
   311|  userId: string,
   312|  options: {
   313|    limit?: number;
   314|    offset?: number;
   315|    actionTypes?: string[];
   316|  } = {},
   317|): Promise<SecurityEvent[]> {
   318|  const { limit = 50, offset = 0, actionTypes } = options;
   319|
   320|  let query = db<SecurityEvent>('audit_log')
   321|    .where('user_id', userId)
   322|    .orderBy('created_at', 'desc')
   323|    .limit(limit)
   324|    .offset(offset);
   325|
   326|  if (actionTypes && actionTypes.length > 0) {
   327|    query = query.whereIn('action', actionTypes);
   328|  }
   329|
   330|  return query;
   331|}
   332|
   333|/**
   334| * Get recent security events (admin)
   335| */
   336|export async function getRecentEvents(
   337|  options: {
   338|    limit?: number;
   339|    offset?: number;
   340|    actionTypes?: string[];
   341|    userId?: string;
   342|    ipAddress?: string;
   343|    email?: string;
   344|    from?: Date;
   345|    to?: Date;
   346|  } = {},
   347|): Promise<SecurityEvent[]> {
   348|  const { limit = 50, offset = 0, actionTypes, userId, ipAddress, email, from, to } = options;
   349|
   350|  let query = db<SecurityEvent>('audit_log')
   351|    .orderBy('created_at', 'desc')
   352|    .limit(limit)
   353|    .offset(offset);
   354|
   355|  if (actionTypes && actionTypes.length > 0) {
   356|    query = query.whereIn('action', actionTypes);
   357|  }
   358|
   359|  if (userId) {
   360|    query = query.where('user_id', userId);
   361|  }
   362|
   363|  if (ipAddress) {
   364|    query = query.where('ip_address', ipAddress);
   365|  }
   366|
   367|  if (email) {
   368|    query = query.where('email', email);
   369|  }
   370|
   371|  if (from) {
   372|    query = query.where('created_at', '>=', from);
   373|  }
   374|
   375|  if (to) {
   376|    query = query.where('created_at', '<=', to);
   377|  }
   378|
   379|  return query;
   380|}
   381|
   382|/**
   383| * Get security statistics
   384| */
   385|export async function getSecurityStats(
   386|  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
   387|): Promise<SecurityStats> {
   388|  const events = await db('audit_log').where('created_at', '>=', since).select('action', 'success');
   389|
   390|  const stats: SecurityStats = {
   391|    totalEvents: events.length,
   392|    failedLogins: 0,
   393|    successfulLogins: 0,
   394|    tokenRefreshes: 0,
   395|    rateLimitBreaches: 0,
   396|    suspiciousActivities: 0,
   397|  };
   398|
   399|  for (const event of events) {
   400|    switch (event.action) {
   401|      case SecurityEventType.LOGIN_FAILED:
   402|        stats.failedLogins++;
   403|        break;
   404|      case SecurityEventType.LOGIN_SUCCESS:
   405|        stats.successfulLogins++;
   406|        break;
   407|      case SecurityEventType.TOKEN_REFRESH:
   408|        stats.tokenRefreshes++;
   409|        break;
   410|      case SecurityEventType.RATE_LIMIT_EXCEEDED:
   411|        stats.rateLimitBreaches++;
   412|        break;
   413|      case SecurityEventType.SUSPICIOUS_LOGIN_PATTERN:
   414|      case SecurityEventType.BRUTE_FORCE_DETECTED:
   415|        stats.suspiciousActivities++;
   416|        break;
   417|    }
     default:
       break;
   418|  }
   419|
   420|  return stats;
   421|}
   422|
   423|/**
   424| * Get event counts by type
   425| */
   426|export async function getEventCountsByType(
   427|  since: Date = new Date(Date.now() - 24 * 60 * 60 * 1000),
   428|): Promise<Record<string, number>> {
   429|  const results = await db('audit_log')
   430|    .where('created_at', '>=', since)
   431|    .select('action')
   432|    .count('* as count')
   433|    .groupBy('action');
   434|
   435|  const counts: Record<string, number> = {};
   436|  for (const row of results) {
   437|    counts[row.action] = Number(row.count);
   438|  }
   439|
   440|  return counts;
   441|}
   442|
   443|/**
   444| * Clean up old security events
   445| */
   446|export async function cleanupOldEvents(daysOld: number = 90): Promise<number> {
   447|  const cutoffDate = new Date();
   448|  cutoffDate.setDate(cutoffDate.getDate() - daysOld);
   449|
   450|  return db('audit_log').where('created_at', '<', cutoffDate).delete();
   451|}
   452|
   453|// Export service object for convenience
   454|export const SecurityLoggingService = {
   455|  logSecurityEvent,
   456|  logLoginAttempt,
   457|  logLogout,
   458|  logTokenRefresh,
   459|  logTokenRevocation,
   460|  logPasswordChange,
   461|  logCSRFValidationFailed,
   462|  logRateLimitExceeded,
   463|  logSuspiciousActivity,
   464|  getFailedLoginCount,
   465|  getFailedLoginCountByIP,
   466|  getEventsByUser,
   467|  getRecentEvents,
   468|  getSecurityStats,
   469|  getEventCountsByType,
   470|  cleanupOldEvents,
   471|};
   472|
   473|export default SecurityLoggingService;
   474|