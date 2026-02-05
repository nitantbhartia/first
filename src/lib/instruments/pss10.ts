/**
 * Perceived Stress Scale (PSS-10)
 *
 * 10-item scale measuring the degree to which situations in one's life are
 * appraised as stressful over the past month. Rated on a 0-4 scale.
 *
 * 4 items are reverse-scored (items 4, 5, 7, 8).
 *
 * The PSS is in the public domain.
 *
 * Scoring:
 *   0-13:  Low stress
 *   14-26: Moderate stress
 *   27-40: High perceived stress
 *
 * References:
 * - Cohen, S., Kamarck, T., & Mermelstein, R. (1983). A global measure of
 *   perceived stress. Journal of Health and Social Behavior, 24(4), 385-396.
 * - Cohen, S., & Williamson, G. (1988). Perceived stress in a probability
 *   sample of the United States. In S. Spacapan & S. Oskamp (Eds.), The Social
 *   Psychology of Health. Sage.
 */

export interface PSS10Question {
  id: string;
  text: string;
  reversed: boolean;
}

export const PSS10_QUESTIONS: PSS10Question[] = [
  {
    id: 'pss10_01',
    text: 'In the last month, how often have you been upset because of something that happened unexpectedly?',
    reversed: false,
  },
  {
    id: 'pss10_02',
    text: 'In the last month, how often have you felt that you were unable to control the important things in your life?',
    reversed: false,
  },
  {
    id: 'pss10_03',
    text: 'In the last month, how often have you felt nervous and stressed?',
    reversed: false,
  },
  {
    id: 'pss10_04',
    text: 'In the last month, how often have you felt confident about your ability to handle your personal problems?',
    reversed: true,
  },
  {
    id: 'pss10_05',
    text: 'In the last month, how often have you felt that things were going your way?',
    reversed: true,
  },
  {
    id: 'pss10_06',
    text: 'In the last month, how often have you found that you could not cope with all the things that you had to do?',
    reversed: false,
  },
  {
    id: 'pss10_07',
    text: 'In the last month, how often have you been able to control irritations in your life?',
    reversed: true,
  },
  {
    id: 'pss10_08',
    text: 'In the last month, how often have you felt that you were on top of things?',
    reversed: true,
  },
  {
    id: 'pss10_09',
    text: 'In the last month, how often have you been angered because of things that were outside of your control?',
    reversed: false,
  },
  {
    id: 'pss10_10',
    text: 'In the last month, how often have you felt difficulties were piling up so high that you could not overcome them?',
    reversed: false,
  },
];

export const PSS10_PREAMBLE =
  'The questions in this scale ask you about your feelings and thoughts during the last month. In each case, please indicate how often you felt or thought a certain way.';

export const PSS10_SCALE = {
  min: 0,
  max: 4,
  labels: [
    'Never',
    'Almost never',
    'Sometimes',
    'Fairly often',
    'Very often',
  ],
};

export const PSS10_SEVERITY = [
  { min: 0, max: 13, label: 'Low', description: 'Low perceived stress' },
  { min: 14, max: 26, label: 'Moderate', description: 'Moderate perceived stress' },
  { min: 27, max: 40, label: 'High', description: 'High perceived stress' },
];
