/**
 * Adverse Childhood Experiences (ACE) Questionnaire
 *
 * 10 items measuring exposure to adverse experiences during childhood
 * (before age 18). Binary scoring (Yes = 1, No = 0). Total score ranges
 * from 0 to 10.
 *
 * This instrument covers sensitive topics including abuse, neglect, and
 * household dysfunction. A content warning should be displayed before
 * administration.
 *
 * Scoring:
 *   0:   No reported ACEs
 *   1-3: Low-moderate ACE exposure
 *   4+:  High ACE exposure (associated with significantly elevated health risks)
 *
 * References:
 * - Felitti, V. J., et al. (1998). Relationship of childhood abuse and household
 *   dysfunction to many of the leading causes of death in adults: The Adverse
 *   Childhood Experiences (ACE) Study. American Journal of Preventive Medicine,
 *   14(4), 245-258.
 */

export interface ACEQuestion {
  id: string;
  text: string;
  category: 'Abuse' | 'Neglect' | 'Household Dysfunction';
}

export const ACE_CONTENT_WARNING = {
  title: 'Content Warning',
  message:
    'The following questions ask about difficult experiences that may have occurred during your childhood (before age 18). These questions cover topics including abuse, neglect, and household challenges. Please take your time and skip any question you are not comfortable answering. Your responses are confidential. If any of these questions bring up difficult feelings, we encourage you to reach out to a trusted person or mental health professional.',
  requiresAcknowledgment: true,
};

export const ACE_QUESTIONS: ACEQuestion[] = [
  // Abuse (3 items)
  {
    id: 'ace_01',
    text: 'Did a parent or other adult in the household often or very often swear at you, insult you, put you down, or humiliate you? Or act in a way that made you afraid that you might be physically hurt?',
    category: 'Abuse',
  },
  {
    id: 'ace_02',
    text: 'Did a parent or other adult in the household often or very often push, grab, slap, or throw something at you? Or ever hit you so hard that you had marks or were injured?',
    category: 'Abuse',
  },
  {
    id: 'ace_03',
    text: 'Did an adult or person at least 5 years older than you ever touch or fondle you or have you touch their body in a sexual way? Or attempt or actually have oral, anal, or vaginal intercourse with you?',
    category: 'Abuse',
  },

  // Neglect (2 items)
  {
    id: 'ace_04',
    text: 'Did you often or very often feel that no one in your family loved you or thought you were important or special? Or your family didn\'t look out for each other, feel close to each other, or support each other?',
    category: 'Neglect',
  },
  {
    id: 'ace_05',
    text: 'Did you often or very often feel that you didn\'t have enough to eat, had to wear dirty clothes, and had no one to protect you? Or your parents were too drunk or high to take care of you or take you to the doctor if you needed it?',
    category: 'Neglect',
  },

  // Household Dysfunction (5 items)
  {
    id: 'ace_06',
    text: 'Were your parents ever separated or divorced?',
    category: 'Household Dysfunction',
  },
  {
    id: 'ace_07',
    text: 'Was your mother or stepmother often or very often pushed, grabbed, slapped, or had something thrown at her? Or sometimes, often, or very often kicked, bitten, hit with a fist, or hit with something hard? Or ever repeatedly hit over at least a few minutes or threatened with a gun or knife?',
    category: 'Household Dysfunction',
  },
  {
    id: 'ace_08',
    text: 'Did you live with anyone who was a problem drinker or alcoholic, or who used street drugs?',
    category: 'Household Dysfunction',
  },
  {
    id: 'ace_09',
    text: 'Was a household member depressed or mentally ill, or did a household member attempt suicide?',
    category: 'Household Dysfunction',
  },
  {
    id: 'ace_10',
    text: 'Did a household member go to prison?',
    category: 'Household Dysfunction',
  },
];

export const ACE_PREAMBLE =
  'While you were growing up, during your first 18 years of life, did any of the following apply to you?';

export const ACE_SCALE = {
  min: 0,
  max: 1,
  labels: ['No', 'Yes'],
};

export const ACE_SEVERITY = [
  { min: 0, max: 0, label: 'None', description: 'No reported adverse childhood experiences' },
  { min: 1, max: 3, label: 'Low-Moderate', description: 'Some adverse childhood experiences reported' },
  { min: 4, max: 10, label: 'High', description: 'Elevated ACE score associated with increased health risks' },
];
