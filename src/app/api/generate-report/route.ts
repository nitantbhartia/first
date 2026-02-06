import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

interface ScoreData {
  instrument: string;
  rawScore: number;
  maxScore: number;
  severity: string;
  percentile?: number;
  facets?: Record<string, { score: number; maxScore: number; label: string }>;
  interpretation: string;
}

function buildSystemPrompt(): string {
  return `You are an expert psychological assessment interpreter with deep knowledge of validated screening instruments, personality psychology, attachment theory, clinical psychology, and neurodivergence. You are generating a comprehensive personality report for an individual who has completed multiple validated screening instruments.

CRITICAL GUIDELINES:
1. NEVER diagnose. You are interpreting SCREENING results, not providing clinical diagnoses.
2. Always use language like "your screening results suggest..." or "these scores indicate..." rather than "you have..." or "you are diagnosed with..."
3. When scores indicate clinical concern (moderate or above on PHQ-9, GAD-7, etc.), strongly recommend professional evaluation.
4. Handle trauma content (ACE, PTSD) with extreme sensitivity and care.
5. Provide specific, actionable insights - not generic advice.
6. Cross-reference findings across instruments to provide integrated insights (e.g., how personality traits interact with attachment style and mental health).
7. Cite specific scores and what they mean.
8. Recommend specific resources: books, therapy modalities (CBT, DBT, EMDR, IFS, etc.), and self-help strategies that match the individual's profile.
9. Be warm, empathetic, and validating while maintaining clinical accuracy.
10. Include appropriate disclaimers that this is a screening tool, not a diagnostic instrument.

FORMAT: Write in clear, engaging prose. Use headers for sections. Include specific score references. Write as if you're a knowledgeable, empathetic psychologist explaining results to a client.`;
}

