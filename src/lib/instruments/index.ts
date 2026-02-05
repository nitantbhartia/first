/**
 * Deep Personality Assessment Instruments
 *
 * Central index file that exports all instrument data and defines the
 * assessment flow structure via ASSESSMENT_SECTIONS.
 */

// BFI-2: Big Five Inventory-2 (Personality)
export {
  BFI2_QUESTIONS,
  BFI2_SCALE,
  BFI2_DOMAINS,
  type InstrumentQuestion,
} from './bfi2';

// ECR-R: Experiences in Close Relationships-Revised (Attachment)
export {
  ECRR_QUESTIONS,
  ECRR_SCALE,
  ECRR_DIMENSIONS,
  type ECRRQuestion,
} from './ecr-r';

// PHQ-9: Patient Health Questionnaire-9 (Depression)
export {
  PHQ9_QUESTIONS,
  PHQ9_SCALE,
  PHQ9_PREAMBLE,
  PHQ9_SEVERITY,
  PHQ9_CRISIS_RESOURCES,
  type PHQ9Question,
} from './phq9';

// GAD-7: Generalized Anxiety Disorder 7-item (Anxiety)
export {
  GAD7_QUESTIONS,
  GAD7_SCALE,
  GAD7_PREAMBLE,
  GAD7_SEVERITY,
  type GAD7Question,
} from './gad7';

// ASRS: Adult ADHD Self-Report Scale (ADHD)
export {
  ASRS_QUESTIONS,
  ASRS_SCALE,
  ASRS_PREAMBLE,
  ASRS_PART_A_THRESHOLDS,
  type ASRSQuestion,
} from './asrs';

// ACE: Adverse Childhood Experiences (Trauma)
export {
  ACE_QUESTIONS,
  ACE_SCALE,
  ACE_PREAMBLE,
  ACE_SEVERITY,
  ACE_CONTENT_WARNING,
  type ACEQuestion,
} from './ace';

// PSS-10: Perceived Stress Scale (Stress)
export {
  PSS10_QUESTIONS,
  PSS10_SCALE,
  PSS10_PREAMBLE,
  PSS10_SEVERITY,
  type PSS10Question,
} from './pss10';

// PC-PTSD-5: Primary Care PTSD Screen for DSM-5 (PTSD)
export {
  PCPTSD5_QUESTIONS,
  PCPTSD5_SCALE,
  PCPTSD5_PREAMBLE,
  PCPTSD5_FOLLOWUP_INTRO,
  PCPTSD5_CUTOFFS,
  type PCPTSD5Question,
} from './pcptsd5';

// AQ-10: Autism Spectrum Quotient 10-item (Autism Spectrum)
export {
  AQ10_QUESTIONS,
  AQ10_SCALE,
  AQ10_PREAMBLE,
  AQ10_CUTOFF,
  scoreAQ10Item,
  type AQ10Question,
} from './aq10';

// DERS-SF: Difficulties in Emotion Regulation Scale Short Form
export {
  DERSSF_QUESTIONS,
  DERSSF_SCALE,
  DERSSF_PREAMBLE,
  DERSSF_SUBSCALES,
  type DERSSFQuestion,
} from './ders-sf';

// Values: Schwartz Portrait Values Questionnaire adaptation
export {
  VALUES_QUESTIONS,
  VALUES_SCALE,
  VALUES_PREAMBLE,
  VALUES_DIMENSIONS,
  type ValuesQuestion,
} from './values';

// ============================================================
// Assessment Sections
// Defines the flow and grouping of instruments in the assessment
// ============================================================

export interface AssessmentInstrument {
  id: string;
  name: string;
  shortName: string;
  itemCount: number;
  /** Whether this instrument contains items flagged as crisis items */
  hasCrisisItems: boolean;
  /** Whether this instrument requires a content warning before display */
  requiresContentWarning: boolean;
}

export interface AssessmentSection {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  instruments: AssessmentInstrument[];
}

