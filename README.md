# Deep Personality

**The owner's manual for your mind.**

Deep Personality is a web-based psychological assessment platform that consolidates 12+ clinically-validated mental health screening instruments into a single, beautifully designed assessment experience. Users complete 204+ questions and receive an AI-generated 50+ page personality report covering personality traits, attachment styles, mental health screens, neurodivergence indicators, trauma history, values alignment, and more.

## Features

- **12 Validated Instruments**: BFI-2 (Big Five), ECR-R (Attachment), PHQ-9 (Depression), GAD-7 (Anxiety), ASRS (ADHD), AQ-10 (Autism), ACE (Trauma), PSS-10 (Stress), PC-PTSD-5 (PTSD), DERS-SF (Emotion Regulation), Values Assessment
- **AI-Generated Reports**: 50+ page narrative report with cross-domain insights
- **Couples Comparison**: Relationship dynamics analysis for partners, friends, family, or coworkers
- **Crisis Safety**: Automatic detection of suicidal ideation with crisis resource display
- **Clinical Export**: PDF formatted for mental health practitioners
- **AI Prompt Export**: Pre-constructed prompt for ChatGPT/Claude with full psychological profile
- **Dating Bio Generator**: AI-generated dating profile bios based on personality data

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), React, Tailwind CSS, Framer Motion
- **State Management**: Zustand with localStorage persistence
- **AI**: Anthropic Claude API (primary), OpenAI GPT-4 (fallback)
- **Payments**: Stripe Checkout
- **Database**: Supabase (optional — works with local storage for development)

## Getting Started

```bash
npm install
cp .env.example .env.local
# Add your API keys to .env.local
npm run dev
```

The app works in demo mode without any API keys configured. AI reports will use template content, and payments will simulate success.

## Pricing

| Tier | Price | Contents |
|------|-------|----------|
| Basic | Free | Full assessment, high-level results, executive summary |
| Full Report | $19 | 50+ page AI report, clinical PDF, AI prompt, dating bio generator |
| Couples | $29 | Full reports for both + relationship dynamics analysis |

## Disclaimer

Deep Personality is a screening tool, not a diagnostic instrument. Results are not a clinical diagnosis. This product is not a substitute for professional mental health evaluation or treatment.

If you are in crisis, contact **988** (Suicide & Crisis Lifeline) or your local emergency services.
