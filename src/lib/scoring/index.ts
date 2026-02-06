/**
 * Deep Personality Platform — Scoring Engine
 *
 * Pure scoring functions for each assessment instrument. Every function
 * accepts a Record<string, number> mapping questionId -> answer value
 * and returns a ScoreResult describing the clinical/interpretive result.
 *
 * Instrument definitions (item metadata, reverse-score flags, domain
 * assignments) are imported from the instrument files where available.
 * Instruments not yet defined in separate files have their scoring
 * parameters defined locally.
 */

// ---------------------------------------------------------------------------
// Imports from instrument definition files
// ---------------------------------------------------------------------------

import { BFI2_QUESTIONS } from '../instruments/bfi2';
import { ECRR_QUESTIONS } from '../instruments/ecr-r';
import { PHQ9_QUESTIONS } from '../instruments/phq9';
import { GAD7_QUESTIONS } from '../instruments/gad7';
import {
  ASRS_QUESTIONS,
  ASRS_PART_A_THRESHOLDS,
} from '../instruments/asrs';
import { ACE_QUESTIONS } from '../instruments/ace';
import { PSS10_QUESTIONS } from '../instruments/pss10';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ScoreResult {
  instrument: string;
  rawScore: number;
  maxScore: number;
  severity:
    | 'none'
    | 'minimal'
    | 'mild'
    | 'moderate'
    | 'moderate_severe'
    | 'severe'
    | 'high'
    | 'low'
    | 'positive'
    | 'negative';
  percentile?: number;
  facets?: Record<string, { score: number; maxScore: number; label: string }>;
  interpretation: string;
}

type Answers = Record<string, number>;

// ---------------------------------------------------------------------------
// Utility helpers
// ---------------------------------------------------------------------------

/**
 * Reverse-score an item on any Likert scale.
 *   reversed = scaleMin + scaleMax - value
 *
 * Examples:
 *   1-5 scale: reverseScore(2, 1, 5) => 4
 *   0-4 scale: reverseScore(1, 0, 4) => 3
 *   1-7 scale: reverseScore(3, 1, 7) => 5
 */
function reverseScore(
  value: number,
  scaleMin: number,
  scaleMax: number,
): number {
  return scaleMin + scaleMax - value;
}

/** Sum an array of numbers. */
function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

/** Arithmetic mean (returns 0 for an empty array). */
function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return sum(values) / values.length;
}

/** Round to `decimals` decimal places (default 2). */
function round(value: number, decimals: number = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

/**
 * Approximate the standard-normal CDF using the Abramowitz & Stegun
 * rational approximation (maximum error ~1.5 x 10^-7).
 * Returns a percentage 0-100.
 */
function normalCDF(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * absX);
  const poly =
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t;
  const y = 1.0 - poly * Math.exp(-(absX * absX));

  return Math.round(50 * (1.0 + sign * y));
}

/**
 * Convert a raw score to a percentile using a population mean and SD.
 * Clamped to the range 1-99.
 */
function toPercentile(
  value: number,
  popMean: number,
  popSD: number,
): number {
  const z = (value - popMean) / popSD;
  return Math.min(99, Math.max(1, normalCDF(z)));
}

/** Descriptive label for a percentile rank. */
function percentileLabel(pct: number): string {
  if (pct <= 15) return 'Low';
  if (pct <= 30) return 'Below Average';
  if (pct <= 70) return 'Average';
  if (pct <= 85) return 'Above Average';
  return 'High';
}

/** Ordinal suffix for a number (1st, 2nd, 3rd, 4th, ...). */
function ordinalSuffix(n: number): string {
  const mod100 = n % 100;
  if (mod100 >= 11 && mod100 <= 13) return 'th';
  switch (n % 10) {
    case 1:
      return 'st';
    case 2:
      return 'nd';
    case 3:
      return 'rd';
    default:
      return 'th';
  }
}

/** True if the answers map contains at least one key with the given prefix. */
function hasAnswersForPrefix(answers: Answers, prefix: string): boolean {
  return Object.keys(answers).some((key) => key.startsWith(`${prefix}_`));
}

/**
 * Collect answered values for sequential two-digit-padded IDs.
 *   prefix = "phq9", count = 9  =>  looks for phq9_01 .. phq9_09
 */
