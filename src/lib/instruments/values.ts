/**
 * Values Assessment based on Schwartz's Portrait Values Questionnaire (PVQ)
 *
 * A public domain adaptation measuring 10 basic human value dimensions from
 * Schwartz's Theory of Basic Human Values. 21 items on a 1-6 scale.
 *
 * Each item is a brief portrait of a person. Respondents rate how similar
 * the described person is to themselves.
 *
 * The 10 value dimensions:
 * 1. Self-Direction - Independent thought and action
 * 2. Stimulation - Excitement, novelty, challenge
 * 3. Hedonism - Pleasure and sensuous gratification
 * 4. Achievement - Personal success through competence
 * 5. Power - Social status, prestige, dominance
 * 6. Security - Safety, harmony, stability
 * 7. Conformity - Restraint from actions that violate social norms
 * 8. Tradition - Respect and commitment to cultural/religious customs
 * 9. Benevolence - Concern for the welfare of close others
 * 10. Universalism - Understanding, tolerance, protection for all people and nature
 *
 * References:
 * - Schwartz, S. H. (2003). A proposal for measuring value orientations across
 *   nations. Questionnaire Package of the European Social Survey, 259-290.
 * - Schwartz, S. H. (1992). Universals in the content and structure of values:
 *   Theoretical advances and empirical tests in 20 countries. Advances in
 *   Experimental Social Psychology, 25, 1-65.
 * - European Social Survey (ESS) PVQ-21 (public domain)
 */

export interface ValuesQuestion {
  id: string;
  text: string;
  valueDimension: string;
}

export const VALUES_QUESTIONS: ValuesQuestion[] = [
  // Self-Direction (2 items)
  {
    id: 'val_01',
    text: 'Thinking up new ideas and being creative is important to this person. They like to do things in their own original way.',
    valueDimension: 'Self-Direction',
  },
  {
    id: 'val_02',
    text: 'It is important to this person to make their own decisions about what they do. They like to be free and not depend on others.',
    valueDimension: 'Self-Direction',
  },

  // Stimulation (2 items)
  {
    id: 'val_03',
    text: 'This person thinks it is important to do lots of different things in life. They always look for new things to try.',
    valueDimension: 'Stimulation',
  },
  {
    id: 'val_04',
    text: 'This person likes surprises and is always looking for new things to do. They think it is important to do lots of different things in life.',
    valueDimension: 'Stimulation',
  },

  // Hedonism (2 items)
  {
    id: 'val_05',
    text: 'Having a good time is important to this person. They like to "spoil" themselves.',
    valueDimension: 'Hedonism',
  },
  {
    id: 'val_06',
    text: 'This person seeks every chance to have fun. It is important to them to do things that give them pleasure.',
    valueDimension: 'Hedonism',
  },

  // Achievement (2 items)
  {
    id: 'val_07',
    text: 'It is important to this person to show their abilities. They want people to admire what they do.',
    valueDimension: 'Achievement',
  },
  {
    id: 'val_08',
    text: 'Being very successful is important to this person. They hope people will recognize their achievements.',
    valueDimension: 'Achievement',
  },

  // Power (2 items)
  {
    id: 'val_09',
    text: 'It is important to this person to be rich. They want to have a lot of money and expensive things.',
    valueDimension: 'Power',
  },
  {
    id: 'val_10',
    text: 'It is important to this person that people do what they say. They want to be in charge and tell others what to do.',
    valueDimension: 'Power',
  },

  // Security (2 items)
  {
    id: 'val_11',
    text: 'It is important to this person to live in secure surroundings. They avoid anything that might endanger their safety.',
    valueDimension: 'Security',
  },
  {
    id: 'val_12',
    text: 'It is important to this person that the government ensures their safety against all threats. They want the state to be strong so it can defend its citizens.',
    valueDimension: 'Security',
  },

  // Conformity (2 items)
  {
    id: 'val_13',
    text: 'This person believes that people should do what they are told. They think people should follow rules at all times, even when no one is watching.',
    valueDimension: 'Conformity',
  },
  {
    id: 'val_14',
    text: 'It is important to this person always to behave properly. They want to avoid doing anything people would say is wrong.',
    valueDimension: 'Conformity',
  },

  // Tradition (2 items)
  {
    id: 'val_15',
    text: 'Tradition is important to this person. They try to follow the customs handed down by their religion or family.',
    valueDimension: 'Tradition',
  },
  {
    id: 'val_16',
    text: 'It is important to this person to be humble and modest. They try not to draw attention to themselves.',
    valueDimension: 'Tradition',
  },

  // Benevolence (2 items)
  {
    id: 'val_17',
    text: 'It is important to this person to help the people around them. They want to care for the well-being of those they know.',
    valueDimension: 'Benevolence',
  },
  {
    id: 'val_18',
    text: 'It is very important to this person to be loyal to their friends. They want to devote themselves to people close to them.',
    valueDimension: 'Benevolence',
  },

  // Universalism (3 items)
  {
    id: 'val_19',
    text: 'This person strongly believes that people should care for nature. Looking after the environment is important to them.',
    valueDimension: 'Universalism',
  },
  {
    id: 'val_20',
    text: 'It is important to this person to listen to people who are different from them. Even when they disagree with someone, they still want to understand them.',
    valueDimension: 'Universalism',
  },
  {
    id: 'val_21',
    text: 'This person believes all the worlds people should live in harmony. Promoting peace among all groups in the world is important to them.',
    valueDimension: 'Universalism',
  },
];

