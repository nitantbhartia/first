import { NextRequest, NextResponse } from 'next/server';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

interface BioRequest {
  scores: Record<string, unknown>;
  platform: 'hinge' | 'bumble' | 'tinder' | 'general';
  tone: 'witty' | 'sincere' | 'adventurous' | 'intellectual' | 'playful';
  length: 'short' | 'medium' | 'long';
}

function buildBioPrompt(params: BioRequest): string {
  const platformGuide: Record<string, string> = {
    hinge: "Hinge-style prompts and answers. Hinge bios are typically responses to prompts like 'A life goal of mine', 'I go crazy for', 'The hallmark of a good relationship is'. Write 3 prompt-response pairs.",
    bumble: "Bumble bio format. Keep it confident and approachable. 150-300 characters for short, up to 600 for long.",
    tinder: "Tinder bio format. Punchy, memorable, hook-driven. Very concise for short (under 100 chars), witty for medium.",
    general: "General dating profile bio. Versatile format that works across platforms.",
  };

  const toneGuide: Record<string, string> = {
    witty: "Clever, humorous, self-aware. Use wordplay and unexpected observations. Show intelligence through humor.",
    sincere: "Genuine, warm, emotionally honest. Show vulnerability and authenticity. Avoid clichés.",
    adventurous: "Energetic, experience-seeking, spontaneous. Focus on activities, travel, trying new things.",
    intellectual: "Thoughtful, curious, depth-seeking. Reference interests in ideas, culture, meaningful conversation.",
    playful: "Fun, lighthearted, flirty. Keep it engaging and not too serious. Show personality through playfulness.",
  };

  return `You are a dating bio writer. Based on the following personality assessment data, write an authentic dating profile bio.

PERSONALITY DATA:
${JSON.stringify(params.scores, null, 2)}

PLATFORM: ${params.platform} — ${platformGuide[params.platform]}
TONE: ${params.tone} — ${toneGuide[params.tone]}
LENGTH: ${params.length}

IMPORTANT RULES:
1. Make it feel AUTHENTIC to this specific person's personality data, not generic
2. Reference traits indirectly (don't say "I scored high on openness" — instead show it through interests and values)
3. Be specific and unique — avoid dating bio clichés like "love to travel" or "looking for my person"
4. Match the platform's culture and format
5. The bio should make someone want to start a conversation
6. Generate 3 variations so the user can choose their favorite

Return the bios as a JSON array of 3 strings.`;
}