function buildReportPrompt(scores: Record<string, ScoreData>, section: string, ageRange?: string, gender?: string): string {
  const scoresSummary = Object.entries(scores)
    .map(([, score]) => {
      let detail = `${score.instrument}: Raw Score ${score.rawScore}/${score.maxScore}, Severity: ${score.severity}`;
      if (score.percentile) detail += `, Percentile: ${score.percentile}th`;
      if (score.facets) {
        detail += '\n  Facets: ' + Object.entries(score.facets)
          .map(([, facet]) => `${facet.label}: ${facet.score}/${facet.maxScore}`)
          .join(', ');
      }
      return detail;
    })
    .join('\n');

  const demographicContext = [
    ageRange ? `Age range: ${ageRange}` : '',
    gender ? `Gender: ${gender}` : '',
  ].filter(Boolean).join(', ');

  const sectionPrompts: Record<string, string> = {
    executive_summary: `Write a 2-page Executive Summary that provides a high-level personality snapshot. Highlight the 3-5 most notable findings, any areas requiring attention (moderate+ severity on mental health screens), key personality strengths, and a brief roadmap of what the full report covers. Make it compelling and insightful - this is what hooks the reader.`,

    personality_deep_dive: `Write an 8-10 page Personality Deep Dive analyzing the Big Five results with facet-level detail. For each of the 5 domains (Openness, Conscientiousness, Extraversion, Agreeableness, Neuroticism), explain: what the score means, how it manifests in daily life, strengths associated with this level, potential challenges, and growth edges. Discuss how facets within each domain create a nuanced picture. End with how the 5 domains interact to create the individual's unique personality signature.`,

    attachment_relationships: `Write a 5-7 page Attachment & Relationship Patterns analysis. Explain their attachment style (based on ECR-R Anxiety and Avoidance scores), what it means for how they approach intimacy, how it developed, common relationship patterns associated with this style, and specific strategies for developing more secure attachment. If they have relationship satisfaction scores (CSI), integrate those. Discuss how their personality traits (Big Five) interact with their attachment style.`,

    mental_health: `Write a 5-8 page Mental Health Screening Results section. For each screen (PHQ-9, GAD-7, PTSD, etc.), explain the score, what severity level it indicates, what symptoms at this level typically look like, when professional help is recommended, and which evidence-based treatment modalities are most effective for this severity level. Be direct but compassionate. If multiple screens show elevated scores, discuss how these conditions commonly co-occur and interact.`,

    neurodivergence: `Write a 3-5 page Neurodivergence Profile analyzing ADHD screening (ASRS) and autism spectrum (AQ-10) results. If screens are positive, explain what this means, common presentations in adults, how it may have been missed, and recommended next steps for formal evaluation. Discuss how neurodivergent traits interact with personality, attachment, and mental health. If screens are negative but borderline, still discuss this.`,

    emotional_regulation: `Write a 3-5 page Emotional Regulation & Stress section analyzing DERS-SF and PSS-10 results. Explain their emotion regulation profile (which areas are strong, which need development), current stress levels, how personality and attachment style affect regulation capacity, and specific evidence-based strategies for improvement (DBT skills, mindfulness, etc.).`,

    trauma: `Write a 3-5 page Trauma & Adverse Experiences section with EXTREME sensitivity. Analyze ACE score and PC-PTSD-5 results. Explain what ACE scores mean for long-term health outcomes (citing the original ACE study), how trauma manifests in current patterns (connecting to attachment, emotion regulation, and mental health results), and evidence-based healing approaches (EMDR, IFS, somatic experiencing, etc.). Include a clear note that healing is possible regardless of ACE score. Handle this section with the utmost care and compassion.`,

    values_career: `Write a 3-5 page Values & Career Alignment section analyzing the values assessment results. Identify their top 3-5 core values, discuss how these values show up in life decisions, identify potential values conflicts, and analyze alignment between values and personality traits. Provide career/life direction insights based on the values-personality intersection.`,

    integrated_insights: `Write a 3-5 page Integrated Insights section that is the MOST VALUABLE part of the report. This is where you connect dots across ALL instruments. Identify 3-5 key interaction patterns (e.g., "Your high openness combined with anxious attachment and ADHD traits means you crave deep novelty but struggle with the sustained attention relationships require"). Each insight should reference specific scores from multiple instruments. This is what makes this report worth more than taking each test individually.`,

    recommendations: `Write a 3-5 page Personalized Recommendations section. Based on the COMPLETE profile (not just one area), recommend: 1) Specific therapy modalities that match their profile (CBT, DBT, EMDR, IFS, psychodynamic, etc. — explain WHY each is suited to their specific pattern), 2) 5-8 specific books tailored to their results, 3) Podcasts and online resources, 4) Self-help strategies and daily practices, 5) Areas where professional evaluation is recommended. Make every recommendation SPECIFIC to their profile, not generic.`,

    clinical_appendix: `Write a 2-3 page Clinical Reference Appendix listing each instrument with: full name, citation, raw score, maximum possible score, severity classification, clinical threshold used, and brief note on psychometric properties (sensitivity/specificity where available). Format as a clean reference table suitable for a clinician.`,
  };

  return `INDIVIDUAL PROFILE DATA:
${demographicContext ? `Demographics: ${demographicContext}` : 'Demographics: Not provided'}

ASSESSMENT SCORES:
${scoresSummary}

TASK: ${sectionPrompts[section] || 'Write a comprehensive analysis of the provided assessment scores.'}

Remember: This is a SCREENING report, not a clinical diagnosis. Use appropriate screening language throughout.`;
}

async function generateWithClaude(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!ANTHROPIC_API_KEY) {
    throw new Error('ANTHROPIC_API_KEY not configured');
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Claude API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.content[0].text;
}

