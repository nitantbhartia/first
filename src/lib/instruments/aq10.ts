/**
 * Autism Spectrum Quotient - 10 item version (AQ-10)
 *
 * A 10-item screening instrument for autism spectrum conditions in adults.
 * Each item is rated on a 4-point scale. Scoring: for each item, certain
 * responses (either "Definitely Agree"/"Slightly Agree" or "Definitely
 * Disagree"/"Slightly Disagree") score 1 point.
 *
 * Scoring:
 * Score of 6 or above: referral for specialist diagnostic assessment is
 * indicated.
 *
 * References:
 * - Allison, C., Auyeung, B., & Baron-Cohen, S. (2012). Toward brief "Red
 *   Flags" for autism screening: The Short Autism Spectrum Quotient and the
 *   Short Quantitative Checklist in 1,000 cases and 3,000 controls. Journal
 *   of the American Academy of Child & Adolescent Psychiatry, 51(2), 202-212.
 * - Baron-Cohen, S., et al. (2001). The Autism-Spectrum Quotient (AQ):
 *   Evidence from Asperger syndrome/high-functioning autism, males and females,
 *   scientists and mathematicians. Journal of Autism and Developmental
 *   Disorders, 31(1), 5-17.
 */

export interface AQ10Question {
  id: string;
  text: string;
  /** Which responses score 1 point: 'agree' means "Definitely agree" or "Slightly agree" scores 1 */
  scoringDirection: 'agree' | 'disagree';
}

export const AQ10_QUESTIONS: AQ10Question[] = [
  {
    id: 'aq10_01',
    text: 'I often notice small sounds when others do not.',
    scoringDirection: 'agree',
  },
  {
    id: 'aq10_02',
    text: 'I usually concentrate more on the whole picture, rather than the small details.',
    scoringDirection: 'disagree',
  },
  {
    id: 'aq10_03',
    text: 'I find it easy to do more than one thing at once.',
    scoringDirection: 'disagree',
  },
  {
    id: 'aq10_04',
    text: 'If there is an interruption, I can switch back to what I was doing very quickly.',
    scoringDirection: 'disagree',
  },
  {
    id: 'aq10_05',
    text: 'I find it easy to read between the lines when someone is talking to me.',
    scoringDirection: 'disagree',
  },
  {
    id: 'aq10_06',
    text: 'I know how to tell if someone listening to me is getting bored.',
    scoringDirection: 'disagree',
  },
  {
    id: 'aq10_07',
    text: 'When I\'m reading a story, I find it difficult to work out the characters\' intentions.',
    scoringDirection: 'agree',
  },
  {
    id: 'aq10_08',
    text: 'I like to collect information about categories of things (e.g., types of car, types of bird, types of train, types of plant, etc.).',
    scoringDirection: 'agree',
  },
  {
    id: 'aq10_09',
    text: 'I find it easy to work out what someone is thinking or feeling just by looking at their face.',
    scoringDirection: 'disagree',
  },
  {
    id: 'aq10_10',
    text: 'I find it difficult to work out people\'s intentions.',
    scoringDirection: 'agree',
  },
];

export const AQ10_PREAMBLE =
  'Below are a list of statements. Please read each statement very carefully and rate how strongly you agree or disagree with it.';

export const AQ10_SCALE = {
  min: 0,
  max: 3,
  labels: [
    'Definitely agree',
    'Slightly agree',
    'Slightly disagree',
    'Definitely disagree',
  ],
};

/**
 * Scoring function for AQ-10.
 * For 'agree' items: "Definitely agree" (0) or "Slightly agree" (1) scores 1 point.
 * For 'disagree' items: "Slightly disagree" (2) or "Definitely disagree" (3) scores 1 point.
 */
export function scoreAQ10Item(
  question: AQ10Question,
  response: number
): number {
  if (question.scoringDirection === 'agree') {
    return response <= 1 ? 1 : 0;
  } else {
    return response >= 2 ? 1 : 0;
  }
}

export const AQ10_CUTOFF = {
  threshold: 6,
  description:
    'A score of 6 or above indicates that a referral for a specialist diagnostic assessment may be warranted.',
};
