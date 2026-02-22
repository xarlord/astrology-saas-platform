/**
 * API Response Schemas
 * Complete TypeScript interfaces for all API endpoints
 *
 * This file defines the contract between frontend and backend
 * All API responses follow the standard ApiResponse wrapper
 */

// ============================================================================
// BASE API TYPES
// ============================================================================

export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface ApiError {
  success: false;
  error: string;
  message?: string;
  statusCode: number;
}

export interface PaginationParams {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ============================================================================
// AUTHENTICATION TYPES
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

// ============================================================================
// USER TYPES
// ============================================================================

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  role: 'user' | 'admin';
  subscriptionTier: 'free' | 'pro' | 'lifetime';
  subscriptionExpiresAt?: string;
  createdAt: string;
  updatedAt: string;
  settings?: UserSettings;
  preferences?: UserPreferences;
}

export interface UserSettings {
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: '12h' | '24h';
  notifications: NotificationSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  dailyDigest: boolean;
  transitAlerts: boolean;
  lunarReturns: boolean;
  solarReturns: boolean;
}

export interface UserPreferences {
  defaultChartType: 'natal' | 'draconic' | 'harmonic';
  defaultOrb: number;
  defaultHouseSystem: 'placidus' | 'koch' | 'porphyry' | 'equal' | 'whole-sign';
  showAspects: boolean;
  showMidpoints: boolean;
  theme: 'light' | 'dark' | 'system';
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
  settings?: Partial<UserSettings>;
  preferences?: Partial<UserPreferences>;
}

// ============================================================================
// CHART TYPES
// ============================================================================

export interface BirthData {
  name: string;
  birthDate: string; // ISO 8601 date string
  birthTime: string; // HH:MM format
  birthPlace: string;
  latitude: number;
  longitude: number;
  timezone: string;
}

export interface Chart {
  id: string;
  userId: string;
  name: string;
  type: 'natal' | 'draconic' | 'harmonic' | 'composite' | 'synastry';
  birthData: BirthData;
  createdAt: string;
  updatedAt: string;
  isDefault: boolean;
  notes?: string;
}

export interface CreateChartRequest {
  name: string;
  type: Chart['type'];
  birthData: BirthData;
  isDefault?: boolean;
  notes?: string;
}

export interface UpdateChartRequest {
  name?: string;
  isDefault?: boolean;
  notes?: string;
}

export interface CalculatedChart {
  chart: Chart;
  positions: PlanetPosition[];
  aspects: Aspect[];
  houses: House[];
  angles: ChartAngles;
  patterns: AspectPattern[];
}

export interface PlanetPosition {
  planet: string;
  sign: string;
  degree: number;
  minute: number;
  second: number;
  house: number;
  retrograde: boolean;
  element: 'fire' | 'earth' | 'air' | 'water';
  quality: 'cardinal' | 'fixed' | 'mutable';
}

export interface Aspect {
  id: string;
  planets: [string, string];
  type: 'conjunction' | 'opposition' | 'trine' | 'square' | 'sextile' | 'quincunx' | 'semisextile' | 'sesquisquare';
  degree: number;
  minute: number;
  orb: number;
  applying: boolean;
  dignities: DignityScore;
}

export interface DignityScore {
  rulership: number;
  exaltation: number;
  detriment: number;
  fall: number;
  triplicity: number;
  terms: number;
  face: number;
}

export interface House {
  number: number;
  sign: string;
  cuspDegree: number;
  cuspMinute: number;
  planets: string[];
}

export interface ChartAngles {
  ascendant: ZodiacPosition;
  midheaven: ZodiacPosition;
  descendant: ZodiacPosition;
  ic: ZodiacPosition;
}

export interface ZodiacPosition {
  sign: string;
  degree: number;
  minute: number;
  second: number;
  exactDegree: number;
}

export interface AspectPattern {
  type: 'grand-trine' | 'grand-cross' | 'tsquare' | 'ystod' | 'kite' | 'mystic-rectangle';
  planets: string[];
  aspects: string[];
  strength: number;
}

// ============================================================================
// ANALYSIS TYPES
// ============================================================================

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

export interface TransitInterpretation {
  transitId: string;
  userId: string;
  chartId: string;
  startDate: string;
  endDate: string;
  theme: TransitTheme;
  influence: TransitInfluence;
  opportunities: string[];
  challenges: string[];
  recommendations: string[];
}

export interface TransitTheme {
  primary: string;
  secondary: string[];
}