function collectValues(
  answers: Answers,
  prefix: string,
  count: number,
): number[] {
  const values: number[] = [];
  for (let i = 1; i <= count; i++) {
    const id = `${prefix}_${String(i).padStart(2, '0')}`;
    if (id in answers) {
      values.push(answers[id]);
    }
  }
  return values;
}

// ---------------------------------------------------------------------------
// BFI-2 population norms (approximate, Soto & John, 2017)
// ---------------------------------------------------------------------------

const BFI2_NORMS: Record<string, { mean: number; sd: number }> = {
  Extraversion: { mean: 3.25, sd: 0.73 },
  Agreeableness: { mean: 3.64, sd: 0.62 },
  Conscientiousness: { mean: 3.45, sd: 0.69 },
  Neuroticism: { mean: 2.85, sd: 0.78 },
  Openness: { mean: 3.75, sd: 0.65 },
};

// =========================================================================
// 1. BFI-2  (Big Five Inventory-2)
// =========================================================================

export function scoreBFI2(answers: Answers): ScoreResult {
  const SCALE_MIN = 1;
  const SCALE_MAX = 5;

  // Build a structured map of domains -> facets -> items from the
  // canonical question list so that scoring always stays in sync with
  // the instrument definition.
  const domainMap: Record<
    string,
    {
      items: { id: string; reversed: boolean }[];
      facets: Record<string, { id: string; reversed: boolean }[]>;
    }
  > = {};

  for (const q of BFI2_QUESTIONS) {
    if (!domainMap[q.domain]) {
      domainMap[q.domain] = { items: [], facets: {} };
    }
    domainMap[q.domain].items.push({ id: q.id, reversed: q.reversed });

    if (!domainMap[q.domain].facets[q.facet]) {
      domainMap[q.domain].facets[q.facet] = [];
    }
    domainMap[q.domain].facets[q.facet].push({
      id: q.id,
      reversed: q.reversed,
    });
  }

  const facets: Record<
    string,
    { score: number; maxScore: number; label: string }
  > = {};
  const allScoredValues: number[] = [];
  const interpretationLines: string[] = [];

  for (const domainName of Object.keys(domainMap)) {
    const domainData = domainMap[domainName];

    // --- Domain-level mean ---
    const domainValues: number[] = [];
    for (const item of domainData.items) {
      if (item.id in answers) {
        const raw = answers[item.id];
        const scored = item.reversed
          ? reverseScore(raw, SCALE_MIN, SCALE_MAX)
          : raw;
        domainValues.push(scored);
        allScoredValues.push(scored);
      }
    }
    const domainMean = round(mean(domainValues));

    // Percentile from population norms
    const norms = BFI2_NORMS[domainName];
    const pct = norms ? toPercentile(domainMean, norms.mean, norms.sd) : undefined;
    const pctStr =
      pct !== undefined
        ? `${percentileLabel(pct)} (${pct}${ordinalSuffix(pct)} percentile)`
        : domainName;

    facets[domainName] = {
      score: domainMean,
      maxScore: SCALE_MAX,
      label: pctStr,
    };
    interpretationLines.push(`${domainName}: ${domainMean}/${SCALE_MAX} — ${pctStr}`);

    // --- Facet-level means ---
    for (const [facetName, facetItems] of Object.entries(domainData.facets)) {
      const facetValues: number[] = [];
      for (const item of facetItems) {
        if (item.id in answers) {
          const raw = answers[item.id];
          facetValues.push(
            item.reversed
              ? reverseScore(raw, SCALE_MIN, SCALE_MAX)
              : raw,
          );
        }
      }
      facets[`${domainName}: ${facetName}`] = {
        score: round(mean(facetValues)),
        maxScore: SCALE_MAX,
        label: facetName,
      };
    }
  }

  const overallMean = round(mean(allScoredValues));

  return {
    instrument: 'BFI-2',
    rawScore: overallMean,
    maxScore: SCALE_MAX,
    severity: 'none', // personality trait, not pathology
    facets,
    interpretation:
      'Big Five personality profile (mean scores on 1-5 scale):\n' +
      interpretationLines.join('\n'),
  };
}

// =========================================================================
// 2. ECR-R  (Experiences in Close Relationships-Revised)
// =========================================================================

