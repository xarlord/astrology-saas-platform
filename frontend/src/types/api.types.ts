/**
 * API Response Types
 * Complete TypeScript interfaces for all API endpoints
 *
 * This file re-exports types from Zod schemas and maintains backward compatibility.
 * For new code, import directly from './schemas' for both types and runtime validation.
 *
 * @example
 * // Recommended: Import from schemas for both types and validation
 * import { User, userSchema, LoginRequest, loginRequestSchema } from './schemas';
 *
 * // Legacy: Import just types (still works but no runtime validation)
 * import { User, LoginRequest } from './api.types';
 */

// ============================================================================
// RE-EXPORT FROM ZOD SCHEMAS
// ============================================================================

// Base API types
export type {
  ApiResponse,
  PaginatedResponse,
  PaginationMeta,
  ValidationError,
  ApiErrorResponse,
  SimpleErrorResponse,
  HealthCheckResponse,
  ServiceHealth,
  SuccessResponse,
  DeleteResponse,
} from './schemas/base.schema';

// Auth types
export type {
  User,
  UserSettings,
  UserPreferences,
  NotificationSettings,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ChangePasswordRequest,
  UpdateUserRequest,
  SubscriptionTier,
  UserRole,
} from './schemas/auth.schema';

// Chart types
export type {
  Chart,
  BirthData,
  CalculatedChart,
  PlanetPosition,
  Aspect,
  House,
  HouseCusp,
  ChartAngles,
  ZodiacPosition,
  AspectPattern,
  DignityScore,
  ZodiacSign,
  Element,
  Quality,
  ChartType,
  HouseSystem,
  AspectType,
  PlanetName,
  CreateChartRequest,
  UpdateChartRequest,
  ChartResponse,
  ChartsListResponse,
} from './schemas/chart.schema';

// Transit types
export type {
  TransitRequest,
  TransitResponse,
  DailyTransit,
  MajorTransit,
  LunarPhase,
  TransitAspect,
  TransitMood,
  PlanetaryIngress,
  TransitForecastRequest,
  TransitInterpretation,
  TransitTheme,
  TransitInfluenceDetail,
  TransitSignificance,
  TransitInfluence,
  EnergyLevel,
  LunarPhaseType,
} from './schemas/transit.schema';

// Synastry types
export type {
  SynastryRequest,
  SynastryResponse,
  SynastryComparison,
  SynastryAspect,
  CompatibilityAnalysis,
  SynastryBreakdown,
  RelationshipDynamic,
  SynastryAspectInfluence,
  SynastrySignificance,
} from './schemas/synastry.schema';

// Return types
export type {
  SolarReturnRequest,
  SolarReturnResponse,
  SolarReturnAnalysis,
  SolarReturnKeyDate,
  LunarReturnRequest,
  LunarReturnResponse,
  LunarReturnAnalysis,
  ReturnLocation,
} from './schemas/returns.schema';

// ============================================================================
// LEGACY TYPES (not in schemas yet)
// These are maintained for backward compatibility
// ============================================================================

// Pagination parameters for requests
export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

// API Error type (legacy format)
export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
}

// Analysis types
export interface PersonalityAnalysis {
  userId: string;
  chartId: string;
  generatedAt: string;
  coreIdentity: PersonalitySection;
  emotionalNature: PersonalitySection;
  mentalStyle: PersonalitySection;
  relationships: PersonalitySection;
  careerDrive: PersonalitySection;
  spiritualPath: PersonalitySection;
  strengths: string[];
  challenges: string[];
  growthOpportunities: string[];
}

export interface PersonalitySection {
  title: string;
  description: string;
  keyPoints: string[];
  rulingPlanets: string[];
  associatedSigns: string[];
  associatedHouses: number[];
}

export interface AspectPatternAnalysis {
  chartId: string;
  patterns: AspectPattern[];
  dominantElement: 'fire' | 'earth' | 'air' | 'water' | 'balanced';
  dominantQuality: 'cardinal' | 'fixed' | 'mutable' | 'balanced';
  hemisphereBalance: HemisphereBalance;
  aspectConfigurationStrength: number;
}

export interface HemisphereBalance {
  eastern: number;
  western: number;
  northern: number;
  southern: number;
}

// Calendar types
export interface CalendarEvent {
  id: string;
  userId: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  allDay: boolean;
  type: 'transit' | 'lunar-phase' | 'planetary-hour' | 'aspect' | 'custom';
  significance: 'minor' | 'moderate' | 'major';
  color: string;
  metadata: Record<string, unknown>;
  reminders: Reminder[];
  createdAt: string;
  updatedAt: string;
}

export interface Reminder {
  id: string;
  minutesBefore: number;
  method: 'push' | 'email';
  enabled: boolean;
}

export interface CreateEventRequest {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  allDay?: boolean;
  type?: CalendarEvent['type'];
  significance?: CalendarEvent['significance'];
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  allDay?: boolean;
  type?: CalendarEvent['type'];
  significance?: CalendarEvent['significance'];
  color?: string;
  metadata?: Record<string, unknown>;
}

