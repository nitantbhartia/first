"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useAssessmentStore } from "@/lib/store/assessmentStore";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

interface ComparisonDimension {
  label: string;
  personA: number;
  personB: number;
  maxScore: number;
  insight: string;
}

const RELATIONSHIP_TYPES = [
  { id: "romantic", label: "Romantic Partner", icon: "❤️" },
  { id: "professional", label: "Coworker / Professional", icon: "💼" },
  { id: "friend", label: "Friend", icon: "🤝" },
  { id: "family", label: "Family Member", icon: "👨‍👩‍👧" },
];

function getAttachmentStyle(anxiety: number, avoidance: number): string {
  const anxiousThreshold = 3.5;
  const avoidantThreshold = 3.5;
  if (anxiety < anxiousThreshold && avoidance < avoidantThreshold) return "Secure";
  if (anxiety >= anxiousThreshold && avoidance < avoidantThreshold) return "Anxious-Preoccupied";
  if (anxiety < anxiousThreshold && avoidance >= avoidantThreshold) return "Dismissive-Avoidant";
  return "Fearful-Avoidant";
}

function getAttachmentDynamicInsight(styleA: string, styleB: string): string {
  if (styleA === "Secure" && styleB === "Secure") {
    return "Both partners have secure attachment, providing a strong foundation for open communication, trust, and emotional availability. This is the most stable pairing.";
  }
  if (
    (styleA === "Anxious-Preoccupied" && styleB === "Dismissive-Avoidant") ||
    (styleA === "Dismissive-Avoidant" && styleB === "Anxious-Preoccupied")
  ) {
    return "This is the classic anxious-avoidant trap. The anxious partner's need for closeness triggers the avoidant partner's need for space, creating a pursue-withdraw cycle. Awareness of this pattern is the first step toward breaking it. EFT (Emotionally Focused Therapy) is highly recommended.";
  }
  if (styleA === "Anxious-Preoccupied" && styleB === "Anxious-Preoccupied") {
    return "Both partners are high in attachment anxiety, which means deep emotional intensity but also potential for escalating conflicts. When both partners feel insecure simultaneously, things can escalate quickly. Learning co-regulation techniques is key.";
  }
  if (styleA === "Dismissive-Avoidant" && styleB === "Dismissive-Avoidant") {
    return "Both partners tend toward emotional distance, which can create a stable but potentially disconnected dynamic. The relationship may feel low-conflict but also low-warmth. Intentional vulnerability practices can help deepen the connection.";
  }
  if (styleA === "Secure" || styleB === "Secure") {
    return "Having one secure partner provides a stabilizing influence. The secure partner can model healthy communication and emotional availability, helping the other partner develop earned security over time.";
  }
  return "This pairing has complex dynamics that would benefit from couples therapy to navigate effectively. Understanding each other's triggers and needs is essential.";
}