export function scoreECRR(answers: Answers): ScoreResult {
  const SCALE_MIN = 1;
  const SCALE_MAX = 7;
  const CUTOFF = 3.5;

  // Separate items by dimension, applying reverse-scoring from the
  // instrument definition.
  function dimensionMean(
    dimension: 'Anxiety' | 'Avoidance',
  ): number {
    const values: number[] = [];
    for (const q of ECRR_QUESTIONS) {
      if (q.dimension !== dimension) continue;
      if (!(q.id in answers)) continue;
      const raw = answers[q.id];
      values.push(
        q.reversed ? reverseScore(raw, SCALE_MIN, SCALE_MAX) : raw,
      );
    }
    return round(mean(values));
  }

  const anxietyMean = dimensionMean('Anxiety');
  const avoidanceMean = dimensionMean('Avoidance');

  const highAnxiety = anxietyMean >= CUTOFF;
  const highAvoidance = avoidanceMean >= CUTOFF;

  // Four-category attachment style classification
  let attachmentStyle: string;
  let severity: ScoreResult['severity'];

  if (!highAnxiety && !highAvoidance) {
    attachmentStyle = 'Secure';
    severity = 'low';
  } else if (highAnxiety && !highAvoidance) {
    attachmentStyle = 'Anxious-Preoccupied';
    severity = 'moderate';
  } else if (!highAnxiety && highAvoidance) {
    attachmentStyle = 'Dismissive-Avoidant';
    severity = 'moderate';
  } else {
    attachmentStyle = 'Fearful-Avoidant';
    severity = 'high';
  }

  return {
    instrument: 'ECR-R',
    rawScore: round((anxietyMean + avoidanceMean) / 2),
    maxScore: SCALE_MAX,
    severity,
    facets: {
      Anxiety: {
        score: anxietyMean,
        maxScore: SCALE_MAX,
        label: highAnxiety ? 'Elevated' : 'Low',
      },
      Avoidance: {
        score: avoidanceMean,
        maxScore: SCALE_MAX,
        label: highAvoidance ? 'Elevated' : 'Low',
      },
    },
    interpretation:
      `Attachment style: ${attachmentStyle}. ` +
      `Anxiety: ${anxietyMean}/7 (${highAnxiety ? 'above' : 'below'} cutoff of ${CUTOFF}). ` +
      `Avoidance: ${avoidanceMean}/7 (${highAvoidance ? 'above' : 'below'} cutoff of ${CUTOFF}).`,
  };
}

// =========================================================================
// 3. PHQ-9  (Patient Health Questionnaire-9)
// =========================================================================

export function scorePHQ9(answers: Answers): ScoreResult {
  const total = sum(PHQ9_QUESTIONS.map((q) => answers[q.id] ?? 0));

  let severity: ScoreResult['severity'];
  let label: string;

  if (total <= 4) {
    severity = 'minimal';
    label = 'Minimal depression';
  } else if (total <= 9) {
    severity = 'mild';
    label = 'Mild depression';
  } else if (total <= 14) {
    severity = 'moderate';
    label = 'Moderate depression';
  } else if (total <= 19) {
    severity = 'moderate_severe';
    label = 'Moderately severe depression';
  } else {
    severity = 'severe';
    label = 'Severe depression';
  }

  // Flag endorsement of suicidal ideation (item 9)
  const crisisValue = answers['phq9_09'] ?? 0;
  const crisisNote =
    crisisValue > 0
      ? ' Note: Endorsement of suicidal ideation detected (item 9) — crisis resources should be provided.'
      : '';

  return {
    instrument: 'PHQ-9',
    rawScore: total,
    maxScore: 27,
    severity,
    interpretation: `${label} (score: ${total}/27).${crisisNote}`,
  };
}

// =========================================================================
// 4. GAD-7  (Generalized Anxiety Disorder-7)
// =========================================================================

export function scoreGAD7(answers: Answers): ScoreResult {
  const total = sum(GAD7_QUESTIONS.map((q) => answers[q.id] ?? 0));

  let severity: ScoreResult['severity'];
  let label: string;

  if (total <= 4) {
    severity = 'minimal';
    label = 'Minimal anxiety';
  } else if (total <= 9) {
    severity = 'mild';
    label = 'Mild anxiety';
  } else if (total <= 14) {
    severity = 'moderate';
    label = 'Moderate anxiety';
  } else {
    severity = 'severe';
    label = 'Severe anxiety';
  }

  return {
    instrument: 'GAD-7',
    rawScore: total,
    maxScore: 21,
    severity,
    interpretation: `${label} (score: ${total}/21).`,
  };
}