export interface CalendarViewRequest {
  year: number;
  month: number;
  chartId?: string;
}

export interface CalendarViewResponse {
  month: number;
  year: number;
  events: CalendarEvent[];
  lunarPhases: LunarPhase[];
  planetaryIngresses: PlanetaryIngress[];
}

export interface ExportCalendarRequest {
  format: 'ics' | 'json';
  startDate: string;
  endDate: string;
  includeTransits: boolean;
  includeLunarPhases: boolean;
}

export interface CalendarExportResponse {
  downloadUrl: string;
  expiresAt: string;
  format: string;
  eventCount: number;
}

// Report types
export interface ReportRequest {
  type: 'personality' | 'transit' | 'synastry' | 'solar-return' | 'lunar-return';
  chartId?: string;
  chart2Id?: string;
  startDate?: string;
  endDate?: string;
  year?: number;
  format: 'pdf' | 'json';
  includeAnalysis: boolean;
  includeCharts: boolean;
  includeAspects: boolean;
}

export interface ReportResponse {
  id: string;
  type: ReportRequest['type'];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  format: string;
  downloadUrl?: string;
  expiresAt?: string;
  error?: string;
  createdAt: string;
  completedAt?: string;
}

export interface ReportMetadata {
  reportId: string;
  type: string;
  generatedAt: string;
  dataRange: string;
  chartCount: number;
}

// Learning types
export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'planets' | 'signs' | 'houses' | 'aspects' | 'transits' | 'advanced';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  lessons: Lesson[];
  thumbnailUrl?: string;
  createdAt: string;
}

export interface Lesson {
  id: string;
  courseId?: string;
  title: string;
  description: string;
  category: 'basics' | 'planets' | 'signs' | 'houses' | 'aspects' | 'transits' | 'advanced';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number;
  order: number;
  videoUrl?: string;
  content?: LessonContent;
  prerequisites: string[];
  tags: string[];
  isPublished: boolean;
  completed?: boolean;
}

export interface LessonContent {
  sections: LessonSection[];
  quizzes: Quiz[];
  exercises: Exercise[];
}

export interface LessonSection {
  id: string;
  title: string;
  content: string;
  diagrams: string[];
  examples: string[];
}

export interface Quiz {
  id: string;
  sectionId: string;
  questions: QuizQuestion[];
  passingScore: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple-choice' | 'true-false' | 'fill-blank';
  options?: string[];
  correctAnswer: string | string[];
  explanation: string;
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  instructions: string;
  tools: string[];
}

export interface UserProgress {
  userId: string;
  lessonId?: string;
  courseId?: string;
  status: 'not-started' | 'in-progress' | 'completed';
  completedSections: string[];
  completedQuizzes: string[];
  completedExercises: string[];
  quizScores: Record<string, number>;
  currentSection: string;
  progressPercentage: number;
  lastAccessedAt: string;
  completedAt?: string;
}

export interface UpdateProgressRequest {
  lessonId: string;
  sectionId?: string;
  quizId?: string;
  exerciseId?: string;
  quizScore?: number;
  markComplete?: boolean;
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: number;
  lessons: string[];
  prerequisites: string[];
}

// Location/Geocoding types
export interface GeocodeRequest {
  query: string;
  limit?: number;
}

export interface GeocodeResult {
  id: string;
  name: string;
  country: string;
  admin1?: string;
  admin2?: string;
  latitude: number;
  longitude: number;
  timezone: string;
  population?: number;
}

export interface ReverseGeocodeRequest {
  latitude: number;
  longitude: number;
}

export interface TimezoneRequest {
  latitude: number;
  longitude: number;
  date?: string;
}

export interface TimezoneResponse {
  timezone: string;
  utcOffset: number;
  dstOffset: number;
  abbreviation: string;
}

// Notification types
export interface Notification {
  id: string;
  userId: string;
  type: 'transit' | 'event' | 'system' | 'achievement';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
  expiresAt?: string;
}

export interface NotificationPreferences {
  inApp: boolean;
  email: boolean;
  push: boolean;
  transitAlerts: boolean;
  dailyDigest: boolean;
  weeklyForecast: boolean;
}

export interface MarkNotificationsReadRequest {
  notificationIds?: string[];
  markAll?: boolean;
}

// Push notification types
export interface PushSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface RegisterPushRequest {
  subscription: PushSubscription;
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
  actions?: {
    action: string;
    title: string;
    icon?: string;
  }[];
}

// AI interpretation types
export interface AIInterpretationRequest {
  type: 'personality' | 'transit' | 'synastry' | 'aspect-pattern';
  chartId?: string;
  transitId?: string;
  synastryId?: string;
  focus?: string[];
  language?: string;
}

export interface AIInterpretationResponse {
  interpretation: string;
  confidence: number;
  sources: string[];
  tokens: number;
}

// TransitInfluence type (alias for backward compatibility)
export type { TransitInfluenceDetail as TransitInfluence } from './schemas/transit.schema';

// ErrorResponse type (alias for backward compatibility)
export type { ApiErrorResponse as ErrorResponse } from './schemas/base.schema';
