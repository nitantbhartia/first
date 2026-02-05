// =============================================================================
// Deep Personality Assessment Platform — TypeScript Type Definitions
// =============================================================================

// -----------------------------------------------------------------------------
// Instrument Identifiers
// -----------------------------------------------------------------------------

/** All supported assessment instrument codes. */
export type InstrumentId =
  | "BFI2"      // Big Five Inventory-2
  | "ECR_R"     // Experiences in Close Relationships–Revised (Attachment)
  | "PHQ9"      // Patient Health Questionnaire-9 (Depression)
  | "GAD7"      // Generalized Anxiety Disorder-7
  | "ASRS"      // Adult ADHD Self-Report Scale
  | "ACE"       // Adverse Childhood Experiences
  | "PSS10"     // Perceived Stress Scale-10
  | "PC_PTSD5"  // Primary Care PTSD Screen for DSM-5
  | "AQ10"      // Autism-Spectrum Quotient (10-item)
  | "CSI16"     // Couples Satisfaction Index-16
  | "DERS_SF"   // Difficulties in Emotion Regulation Scale–Short Form
  | "PVQ";      // Portrait Values Questionnaire

/** Human-readable display names for each instrument. */
export type InstrumentDisplayName =
  | "Big Five Inventory-2"
  | "Experiences in Close Relationships–Revised"
  | "Patient Health Questionnaire-9"
  | "Generalized Anxiety Disorder-7"
  | "Adult ADHD Self-Report Scale"
  | "Adverse Childhood Experiences"
  | "Perceived Stress Scale-10"
  | "Primary Care PTSD Screen for DSM-5"
  | "Autism-Spectrum Quotient"
  | "Couples Satisfaction Index-16"
  | "Difficulties in Emotion Regulation Scale–Short Form"
  | "Portrait Values Questionnaire";

/** Broad domain each instrument belongs to. */
export type InstrumentDomain =
  | "personality"
  | "attachment"
  | "clinical"
  | "developmental"
  | "relational"
  | "regulation"
  | "values";

// -----------------------------------------------------------------------------
// Question & Answer Types
// -----------------------------------------------------------------------------

/** The family of response scale used by a question. */
export type LikertScaleType =
  | "likert_1_5"   // e.g. BFI-2: 1 Disagree strongly … 5 Agree strongly
  | "likert_0_3"   // e.g. PHQ-9, GAD-7: 0 Not at all … 3 Nearly every day
  | "likert_0_4"   // e.g. ASRS: 0 Never … 4 Very often
  | "likert_1_7"   // e.g. ECR-R, CSI-16 (some items): 1 … 7
  | "binary_0_1";  // e.g. ACE, PC-PTSD-5, AQ-10: yes/no

export type QuestionType = LikertScaleType;

/** A single anchor label on a response scale. */
export interface ScaleAnchor {
  /** Numeric value stored when this anchor is selected. */
  value: number;
  /** User-facing label (e.g. "Not at all", "Nearly every day"). */
  label: string;
}

/** Full description of a response scale. */
export interface ResponseScale {
  type: QuestionType;
  /** Inclusive minimum value. */
  min: number;
  /** Inclusive maximum value. */
  max: number;
  /** Ordered anchors from min to max. */
  anchors: ScaleAnchor[];
}

/** A single assessment question / item. */
export interface AssessmentQuestion {
  /** Globally unique item identifier, e.g. "BFI2_01", "PHQ9_03". */
  id: string;
  /** The instrument this item belongs to. */
  instrumentId: InstrumentId;
  /** 1-based position within the instrument. */
  itemNumber: number;
  /** The question / statement text shown to the respondent. */
  text: string;
  /** Which response scale to display. */
  responseScale: ResponseScale;
  /** Whether this item is reverse-scored. */
  isReversed: boolean;
  /** Facet or subscale this item contributes to (instrument-specific). */
  facetKey: string;
  /** Optional section grouping within the instrument. */
  sectionKey?: string;
}

/** A named section within an instrument (e.g. for visual grouping). */
export interface AssessmentSection {
  /** Machine key, unique within the instrument. */
  key: string;
  /** Display title (e.g. "Over the last 2 weeks…"). */
  title: string;
  /** Optional introductory text or instructions. */
  description?: string;
  /** Ordered question IDs that belong to this section. */
  questionIds: string[];
}

/** Full metadata and items for one assessment instrument. */
export interface AssessmentInstrument {
  id: InstrumentId;
  /** Short code shown in the UI (e.g. "PHQ-9"). */
  shortName: string;
  displayName: InstrumentDisplayName;
  domain: InstrumentDomain;
  /** Brief explanation of what this instrument measures. */
  description: string;
  /** Citation / reference for the instrument. */
  citation?: string;
  /** Estimated completion time in minutes. */
  estimatedMinutes: number;
  /** Total number of items. */
  itemCount: number;
  /** Default response scale (items may override individually). */
  defaultResponseScale: ResponseScale;
  /** Ordered sections (if the instrument uses them). */
  sections: AssessmentSection[];
  /** All items, in presentation order. */
  questions: AssessmentQuestion[];
}