// =========================================================================
// 5. ASRS  (Adult ADHD Self-Report Scale v1.1)
// =========================================================================

export function scoreASRS(answers: Answers): ScoreResult {
  const SCALE_MAX = 4;

  // ----- Part A screening -----
  const partAQuestions = ASRS_QUESTIONS.filter((q) => q.part === 'A');
  let partAPositiveCount = 0;
  for (const q of partAQuestions) {
    const value = answers[q.id] ?? 0;
    const threshold = ASRS_PART_A_THRESHOLDS[q.id] ?? 2;
    if (value >= threshold) {
      partAPositiveCount++;
    }
  }
  const isPositiveScreen = partAPositiveCount >= 4;

  // ----- Part B symptom severity -----
  const partBQuestions = ASRS_QUESTIONS.filter((q) => q.part === 'B');
  const partBSum = sum(partBQuestions.map((q) => answers[q.id] ?? 0));
  const partBMax = partBQuestions.length * SCALE_MAX; // 48

  // ----- Total sum (all 18 items) -----
  const totalSum = sum(ASRS_QUESTIONS.map((q) => answers[q.id] ?? 0));
  const totalMax = ASRS_QUESTIONS.length * SCALE_MAX; // 72

  return {
    instrument: 'ASRS',
    rawScore: totalSum,
    maxScore: totalMax,
    severity: isPositiveScreen ? 'positive' : 'negative',
    facets: {
      'Part A Screen': {
        score: partAPositiveCount,
        maxScore: partAQuestions.length,
        label: isPositiveScreen
          ? 'Positive — further evaluation recommended'
          : 'Negative',
      },
      'Part B Severity': {
        score: partBSum,
        maxScore: partBMax,
        label: 'Symptom severity supplement',
      },
    },
    interpretation:
      `ADHD screening: ${isPositiveScreen ? 'Positive' : 'Negative'} ` +
      `(${partAPositiveCount}/${partAQuestions.length} Part A items above threshold; >=4 required). ` +
      `Total symptom score: ${totalSum}/${totalMax}.`,
  };
}

// =========================================================================
// 6. ACE  (Adverse Childhood Experiences)
// =========================================================================

export function scoreACE(answers: Answers): ScoreResult {
  const total = sum(ACE_QUESTIONS.map((q) => answers[q.id] ?? 0));

  let severity: ScoreResult['severity'];
  let label: string;

  if (total === 0) {
    severity = 'low';
    label = 'No reported adverse childhood experiences';
  } else if (total <= 3) {
    severity = 'moderate';
    label = 'Moderate ACE exposure';
  } else {
    severity = 'high';
    label = 'High ACE exposure — associated with significantly elevated health risks';
  }

  // Build category-level facets
  const categoryCounts: Record<string, { endorsed: number; total: number }> = {};
  for (const q of ACE_QUESTIONS) {
    if (!categoryCounts[q.category]) {
      categoryCounts[q.category] = { endorsed: 0, total: 0 };
    }
    categoryCounts[q.category].total++;
    categoryCounts[q.category].endorsed += answers[q.id] ?? 0;
  }

  const facets: Record<string, { score: number; maxScore: number; label: string }> = {};
  for (const [cat, counts] of Object.entries(categoryCounts)) {
    facets[cat] = {
      score: counts.endorsed,
      maxScore: counts.total,
      label: cat,
    };
  }

  return {
    instrument: 'ACE',
    rawScore: total,
    maxScore: 10,
    severity,
    facets,
    interpretation: `ACE score: ${total}/10. ${label}.`,
  };
}

// =========================================================================
// 7. PSS-10  (Perceived Stress Scale)
// =========================================================================