export const ASSESSMENT_SECTIONS: AssessmentSection[] = [
  {
    id: 'personality',
    title: 'Personality',
    description:
      'Let\'s start by understanding your core personality traits. These questions explore how you typically think, feel, and behave across different situations. There are no right or wrong answers - just go with what feels most natural to you.',
    estimatedMinutes: 10,
    instruments: [
      {
        id: 'bfi2',
        name: 'Big Five Inventory-2',
        shortName: 'BFI-2',
        itemCount: 60,
        hasCrisisItems: false,
        requiresContentWarning: false,
      },
    ],
  },
  {
    id: 'values-motivation',
    title: 'Values & Motivation',
    description:
      'Now let\'s explore what matters most to you. These questions look at your core values and what motivates you in life. Understanding your values helps paint a picture of what drives your decisions and gives your life meaning.',
    estimatedMinutes: 4,
    instruments: [
      {
        id: 'values',
        name: 'Portrait Values Questionnaire',
        shortName: 'PVQ',
        itemCount: 21,
        hasCrisisItems: false,
        requiresContentWarning: false,
      },
    ],
  },
  {
    id: 'attachment-relationships',
    title: 'Attachment & Relationships',
    description:
      'These questions explore how you relate to others in close relationships. Your attachment style influences how you connect with partners, friends, and family. Think about your general tendencies in relationships, not just one specific relationship.',
    estimatedMinutes: 6,
    instruments: [
      {
        id: 'ecrr',
        name: 'Experiences in Close Relationships-Revised',
        shortName: 'ECR-R',
        itemCount: 36,
        hasCrisisItems: false,
        requiresContentWarning: false,
      },
    ],
  },
  {
    id: 'emotional-wellbeing',
    title: 'Emotional Wellbeing',
    description:
      'The next set of questions checks in on how you\'ve been feeling recently. These are standard wellness screenings used by healthcare providers worldwide. Answer based on your experience over the past two weeks.',
    estimatedMinutes: 3,
    instruments: [
      {
        id: 'phq9',
        name: 'Patient Health Questionnaire-9',
        shortName: 'PHQ-9',
        itemCount: 9,
        hasCrisisItems: true,
        requiresContentWarning: false,
      },
      {
        id: 'gad7',
        name: 'Generalized Anxiety Disorder 7-item',
        shortName: 'GAD-7',
        itemCount: 7,
        hasCrisisItems: false,
        requiresContentWarning: false,
      },
    ],
  },
  {
    id: 'stress-regulation',
    title: 'Stress & Regulation',
    description:
      'These questions look at how you experience and manage stress and emotions. Understanding your stress levels and emotion regulation patterns can reveal important insights about your coping strategies and resilience.',
    estimatedMinutes: 5,
    instruments: [
      {
        id: 'pss10',
        name: 'Perceived Stress Scale',
        shortName: 'PSS-10',
        itemCount: 10,
        hasCrisisItems: false,
        requiresContentWarning: false,
      },
      {
        id: 'derssf',
        name: 'Difficulties in Emotion Regulation Scale - Short Form',
        shortName: 'DERS-SF',
        itemCount: 18,
        hasCrisisItems: false,
        requiresContentWarning: false,
      },
    ],
  },
  {
    id: 'neurodivergence',
    title: 'Neurodivergence',
    description:
      'These screening questions explore patterns in attention, focus, and social perception. Many people discover that understanding their neurocognitive profile helps explain lifelong patterns. Remember, these are screening tools, not diagnostic instruments.',
    estimatedMinutes: 5,
    instruments: [
      {
        id: 'asrs',
        name: 'Adult ADHD Self-Report Scale',
        shortName: 'ASRS',
        itemCount: 18,
        hasCrisisItems: false,
        requiresContentWarning: false,
      },
      {
        id: 'aq10',
        name: 'Autism Spectrum Quotient (10-item)',
        shortName: 'AQ-10',
        itemCount: 10,
        hasCrisisItems: false,
        requiresContentWarning: false,
      },
    ],
  },
  {
    id: 'trauma-experiences',
    title: 'Trauma & Experiences',
    description:
      'This final section asks about significant life experiences. Some of these questions touch on difficult topics. You can skip any question you\'re not comfortable answering. Your responses help us understand your full picture, and everything you share is kept confidential.',
    estimatedMinutes: 3,
    instruments: [
      {
        id: 'ace',
        name: 'Adverse Childhood Experiences',
        shortName: 'ACE',
        itemCount: 10,
        hasCrisisItems: false,
        requiresContentWarning: true,
      },
      {
        id: 'pcptsd5',
        name: 'Primary Care PTSD Screen for DSM-5',
        shortName: 'PC-PTSD-5',
        itemCount: 5,
        hasCrisisItems: false,
        requiresContentWarning: false,
      },
    ],
  },
];

/**
 * Total number of items across all instruments.
 */
export const TOTAL_ASSESSMENT_ITEMS = ASSESSMENT_SECTIONS.reduce(
  (total, section) =>
    total + section.instruments.reduce((sectionTotal, inst) => sectionTotal + inst.itemCount, 0),
  0
);

/**
 * Total estimated time in minutes for the full assessment.
 */
export const TOTAL_ESTIMATED_MINUTES = ASSESSMENT_SECTIONS.reduce(
  (total, section) => total + section.estimatedMinutes,
  0
);