export default function ComparePage() {
  const { scores: myScores } = useAssessmentStore();
  const [shareCode, setShareCode] = useState("");
  const [partnerScores, setPartnerScores] = useState<Record<string, unknown> | null>(null);
  const [relationshipType, setRelationshipType] = useState("romantic");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<"input" | "select-type" | "results">("input");

  // Check URL for code parameter
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const code = params.get("code");
    if (code) {
      setShareCode(code);
    }
  }, []);

  const fetchPartnerScores = async () => {
    if (!shareCode.trim()) {
      setError("Please enter a share code");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/share?code=${shareCode.trim()}`);
      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Invalid share code");
        return;
      }

      setPartnerScores(data.scores);
      setStep("select-type");
    } catch {
      setError("Failed to fetch partner data. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const generateComparison = (): ComparisonDimension[] => {
    // Use demo data if real scores aren't available
    const personA = (myScores || {}) as Record<string, Record<string, number>>;
    const personB = (partnerScores || {}) as Record<string, Record<string, number>>;

    return [
      {
        label: "Openness",
        personA: personA?.bfi2?.openness ?? 3.8,
        personB: personB?.bfi2?.openness ?? 3.2,
        maxScore: 5,
        insight: "Differences in openness affect how you approach new experiences, creativity, and intellectual exploration together.",
      },
      {
        label: "Conscientiousness",
        personA: personA?.bfi2?.conscientiousness ?? 3.2,
        personB: personB?.bfi2?.conscientiousness ?? 4.1,
        maxScore: 5,
        insight: "Different levels of organization and structure preference can create friction in shared responsibilities.",
      },
      {
        label: "Extraversion",
        personA: personA?.bfi2?.extraversion ?? 3.0,
        personB: personB?.bfi2?.extraversion ?? 3.8,
        maxScore: 5,
        insight: "Mismatched social energy needs require negotiation around social activities and alone time.",
      },
      {
        label: "Agreeableness",
        personA: personA?.bfi2?.agreeableness ?? 3.8,
        personB: personB?.bfi2?.agreeableness ?? 3.5,
        maxScore: 5,
        insight: "Similar agreeableness levels suggest compatible approaches to conflict and cooperation.",
      },
      {
        label: "Emotional Stability",
        personA: 5 - (personA?.bfi2?.neuroticism ?? 3.5),
        personB: 5 - (personB?.bfi2?.neuroticism ?? 2.8),
        maxScore: 5,
        insight: "Different levels of emotional reactivity affect how you support each other through stress.",
      },
      {
        label: "Attachment Anxiety",
        personA: personA?.ecrr?.anxiety ?? 4.2,
        personB: personB?.ecrr?.anxiety ?? 2.8,
        maxScore: 7,
        insight: "Attachment anxiety differences influence how much reassurance each partner needs.",
      },
      {
        label: "Attachment Avoidance",
        personA: personA?.ecrr?.avoidance ?? 2.5,
        personB: personB?.ecrr?.avoidance ?? 3.8,
        maxScore: 7,
        insight: "Avoidance differences affect comfort with emotional closeness and vulnerability.",
      },
      {
        label: "Stress Level",
        personA: personA?.pss10?.total ?? 22,
        personB: personB?.pss10?.total ?? 18,
        maxScore: 40,
        insight: "Different stress levels impact how much emotional bandwidth each partner has available.",
      },
    ];
  };

  const styleA = getAttachmentStyle(4.2, 2.5);
  const styleB = getAttachmentStyle(2.8, 3.8);
  const attachmentInsight = getAttachmentDynamicInsight(styleA, styleB);

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Header */}
      <nav className="border-b border-navy-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-[family-name:var(--font-display)] text-xl text-navy-900">
            Deep <span className="gradient-text">Personality</span>
          </Link>
          <Link href="/results" className="text-sm font-medium text-navy-600 hover:text-navy-900">
            Back to Results
          </Link>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-6 py-12">
        {step === "input" && (
          <motion.div initial="hidden" animate="visible" variants={fadeIn} className="text-center">
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-navy-900 sm:text-4xl">
              Relationship Comparison
            </h1>
            <p className="mx-auto mt-4 max-w-xl text-lg text-navy-600">
              Enter your partner&apos;s share code to generate a detailed relationship dynamics analysis.
            </p>

            <div className="mx-auto mt-12 max-w-md">
              <div className="assessment-card p-8">
                <label className="block text-left text-sm font-semibold text-navy-800">
                  Partner&apos;s Share Code
                </label>
                <input
                  type="text"
                  value={shareCode}
                  onChange={(e) => setShareCode(e.target.value.toUpperCase())}
                  placeholder="e.g., A1B2C3D4"
                  className="mt-2 w-full rounded-xl border-2 border-navy-200 bg-white px-4 py-3 text-center text-xl font-mono tracking-widest text-navy-900 placeholder:text-navy-300 focus:border-amber-500 focus:outline-none"
                  maxLength={8}
                />
                {error && (
                  <p className="mt-3 text-sm text-coral-600">{error}</p>
                )}
                <button
                  onClick={fetchPartnerScores}
                  disabled={loading}
                  className="mt-6 w-full rounded-full bg-navy-900 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800 disabled:opacity-50"
                >
                  {loading ? "Looking up..." : "Find Partner Profile"}
                </button>
              </div>

              <div className="mt-8">
                <p className="text-sm text-navy-500">
                  Don&apos;t have a code?{" "}
                  <button
                    onClick={() => {
                      setPartnerScores({});
                      setStep("select-type");
                    }}
                    className="font-semibold text-amber-600 hover:underline"
                  >
                    View demo comparison
                  </button>
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {step === "select-type" && (
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <h2 className="text-center font-[family-name:var(--font-display)] text-2xl text-navy-900">
              What is your relationship?
            </h2>
            <p className="mt-2 text-center text-navy-600">
              This helps tailor the analysis to your specific dynamic.
            </p>

            <div className="mx-auto mt-8 grid max-w-lg gap-3">
              {RELATIONSHIP_TYPES.map((type) => (
                <button
                  key={type.id}
                  onClick={() => setRelationshipType(type.id)}
                  className={`flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all ${
                    relationshipType === type.id
                      ? "border-amber-500 bg-amber-50"
                      : "border-navy-200 bg-white hover:border-navy-300"
                  }`}
                >
                  <span className="text-2xl">{type.icon}</span>
                  <span className="font-medium text-navy-900">{type.label}</span>
                </button>
              ))}
            </div>

            <div className="mt-8 text-center">
              <button
                onClick={() => setStep("results")}
                className="rounded-full bg-navy-900 px-8 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800"
              >
                Generate Comparison Report
              </button>
            </div>
          </motion.div>
        )}

        {step === "results" && (
          <motion.div initial="hidden" animate="visible" variants={fadeIn}>
            <div className="mb-8 text-center">
              <h1 className="font-[family-name:var(--font-display)] text-3xl text-navy-900">
                Relationship Dynamics Report
              </h1>
              <p className="mt-2 text-navy-600">
                {RELATIONSHIP_TYPES.find((t) => t.id === relationshipType)?.label} comparison
              </p>
            </div>

            {/* Attachment Dynamics */}
            <div className="assessment-card mb-6 p-6">
              <h3 className="font-[family-name:var(--font-display)] text-xl text-navy-900">
                Attachment Dynamics
              </h3>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl bg-navy-50 p-4 text-center">
                  <div className="text-sm text-navy-500">You</div>
                  <div className="mt-1 font-semibold text-navy-900">{styleA}</div>
                </div>
                <div className="rounded-xl bg-navy-50 p-4 text-center">
                  <div className="text-sm text-navy-500">Partner</div>
                  <div className="mt-1 font-semibold text-navy-900">{styleB}</div>
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-navy-700">{attachmentInsight}</p>
            </div>

            {/* Dimension Comparison */}
            <div className="assessment-card mb-6 p-6">
              <h3 className="mb-6 font-[family-name:var(--font-display)] text-xl text-navy-900">
                Trait Comparison
              </h3>
              <div className="space-y-6">
                {generateComparison().map((dim) => (
                  <div key={dim.label}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-semibold text-navy-800">{dim.label}</span>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-xs text-navy-500">You</span>
                        <div className="flex-1">
                          <div className="h-3 rounded-full bg-navy-100">
                            <div
                              className="h-3 rounded-full bg-amber-500"
                              style={{ width: `${(dim.personA / dim.maxScore) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-10 text-right text-xs font-medium text-navy-700">
                          {dim.personA.toFixed(1)}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="w-16 text-xs text-navy-500">Partner</span>
                        <div className="flex-1">
                          <div className="h-3 rounded-full bg-navy-100">
                            <div
                              className="h-3 rounded-full bg-coral-500"
                              style={{ width: `${(dim.personB / dim.maxScore) * 100}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-10 text-right text-xs font-medium text-navy-700">
                          {dim.personB.toFixed(1)}
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-navy-500">{dim.insight}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Compatibility Overview */}
            <div className="assessment-card mb-6 p-6">
              <h3 className="mb-4 font-[family-name:var(--font-display)] text-xl text-navy-900">
                Compatibility Highlights
              </h3>
              <div className="space-y-4">
                {[
                  {
                    area: "Communication Style",
                    score: 72,
                    note: "You have complementary communication patterns. One partner tends toward directness while the other brings emotional attunement.",
                  },
                  {
                    area: "Conflict Resolution",
                    score: 58,
                    note: "Different stress responses may create challenges during conflict. Learning each other's de-escalation needs is important.",
                  },
                  {
                    area: "Values Alignment",
                    score: 81,
                    note: "Strong alignment on core values, especially around growth and authenticity. Minor differences in structure vs. flexibility preferences.",
                  },
                  {
                    area: "Emotional Support",
                    score: 67,
                    note: "Both partners have capacity for deep empathy, but different comfort levels with vulnerability may create asymmetry in emotional sharing.",
                  },
                  {
                    area: "Growth Potential",
                    score: 85,
                    note: "High potential for mutual growth. Your differences are complementary rather than conflicting, creating opportunities to learn from each other.",
                  },
                ].map((item) => (
                  <div key={item.area}>
                    <div className="mb-1 flex justify-between">
                      <span className="text-sm font-semibold text-navy-800">{item.area}</span>
                      <span className="text-sm font-semibold text-navy-900">{item.score}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-navy-100">
                      <div
                        className={`h-2 rounded-full ${
                          item.score >= 80 ? "bg-sage-500" : item.score >= 60 ? "bg-amber-500" : "bg-coral-500"
                        }`}
                        style={{ width: `${item.score}%` }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-navy-500">{item.note}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Growth Roadmap */}
            <div className="assessment-card mb-6 p-6">
              <h3 className="mb-4 font-[family-name:var(--font-display)] text-xl text-navy-900">
                Growth Roadmap
              </h3>
              <div className="space-y-4">
                {[
                  {
                    title: "Learn Each Other's Attachment Language",
                    desc: "Understanding your attachment styles is the foundation. Read 'Attached' by Levine & Heller together and discuss which patterns you recognize.",
                  },
                  {
                    title: "Develop a Conflict Protocol",
                    desc: "Agree on a de-escalation strategy before you need it. Use the 'time-out and return' method: either partner can call a pause, but you commit to returning within 30 minutes.",
                  },
                  {
                    title: "Practice Vulnerability Exercises",
                    desc: "The '36 Questions That Lead to Love' (Aron et al.) can deepen connection. Do them monthly, not just once. Each time reveals new layers.",
                  },
                  {
                    title: "Consider Couples Therapy (Preventive)",
                    desc: "You don't need to be in crisis to benefit from couples therapy. EFT (Emotionally Focused Therapy) is particularly well-suited to your attachment dynamic.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4 rounded-xl bg-navy-50 p-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500 text-sm font-bold text-white">
                      {i + 1}
                    </div>
                    <div>
                      <div className="font-semibold text-navy-900">{item.title}</div>
                      <p className="mt-1 text-sm text-navy-600">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Link
                href="/results"
                className="rounded-full border border-navy-200 px-6 py-3 text-center text-sm font-semibold text-navy-700 transition-all hover:bg-navy-50"
              >
                Back to My Results
              </Link>
              <button
                onClick={() => window.print()}
                className="rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800"
              >
                Download PDF
              </button>
            </div>

            {/* Disclaimer */}
            <div className="mt-12 rounded-xl bg-navy-50 p-4 text-center text-xs text-navy-500">
              <p>
                This comparison is based on screening-level data and AI interpretation. It is not a substitute for professional couples counseling.
                For relationship concerns, consider consulting a licensed therapist specializing in couples therapy.
              </p>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