// -----------------------------------------------------------------------------
// Answer / Response Types
// -----------------------------------------------------------------------------

/** A single recorded answer to one item. */
export interface QuestionAnswer {
  questionId: string;
  /** Raw value selected by the respondent (before any reverse-scoring). */
  rawValue: number;
  /** Timestamp when the answer was recorded or last changed. */
  answeredAt: string; // ISO-8601
}

/** The current progress through one instrument. */
export interface InstrumentProgress {
  instrumentId: InstrumentId;
  /** Number of questions answered so far. */
  answeredCount: number;
  /** Total questions in the instrument. */
  totalCount: number;
  /** True when answeredCount === totalCount. */
  isComplete: boolean;
}

/** All answers and metadata for a single assessment session. */
export interface AssessmentSession {
  /** Unique session identifier (UUID). */
  sessionId: string;
  userId: string;
  /** Which instruments are included in this session. */
  instrumentIds: InstrumentId[];
  /** Map from questionId to the respondent's answer. */
  answers: Record<string, QuestionAnswer>;
  /** Per-instrument completion status. */
  progress: InstrumentProgress[];
  /** Overall session status. */
  status: AssessmentSessionStatus;
  startedAt: string;   // ISO-8601
  updatedAt: string;   // ISO-8601
  completedAt?: string; // ISO-8601
}

export type AssessmentSessionStatus =
  | "not_started"
  | "in_progress"
  | "completed"
  | "expired"
  | "abandoned";

// -----------------------------------------------------------------------------
// Scoring Types
// -----------------------------------------------------------------------------

/** Severity / classification bucket produced by a screening instrument. */
export type SeverityLevel =
  | "none"
  | "minimal"
  | "mild"
  | "moderate"
  | "moderately_severe"
  | "severe"
  | "very_severe"
  | "positive"   // binary screeners (PC-PTSD-5, ACE threshold, AQ-10)
  | "negative";

/** Raw and derived score for a single facet or subscale. */
export interface FacetScore {
  /** Facet key matching AssessmentQuestion.facetKey. */
  facetKey: string;
  /** Human-readable facet name (e.g. "Extraversion", "Anxiety", "Avoidance"). */
  facetLabel: string;
  /** Sum or mean of scored item values for this facet. */
  rawScore: number;
  /** Score expressed as a percentage of the theoretical max (0–100). */
  percentScore: number;
  /** Number of items that contribute to this facet. */
  itemCount: number;
  /** Optional severity classification. */
  severity?: SeverityLevel;
  /** Optional population percentile (0–100). */
  percentile?: number;
}

/** Scoring result for one complete instrument. */
export interface InstrumentScore {
  instrumentId: InstrumentId;
  /** Total raw score (sum of scored items). */
  totalRawScore: number;
  /** Theoretical minimum total. */
  possibleMin: number;
  /** Theoretical maximum total. */
  possibleMax: number;
  /** Overall severity (for clinical screeners). */
  severity?: SeverityLevel;
  /** Optional overall percentile. */
  percentile?: number;
  /** Per-facet breakdown. */
  facetScores: FacetScore[];
  /** Timestamp when scoring was computed. */
  scoredAt: string; // ISO-8601
}

/** Aggregated scores across all instruments in a session. */
export interface AssessmentScoreSet {
  sessionId: string;
  userId: string;
  /** One entry per completed instrument. */
  instrumentScores: InstrumentScore[];
  /** When the full score set was computed. */
  computedAt: string; // ISO-8601
}

// -----------------------------------------------------------------------------
// BFI-2 Specific Facet Types
// -----------------------------------------------------------------------------

/** The five broad domains of the Big Five. */
export type BigFiveDomain =
  | "extraversion"
  | "agreeableness"
  | "conscientiousness"
  | "negative_emotionality"
  | "open_mindedness";

/** The fifteen narrow facets of the BFI-2 (three per domain). */
export type BigFiveFacet =
  | "sociability"
  | "assertiveness"
  | "energy_level"
  | "compassion"
  | "respectfulness"
  | "trust"
  | "organization"
  | "productiveness"
  | "responsibility"
  | "anxiety"
  | "depression"
  | "emotional_volatility"
  | "intellectual_curiosity"
  | "aesthetic_sensitivity"
  | "creative_imagination";

