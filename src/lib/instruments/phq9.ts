/**
 * Patient Health Questionnaire-9 (PHQ-9)
 *
 * A 9-item depression screening instrument. Each item is rated on a 0-3 scale
 * measuring frequency of symptoms over the past two weeks.
 *
 * The PHQ-9 is in the public domain. No permission is required to reproduce,
 * translate, display, or distribute.
 *
 * Scoring:
 *   0-4:   Minimal depression
 *   5-9:   Mild depression
 *   10-14: Moderate depression
 *   15-19: Moderately severe depression
 *   20-27: Severe depression
 *
 * References:
 * - Kroenke, K., Spitzer, R. L., & Williams, J. B. (2001). The PHQ-9: validity
 *   of a brief depression severity measure. Journal of General Internal Medicine,
 *   16(9), 606-613.
 */

export interface PHQ9Question {
  id: string;
  text: string;
  isCrisisItem: boolean;
}

export const PHQ9_QUESTIONS: PHQ9Question[] = [
  {
    id: 'phq9_01',
    text: 'Little interest or pleasure in doing things.',
    isCrisisItem: false,
  },
  {
    id: 'phq9_02',
    text: 'Feeling down, depressed, or hopeless.',
    isCrisisItem: false,
  },
  {
    id: 'phq9_03',
    text: 'Trouble falling or staying asleep, or sleeping too much.',
    isCrisisItem: false,
  },
  {
    id: 'phq9_04',
    text: 'Feeling tired or having little energy.',
    isCrisisItem: false,
  },
  {
    id: 'phq9_05',
    text: 'Poor appetite or overeating.',
    isCrisisItem: false,
  },
  {
    id: 'phq9_06',
    text: 'Feeling bad about yourself - or that you are a failure or have let yourself or your family down.',
    isCrisisItem: false,
  },
  {
    id: 'phq9_07',
    text: 'Trouble concentrating on things, such as reading the newspaper or watching television.',
    isCrisisItem: false,
  },
  {
    id: 'phq9_08',
    text: 'Moving or speaking so slowly that other people could have noticed. Or the opposite - being so fidgety or restless that you have been moving around a lot more than usual.',
    isCrisisItem: false,
  },
  {
    id: 'phq9_09',
    text: 'Thoughts that you would be better off dead, or of hurting yourself in some way.',
    isCrisisItem: true,
  },
];

export const PHQ9_PREAMBLE =
  'Over the last 2 weeks, how often have you been bothered by any of the following problems?';

export const PHQ9_SCALE = {
  min: 0,
  max: 3,
  labels: [
    'Not at all',
    'Several days',
    'More than half the days',
    'Nearly every day',
  ],
};

export const PHQ9_SEVERITY = [
  { min: 0, max: 4, label: 'Minimal', description: 'Minimal depression' },
  { min: 5, max: 9, label: 'Mild', description: 'Mild depression' },
  { min: 10, max: 14, label: 'Moderate', description: 'Moderate depression' },
  { min: 15, max: 19, label: 'Moderately Severe', description: 'Moderately severe depression' },
  { min: 20, max: 27, label: 'Severe', description: 'Severe depression' },
];

export const PHQ9_CRISIS_RESOURCES = {
  message:
    'If you are having thoughts of hurting yourself, please reach out for help immediately.',
  resources: [
    { name: '988 Suicide & Crisis Lifeline', contact: 'Call or text 988' },
    { name: 'Crisis Text Line', contact: 'Text HOME to 741741' },
    { name: 'Emergency Services', contact: 'Call 911' },
  ],
};
