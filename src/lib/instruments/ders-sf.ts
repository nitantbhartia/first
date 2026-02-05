/**
 * Difficulties in Emotion Regulation Scale - Short Form (DERS-SF)
 *
 * 18 items measuring difficulties in emotion regulation across 6 subscales
 * (3 items each). Rated on a 1-5 scale.
 *
 * Subscales:
 * 1. Nonacceptance - Nonacceptance of emotional responses
 * 2. Goals - Difficulties engaging in goal-directed behavior
 * 3. Impulse - Impulse control difficulties
 * 4. Awareness - Lack of emotional awareness (reverse-scored subscale)
 * 5. Strategies - Limited access to emotion regulation strategies
 * 6. Clarity - Lack of emotional clarity
 *
 * Higher scores indicate greater difficulties with emotion regulation.
 *
 * References:
 * - Kaufman, E. A., et al. (2016). The Difficulties in Emotion Regulation
 *   Scale Short Form (DERS-SF): Validation and replication in adolescent and
 *   adult samples. Journal of Psychopathology and Behavioral Assessment,
 *   38(3), 443-455.
 * - Gratz, K. L., & Roemer, L. (2004). Multidimensional assessment of emotion
 *   regulation and dysregulation: Development, factor structure, and initial
 *   validation of the Difficulties in Emotion Regulation Scale. Journal of
 *   Psychopathology and Behavioral Assessment, 26(1), 41-54.
 */

export interface DERSSFQuestion {
  id: string;
  text: string;
  subscale: string;
  reversed: boolean;
}

export const DERSSF_QUESTIONS: DERSSFQuestion[] = [
  // ============================================================
  // Nonacceptance of Emotional Responses (3 items)
  // ============================================================
  {
    id: 'ders_01',
    text: 'When I\'m upset, I feel guilty for feeling that way.',
    subscale: 'Nonacceptance',
    reversed: false,
  },
  {
    id: 'ders_02',
    text: 'When I\'m upset, I become embarrassed for feeling that way.',
    subscale: 'Nonacceptance',
    reversed: false,
  },
  {
    id: 'ders_03',
    text: 'When I\'m upset, I feel like I am weak.',
    subscale: 'Nonacceptance',
    reversed: false,
  },

  // ============================================================
  // Difficulties Engaging in Goal-Directed Behavior (3 items)
  // ============================================================
  {
    id: 'ders_04',
    text: 'When I\'m upset, I have difficulty getting work done.',
    subscale: 'Goals',
    reversed: false,
  },
  {
    id: 'ders_05',
    text: 'When I\'m upset, I have difficulty focusing on other things.',
    subscale: 'Goals',
    reversed: false,
  },
  {
    id: 'ders_06',
    text: 'When I\'m upset, I have difficulty concentrating.',
    subscale: 'Goals',
    reversed: false,
  },

  // ============================================================
  // Impulse Control Difficulties (3 items)
  // ============================================================
  {
    id: 'ders_07',
    text: 'When I\'m upset, I have difficulty controlling my behaviors.',
    subscale: 'Impulse',
    reversed: false,
  },
  {
    id: 'ders_08',
    text: 'When I\'m upset, I feel out of control.',
    subscale: 'Impulse',
    reversed: false,
  },
  {
    id: 'ders_09',
    text: 'When I\'m upset, I lose control over my behaviors.',
    subscale: 'Impulse',
    reversed: false,
  },

  // ============================================================
  // Lack of Emotional Awareness (3 items, all reverse-scored)
  // ============================================================
  {
    id: 'ders_10',
    text: 'I pay attention to how I feel.',
    subscale: 'Awareness',
    reversed: true,
  },
  {
    id: 'ders_11',
    text: 'I care about what I am feeling.',
    subscale: 'Awareness',
    reversed: true,
  },
  {
    id: 'ders_12',
    text: 'When I\'m upset, I acknowledge my emotions.',
    subscale: 'Awareness',
    reversed: true,
  },

  // ============================================================
  // Limited Access to Emotion Regulation Strategies (3 items)
  // ============================================================
  {
    id: 'ders_13',
    text: 'When I\'m upset, I believe that I will remain that way for a long time.',
    subscale: 'Strategies',
    reversed: false,
  },
  {
    id: 'ders_14',
    text: 'When I\'m upset, I believe that there is nothing I can do to make myself feel better.',
    subscale: 'Strategies',
    reversed: false,
  },
  {
    id: 'ders_15',
    text: 'When I\'m upset, I believe that wallowing in it is all I can do.',
    subscale: 'Strategies',
    reversed: false,
  },

  // ============================================================
  // Lack of Emotional Clarity (3 items)
  // ============================================================
  {
    id: 'ders_16',
    text: 'I have difficulty making sense out of my feelings.',
    subscale: 'Clarity',
    reversed: false,
  },
  {
    id: 'ders_17',
    text: 'I have no idea how I am feeling.',
    subscale: 'Clarity',
    reversed: false,
  },
  {
    id: 'ders_18',
    text: 'I am confused about how I feel.',
    subscale: 'Clarity',
    reversed: false,
  },
];

export const DERSSF_PREAMBLE =
  'Please indicate how often the following statements apply to you.';

export const DERSSF_SCALE = {
  min: 1,
  max: 5,
  labels: [
    'Almost never (0-10%)',
    'Sometimes (11-35%)',
    'About half the time (36-65%)',
    'Most of the time (66-90%)',
    'Almost always (91-100%)',
  ],
};

export const DERSSF_SUBSCALES = [
  {
    id: 'Nonacceptance',
    name: 'Nonacceptance of Emotional Responses',
    description: 'Tendency to have negative secondary emotional responses to one\'s negative emotions.',
  },
  {
    id: 'Goals',
    name: 'Difficulties Engaging in Goal-Directed Behavior',
    description: 'Difficulty concentrating and accomplishing tasks when experiencing negative emotions.',
  },
  {
    id: 'Impulse',
    name: 'Impulse Control Difficulties',
    description: 'Difficulty remaining in control of one\'s behavior when experiencing negative emotions.',
  },
  {
    id: 'Awareness',
    name: 'Lack of Emotional Awareness',
    description: 'Inattention to and lack of awareness of emotional responses.',
  },
  {
    id: 'Strategies',
    name: 'Limited Access to Emotion Regulation Strategies',
    description: 'Belief that there is little that can be done to regulate emotions effectively.',
  },
  {
    id: 'Clarity',
    name: 'Lack of Emotional Clarity',
    description: 'Extent to which one knows and is clear about the emotions one is experiencing.',
  },
];
