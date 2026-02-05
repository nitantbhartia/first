/**
 * Primary Care PTSD Screen for DSM-5 (PC-PTSD-5)
 *
 * A 5-item screen designed to identify individuals with probable PTSD in
 * primary care settings. Binary scoring (Yes = 1, No = 0).
 *
 * The PC-PTSD-5 is in the public domain, developed by the U.S. Department
 * of Veterans Affairs (VA) National Center for PTSD.
 *
 * Scoring:
 * A score of 3 or higher suggests probable PTSD and warrants further assessment.
 * In some settings, a cut-point of 4 is used to improve specificity.
 *
 * References:
 * - Prins, A., et al. (2016). The Primary Care PTSD Screen for DSM-5
 *   (PC-PTSD-5): Development and evaluation within a veteran primary care
 *   sample. Journal of General Internal Medicine, 31(10), 1206-1211.
 */

export interface PCPTSD5Question {
  id: string;
  text: string;
  symptomCluster: string;
}

export const PCPTSD5_PREAMBLE =
  'Sometimes things happen to people that are unusually or especially frightening, horrible, or traumatic. For example: a serious accident or fire, a physical or sexual assault or abuse, an earthquake or flood, a war, seeing someone be killed or seriously injured, having a loved one die through homicide or suicide. Have you ever experienced this kind of event?';

export const PCPTSD5_FOLLOWUP_INTRO =
  'If yes: In the past month, have you...';

export const PCPTSD5_QUESTIONS: PCPTSD5Question[] = [
  {
    id: 'pcptsd5_01',
    text: 'Had nightmares about the event(s) or thought about the event(s) when you did not want to?',
    symptomCluster: 'Re-experiencing',
  },
  {
    id: 'pcptsd5_02',
    text: 'Tried hard not to think about the event(s) or went out of your way to avoid situations that reminded you of the event(s)?',
    symptomCluster: 'Avoidance',
  },
  {
    id: 'pcptsd5_03',
    text: 'Been constantly on guard, watchful, or easily startled?',
    symptomCluster: 'Arousal',
  },
  {
    id: 'pcptsd5_04',
    text: 'Felt numb or detached from people, activities, or your surroundings?',
    symptomCluster: 'Numbing',
  },
  {
    id: 'pcptsd5_05',
    text: 'Felt guilty or unable to stop blaming yourself or others for the event(s) or any problems the event(s) may have caused?',
    symptomCluster: 'Negative Cognitions',
  },
];

export const PCPTSD5_SCALE = {
  min: 0,
  max: 1,
  labels: ['No', 'Yes'],
};

export const PCPTSD5_CUTOFFS = {
  probable: 3,
  highSpecificity: 4,
  description:
    'A score of 3 or higher suggests probable PTSD. A score of 4 or higher has higher specificity.',
};