/** A scored BFI-2 domain with its three nested facet scores. */
export interface BigFiveDomainScore {
  domain: BigFiveDomain;
  domainLabel: string;
  /** Mean score across all 12 domain items (1.00 – 5.00). */
  meanScore: number;
  /** Per-facet means (1.00 – 5.00 each, 4 items per facet). */
  facets: {
    facet: BigFiveFacet;
    facetLabel: string;
    meanScore: number;
  }[];
}

// -----------------------------------------------------------------------------
// ECR-R Specific Types
// -----------------------------------------------------------------------------

export type AttachmentDimension = "anxiety" | "avoidance";

export type AttachmentStyle =
  | "secure"
  | "anxious_preoccupied"
  | "dismissive_avoidant"
  | "fearful_avoidant";

export interface AttachmentScore {
  anxietyMean: number;      // mean of anxiety subscale items (1–7)
  avoidanceMean: number;    // mean of avoidance subscale items (1–7)
  style: AttachmentStyle;
}

// -----------------------------------------------------------------------------
// PVQ (Schwartz Values) Specific Types
// -----------------------------------------------------------------------------

export type SchwartzValue =
  | "self_direction"
  | "stimulation"
  | "hedonism"
  | "achievement"
  | "power"
  | "security"
  | "conformity"
  | "tradition"
  | "benevolence"
  | "universalism";

export interface ValueScore {
  value: SchwartzValue;
  label: string;
  /** Centred mean score (ipsatised). */
  centredMean: number;
  /** Raw mean before centring. */
  rawMean: number;
}

// -----------------------------------------------------------------------------
// DERS-SF Specific Types
// -----------------------------------------------------------------------------

export type DersFacet =
  | "awareness"
  | "clarity"
  | "goals"
  | "impulse"
  | "nonacceptance"
  | "strategies";

// -----------------------------------------------------------------------------
// Report Types
// -----------------------------------------------------------------------------

/** Tier that determines how much detail the user can see. */
export type ReportTier = "free" | "standard" | "premium";

/** Categories used to organise narrative report sections. */
export type ReportSectionCategory =
  | "summary"
  | "personality"
  | "attachment"
  | "clinical_screening"
  | "emotion_regulation"
  | "values"
  | "relationships"
  | "developmental"
  | "cross_cutting"
  | "recommendations";

/** A single section within a generated report. */
export interface ReportSection {
  /** Unique key for this section. */
  key: string;
  /** Display title. */
  title: string;
  category: ReportSectionCategory;
  /** Markdown-formatted narrative body. */
  body: string;
  /** Minimum tier required to view this section. */
  minimumTier: ReportTier;
  /** Instruments whose scores informed this section. */
  sourceInstruments: InstrumentId[];
  /** Position within the report (lower = earlier). */
  sortOrder: number;
}

/** A fully assembled report for one assessment session. */
export interface AssessmentReport {
  /** Unique report identifier. */
  reportId: string;
  sessionId: string;
  userId: string;
  /** Tier the user has access to (determines visible sections). */
  tier: ReportTier;
  /** Ordered sections of the report. */
  sections: ReportSection[];
  /** The score set used to generate this report. */
  scores: AssessmentScoreSet;
  /** Whether the AI narrative has been generated. */
  generationStatus: ReportGenerationStatus;
  /** Version number (reports may be re-generated). */
  version: number;
  createdAt: string;  // ISO-8601
  updatedAt: string;  // ISO-8601
}

export type ReportGenerationStatus =
  | "pending"
  | "generating"
  | "completed"
  | "failed";

// -----------------------------------------------------------------------------
// User Types
// -----------------------------------------------------------------------------

export type AuthProvider = "email" | "google" | "apple" | "anonymous";

export interface UserProfile {
  userId: string;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  authProvider: AuthProvider;
  /** Current subscription / report tier. */
  tier: ReportTier;
  /** Demographic info optionally collected for norming. */
  demographics?: UserDemographics;
  createdAt: string;  // ISO-8601
  updatedAt: string;  // ISO-8601
}

export interface UserDemographics {
  ageRange?: AgeRange;
  gender?: Gender;
  countryCode?: string; // ISO-3166-1 alpha-2
}

export type AgeRange =
  | "18_24"
  | "25_34"
  | "35_44"
  | "45_54"
  | "55_64"
  | "65_plus";

export type Gender =
  | "male"
  | "female"
  | "non_binary"
  | "other"
  | "prefer_not_to_say";

/** Lightweight user reference used in shared contexts. */
export interface UserSummary {
  userId: string;
  displayName?: string;
  avatarUrl?: string;
}

// -----------------------------------------------------------------------------
// Comparison Types
// -----------------------------------------------------------------------------

/** Comparison between two users' scores on a single instrument. */
export interface InstrumentComparison {
  instrumentId: InstrumentId;
  userAScore: InstrumentScore;
  userBScore: InstrumentScore;
  /** Per-facet deltas (A − B). */
  facetDeltas: FacetDelta[];
}

