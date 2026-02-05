/**
 * Generalized Anxiety Disorder 7-item scale (GAD-7)
 *
 * A 7-item anxiety screening instrument. Each item is rated on a 0-3 scale
 * measuring frequency of symptoms over the past two weeks.
 *
 * The GAD-7 is in the public domain. No permission is required to reproduce,
 * translate, display, or distribute.
 *
 * Scoring:
 *   0-4:   Minimal anxiety
 *   5-9:   Mild anxiety
 *   10-14: Moderate anxiety
 *   15-21: Severe anxiety
 *
 * References:
 * - Spitzer, R. L., Kroenke, K., Williams, J. B., & Löwe, B. (2006). A brief
 *   measure for assessing generalized anxiety disorder: the GAD-7. Archives of
 *   Internal Medicine, 166(10), 1092-1097.
 */

export interface GAD7Question {
  id: string;
  text: string;
}

export const GAD7_QUESTIONS: GAD7Question[] = [
  {
    id: 'gad7_01',
    text: 'Feeling nervous, anxious, or on edge.',
  },
  {
    id: 'gad7_02',
    text: 'Not being able to stop or control worrying.',
  },
  {
    id: 'gad7_03',
    text: 'Worrying too much about different things.',
  },
  {
    id: 'gad7_04',
    text: 'Trouble relaxing.',
  },
  {
    id: 'gad7_05',
    text: 'Being so restless that it is hard to sit still.',
  },
  {
    id: 'gad7_06',
    text: 'Becoming easily annoyed or irritable.',
  },
  {
    id: 'gad7_07',
    text: 'Feeling afraid, as if something awful might happen.',
  },
];

export const GAD7_PREAMBLE =
  'Over the last 2 weeks, how often have you been bothered by the following problems?';

export const GAD7_SCALE = {
  min: 0,
  max: 3,
  labels: [
    'Not at all',
    'Several days',
    'More than half the days',
    'Nearly every day',
  ],
};

export const GAD7_SEVERITY = [
  { min: 0, max: 4, label: 'Minimal', description: 'Minimal anxiety' },
  { min: 5, max: 9, label: 'Mild', description: 'Mild anxiety' },
  { min: 10, max: 14, label: 'Moderate', description: 'Moderate anxiety' },
  { min: 15, max: 21, label: 'Severe', description: 'Severe anxiety' },
];