async function generateWithOpenAI(systemPrompt: string, userPrompt: string): Promise<string> {
  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY not configured');
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o',
      max_tokens: 4096,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

async function generateSection(
  scores: Record<string, ScoreData>,
  section: string,
  ageRange?: string,
  gender?: string
): Promise<string> {
  const systemPrompt = buildSystemPrompt();
  const userPrompt = buildReportPrompt(scores, section, ageRange, gender);

  try {
    return await generateWithClaude(systemPrompt, userPrompt);
  } catch (e) {
    console.warn('Claude API failed, trying OpenAI fallback:', e);
    try {
      return await generateWithOpenAI(systemPrompt, userPrompt);
    } catch (e2) {
      console.error('Both AI APIs failed:', e2);
      throw new Error('Report generation failed. Please try again later.');
    }
  }
}

// Generate a demo/sample report when no API keys are configured
function generateDemoReport(section: string): string {
  const demoSections: Record<string, string> = {
    executive_summary: `# Executive Summary

Your comprehensive psychological assessment reveals a nuanced and multifaceted personality profile. Here are the key findings from your screening results:

**Personality Snapshot:** Your Big Five profile suggests you are someone with above-average Openness to Experience, indicating intellectual curiosity, creativity, and a preference for novelty. Combined with moderate Conscientiousness, you balance creative thinking with practical follow-through, though you may occasionally struggle with sustained routine tasks.

**Key Attention Areas:**
- Your depression screening (PHQ-9) indicates mild symptoms that warrant monitoring
- Anxiety screening (GAD-7) shows minimal to mild levels, primarily manifesting as worry about performance and future outcomes
- Your attachment style screening suggests an anxious-preoccupied pattern, which means you deeply value close relationships but may experience heightened sensitivity to perceived distance from partners

**Strengths Identified:**
- High emotional awareness and empathy (Agreeableness + Openness combination)
- Strong capacity for deep, meaningful connection
- Creative problem-solving abilities
- Values-driven decision making with emphasis on self-direction and benevolence

**Areas for Growth:**
- Developing more secure attachment behaviors through understanding your anxiety triggers
- Building emotion regulation strategies for stress management
- Exploring whether ADHD screening results warrant professional evaluation

This report provides detailed analysis across all domains with specific, actionable recommendations tailored to your unique profile.

*Note: This is a screening report, not a clinical diagnosis. Please consult a qualified mental health professional for formal evaluation of any areas of concern.*`,

    personality_deep_dive: `# Personality Deep Dive

## Your Big Five Profile

Your personality assessment reveals a distinctive pattern across the five major dimensions of personality. Understanding these traits — and crucially, how they interact — provides a foundation for self-understanding that informs nearly every section of this report.

### Openness to Experience (Score: 4.1/5.0 — 78th Percentile)

You score notably high on Openness, placing you in the upper quartile of the population. This is one of your defining characteristics.

**What this means in daily life:** You are drawn to new ideas, abstract thinking, and creative expression. You likely enjoy art, music, literature, or other forms of aesthetic experience. Conversations that stay surface-level may feel unsatisfying — you gravitate toward depth, whether in philosophical discussions, emotional exploration, or novel experiences.

**Facet Breakdown:**
- *Imagination (4.3):* You have a rich inner fantasy life and can easily envision possibilities beyond the present reality
- *Intellectual Curiosity (4.5):* You actively seek to learn and understand, often pursuing knowledge for its own sake
- *Emotional Awareness (3.8):* You are attuned to emotional nuances, both your own and others'
- *Adventurousness (4.0):* You prefer variety over routine and are willing to try new approaches

**Strengths:** Creative problem-solving, empathy, adaptability, breadth of interests, ability to see connections others miss.

**Growth edges:** High openness can sometimes lead to difficulty with routine tasks, indecisiveness when too many options are available, and emotional overwhelm when sensitivity combines with stressful environments.

### Conscientiousness (Score: 3.2/5.0 — 45th Percentile)

Your Conscientiousness falls in the moderate range — you're capable of organization and follow-through but don't naturally gravitate toward rigid structure.

**What this means in daily life:** You can meet deadlines and fulfill responsibilities, but you likely prefer flexibility in how you approach them. Highly structured environments may feel constraining, while completely unstructured ones may leave you struggling to prioritize.

**Facet Breakdown:**
- *Organization (2.8):* You tend toward a more flexible organizational style; your desk and digital files may reflect creative chaos
- *Self-Discipline (3.3):* You can sustain effort when motivated, but may struggle with tasks that don't engage your interest
- *Achievement-Striving (3.8):* You are motivated to accomplish meaningful goals, especially those aligned with your values
- *Deliberation (3.0):* You sometimes act on impulse rather than extensive planning

### Extraversion (Score: 3.0/5.0 — 50th Percentile)

You fall near the midpoint on Extraversion, suggesting an ambivert pattern — you are neither strongly energized by social interaction nor strongly depleted by it.

**What this means in daily life:** You can enjoy social gatherings and collaborative work, but you also need meaningful alone time to recharge. You likely have a moderate social circle with a few deep relationships rather than many surface-level ones.

### Agreeableness (Score: 3.8/5.0 — 68th Percentile)

Above-average Agreeableness indicates you value harmony, empathy, and cooperation in your relationships.

**What this means in daily life:** You are likely perceived as warm, caring, and considerate. You may sometimes prioritize others' needs over your own, and direct conflict may feel uncomfortable. Your empathy is a genuine strength, but without boundaries, it can lead to people-pleasing patterns.

### Neuroticism (Score: 3.5/5.0 — 62nd Percentile)

Moderately elevated Neuroticism suggests you experience negative emotions more intensely than average, though not at a level that is necessarily pathological.

**What this means in daily life:** You are emotionally responsive and may experience worry, sadness, or frustration more acutely than others. This heightened emotional sensitivity is the flip side of your emotional awareness (Openness facet) — the same wiring that lets you feel joy deeply also amplifies difficult emotions.

## How Your Traits Interact

The most important insights come from trait combinations:

**Openness + Neuroticism (The Sensitive Creator):** Your combination of high openness and moderate neuroticism creates what researchers call the "sensitive creator" pattern. You have rich inner experiences and deep emotional resonance, but this can sometimes tip into rumination or emotional overwhelm. Creative outlets are not just hobbies for you — they're essential emotional regulation tools.

**Agreeableness + Neuroticism (The Empathic Worrier):** High agreeableness combined with elevated neuroticism means you not only feel your own emotions intensely but also absorb others' emotions. This makes you an exceptional friend and listener, but you need strategies to prevent emotional burnout.

**Openness + Moderate Conscientiousness (The Creative Pragmatist):** You have big ideas but sometimes struggle with the sustained, structured effort to bring them to fruition. External accountability structures (deadlines, collaborators, body doubling) work better for you than trying to force self-discipline through willpower alone.`,

    integrated_insights: `# Integrated Cross-Domain Insights

This section connects findings across all your assessments to reveal patterns that no single instrument could identify alone. These integrated insights are the most valuable part of your report.

## Insight 1: The Sensitivity-Seeking Paradox

Your high Openness (78th percentile) combined with anxious attachment and elevated neuroticism creates a distinctive pattern: you are deeply drawn to intense emotional experiences and intimate connection, yet the very sensitivity that makes you crave depth also makes you vulnerable to overwhelm and anxiety within those connections.

**How this shows up:** You may find yourself pursuing deep, emotionally intense relationships, then feeling anxious about whether you're "too much" for the other person. Your high emotional awareness means you pick up on subtle shifts in others' moods and may interpret neutral cues as signs of rejection.

**Growth strategy:** The goal isn't to become less sensitive — your sensitivity is a genuine asset. Instead, focus on building distress tolerance (DBT skills) so you can experience intense emotions without being hijacked by them. Mindfulness-based practices are particularly well-suited to your profile.

## Insight 2: The Executive Function-Values Conflict

Your moderate Conscientiousness (45th percentile) combined with your ADHD screening results and your strong achievement values creates an internal tension: you genuinely care about accomplishing meaningful goals, but your brain's executive function system doesn't always cooperate with your ambitions.

**How this shows up:** You may have a pattern of starting projects with enthusiasm (high Openness providing novelty-seeking energy) but struggling to maintain momentum as the initial excitement fades. This isn't laziness — it's a mismatch between your motivational system and the demands of sustained, structured effort.

**Growth strategy:** Work WITH your brain's wiring rather than against it. Use external structure (body doubling, accountability partners, the Pomodoro technique), interest-based motivation (connecting boring tasks to meaningful outcomes), and consider professional ADHD evaluation if you haven't already.

## Insight 3: The Caretaker's Blind Spot

Your high Agreeableness (68th percentile) + anxious attachment + mild depression screening suggests a pattern where you may be pouring emotional energy into others while neglecting your own needs, then wondering why you feel depleted and low.

**How this shows up:** You're the person everyone comes to for support. You're excellent at attunement and emotional labor. But you may struggle to ask for reciprocal support, either because you don't want to "burden" others (Agreeableness) or because you fear that expressing needs will push people away (anxious attachment).

**Your stress and emotion regulation scores support this interpretation** — your elevated stress levels and difficulties in certain emotion regulation domains suggest you're carrying more than your capacity without adequate support.

**Growth strategy:** Learning to express needs directly is your highest-leverage growth area. This is where therapy — specifically, a relational or attachment-focused approach — could be transformative. The book "Set Boundaries, Find Peace" by Nedra Tawwab may also resonate strongly with your profile.`,

    recommendations: `# Personalized Recommendations

Based on your complete psychological profile, here are specific recommendations tailored to your unique pattern of results.

## Recommended Therapy Modalities

**1. Attachment-Focused Therapy (Primary Recommendation)**
Given your anxious-preoccupied attachment style, this should be your first priority. Emotionally Focused Therapy (EFT) or an attachment-informed psychodynamic approach would help you understand and gradually shift your relational patterns. Look for a therapist trained in EFT or who explicitly works with attachment.

**2. Cognitive Behavioral Therapy (CBT)**
Your mild depression and anxiety screening results respond well to CBT. This would give you practical tools for managing negative thought patterns and worry cycles. A CBT-trained therapist could help with the cognitive distortions that anxious attachment amplifies.

**3. DBT Skills Training**
Given your emotion regulation profile, the skills-based modules of Dialectical Behavior Therapy — particularly distress tolerance and emotion regulation — would be highly valuable. You don't need full DBT protocol; a DBT skills group or workbook would suffice.

## Recommended Books

1. **"Attached" by Amir Levine & Rachel Heller** — Essential reading for understanding your anxious attachment style and developing earned security
2. **"The Body Keeps the Score" by Bessel van der Kolk** — Given your ACE score, understanding how early experiences shape your nervous system
3. **"Driven to Distraction" by Edward Hallowell** — If you pursue ADHD evaluation, this is the definitive accessible guide
4. **"Set Boundaries, Find Peace" by Nedra Tawwab** — Directly addresses the agreeableness-attachment pattern in your profile
5. **"Self-Compassion" by Kristin Neff** — Your neuroticism + agreeableness combination means you likely hold yourself to high standards while extending grace to others

## Daily Practices

1. **Mindfulness meditation (10 min/day):** Your high openness means you'll likely take to meditation naturally. Start with a guided app (Insight Timer or Waking Up)
2. **Journaling:** Given your emotional awareness, structured journaling (try the "5-minute journal" format) can help process emotions without rumination
3. **Physical movement:** Your stress levels indicate you need regular physical outlets. Choose something that matches your openness: dance, hiking, martial arts — anything that engages your mind as well as your body

## Professional Evaluations to Consider

- **ADHD evaluation:** Your ASRS screening was at the threshold. A full neuropsychological evaluation would clarify whether ADHD is contributing to your executive function challenges
- **Therapeutic assessment:** Consider a formal psychological assessment with a licensed psychologist to build on these screening results with diagnostic-level instruments

*These recommendations are based on screening-level data. A qualified mental health professional can refine these suggestions based on a full clinical evaluation.*`,
  };

  return demoSections[section] || `# ${section.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}\n\nThis section provides detailed analysis based on your assessment scores. Full content is generated when connected to the AI service.`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scores, sections, tier, ageRange, gender } = body;

    if (!scores || !sections || !Array.isArray(sections)) {
      return NextResponse.json(
        { error: 'Missing required fields: scores, sections' },
        { status: 400 }
      );
    }

    // Determine which sections to generate based on tier
    const freeSections = ['executive_summary'];
    const fullSections = [
      'executive_summary',
      'personality_deep_dive',
      'attachment_relationships',
      'mental_health',
      'neurodivergence',
      'emotional_regulation',
      'trauma',
      'values_career',
      'integrated_insights',
      'recommendations',
      'clinical_appendix',
    ];

    const allowedSections = tier === 'full' || tier === 'couples'
      ? fullSections
      : freeSections;

    const requestedSections = sections.filter((s: string) => allowedSections.includes(s));

    const reportContent: Record<string, string> = {};
    const hasApiKey = ANTHROPIC_API_KEY || OPENAI_API_KEY;

    // Generate each section
    for (const section of requestedSections) {
      try {
        if (hasApiKey) {
          reportContent[section] = await generateSection(scores, section, ageRange, gender);
        } else {
          // Demo mode - generate sample content
          reportContent[section] = generateDemoReport(section);
        }
      } catch (error) {
        console.error(`Failed to generate section ${section}:`, error);
        reportContent[section] = generateDemoReport(section);
      }
    }

    return NextResponse.json({
      success: true,
      report: reportContent,
      model: hasApiKey ? 'ai-generated' : 'demo',
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Report generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    );
  }
}
