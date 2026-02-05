/**
 * Adult ADHD Self-Report Scale (ASRS v1.1)
 *
 * 18-item screening instrument for adult ADHD developed by the World Health
 * Organization (WHO). The scale consists of:
 * - Part A (6 items): Screening items most predictive of ADHD
 * - Part B (12 items): Additional items providing supplementary information
 *
 * Rated on a 0-4 scale measuring frequency of symptoms over the past 6 months.
 *
 * The ASRS is in the public domain as a WHO instrument.
 *
 * Scoring (Part A screening):
 * Items have different clinical thresholds for "consistent with ADHD."
 * 4+ items in Part A at or above threshold suggests further evaluation.
 *
 * References:
 * - Kessler, R. C., et al. (2005). The World Health Organization Adult ADHD
 *   Self-Report Scale (ASRS). Psychological Medicine, 35(2), 245-256.
 */

export interface ASRSQuestion {
  id: string;
  text: string;
  part: 'A' | 'B';
  symptomDomain: 'Inattention' | 'Hyperactivity-Impulsivity';
}

export const ASRS_QUESTIONS: ASRSQuestion[] = [
  // ============================================================
  // PART A - Screening (6 items)
  // ============================================================
  {
    id: 'asrs_01',
    text: 'How often do you have trouble wrapping up the final details of a project, once the challenging parts have been done?',
    part: 'A',
    symptomDomain: 'Inattention',
  },
  {
    id: 'asrs_02',
    text: 'How often do you have difficulty getting things in order when you have to do a task that requires organization?',
    part: 'A',
    symptomDomain: 'Inattention',
  },
  {
    id: 'asrs_03',
    text: 'How often do you have problems remembering appointments or obligations?',
    part: 'A',
    symptomDomain: 'Inattention',
  },
  {
    id: 'asrs_04',
    text: 'When you have a task that requires a lot of thought, how often do you avoid or delay getting started?',
    part: 'A',
    symptomDomain: 'Inattention',
  },
  {
    id: 'asrs_05',
    text: 'How often do you fidget or squirm with your hands or feet when you have to sit down for a long time?',
    part: 'A',
    symptomDomain: 'Hyperactivity-Impulsivity',
  },
  {
    id: 'asrs_06',
    text: 'How often do you feel overly active and compelled to do things, like you were driven by a motor?',
    part: 'A',
    symptomDomain: 'Hyperactivity-Impulsivity',
  },

  // ============================================================
  // PART B - Supplementary (12 items)
  // ============================================================
  {
    id: 'asrs_07',
    text: 'How often do you make careless mistakes when you have to work on a boring or difficult project?',
    part: 'B',
    symptomDomain: 'Inattention',
  },
  {
    id: 'asrs_08',
    text: 'How often do you have difficulty keeping your attention when you are doing boring or repetitive work?',
    part: 'B',
    symptomDomain: 'Inattention',
  },
  {
    id: 'asrs_09',
    text: 'How often do you have difficulty concentrating on what people say to you, even when they are speaking to you directly?',
    part: 'B',
    symptomDomain: 'Inattention',
  },
  {
    id: 'asrs_10',
    text: 'How often do you misplace or have difficulty finding things at home or at work?',
    part: 'B',
    symptomDomain: 'Inattention',
  },
  {
    id: 'asrs_11',
    text: 'How often are you distracted by activity or noise around you?',
    part: 'B',
    symptomDomain: 'Inattention',
  },
  {
    id: 'asrs_12',
    text: 'How often do you leave your seat in meetings or other situations in which you are expected to remain seated?',
    part: 'B',
    symptomDomain: 'Hyperactivity-Impulsivity',
  },
  {
    id: 'asrs_13',
    text: 'How often do you feel restless or fidgety?',
    part: 'B',
    symptomDomain: 'Hyperactivity-Impulsivity',
  },
  {
    id: 'asrs_14',
    text: 'How often do you have difficulty unwinding and relaxing when you have time to yourself?',
    part: 'B',
    symptomDomain: 'Hyperactivity-Impulsivity',
  },
  {
    id: 'asrs_15',
    text: 'How often do you find yourself talking too much when you are in social situations?',
    part: 'B',
    symptomDomain: 'Hyperactivity-Impulsivity',
  },
  {
    id: 'asrs_16',
    text: 'When you\'re in a conversation, how often do you find yourself finishing the sentences of the people you are talking to, before they can finish them themselves?',
    part: 'B',
    symptomDomain: 'Hyperactivity-Impulsivity',
  },
  {
    id: 'asrs_17',
    text: 'How often do you have difficulty waiting your turn in situations when turn taking is required?',
    part: 'B',
    symptomDomain: 'Hyperactivity-Impulsivity',
  },
  {
    id: 'asrs_18',
    text: 'How often do you interrupt others when they are busy?',
    part: 'B',
    symptomDomain: 'Hyperactivity-Impulsivity',
  },
];

export const ASRS_PREAMBLE =
  'Please answer the questions below, rating yourself on each of the criteria shown using the scale on the right side of the page. As you answer each question, select the response that best describes how you have felt and conducted yourself over the past 6 months.';

export const ASRS_SCALE = {
  min: 0,
  max: 4,
  labels: [
    'Never',
    'Rarely',
    'Sometimes',
    'Often',
    'Very Often',
  ],
};

/**
 * For Part A screening, items 1-3 score positively at "Sometimes" (2) or above,
 * and items 4-6 score positively at "Often" (3) or above.
 * 4+ positive items in Part A suggests need for further evaluation.
 */
export const ASRS_PART_A_THRESHOLDS: Record<string, number> = {
  asrs_01: 2, // Sometimes
  asrs_02: 2, // Sometimes
  asrs_03: 2, // Sometimes
  asrs_04: 3, // Often
  asrs_05: 3, // Often
  asrs_06: 3, // Often
};