export interface FacetDelta {
  facetKey: string;
  facetLabel: string;
  /** Signed difference: userA.rawScore − userB.rawScore. */
  rawDelta: number;
  /** Signed difference of percent scores. */
  percentDelta: number;
  /** Qualitative interpretation of the gap. */
  interpretation: DeltaInterpretation;
}

export type DeltaInterpretation =
  | "very_similar"
  | "somewhat_similar"
  | "moderate_difference"
  | "large_difference"
  | "very_large_difference";

/** Full comparison payload between two users across all shared instruments. */
export interface ComparisonResult {
  comparisonId: string;
  userA: UserSummary;
  userB: UserSummary;
  /** Only instruments both users have completed are compared. */
  instrumentComparisons: InstrumentComparison[];
  /** AI-generated narrative about the pair's dynamic. */
  narrativeSummary?: string;
  /** Compatibility / similarity score (0–100), if applicable. */
  overallSimilarityScore?: number;
  createdAt: string; // ISO-8601
}

// -----------------------------------------------------------------------------
// Share Code Types
// -----------------------------------------------------------------------------

/** A share code that allows one user to invite another to compare results. */
export interface ShareCode {
  /** The short alphanumeric code (e.g. "ABCD-1234"). */
  code: string;
  /** User who created the share code. */
  ownerUserId: string;
  /** Session whose results are being shared. */
  sessionId: string;
  /** Which instruments the owner consents to share. */
  sharedInstrumentIds: InstrumentId[];
  /** Maximum number of times this code can be redeemed. */
  maxRedemptions: number;
  /** How many times the code has been redeemed so far. */
  redemptionCount: number;
  status: ShareCodeStatus;
  /** When the code expires, if ever. */
  expiresAt?: string; // ISO-8601
  createdAt: string;  // ISO-8601
}

export type ShareCodeStatus =
  | "active"
  | "expired"
  | "revoked"
  | "fully_redeemed";

/** Record of a single share code redemption. */
export interface ShareCodeRedemption {
  redemptionId: string;
  code: string;
  /** User who redeemed (the "invitee"). */
  redeemerUserId: string;
  /** Comparison generated as a result. */
  comparisonId: string;
  redeemedAt: string; // ISO-8601
}

/** Request payload for creating a new share code. */
export interface CreateShareCodeRequest {
  sessionId: string;
  sharedInstrumentIds: InstrumentId[];
  maxRedemptions?: number; // defaults to 1
  /** Duration in hours before the code expires (omit for no expiry). */
  expiresInHours?: number;
}

/** Request payload for redeeming an existing share code. */
export interface RedeemShareCodeRequest {
  code: string;
  /** The redeemer's completed session to compare against. */
  redeemerSessionId: string;
}

// -----------------------------------------------------------------------------
// Reverse Scoring Helper Types
// -----------------------------------------------------------------------------

/** Configuration for reverse-scoring a single item. */
export interface ReverseScoringRule {
  questionId: string;
  /** The minimum value on the item's scale. */
  scaleMin: number;
  /** The maximum value on the item's scale. */
  scaleMax: number;
}

/**
 * Compute a reverse-scored value.
 * reversed = scaleMin + scaleMax − rawValue
 */
export type ReverseScoredValue = number;

// -----------------------------------------------------------------------------
// Scoring Configuration Types
// -----------------------------------------------------------------------------

/** How facet scores are aggregated from items. */
export type AggregationMethod = "sum" | "mean";

/** Threshold rule that maps a score range to a severity level. */
export interface SeverityThreshold {
  /** Inclusive lower bound. */
  min: number;
  /** Inclusive upper bound. */
  max: number;
  severity: SeverityLevel;
  label: string;
}

/** Complete scoring configuration for one instrument. */
export interface ScoringConfig {
  instrumentId: InstrumentId;
  aggregationMethod: AggregationMethod;
  /** Items that need to be reverse-scored. */
  reverseScoredItems: ReverseScoringRule[];
  /** Mapping from facetKey to the item IDs contributing to that facet. */
  facetItemMap: Record<string, string[]>;
  /** Severity thresholds applied to the total score (if applicable). */
  severityThresholds?: SeverityThreshold[];
  /** Per-facet severity thresholds (if applicable). */
  facetSeverityThresholds?: Record<string, SeverityThreshold[]>;
}

// -----------------------------------------------------------------------------
// API / Transport Utility Types
// -----------------------------------------------------------------------------

/** Standard envelope for paginated list responses. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNextPage: boolean;
}

/** Standard envelope for API error responses. */
export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

/** Discriminated union for async operation results. */
export type ApiResult<T> =
  | { success: true; data: T }
  | { success: false; error: ApiError };