export function scorePSS10(answers: Answers): ScoreResult {
  const SCALE_MIN = 0;
  const SCALE_MAX = 4;

  // Items 4, 5, 7, 8 are reverse-scored (flagged in the instrument file).
  // Reverse operation on 0-4 scale: 4 - value  (i.e. 0+4 - value).
  let total = 0;
  for (const q of PSS10_QUESTIONS) {
    const raw = answers[q.id] ?? 0;
    total += q.reversed
      ? reverseScore(raw, SCALE_MIN, SCALE_MAX)
      : raw;
  }

  let severity: ScoreResult['severity'];
  let label: string;

  if (total <= 13) {
    severity = 'low';
    label = 'Low perceived stress';
  } else if (total <= 26) {
    severity = 'moderate';
    label = 'Moderate perceived stress';
  } else {
    severity = 'high';
    label = 'High perceived stress';
  }

  return {
    instrument: 'PSS-10',
    rawScore: total,
    maxScore: 40,
    severity,
    interpretation: `${label} (score: ${total}/40).`,
  };
}

// =========================================================================
// 8. PC-PTSD-5  (Primary Care PTSD Screen for DSM-5)
// =========================================================================

const PCPTSD5_ITEM_COUNT = 5;
const PCPTSD5_PREFIX = 'pcptsd5';
const PCPTSD5_CUTOFF = 3;

export function scorePCPTSD5(answers: Answers): ScoreResult {
  const values = collectValues(answers, PCPTSD5_PREFIX, PCPTSD5_ITEM_COUNT);
  const total = sum(values);
  const isPositive = total >= PCPTSD5_CUTOFF;

  return {
    instrument: 'PC-PTSD-5',
    rawScore: total,
    maxScore: PCPTSD5_ITEM_COUNT,
    severity: isPositive ? 'positive' : 'negative',
    interpretation:
      `PTSD screening: ${isPositive ? 'Positive' : 'Negative'} ` +
      `(${total}/${PCPTSD5_ITEM_COUNT} items endorsed; >=${PCPTSD5_CUTOFF} required for positive screen).` +
      (isPositive
        ? ' Further evaluation for PTSD is recommended.'
        : ''),
  };
}

// =========================================================================
// 9. AQ-10  (Autism Spectrum Quotient — 10-item version)
// =========================================================================

// Scoring key (Allison, Auyeung & Baron-Cohen, 2012):
//   Items 1, 7, 8, 10: score 1 if response is "Definitely agree" or
//     "Slightly agree"  (value <= 2 on a 1-4 scale).
//   Items 2, 3, 4, 5, 6, 9: score 1 if response is "Definitely disagree"
//     or "Slightly disagree"  (value >= 3 on a 1-4 scale).
// Total 0-10.  >= 6 indicates referral for diagnostic assessment.

const AQ10_PREFIX = 'aq10';
const AQ10_ITEM_COUNT = 10;
const AQ10_CUTOFF = 6;
const AQ10_AGREE_SCORED = new Set([1, 7, 8, 10]);

export function scoreAQ10(answers: Answers): ScoreResult {
  let total = 0;

  for (let i = 1; i <= AQ10_ITEM_COUNT; i++) {
    const id = `${AQ10_PREFIX}_${String(i).padStart(2, '0')}`;
    const value = answers[id];
    if (value === undefined) continue;

    if (AQ10_AGREE_SCORED.has(i)) {
      // "Definitely agree" (1) or "Slightly agree" (2) => 1 point
      if (value <= 2) total += 1;
    } else {
      // "Slightly disagree" (3) or "Definitely disagree" (4) => 1 point
      if (value >= 3) total += 1;
    }
  }

  const isPositive = total >= AQ10_CUTOFF;

  return {
    instrument: 'AQ-10',
    rawScore: total,
    maxScore: AQ10_ITEM_COUNT,
    severity: isPositive ? 'positive' : 'negative',
    interpretation:
      `Autism spectrum screening: ${isPositive ? 'Referral recommended' : 'Below referral threshold'} ` +
      `(score: ${total}/${AQ10_ITEM_COUNT}; >=${AQ10_CUTOFF} indicates referral for diagnostic assessment).`,
  };
}

// =========================================================================
// 10. DERS-SF  (Difficulties in Emotion Regulation Scale — Short Form)
// =========================================================================

