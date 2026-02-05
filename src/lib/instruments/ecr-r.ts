/**
 * Experiences in Close Relationships-Revised (ECR-R)
 *
 * 36 items measuring adult attachment along two dimensions:
 * - Anxiety (fear of rejection/abandonment): 18 items
 * - Avoidance (discomfort with closeness/dependency): 18 items
 *
 * Rated on a 1-7 scale from "Strongly disagree" to "Strongly agree."
 *
 * References:
 * - Fraley, R. C., Waller, N. G., & Brennan, K. A. (2000). An item response
 *   theory analysis of self-report measures of adult attachment. Journal of
 *   Personality and Social Psychology, 78(2), 350-365.
 * - Fraley, R. C. (publicly available at www.yourpersonality.net)
 */

export interface ECRRQuestion {
  id: string;
  text: string;
  dimension: 'Anxiety' | 'Avoidance';
  reversed: boolean;
}

export const ECRR_QUESTIONS: ECRRQuestion[] = [
  // ============================================================
  // ANXIETY DIMENSION (18 items)
  // Fear of rejection, worry about the relationship, need for reassurance
  // ============================================================
  {
    id: 'ecrr_01',
    text: 'I\'m afraid that I will lose my partner\'s love.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_02',
    text: 'I often worry that my partner will not want to stay with me.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_03',
    text: 'I often worry that my partner doesn\'t really love me.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_04',
    text: 'I worry that romantic partners won\'t care about me as much as I care about them.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_05',
    text: 'I often wish that my partner\'s feelings for me were as strong as my feelings for him or her.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_06',
    text: 'I worry a lot about my relationships.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_07',
    text: 'When my partner is out of sight, I worry that he or she might become interested in someone else.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_08',
    text: 'When I show my feelings for romantic partners, I\'m afraid they will not feel the same about me.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_09',
    text: 'I rarely worry about my partner leaving me.',
    dimension: 'Anxiety',
    reversed: true,
  },
  {
    id: 'ecrr_10',
    text: 'My romantic partner makes me doubt myself.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_11',
    text: 'I do not often worry about being abandoned.',
    dimension: 'Anxiety',
    reversed: true,
  },
  {
    id: 'ecrr_12',
    text: 'I find that my partner(s) don\'t want to get as close as I would like.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_13',
    text: 'Sometimes romantic partners change their feelings about me for no apparent reason.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_14',
    text: 'My desire to be very close sometimes scares people away.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_15',
    text: 'I\'m afraid that once a romantic partner gets to know me, he or she won\'t like who I really am.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_16',
    text: 'It makes me mad that I don\'t get the affection and support I need from my partner.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_17',
    text: 'I worry that I won\'t measure up to other people.',
    dimension: 'Anxiety',
    reversed: false,
  },
  {
    id: 'ecrr_18',
    text: 'My partner only seems to notice me when I\'m angry.',
    dimension: 'Anxiety',
    reversed: false,
  },

  // ============================================================
  // AVOIDANCE DIMENSION (18 items)
  // Discomfort with closeness, reluctance to depend on others
  // ============================================================
  {
    id: 'ecrr_19',
    text: 'I prefer not to show a partner how I feel deep down.',
    dimension: 'Avoidance',
    reversed: false,
  },
  {
    id: 'ecrr_20',
    text: 'I feel comfortable sharing my private thoughts and feelings with my partner.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_21',
    text: 'I find it difficult to allow myself to depend on romantic partners.',
    dimension: 'Avoidance',
    reversed: false,
  },
  {
    id: 'ecrr_22',
    text: 'I am very comfortable being close to romantic partners.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_23',
    text: 'I don\'t feel comfortable opening up to romantic partners.',
    dimension: 'Avoidance',
    reversed: false,
  },
  {
    id: 'ecrr_24',
    text: 'I prefer not to be too close to romantic partners.',
    dimension: 'Avoidance',
    reversed: false,
  },
  {
    id: 'ecrr_25',
    text: 'I get uncomfortable when a romantic partner wants to be very close.',
    dimension: 'Avoidance',
    reversed: false,
  },
  {
    id: 'ecrr_26',
    text: 'I find it relatively easy to get close to my partner.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_27',
    text: 'It\'s not difficult for me to get close to my partner.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_28',
    text: 'I usually discuss my problems and concerns with my partner.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_29',
    text: 'It helps to turn to my romantic partner in times of need.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_30',
    text: 'I tell my partner just about everything.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_31',
    text: 'I talk things over with my partner.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_32',
    text: 'I am nervous when partners get too close to me.',
    dimension: 'Avoidance',
    reversed: false,
  },
  {
    id: 'ecrr_33',
    text: 'I feel comfortable depending on romantic partners.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_34',
    text: 'I find it easy to depend on romantic partners.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_35',
    text: 'It\'s easy for me to be affectionate with my partner.',
    dimension: 'Avoidance',
    reversed: true,
  },
  {
    id: 'ecrr_36',
    text: 'My partner really understands me and my needs.',
    dimension: 'Avoidance',
    reversed: true,
  },
];

export const ECRR_SCALE = {
  min: 1,
  max: 7,
  labels: [
    'Strongly disagree',
    'Disagree',
    'Slightly disagree',
    'Neutral',
    'Slightly agree',
    'Agree',
    'Strongly agree',
  ],
};

export const ECRR_DIMENSIONS = [
  {
    name: 'Anxiety',
    description: 'Fear of rejection, abandonment, and worry about the availability and responsiveness of attachment figures.',
  },
  {
    name: 'Avoidance',
    description: 'Discomfort with closeness and dependency, preference for emotional distance in intimate relationships.',
  },
];
