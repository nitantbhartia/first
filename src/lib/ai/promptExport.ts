export interface ScoreData {
  instrument: string;
  rawScore: number;
  maxScore: number;
  severity: string;
  percentile?: number;
  facets?: Record<string, { score: number; maxScore: number; label: string }>;
  interpretation: string;
}

export function generateAIPrompt(scores: Record<string, ScoreData>, ageRange?: string, gender?: string): string {
  const scoreLines = Object.entries(scores).map(([, score]) => {
    let line = `- ${score.instrument}: ${score.rawScore}/${score.maxScore} (${score.severity})`;
    if (score.percentile) line += ` — ${score.percentile}th percentile`;
    if (score.facets) {
      const facetDetails = Object.entries(score.facets)
        .map(([, facet]) => `  - ${facet.label}: ${facet.score}/${facet.maxScore}`)
        .join('\n');
      line += '\n' + facetDetails;
    }
    return line;
  }).join('\n');

  return `You are a knowledgeable and empathetic psychological assistant. The following individual has completed a comprehensive personality assessment using multiple clinically-validated screening instruments. Use this data to provide personalized, insightful responses to their questions.

IMPORTANT: You are NOT a therapist and cannot provide clinical diagnoses. You can help the individual explore their results, understand patterns, and consider how their profile affects different areas of their life. Always encourage professional consultation for clinical concerns.

=== PSYCHOLOGICAL PROFILE ===

${ageRange ? `Age Range: ${ageRange}` : ''}
${gender ? `Gender: ${gender}` : ''}

Assessment Results:
${scoreLines}

=== END PROFILE ===

Guidelines for responding:
1. Reference specific scores and what they mean when relevant
2. Make connections across instruments (e.g., how personality traits interact with attachment style)
3. Be warm, insightful, and specific — avoid generic advice
4. When discussing mental health screening results, note that these are screening-level results, not diagnoses
5. Suggest evidence-based strategies that match this person's specific profile
6. If the person asks about relationship dynamics, use attachment and personality data to provide nuanced insights

Suggested questions you can explore:
- "How does my personality affect my relationships?"
- "What career paths might suit my profile?"
- "Why do I keep repeating the same patterns?"
- "What therapy approach would work best for me?"
- "How do my ADHD traits interact with my anxiety?"
- "What are my biggest strengths based on this data?"
- "What should I work on first?"

The individual may now ask you questions. Respond thoughtfully using their profile data.`;
}

export function generateClinicalExport(scores: Record<string, ScoreData>): string {
  const now = new Date().toISOString().split('T')[0];

  const instrumentRows = Object.entries(scores).map(([, score]) => {
    return `| ${score.instrument} | ${score.rawScore} | ${score.maxScore} | ${score.severity} | ${score.percentile ? score.percentile + 'th' : 'N/A'} |`;
  }).join('\n');

  return `DEEP PERSONALITY — CLINICAL SCREENING REPORT
Generated: ${now}
Report Type: Clinical Reference (for licensed mental health practitioners)

DISCLAIMER: This report contains screening-level results from self-administered validated instruments. These results are NOT clinical diagnoses. They are intended to assist qualified mental health professionals in treatment planning and should be interpreted in the context of a comprehensive clinical evaluation.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SCREENING RESULTS SUMMARY

| Instrument | Raw Score | Max Score | Severity | Percentile |
|------------|-----------|-----------|----------|------------|
${instrumentRows}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUMENT DETAILS

${Object.entries(scores).map(([, score]) => {
  let detail = `## ${score.instrument}
Score: ${score.rawScore}/${score.maxScore}
Classification: ${score.severity}
${score.interpretation}`;

  if (score.facets) {
    detail += '\n\nFacet Scores:';
    Object.entries(score.facets).forEach(([, facet]) => {
      detail += `\n  ${facet.label}: ${facet.score}/${facet.maxScore}`;
    });
  }

  return detail;
}).join('\n\n---\n\n')}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

FLAGGED AREAS REQUIRING FOLLOW-UP

${Object.entries(scores)
  .filter(([, score]) => ['moderate', 'moderate_severe', 'severe', 'high', 'positive'].includes(score.severity))
  .map(([, score]) => `⚠ ${score.instrument}: ${score.severity} — Professional evaluation recommended`)
  .join('\n') || 'No areas flagged at moderate or above threshold.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INSTRUMENT CITATIONS

- PHQ-9: Kroenke K, Spitzer RL, Williams JB. The PHQ-9: validity of a brief depression severity measure. J Gen Intern Med. 2001;16(9):606-613.
- GAD-7: Spitzer RL, Kroenke K, Williams JBW, Löwe B. A brief measure for assessing generalized anxiety disorder. Arch Intern Med. 2006;166(10):1092-1097.
- BFI-2: Soto CJ, John OP. The next Big Five Inventory (BFI-2): Developing and assessing a hierarchical model with 15 facets. Journal of Personality and Social Psychology. 2017;113(1):117-143.
- ECR-R: Fraley RC, Waller NG, Brennan KA. An item response theory analysis of self-report measures of adult attachment. Journal of Personality and Social Psychology. 2000;78(2):350-365.
- ASRS v1.1: Kessler RC, et al. The World Health Organization Adult ADHD Self-Report Scale (ASRS). Psychological Medicine. 2005;35(2):245-256.
- ACE: Felitti VJ, et al. Relationship of childhood abuse and household dysfunction to many of the leading causes of death in adults. American Journal of Preventive Medicine. 1998;14(4):245-258.
- PSS-10: Cohen S, Kamarck T, Mermelstein R. A global measure of perceived stress. Journal of Health and Social Behavior. 1983;24(4):385-396.
- PC-PTSD-5: Prins A, et al. The Primary Care PTSD Screen for DSM-5 (PC-PTSD-5). Primary Care Psychiatry. 2016.
- AQ-10: Allison C, Auyeung B, Baron-Cohen S. Toward brief "Red Flags" for autism screening. Journal of the American Academy of Child & Adolescent Psychiatry. 2012;51(2):202-212.
- DERS-SF: Kaufman EA, et al. The Difficulties in Emotion Regulation Scale Short Form (DERS-SF). Journal of Psychopathology and Behavioral Assessment. 2016;38(3):443-455.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

This report was generated by Deep Personality (deeppersonality.com).
Deep Personality is a screening tool, not a diagnostic instrument.
For crisis support: 988 Suicide & Crisis Lifeline | Crisis Text Line: Text HOME to 741741
`;
}