// 18 items on a 1-5 Likert scale (1 = Almost Never, 5 = Almost Always).
// 6 subscales with 3 items each. Items in the Awareness subscale are
// reverse-scored because they are positively worded (e.g. "I pay attention
// to how I feel"), while higher DERS scores indicate greater difficulty.
//
// Subscale -> item mapping follows Kaufman et al. (2016), with items
// renumbered 1-18 for the short form.
//
// Total range: 18-90.  Higher = more difficulty regulating emotions.

interface DERSSFSubscale {
  name: string;
  items: number[];
  reverseScored: boolean;
}

const DERSSF_PREFIX = 'derssf';
const DERSSF_SCALE_MIN = 1;
const DERSSF_SCALE_MAX = 5;

const DERSSF_SUBSCALES: DERSSFSubscale[] = [
  { name: 'Awareness', items: [1, 4, 6], reverseScored: true },
  { name: 'Clarity', items: [2, 3, 5], reverseScored: false },
  { name: 'Goals', items: [8, 12, 15], reverseScored: false },
  { name: 'Impulse', items: [9, 13, 16], reverseScored: false },
  { name: 'Nonacceptance', items: [7, 10, 14], reverseScored: false },
  { name: 'Strategies', items: [11, 17, 18], reverseScored: false },
];

export function scoreDERSSF(answers: Answers): ScoreResult {
  const facets: Record<
    string,
    { score: number; maxScore: number; label: string }
  > = {};
  let totalScore = 0;

  for (const subscale of DERSSF_SUBSCALES) {
    let subscaleSum = 0;
    for (const itemNum of subscale.items) {
      const id = `${DERSSF_PREFIX}_${String(itemNum).padStart(2, '0')}`;
      const raw = answers[id] ?? DERSSF_SCALE_MIN; // conservative default
      subscaleSum += subscale.reverseScored
        ? reverseScore(raw, DERSSF_SCALE_MIN, DERSSF_SCALE_MAX)
        : raw;
    }

    const subscaleMax = subscale.items.length * DERSSF_SCALE_MAX; // 15

    facets[subscale.name] = {
      score: subscaleSum,
      maxScore: subscaleMax,
      label: subscale.name,
    };
    totalScore += subscaleSum;
  }

  const TOTAL_MAX = 90; // 18 * 5

  // Severity thresholds (approximately equal thirds of the 18-90 range)
  let severity: ScoreResult['severity'];
  let label: string;

  if (totalScore <= 36) {
    severity = 'low';
    label = 'Low difficulty with emotion regulation';
  } else if (totalScore <= 54) {
    severity = 'moderate';
    label = 'Moderate difficulty with emotion regulation';
  } else {
    severity = 'high';
    label = 'High difficulty with emotion regulation';
  }

  return {
    instrument: 'DERS-SF',
    rawScore: totalScore,
    maxScore: TOTAL_MAX,
    severity,
    facets,
    interpretation:
      `${label} (total: ${totalScore}/${TOTAL_MAX}). ` +
      'Subscale scores indicate relative areas of strength and difficulty in emotion regulation.',
  };
}

// =========================================================================
// 11. Schwartz PVQ  (Portrait Values Questionnaire — PVQ-21)
// =========================================================================

// 21 items on a 1-6 scale (1 = "Not like me at all", 6 = "Very much like me").
// 10 value dimensions with 2-3 items each.
//
// Scoring (Schwartz, 2003):
//   1. Compute raw mean for each value dimension.
//   2. Compute the individual's grand mean (MRAT) across all 21 items.
//   3. Centered score = dimension mean - MRAT.
//      Positive = relatively more important; negative = relatively less.

interface PVQDimension {
  name: string;
  items: number[];
}

const PVQ_PREFIX = 'pvq';
const _PVQ_ITEM_COUNT = 21;
const PVQ_SCALE_MAX = 6;

const PVQ_DIMENSIONS: PVQDimension[] = [
  { name: 'Self-Direction', items: [1, 11] },
  { name: 'Stimulation', items: [6, 15] },
  { name: 'Hedonism', items: [10, 21] },
  { name: 'Achievement', items: [4, 13] },
  { name: 'Power', items: [2, 17] },
  { name: 'Security', items: [5, 14] },
  { name: 'Conformity', items: [7, 16] },
  { name: 'Tradition', items: [9, 20] },
  { name: 'Benevolence', items: [12, 18] },
  { name: 'Universalism', items: [3, 8, 19] },
];