export const VALUES_PREAMBLE =
  'Here we briefly describe different people. Please read each description and think about how much each person is or is not like you.';

export const VALUES_SCALE = {
  min: 1,
  max: 6,
  labels: [
    'Not like me at all',
    'Not like me',
    'A little like me',
    'Somewhat like me',
    'Like me',
    'Very much like me',
  ],
};

export const VALUES_DIMENSIONS = [
  {
    id: 'Self-Direction',
    name: 'Self-Direction',
    description: 'Independent thought and action - choosing, creating, exploring.',
    higherOrder: 'Openness to Change',
  },
  {
    id: 'Stimulation',
    name: 'Stimulation',
    description: 'Excitement, novelty, and challenge in life.',
    higherOrder: 'Openness to Change',
  },
  {
    id: 'Hedonism',
    name: 'Hedonism',
    description: 'Pleasure and sensuous gratification for oneself.',
    higherOrder: 'Openness to Change',
  },
  {
    id: 'Achievement',
    name: 'Achievement',
    description: 'Personal success through demonstrating competence according to social standards.',
    higherOrder: 'Self-Enhancement',
  },
  {
    id: 'Power',
    name: 'Power',
    description: 'Social status and prestige, control or dominance over people and resources.',
    higherOrder: 'Self-Enhancement',
  },
  {
    id: 'Security',
    name: 'Security',
    description: 'Safety, harmony, and stability of society, relationships, and self.',
    higherOrder: 'Conservation',
  },
  {
    id: 'Conformity',
    name: 'Conformity',
    description: 'Restraint of actions, inclinations, and impulses likely to upset or harm others and violate social expectations or norms.',
    higherOrder: 'Conservation',
  },
  {
    id: 'Tradition',
    name: 'Tradition',
    description: 'Respect, commitment, and acceptance of the customs and ideas that traditional culture or religion provide.',
    higherOrder: 'Conservation',
  },
  {
    id: 'Benevolence',
    name: 'Benevolence',
    description: 'Preserving and enhancing the welfare of those with whom one is in frequent personal contact.',
    higherOrder: 'Self-Transcendence',
  },
  {
    id: 'Universalism',
    name: 'Universalism',
    description: 'Understanding, appreciation, tolerance, and protection for the welfare of all people and for nature.',
    higherOrder: 'Self-Transcendence',
  },
];