function generateDemoBios(platform: string, tone: string): string[] {
  const bios: Record<string, Record<string, string[]>> = {
    hinge: {
      witty: [
        "My therapist says I have 'excellent emotional awareness' which is a fancy way of saying I'll notice you're upset before you do and bring snacks.\n\n📚 Currently reading too many books simultaneously\n🧠 Will explain attachment theory on the first date (you've been warned)\n☕ Coffee snob with a heart of gold",
        "The hallmark of a good relationship is: When both people can sit in comfortable silence, then suddenly one says something weird and the other just... gets it.\n\nI go crazy for: Someone who can keep up with my ADHD-fueled conversation jumps from quantum physics to why cats purr.\n\nA life goal of mine: To have a library with one of those rolling ladders. Non-negotiable.",
        "Green flag: I've done the inner work and I have the therapy receipts to prove it.\n\nRed flag: I will psychoanalyze your music taste.\n\nBeige flag: I keep a running list of book recommendations for people I haven't met yet.",
      ],
      sincere: [
        "I believe the best connections start with genuine curiosity about another person's inner world. I'm the kind of person who asks 'how are you' and actually wants to know.\n\nLooking for someone who values depth over perfection, growth over comfort, and real conversations over small talk.",
        "After years of understanding myself better, I've learned that what I value most is authenticity — in myself and in the people I choose to be close to.\n\nI'm drawn to quiet strength, emotional intelligence, and the kind of humor that comes from really seeing the absurdity of being human.",
        "What I bring: emotional awareness, intellectual curiosity, and the ability to make a genuinely good pour-over coffee.\n\nWhat I'm looking for: someone who's done some of their own work and is interested in growing together, not just being comfortable.",
      ],
    },
    bumble: {
      witty: [
        "Personality test results say I'm 'highly open to experience' which explains why I said yes to fermented shark in Iceland and regretted nothing. High emotional intelligence, low tolerance for small talk. Will ask about your childhood by date two. 🧠✨",
        "My ideal weekend: Saturday morning farmers market → afternoon deep-dive into a Wikipedia rabbit hole → evening with friends debating whether hot dogs are sandwiches. Looking for someone whose idea of adventure includes both hiking AND trying to cook something we saw on a food documentary.",
        "Part intellectual, part golden retriever. I'll remember your love language but forget where I put my keys. Emotionally available and geographically located in this city. Let's start with coffee and see if our attachment styles are compatible. 📎",
      ],
      sincere: [
        "I've spent a lot of time understanding who I am and what matters to me. Turns out, it's genuine connection, creative expression, and the courage to be vulnerable with the right person. Hoping to find someone on the same wavelength.",
        "Values-driven, emotionally aware, endlessly curious. I show love through deep listening, thoughtful gestures, and sharing the weird article I found at 2am because it reminded me of your thing. Looking for partnership built on mutual growth.",
        "The people in my life would describe me as warm, insightful, and the friend who always asks the question that makes you really think. I'm looking for someone who appreciates depth and isn't afraid of a real conversation.",
      ],
    },
    tinder: {
      witty: [
        "Emotionally intelligent with chaotic energy. Will psychoanalyze you (affectionately). 🧠",
        "High openness, moderate conscientiousness. Translation: great ideas, sometimes remembers to execute them. Let's be imperfect together.",
        "Looking for someone to explore weird museums with and then debrief over wine about what it all means. Yes I'm that person. Yes I'm fun at parties.",
      ],
      playful: [
        "Swipe right if you want someone who'll remember your birthday but forget their own. 🎂",
        "Pro: emotionally available. Con: will cry during Pixar movies. Every. Single. Time. 🥲",
        "My personality test said I should date someone with secure attachment. Are you that person? No pressure. (A little pressure.)",
      ],
    },
    general: {
      witty: [
        "I've taken enough personality tests to know I'm 'high in openness and agreeableness' — which basically means I'll try your weird restaurant recommendation and pretend to enjoy it even if it's terrible. But I'll tell you the truth later, because apparently I also value authenticity.\n\nLooking for: deep conversations, spontaneous adventures, and someone who doesn't judge my 47 open browser tabs.",
        "Part philosopher, part golden retriever, full-time overthinker (but in a self-aware, working-on-it way). I collect experiences like some people collect stamps — museums, hole-in-the-wall restaurants, 3am conversations about whether we have free will.\n\nIdeal first date: something neither of us has done before. I'll bring the curiosity, you bring the willingness to laugh at whatever goes wrong.",
        "Personality type: the friend who sends you a 12-minute voice note analyzing the emotional dynamics of the show you're both watching. In therapy (green flag), emotionally articulate (greener flag), makes excellent playlists for every mood (greenest flag).",
      ],
      sincere: [
        "I believe real connection starts with self-awareness. I've invested deeply in understanding my own patterns, values, and growth edges — and I'm looking for someone who's on a similar journey.\n\nWhat matters to me: authentic conversations, creative expression, mutual vulnerability, and building something meaningful together rather than performing a relationship for an audience.",
        "After a lot of reflection, I know what I'm looking for: someone who matches my depth without matching my anxieties. Someone curious, emotionally honest, and brave enough to show up as they really are.\n\nI bring warmth, insight, a genuine interest in your inner world, and the ability to make any errand feel like a small adventure if we're doing it together.",
        "I think the bravest thing two people can do is choose to really see each other — the strengths and the struggles. I'm drawn to emotional intelligence, intellectual curiosity, and the kind of quiet confidence that comes from doing your own work.\n\nLet's skip the small talk phase and go straight to 'what shaped you into who you are today.'",
      ],
    },
  };

  const platformBios = bios[platform] || bios.general;
  const toneBios = platformBios[tone] || Object.values(platformBios)[0];
  return toneBios || ["Your unique personality profile is being processed. Check back soon!"];
}

export async function POST(request: NextRequest) {
  try {
    const body: BioRequest = await request.json();
    const { scores, platform, tone, length } = body;

    if (!scores || !platform || !tone || !length) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (ANTHROPIC_API_KEY) {
      try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': ANTHROPIC_API_KEY,
            'anthropic-version': '2023-06-01',
          },
          body: JSON.stringify({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            messages: [{
              role: 'user',
              content: buildBioPrompt(body),
            }],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const text = data.content[0].text;
          // Try to parse JSON array from response
          const match = text.match(/\[[\s\S]*\]/);
          if (match) {
            const bios = JSON.parse(match[0]);
            return NextResponse.json({ bios });
          }
        }
      } catch (e) {
        console.warn('AI bio generation failed, using templates:', e);
      }
    }

    // Fallback to template-based generation
    const bios = generateDemoBios(platform, tone);
    return NextResponse.json({ bios, demo: true });
  } catch (error) {
    console.error('Dating bio error:', error);
    return NextResponse.json(
      { error: 'Failed to generate dating bios' },
      { status: 500 }
    );
  }
}