export function scoreSchwartzPVQ(answers: Answers): ScoreResult {
  // Step 1 & 2 — raw dimension means and grand mean
  const rawMeans: Record<string, number> = {};
  const allItemValues: number[] = [];

  for (const dim of PVQ_DIMENSIONS) {
    const dimValues: number[] = [];
    for (const itemNum of dim.items) {
      const id = `${PVQ_PREFIX}_${String(itemNum).padStart(2, '0')}`;
      if (id in answers) {
        dimValues.push(answers[id]);
        allItemValues.push(answers[id]);
      }
    }
    rawMeans[dim.name] = mean(dimValues);
  }

  const grandMean = mean(allItemValues);

  // Step 3 — center scores
  const facets: Record<
    string,
    { score: number; maxScore: number; label: string }
  > = {};
  const centeredList: { name: string; score: number }[] = [];

  for (const dim of PVQ_DIMENSIONS) {
    const centered = round(rawMeans[dim.name] - grandMean);
    centeredList.push({ name: dim.name, score: centered });

    let priorityLabel: string;
    if (centered > 0.5) {
      priorityLabel = 'High priority';
    } else if (centered < -0.5) {
      priorityLabel = 'Lower priority';
    } else {
      priorityLabel = 'Moderate priority';
    }

    facets[dim.name] = {
      score: centered,
      maxScore: PVQ_SCALE_MAX,
      label: priorityLabel,
    };
  }

  // Rank order for the interpretation string
  centeredList.sort((a, b) => b.score - a.score);
  const topValues = centeredList
    .filter((v) => v.score > 0)
    .slice(0, 3)
    .map((v) => v.name);
  const bottomValues = centeredList
    .filter((v) => v.score < 0)
    .slice(-3)
    .map((v) => v.name);

  return {
    instrument: 'Schwartz PVQ',
    rawScore: round(grandMean),
    maxScore: PVQ_SCALE_MAX,
    severity: 'none', // values profile, not pathology
    facets,
    interpretation:
      'Values profile (centered scores; positive = relatively more important, ' +
      'negative = relatively less important). ' +
      `Top values: ${topValues.length > 0 ? topValues.join(', ') : '(none above mean)'}. ` +
      `Lower-priority values: ${bottomValues.length > 0 ? bottomValues.join(', ') : '(none below mean)'}.`,
  };
}

// =========================================================================
// Master scoring function
// =========================================================================

/**
 * Run every applicable scoring function and return results keyed by
 * instrument name. An instrument is scored only when at least one
 * answer with its prefix is present.
 */
export function computeAllScores(
  answers: Answers,
): Record<string, ScoreResult> {
  const results: Record<string, ScoreResult> = {};

  if (hasAnswersForPrefix(answers, 'bfi2')) {
    results['BFI-2'] = scoreBFI2(answers);
  }
  if (hasAnswersForPrefix(answers, 'ecrr')) {
    results['ECR-R'] = scoreECRR(answers);
  }
  if (hasAnswersForPrefix(answers, 'phq9')) {
    results['PHQ-9'] = scorePHQ9(answers);
  }
  if (hasAnswersForPrefix(answers, 'gad7')) {
    results['GAD-7'] = scoreGAD7(answers);
  }
  if (hasAnswersForPrefix(answers, 'asrs')) {
    results['ASRS'] = scoreASRS(answers);
  }
  if (hasAnswersForPrefix(answers, 'ace')) {
    results['ACE'] = scoreACE(answers);
  }
  if (hasAnswersForPrefix(answers, 'pss10')) {
    results['PSS-10'] = scorePSS10(answers);
  }
  if (hasAnswersForPrefix(answers, 'pcptsd5')) {
    results['PC-PTSD-5'] = scorePCPTSD5(answers);
  }
  if (hasAnswersForPrefix(answers, 'aq10')) {
    results['AQ-10'] = scoreAQ10(answers);
  }
  if (hasAnswersForPrefix(answers, 'derssf')) {
    results['DERS-SF'] = scoreDERSSF(answers);
  }
  if (hasAnswersForPrefix(answers, 'pvq')) {
    results['Schwartz PVQ'] = scoreSchwartzPVQ(answers);
  }

  return results;
}