export interface TransitInfluence {
  overall: 'positive' | 'neutral' | 'challenging';
  intensity: 'low' | 'moderate' | 'high';
  duration: string;
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

// ============================================================================
// TRANSIT TYPES
// ============================================================================

export interface TransitRequest {
  chartId: string;
  startDate: string;
  endDate: string;
}

export interface TransitResponse {
  chartId: string;
  period: {
    start: string;
    end: string;
  };
  dailyTransits: DailyTransit[];
  majorTransits: MajorTransit[];
  lunarPhases: LunarPhase[];
}

export interface DailyTransit {
  date: string;
  aspects: TransitAspect[];
  mood: TransitMood;
  keyEvents: string[];
}

export interface TransitAspect {
  transitPlanet: string;
  natalPlanet: string;
  type: Aspect['type'];
  degree: number;
  orb: number;
  applying: boolean;
  peakDate: string;
  influence: 'positive' | 'neutral' | 'challenging';
}

export interface TransitMood {
  overall: string;
  energy: 'low' | 'moderate' | 'high';
  focus: string[];
}

export interface MajorTransit {
  planet: string;
  type: string;
  startDate: string;
  endDate: string;
  peakDate: string;
  aspects: TransitAspect[];
  significance: 'minor' | 'moderate' | 'major';
  description: string;
}

export interface LunarPhase {
  date: string;
  phase: 'new-moon' | 'waxing-crescent' | 'first-quarter' | 'waxing-gibbous' | 'full-moon' | 'waning-gibbous' | 'last-quarter' | 'waning-crescent';
  sign: string;
  degree: number;
  influence: string;
}

export interface TransitForecastRequest {
  chartId: string;
  duration: number; // days
}

// ============================================================================
// CALENDAR TYPES
// ============================================================================

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

export interface PlanetaryIngress {
  date: string;
  planet: string;
  sign: string;
  degree: number;
  influence: string;
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

// ============================================================================
// SYNASTRY TYPES
// ============================================================================

export interface SynastryRequest {
  chart1Id: string;
  chart2Id: string;
}

export interface SynastryResponse {
  id: string;
  chart1: Chart;
  chart2: Chart;
  compositeChart: CalculatedChart;
  synastryAspects: SynastryAspect[];
  compatibilityAnalysis: CompatibilityAnalysis;
  relationshipDynamics: RelationshipDynamic[];
  strengths: string[];
  challenges: string[];
  recommendations: string[];
  generatedAt: string;
}

export interface SynastryAspect {
  planet1: {
    planet: string;
    chart: '1' | '2';
  };
  planet2: {
    planet: string;
    chart: '1' | '2';
  };
  type: Aspect['type'];
  degree: number;
  orb: number;
  influence: 'harmonious' | 'tense' | 'neutral';
  significance: 'minor' | 'moderate' | 'major';
  interpretation: string;
}

export interface CompatibilityAnalysis {
  overallScore: number;
  romanticScore: number;
  communicationScore: number;
  emotionalScore: number;
  valuesScore: number;
  longTermPotential: number;
  keyFactors: string[];
}

export interface RelationshipDynamic {
  category: string;
  description: string;
  positiveIndicators: string[];
  challengingIndicators: string[];
  advice: string;
}

// ============================================================================
// SOLAR RETURN TYPES
// ============================================================================

export interface SolarReturnRequest {
  chartId: string;
  year: number;
  location?: {
    latitude: number;
    longitude: number;
    placeName: string;
  };
}

export interface SolarReturnResponse {
  id: string;
  chartId: string;
  year: number;
  returnDate: string;
  location: SolarReturnRequest['location'];
  solarReturnChart: CalculatedChart;
  analysis: SolarReturnAnalysis;
  themes: string[];
  keyDates: SolarReturnKeyDate[];
  createdAt: string;
}

export interface SolarReturnAnalysis {
  overview: string;
  dominantThemes: string[];
  houseEmphasis: number[];
  majorAspects: Aspect[];
  recommendations: string[];
}

export interface SolarReturnKeyDate {
  date: string;
  event: string;
  significance: string;
  activatedHouses: number[];
}

// ============================================================================
// LUNAR RETURN TYPES
// ============================================================================

export interface LunarReturnRequest {
  chartId: string;
  date: string;
  location?: {
    latitude: number;
    longitude: number;
    placeName: string;
  };
}

export interface LunarReturnResponse {
  id: string;
  chartId: string;
  returnDate: string;
  location: LunarReturnRequest['location'];
  lunarReturnChart: CalculatedChart;
  analysis: LunarReturnAnalysis;
  emotionalThemes: string[];
  createdAt: string;
}

export interface LunarReturnAnalysis {
  emotionalOverview: string;
  moodThemes: string[];
  focusAreas: string[];
  houseEmphasis: number[];
  aspects: Aspect[];
  recommendations: string[];
}

// ============================================================================
// REPORT GENERATION TYPES
// ============================================================================

export interface ReportRequest {
  type: 'personality' | 'transit' | 'synastry' | 'solar-return' | 'lunar-return';
  chartId?: string;
  chart2Id?: string; // for synastry
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

// ============================================================================
// LEARNING CENTER TYPES
// ============================================================================

export interface Course {
  id: string;
  title: string;
  description: string;
  category: 'basics' | 'planets' | 'signs' | 'houses' | 'aspects' | 'transits' | 'advanced';
  level: 'beginner' | 'intermediate' | 'advanced';
  duration: number; // total minutes
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
  duration: number; // minutes
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
  content: string; // markdown or HTML
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

// ============================================================================
// LOCATION/GEOCODING TYPES
// ============================================================================

export interface GeocodeRequest {
  query: string;
  limit?: number;
}

export interface GeocodeResult {
  id: string;
  name: string;
  country: string;
  admin1?: string; // state/region
  admin2?: string; // county
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

// ============================================================================
// NOTIFICATION TYPES
// ============================================================================

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

// ============================================================================
// PUSH NOTIFICATION TYPES
// ============================================================================

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

// ============================================================================
// AI INTERPRETATION TYPES (Future Feature)
// ============================================================================

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

// ============================================================================
// HEALTH CHECK TYPES
// ============================================================================

export interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  version: string;
  uptime: number;
  timestamp: string;
  services: ServiceHealth[];
}

export interface ServiceHealth {
  name: string;
  status: 'up' | 'down' | 'degraded';
  latency?: number;
  message?: string;
}

// ============================================================================
// ERROR RESPONSE TYPES
// ============================================================================

export interface ValidationError {
  field: string;
  message: string;
  value?: unknown;
}

export interface ErrorResponse {
  success: false;
  error: string;
  message: string;
  statusCode: number;
  validationErrors?: ValidationError[];
  stack?: string; // Only in development
}
