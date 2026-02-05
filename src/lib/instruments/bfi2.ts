/**
 * Big Five Inventory-2 (BFI-2)
 *
 * Based on IPIP-NEO public domain items representing the Big Five personality
 * domains and their facets. 60 items on a 1-5 Likert scale.
 *
 * Domains: Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism
 * Each domain has 3 facets, 4 items per facet (12 items per domain).
 *
 * References:
 * - Soto, C. J., & John, O. P. (2017). The next Big Five Inventory (BFI-2).
 *   Journal of Personality and Social Psychology, 113(1), 117-143.
 * - IPIP-NEO (International Personality Item Pool): https://ipip.ori.org/
 *
 * Items below are drawn from the IPIP public domain item pool.
 */

export interface InstrumentQuestion {
  id: string;
  text: string;
  domain: string;
  facet: string;
  reversed: boolean;
}

export const BFI2_QUESTIONS: InstrumentQuestion[] = [
  // ============================================================
  // EXTRAVERSION (12 items)
  // Facets: Sociability, Assertiveness, Energy Level
  // ============================================================

  // Sociability
  {
    id: 'bfi2_01',
    text: 'I am the life of the party.',
    domain: 'Extraversion',
    facet: 'Sociability',
    reversed: false,
  },
  {
    id: 'bfi2_02',
    text: 'I don\'t talk a lot.',
    domain: 'Extraversion',
    facet: 'Sociability',
    reversed: true,
  },
  {
    id: 'bfi2_03',
    text: 'I talk to a lot of different people at parties.',
    domain: 'Extraversion',
    facet: 'Sociability',
    reversed: false,
  },
  {
    id: 'bfi2_04',
    text: 'I keep in the background.',
    domain: 'Extraversion',
    facet: 'Sociability',
    reversed: true,
  },

  // Assertiveness
  {
    id: 'bfi2_05',
    text: 'I take charge of situations.',
    domain: 'Extraversion',
    facet: 'Assertiveness',
    reversed: false,
  },
  {
    id: 'bfi2_06',
    text: 'I have little to say.',
    domain: 'Extraversion',
    facet: 'Assertiveness',
    reversed: true,
  },
  {
    id: 'bfi2_07',
    text: 'I start conversations.',
    domain: 'Extraversion',
    facet: 'Assertiveness',
    reversed: false,
  },
  {
    id: 'bfi2_08',
    text: 'I wait for others to lead the way.',
    domain: 'Extraversion',
    facet: 'Assertiveness',
    reversed: true,
  },

  // Energy Level
  {
    id: 'bfi2_09',
    text: 'I am full of energy.',
    domain: 'Extraversion',
    facet: 'Energy Level',
    reversed: false,
  },
  {
    id: 'bfi2_10',
    text: 'I often feel tired and sluggish.',
    domain: 'Extraversion',
    facet: 'Energy Level',
    reversed: true,
  },
  {
    id: 'bfi2_11',
    text: 'I am enthusiastic about things.',
    domain: 'Extraversion',
    facet: 'Energy Level',
    reversed: false,
  },
  {
    id: 'bfi2_12',
    text: 'I have a low energy level.',
    domain: 'Extraversion',
    facet: 'Energy Level',
    reversed: true,
  },

  // ============================================================
  // AGREEABLENESS (12 items)
  // Facets: Compassion, Respectfulness, Trust
  // ============================================================

  // Compassion
  {
    id: 'bfi2_13',
    text: 'I sympathize with others\' feelings.',
    domain: 'Agreeableness',
    facet: 'Compassion',
    reversed: false,
  },
  {
    id: 'bfi2_14',
    text: 'I am not really interested in others.',
    domain: 'Agreeableness',
    facet: 'Compassion',
    reversed: true,
  },
  {
    id: 'bfi2_15',
    text: 'I feel others\' emotions.',
    domain: 'Agreeableness',
    facet: 'Compassion',
    reversed: false,
  },
  {
    id: 'bfi2_16',
    text: 'I am not interested in other people\'s problems.',
    domain: 'Agreeableness',
    facet: 'Compassion',
    reversed: true,
  },

  // Respectfulness
  {
    id: 'bfi2_17',
    text: 'I respect others\' opinions and viewpoints.',
    domain: 'Agreeableness',
    facet: 'Respectfulness',
    reversed: false,
  },
  {
    id: 'bfi2_18',
    text: 'I insult people.',
    domain: 'Agreeableness',
    facet: 'Respectfulness',
    reversed: true,
  },
  {
    id: 'bfi2_19',
    text: 'I treat people with courtesy and respect.',
    domain: 'Agreeableness',
    facet: 'Respectfulness',
    reversed: false,
  },
  {
    id: 'bfi2_20',
    text: 'I can be rude and dismissive toward others.',
    domain: 'Agreeableness',
    facet: 'Respectfulness',
    reversed: true,
  },

  // Trust
  {
    id: 'bfi2_21',
    text: 'I trust what people say.',
    domain: 'Agreeableness',
    facet: 'Trust',
    reversed: false,
  },
  {
    id: 'bfi2_22',
    text: 'I suspect hidden motives in others.',
    domain: 'Agreeableness',
    facet: 'Trust',
    reversed: true,
  },
  {
    id: 'bfi2_23',
    text: 'I believe that people are basically well-intentioned.',
    domain: 'Agreeableness',
    facet: 'Trust',
    reversed: false,
  },
  {
    id: 'bfi2_24',
    text: 'I distrust people.',
    domain: 'Agreeableness',
    facet: 'Trust',
    reversed: true,
  },

  // ============================================================
  // CONSCIENTIOUSNESS (12 items)
  // Facets: Organization, Productiveness, Responsibility
  // ============================================================

  // Organization
  {
    id: 'bfi2_25',
    text: 'I like order and regularity.',
    domain: 'Conscientiousness',
    facet: 'Organization',
    reversed: false,
  },
  {
    id: 'bfi2_26',
    text: 'I leave my belongings around.',
    domain: 'Conscientiousness',
    facet: 'Organization',
    reversed: true,
  },
  {
    id: 'bfi2_27',
    text: 'I keep things tidy.',
    domain: 'Conscientiousness',
    facet: 'Organization',
    reversed: false,
  },
  {
    id: 'bfi2_28',
    text: 'I make a mess of things.',
    domain: 'Conscientiousness',
    facet: 'Organization',
    reversed: true,
  },

  // Productiveness
  {
    id: 'bfi2_29',
    text: 'I get chores done right away.',
    domain: 'Conscientiousness',
    facet: 'Productiveness',
    reversed: false,
  },
  {
    id: 'bfi2_30',
    text: 'I waste my time.',
    domain: 'Conscientiousness',
    facet: 'Productiveness',
    reversed: true,
  },
  {
    id: 'bfi2_31',
    text: 'I carry out my plans.',
    domain: 'Conscientiousness',
    facet: 'Productiveness',
    reversed: false,
  },
  {
    id: 'bfi2_32',
    text: 'I find it difficult to get down to work.',
    domain: 'Conscientiousness',
    facet: 'Productiveness',
    reversed: true,
  },

  // Responsibility
  {
    id: 'bfi2_33',
    text: 'I keep my promises.',
    domain: 'Conscientiousness',
    facet: 'Responsibility',
    reversed: false,
  },
  {
    id: 'bfi2_34',
    text: 'I shirk my duties.',
    domain: 'Conscientiousness',
    facet: 'Responsibility',
    reversed: true,
  },
  {
    id: 'bfi2_35',
    text: 'I am a reliable person.',
    domain: 'Conscientiousness',
    facet: 'Responsibility',
    reversed: false,
  },
  {
    id: 'bfi2_36',
    text: 'I do just enough work to get by.',
    domain: 'Conscientiousness',
    facet: 'Responsibility',
    reversed: true,
  },

  // ============================================================
  // NEUROTICISM (12 items)
  // Facets: Anxiety, Depression, Emotional Volatility
  // ============================================================

  // Anxiety
  {
    id: 'bfi2_37',
    text: 'I worry about things.',
    domain: 'Neuroticism',
    facet: 'Anxiety',
    reversed: false,
  },
  {
    id: 'bfi2_38',
    text: 'I am relaxed most of the time.',
    domain: 'Neuroticism',
    facet: 'Anxiety',
    reversed: true,
  },
  {
    id: 'bfi2_39',
    text: 'I get stressed out easily.',
    domain: 'Neuroticism',
    facet: 'Anxiety',
    reversed: false,
  },
  {
    id: 'bfi2_40',
    text: 'I seldom feel anxious.',
    domain: 'Neuroticism',
    facet: 'Anxiety',
    reversed: true,
  },

  // Depression
  {
    id: 'bfi2_41',
    text: 'I often feel sad.',
    domain: 'Neuroticism',
    facet: 'Depression',
    reversed: false,
  },
  {
    id: 'bfi2_42',
    text: 'I feel comfortable with myself.',
    domain: 'Neuroticism',
    facet: 'Depression',
    reversed: true,
  },
  {
    id: 'bfi2_43',
    text: 'I am filled with doubts about things.',
    domain: 'Neuroticism',
    facet: 'Depression',
    reversed: false,
  },
  {
    id: 'bfi2_44',
    text: 'I feel satisfied with myself most of the time.',
    domain: 'Neuroticism',
    facet: 'Depression',
    reversed: true,
  },

  // Emotional Volatility
  {
    id: 'bfi2_45',
    text: 'I have frequent mood swings.',
    domain: 'Neuroticism',
    facet: 'Emotional Volatility',
    reversed: false,
  },
  {
    id: 'bfi2_46',
    text: 'I am not easily bothered by things.',
    domain: 'Neuroticism',
    facet: 'Emotional Volatility',
    reversed: true,
  },
  {
    id: 'bfi2_47',
    text: 'I get upset easily.',
    domain: 'Neuroticism',
    facet: 'Emotional Volatility',
    reversed: false,
  },
  {
    id: 'bfi2_48',
    text: 'I keep my emotions under control.',
    domain: 'Neuroticism',
    facet: 'Emotional Volatility',
    reversed: true,
  },

  // ============================================================
  // OPENNESS (12 items)
  // Facets: Intellectual Curiosity, Aesthetic Sensitivity, Creative Imagination
  // ============================================================

  // Intellectual Curiosity
  {
    id: 'bfi2_49',
    text: 'I am curious about many different things.',
    domain: 'Openness',
    facet: 'Intellectual Curiosity',
    reversed: false,
  },
  {
    id: 'bfi2_50',
    text: 'I have difficulty understanding abstract ideas.',
    domain: 'Openness',
    facet: 'Intellectual Curiosity',
    reversed: true,
  },
  {
    id: 'bfi2_51',
    text: 'I enjoy thinking about complex problems.',
    domain: 'Openness',
    facet: 'Intellectual Curiosity',
    reversed: false,
  },
  {
    id: 'bfi2_52',
    text: 'I avoid philosophical discussions.',
    domain: 'Openness',
    facet: 'Intellectual Curiosity',
    reversed: true,
  },

  // Aesthetic Sensitivity
  {
    id: 'bfi2_53',
    text: 'I see beauty in things that others might not notice.',
    domain: 'Openness',
    facet: 'Aesthetic Sensitivity',
    reversed: false,
  },
  {
    id: 'bfi2_54',
    text: 'I am not interested in art or beauty.',
    domain: 'Openness',
    facet: 'Aesthetic Sensitivity',
    reversed: true,
  },
  {
    id: 'bfi2_55',
    text: 'I believe in the importance of art.',
    domain: 'Openness',
    facet: 'Aesthetic Sensitivity',
    reversed: false,
  },
  {
    id: 'bfi2_56',
    text: 'I do not enjoy going to art museums.',
    domain: 'Openness',
    facet: 'Aesthetic Sensitivity',
    reversed: true,
  },

  // Creative Imagination
  {
    id: 'bfi2_57',
    text: 'I have a vivid imagination.',
    domain: 'Openness',
    facet: 'Creative Imagination',
    reversed: false,
  },
  {
    id: 'bfi2_58',
    text: 'I do not have a good imagination.',
    domain: 'Openness',
    facet: 'Creative Imagination',
    reversed: true,
  },
  {
    id: 'bfi2_59',
    text: 'I enjoy coming up with new ideas and solutions.',
    domain: 'Openness',
    facet: 'Creative Imagination',
    reversed: false,
  },
  {
    id: 'bfi2_60',
    text: 'I have few creative interests.',
    domain: 'Openness',
    facet: 'Creative Imagination',
    reversed: true,
  },
];

export const BFI2_SCALE = {
  min: 1,
  max: 5,
  labels: [
    'Disagree strongly',
    'Disagree a little',
    'Neutral',
    'Agree a little',
    'Agree strongly',
  ],
};

export const BFI2_DOMAINS = [
  {
    name: 'Extraversion',
    facets: ['Sociability', 'Assertiveness', 'Energy Level'],
  },
  {
    name: 'Agreeableness',
    facets: ['Compassion', 'Respectfulness', 'Trust'],
  },
  {
    name: 'Conscientiousness',
    facets: ['Organization', 'Productiveness', 'Responsibility'],
  },
  {
    name: 'Neuroticism',
    facets: ['Anxiety', 'Depression', 'Emotional Volatility'],
  },
  {
    name: 'Openness',
    facets: ['Intellectual Curiosity', 'Aesthetic Sensitivity', 'Creative Imagination'],
  },
];
