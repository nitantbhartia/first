"use client";

import { useAssessmentStore } from "@/lib/store/assessmentStore";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useEffect, useState, useMemo, useCallback } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface BigFiveScores {
  openness: number;
  conscientiousness: number;
  extraversion: number;
  agreeableness: number;
  neuroticism: number;
}

interface AttachmentScores {
  anxiety: number;
  avoidance: number;
  style: "Secure" | "Anxious-Preoccupied" | "Dismissive-Avoidant" | "Fearful-Avoidant";
}

interface SeverityResult {
  score: number;
  label: string;
  color: string;
}

interface ScreenResult {
  score: number;
  positive: boolean;
}

interface DersSubscales {
  awareness: number;
  clarity: number;
  goals: number;
  impulse: number;
  nonAcceptance: number;
  strategies: number;
  total: number;
}

interface ComputedScores {
  bigFive: BigFiveScores;
  attachment: AttachmentScores;
  phq9: SeverityResult;
  gad7: SeverityResult;
  adhd: ScreenResult & { partA: number };
  ace: SeverityResult;
  pss10: SeverityResult;
  pcPtsd5: ScreenResult;
  aq10: ScreenResult & { score: number };
  ders: DersSubscales;
  values: { name: string; score: number }[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const BFI2_REVERSE_ITEMS = new Set([
  3, 4, 5, 8, 9, 11, 12, 16, 17, 22, 23, 24, 25, 26, 28, 29, 30, 31, 36,
  37, 38, 39, 44, 45, 46, 47, 48, 52, 53, 54, 55, 58, 59, 60,
]);

const BIG_FIVE_DOMAINS: Record<keyof BigFiveScores, number[]> = {
  extraversion: [1, 6, 11, 16, 21, 26, 31, 36, 41, 46, 51, 56],
  agreeableness: [2, 7, 12, 17, 22, 27, 32, 37, 42, 47, 52, 57],
  conscientiousness: [3, 8, 13, 18, 23, 28, 33, 38, 43, 48, 53, 58],
  neuroticism: [4, 9, 14, 19, 24, 29, 34, 39, 44, 49, 54, 59],
  openness: [5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60],
};

const ECR_ANXIETY_ITEMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18];
const ECR_AVOIDANCE_ITEMS = [19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36];
const ECR_REVERSE_ITEMS = new Set([3, 15, 19, 22, 25, 27, 29, 31, 33, 35]);

const PSS_REVERSE_ITEMS = new Set([4, 5, 7, 8]);

const VALUES_LIST = [
  "Achievement",
  "Adventure",
  "Authenticity",
  "Autonomy",
  "Balance",
  "Compassion",
  "Courage",
  "Creativity",
  "Curiosity",
  "Family",
  "Freedom",
  "Growth",
  "Honesty",
  "Humor",
  "Justice",
  "Kindness",
  "Knowledge",
  "Leadership",
  "Love",
  "Security",
  "Service",
];

// ---------------------------------------------------------------------------
// Scoring functions
// ---------------------------------------------------------------------------

function getItemValue(answers: Record<string, number>, prefix: string, num: number): number | null {
  const key = `${prefix}${num}`;
  return answers[key] !== undefined ? answers[key] : null;
}

function sumItems(answers: Record<string, number>, prefix: string, items: number[]): number {
  return items.reduce((sum, n) => {
    const v = getItemValue(answers, prefix, n);
    return sum + (v ?? 0);
  }, 0);
}

function computeBigFive(answers: Record<string, number>): BigFiveScores {
  const result: Partial<BigFiveScores> = {};
  for (const [domain, items] of Object.entries(BIG_FIVE_DOMAINS)) {
    let total = 0;
    let count = 0;
    for (const n of items) {
      let v = getItemValue(answers, "bfi2_", n);
      if (v === null) continue;
      if (BFI2_REVERSE_ITEMS.has(n)) {
        v = 6 - v; // 5-point scale, reverse = max+1 - value
      }
      total += v;
      count++;
    }
    result[domain as keyof BigFiveScores] = count > 0 ? parseFloat((total / count).toFixed(2)) : 3;
  }
  return result as BigFiveScores;
}

function computeAttachment(answers: Record<string, number>): AttachmentScores {
  let anxTotal = 0;
  let anxCount = 0;
  for (const n of ECR_ANXIETY_ITEMS) {
    let v = getItemValue(answers, "ecr_", n);
    if (v === null) continue;
    if (ECR_REVERSE_ITEMS.has(n)) v = 8 - v; // 7-point scale
    anxTotal += v;
    anxCount++;
  }
  let avoidTotal = 0;
  let avoidCount = 0;
  for (const n of ECR_AVOIDANCE_ITEMS) {
    let v = getItemValue(answers, "ecr_", n);
    if (v === null) continue;
    if (ECR_REVERSE_ITEMS.has(n)) v = 8 - v;
    avoidTotal += v;
    avoidCount++;
  }
  const anxiety = anxCount > 0 ? parseFloat((anxTotal / anxCount).toFixed(2)) : 3.5;
  const avoidance = avoidCount > 0 ? parseFloat((avoidTotal / avoidCount).toFixed(2)) : 3.5;
  const midpoint = 3.5;
  let style: AttachmentScores["style"];
  if (anxiety <= midpoint && avoidance <= midpoint) style = "Secure";
  else if (anxiety > midpoint && avoidance <= midpoint) style = "Anxious-Preoccupied";
  else if (anxiety <= midpoint && avoidance > midpoint) style = "Dismissive-Avoidant";
  else style = "Fearful-Avoidant";
  return { anxiety, avoidance, style };
}

function classifyPHQ9(score: number): SeverityResult {
  if (score <= 4) return { score, label: "Minimal", color: "text-sage-600" };
  if (score <= 9) return { score, label: "Mild", color: "text-amber-600" };
  if (score <= 14) return { score, label: "Moderate", color: "text-amber-700" };
  if (score <= 19) return { score, label: "Moderately Severe", color: "text-coral-600" };
  return { score, label: "Severe", color: "text-coral-700" };
}

function classifyGAD7(score: number): SeverityResult {
  if (score <= 4) return { score, label: "Minimal", color: "text-sage-600" };
  if (score <= 9) return { score, label: "Mild", color: "text-amber-600" };
  if (score <= 14) return { score, label: "Moderate", color: "text-amber-700" };
  return { score, label: "Severe", color: "text-coral-700" };
}

function classifyACE(score: number): SeverityResult {
  if (score === 0) return { score, label: "No ACEs reported", color: "text-sage-600" };
  if (score <= 3) return { score, label: "Low-Moderate Risk", color: "text-amber-600" };
  return { score, label: "Elevated Risk", color: "text-coral-600" };
}

function classifyPSS(score: number): SeverityResult {
  if (score <= 13) return { score, label: "Low Stress", color: "text-sage-600" };
  if (score <= 26) return { score, label: "Moderate Stress", color: "text-amber-600" };
  return { score, label: "High Stress", color: "text-coral-600" };
}

function computeAllScores(answers: Record<string, number>): ComputedScores {
  const bigFive = computeBigFive(answers);
  const attachment = computeAttachment(answers);

  // PHQ-9
  const phq9Raw = sumItems(answers, "phq9_", [1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const phq9 = classifyPHQ9(phq9Raw);

  // GAD-7
  const gad7Raw = sumItems(answers, "gad7_", [1, 2, 3, 4, 5, 6, 7]);
  const gad7 = classifyGAD7(gad7Raw);

  // ADHD ASRS - Part A is items 1-6
  const partA = sumItems(answers, "asrs_", [1, 2, 3, 4, 5, 6]);
  const adhdTotal = sumItems(answers, "asrs_", Array.from({ length: 18 }, (_, i) => i + 1));
  const adhd = { score: adhdTotal, positive: partA >= 14, partA };

  // ACE - binary items
  const aceItems = Array.from({ length: 10 }, (_, i) => i + 1);
  const aceScore = aceItems.reduce((sum, n) => {
    const v = getItemValue(answers, "ace_", n);
    return sum + (v !== null && v >= 1 ? 1 : 0);
  }, 0);
  const ace = classifyACE(aceScore);

  // PSS-10
  let pssTotal = 0;
  for (let i = 1; i <= 10; i++) {
    let v = getItemValue(answers, "pss_", i);
    if (v === null) continue;
    if (PSS_REVERSE_ITEMS.has(i)) v = 4 - v;
    pssTotal += v;
  }
  const pss10 = classifyPSS(pssTotal);

  // PC-PTSD-5
  const ptsdScore = sumItems(answers, "pcptsd_", [1, 2, 3, 4, 5]);
  const pcPtsd5 = { score: ptsdScore, positive: ptsdScore >= 3 };

  // AQ-10
  const aq10Score = sumItems(answers, "aq10_", Array.from({ length: 10 }, (_, i) => i + 1));
  const aq10 = { score: aq10Score, positive: aq10Score >= 6 };

  // DERS-SF subscales (18 items, 6 subscales of 3 items each)
  const dersSubscaleMap: Record<string, number[]> = {
    awareness: [1, 4, 7],
    clarity: [2, 5, 8],
    goals: [3, 6, 9],
    impulse: [10, 12, 14],
    nonAcceptance: [11, 13, 15],
    strategies: [16, 17, 18],
  };
  const ders: DersSubscales = { awareness: 0, clarity: 0, goals: 0, impulse: 0, nonAcceptance: 0, strategies: 0, total: 0 };
  let dersTotal = 0;
  for (const [sub, items] of Object.entries(dersSubscaleMap)) {
    const s = sumItems(answers, "ders_", items);
    (ders as unknown as Record<string, number>)[sub] = s;
    dersTotal += s;
  }
  ders.total = dersTotal;

  // Values - items are rated 1-6 importance
  const values = VALUES_LIST.map((name, i) => {
    const v = getItemValue(answers, "values_", i + 1);
    return { name, score: v ?? 0 };
  })
    .sort((a, b) => b.score - a.score)
    .slice(0, 10);

  return { bigFive, attachment, phq9, gad7, adhd, ace, pss10, pcPtsd5, aq10, ders, values };
}

// ---------------------------------------------------------------------------
// Demo / mock data
// ---------------------------------------------------------------------------

function generateDemoScores(): ComputedScores {
  return {
    bigFive: {
      openness: 4.2,
      conscientiousness: 3.1,
      extraversion: 2.8,
      agreeableness: 3.9,
      neuroticism: 2.4,
    },
    attachment: {
      anxiety: 3.1,
      avoidance: 2.4,
      style: "Secure",
    },
    phq9: { score: 7, label: "Mild", color: "text-amber-600" },
    gad7: { score: 10, label: "Moderate", color: "text-amber-700" },
    adhd: { score: 38, positive: true, partA: 16 },
    ace: { score: 2, label: "Low-Moderate Risk", color: "text-amber-600" },
    pss10: { score: 18, label: "Moderate Stress", color: "text-amber-600" },
    pcPtsd5: { score: 1, positive: false },
    aq10: { score: 4, positive: false },
    ders: {
      awareness: 8,
      clarity: 10,
      goals: 9,
      impulse: 6,
      nonAcceptance: 7,
      strategies: 8,
      total: 48,
    },
    values: [
      { name: "Curiosity", score: 6 },
      { name: "Authenticity", score: 6 },
      { name: "Growth", score: 5 },
      { name: "Freedom", score: 5 },
      { name: "Creativity", score: 5 },
      { name: "Compassion", score: 4 },
      { name: "Knowledge", score: 4 },
      { name: "Humor", score: 4 },
      { name: "Love", score: 3 },
      { name: "Balance", score: 3 },
    ],
  };
}

const DEMO_REPORT_CONTENT: Record<string, string> = {
  executiveSummary:
    "Your profile reveals a thoughtful, introspective individual with strong creative tendencies and a secure relational foundation. You show above-average openness to experience combined with moderate conscientiousness, suggesting you thrive in environments that reward innovation over rigid structure. Your attachment security provides a stable base, though moderate anxiety scores suggest awareness of possible generalized worry patterns worth monitoring. A positive ADHD screen alongside high openness is a common co-occurrence that can manifest as creative energy paired with difficulty sustaining focus on less stimulating tasks.",
  personalityDeepDive:
    "Your Big Five profile paints the picture of a curious, empathetic individual who may sometimes prioritize harmony over personal boundaries. High Openness (4.2) places you in the 84th percentile, suggesting rich inner experiences, intellectual curiosity, and appreciation for novelty. Your Agreeableness (3.9) is above average, indicating a cooperative and trusting nature. Moderate Conscientiousness (3.1) with below-average Extraversion (2.8) and low Neuroticism (2.4) rounds out a profile common among creative professionals who prefer depth over breadth in social connections.",
  attachmentAnalysis:
    "Your Secure attachment style (Anxiety: 3.1, Avoidance: 2.4) indicates a generally healthy approach to close relationships. You are likely comfortable with intimacy and interdependence, able to communicate needs effectively, and capable of providing consistent support to partners. While your anxiety dimension approaches the moderate range, this likely manifests as thoughtful attentiveness to relationship dynamics rather than clinically significant preoccupation.",
  mentalHealthFlags:
    "Three areas warrant attention: (1) Moderate GAD-7 anxiety (score: 10) suggests you experience worry, restlessness, or tension at a level that may benefit from professional support or evidence-based self-management strategies. (2) Mild PHQ-9 depression (score: 7) is at the upper end of the mild range. (3) Positive ADHD screen (ASRS Part A: 16) strongly suggests pursuing a comprehensive ADHD evaluation with a specialist.",
};

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.4 } },
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function CrisisBanner() {
  return (
    <div className="crisis-banner bg-coral-600 text-white">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-6 py-4 sm:flex-row sm:justify-between">
        <div className="flex items-center gap-3">
          <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-semibold">Your responses indicate you may be in distress.</p>
            <p className="text-sm text-coral-100">
              Please reach out to a crisis resource. You are not alone.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="tel:988"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-coral-700 shadow-sm transition-colors hover:bg-coral-50"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            Call 988
          </a>
          <a
            href="sms:741741&body=HELLO"
            className="inline-flex items-center gap-2 rounded-full border border-white/40 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10"
          >
            Text HOME to 741741
          </a>
        </div>
      </div>
    </div>
  );
}

function BigFiveChart({ scores }: { scores: BigFiveScores }) {
  const domains: { key: keyof BigFiveScores; label: string; color: string }[] = [
    { key: "openness", label: "Openness", color: "bg-amber-500" },
    { key: "conscientiousness", label: "Conscientiousness", color: "bg-sage-500" },
    { key: "extraversion", label: "Extraversion", color: "bg-coral-500" },
    { key: "agreeableness", label: "Agreeableness", color: "bg-navy-500" },
    { key: "neuroticism", label: "Neuroticism", color: "bg-amber-700" },
  ];

  return (
    <div className="space-y-4">
      {domains.map((d) => {
        const pct = ((scores[d.key] - 1) / 4) * 100;
        return (
          <div key={d.key}>
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-sm font-medium text-navy-700">{d.label}</span>
              <span className="text-sm font-semibold text-navy-900">{scores[d.key].toFixed(1)} / 5</span>
            </div>
            <div className="h-3 rounded-full bg-navy-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className={`h-3 rounded-full ${d.color}`}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AttachmentQuadrant({ scores }: { scores: AttachmentScores }) {
  const xPct = Math.min(Math.max(((scores.avoidance - 1) / 6) * 100, 2), 98);
  const yPct = Math.min(Math.max(((scores.anxiety - 1) / 6) * 100, 2), 98);

  const styleColors: Record<string, string> = {
    Secure: "bg-sage-100 text-sage-700 border-sage-300",
    "Anxious-Preoccupied": "bg-amber-100 text-amber-700 border-amber-300",
    "Dismissive-Avoidant": "bg-navy-100 text-navy-700 border-navy-300",
    "Fearful-Avoidant": "bg-coral-100 text-coral-700 border-coral-300",
  };

  return (
    <div>
      <div className={`mb-4 inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-semibold ${styleColors[scores.style]}`}>
        {scores.style}
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[280px]">
        {/* Grid */}
        <div className="absolute inset-0 rounded-xl border border-navy-200 bg-navy-50/50">
          {/* Vertical divider */}
          <div className="absolute left-1/2 top-0 h-full w-px bg-navy-200" />
          {/* Horizontal divider */}
          <div className="absolute left-0 top-1/2 h-px w-full bg-navy-200" />

          {/* Quadrant labels */}
          <span className="absolute left-2 top-2 text-[10px] font-medium text-navy-400">Anxious-Preoccupied</span>
          <span className="absolute right-2 top-2 text-right text-[10px] font-medium text-navy-400">Fearful-Avoidant</span>
          <span className="absolute bottom-2 left-2 text-[10px] font-medium text-navy-400">Secure</span>
          <span className="absolute bottom-2 right-2 text-right text-[10px] font-medium text-navy-400">Dismissive-Avoidant</span>
        </div>

        {/* Axis labels */}
        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-semibold text-navy-500 uppercase tracking-wider">
          Avoidance
        </span>
        <span className="absolute -left-6 top-1/2 -translate-y-1/2 -rotate-90 text-[10px] font-semibold text-navy-500 uppercase tracking-wider">
          Anxiety
        </span>

        {/* Dot */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-coral-500 shadow-lg shadow-coral-200"
          style={{ left: `${xPct}%`, bottom: `${yPct}%` }}
        />
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4 text-center">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-navy-400">Anxiety</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-navy-900">{scores.anxiety.toFixed(1)}</p>
          <p className="text-xs text-navy-500">/ 7.0</p>
        </div>
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-navy-400">Avoidance</p>
          <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-navy-900">{scores.avoidance.toFixed(1)}</p>
          <p className="text-xs text-navy-500">/ 7.0</p>
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ label, color }: { label: string; color: string }) {
  const bgMap: Record<string, string> = {
    "text-sage-600": "bg-sage-100",
    "text-amber-600": "bg-amber-100",
    "text-amber-700": "bg-amber-100",
    "text-coral-600": "bg-coral-100",
    "text-coral-700": "bg-coral-100",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${color} ${bgMap[color] ?? "bg-navy-100"}`}>
      {label}
    </span>
  );
}

function ScreenBadge({ positive, positiveLabel, negativeLabel }: { positive: boolean; positiveLabel?: string; negativeLabel?: string }) {
  if (positive) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-coral-100 px-3 py-1 text-xs font-semibold text-coral-700">
        <span className="h-2 w-2 rounded-full bg-coral-500" />
        {positiveLabel ?? "Positive Screen"}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
      <span className="h-2 w-2 rounded-full bg-sage-500" />
      {negativeLabel ?? "Negative Screen"}
    </span>
  );
}

function ScoreCard({
  title,
  children,
  icon,
  className = "",
}: {
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.div variants={fadeIn} className={`assessment-card overflow-hidden ${className}`}>
      <div className="flex items-center gap-3 border-b border-navy-100 px-6 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-navy-900 text-white">
          {icon}
        </div>
        <h3 className="font-[family-name:var(--font-display)] text-lg text-navy-900">{title}</h3>
      </div>
      <div className="p-6">{children}</div>
    </motion.div>
  );
}

function LockedCard({ title, description }: { title: string; description: string }) {
  return (
    <motion.div variants={fadeIn} className="relative overflow-hidden rounded-2xl border border-navy-200 bg-white">
      {/* Blurred preview content */}
      <div className="p-6 select-none" style={{ filter: "blur(4px)" }} aria-hidden>
        <h4 className="font-[family-name:var(--font-display)] text-lg text-navy-900">{title}</h4>
        <p className="mt-2 text-sm leading-relaxed text-navy-600">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore
          et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
          aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse
          cillum dolore eu fugiat nulla pariatur.
        </p>
        <div className="mt-4 h-24 rounded-lg bg-navy-50" />
      </div>
      {/* Lock overlay */}
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60 backdrop-blur-[2px]">
        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-navy-900 text-white">
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <p className="font-[family-name:var(--font-display)] text-lg text-navy-900">{title}</p>
        <p className="mt-1 max-w-xs text-center text-sm text-navy-500">{description}</p>
      </div>
    </motion.div>
  );
}

function DersChart({ ders }: { ders: DersSubscales }) {
  const subscales: { key: keyof DersSubscales; label: string; max: number }[] = [
    { key: "awareness", label: "Awareness", max: 15 },
    { key: "clarity", label: "Clarity", max: 15 },
    { key: "goals", label: "Goals", max: 15 },
    { key: "impulse", label: "Impulse", max: 15 },
    { key: "nonAcceptance", label: "Non-Acceptance", max: 15 },
    { key: "strategies", label: "Strategies", max: 15 },
  ];

  return (
    <div className="space-y-3">
      {subscales.map((s) => {
        const val = ders[s.key];
        const pct = (val / s.max) * 100;
        return (
          <div key={s.key}>
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-xs font-medium text-navy-600">{s.label}</span>
              <span className="text-xs font-semibold text-navy-800">{val}/{s.max}</span>
            </div>
            <div className="h-2 rounded-full bg-navy-100">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.7 }}
                className="h-2 rounded-full bg-navy-600"
              />
            </div>
          </div>
        );
      })}
      <div className="mt-2 rounded-lg bg-navy-50 px-3 py-2 text-center">
        <span className="text-xs text-navy-500">Total Score</span>
        <p className="font-[family-name:var(--font-display)] text-xl text-navy-900">{ders.total} / 90</p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Page Component
// ---------------------------------------------------------------------------

export default function ResultsPage() {
  const {
    answers,
    scores: _storeScores,
    reportTier,
    reportContent,
    reportGenerated,
    completedAt,
    shareCode,
    crisisDetected,
    setScores,
    setShareCode,
    setReportContent,
    resetAssessment,
  } = useAssessmentStore();

  const [isDemo, setIsDemo] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [shareCodeCopied, setShareCodeCopied] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);

  // Determine if we have real data
  const hasRealData = Object.keys(answers).length > 0;

  // Compute scores
  const computedScores: ComputedScores = useMemo(() => {
    if (isDemo || !hasRealData) return generateDemoScores();
    return computeAllScores(answers);
  }, [answers, isDemo, hasRealData]);

  // Persist computed scores to store on mount / change
  useEffect(() => {
    if (hasRealData && !isDemo) {
      setScores(computedScores as unknown as Record<string, unknown>);
    }
  }, [computedScores, hasRealData, isDemo, setScores]);

  // Auto-enable demo if no real data
  useEffect(() => {
    if (!hasRealData) setIsDemo(true);
  }, [hasRealData]);

  const isPaid = reportTier === "full" || reportTier === "couples";

  const effectiveReportContent = useMemo(() => {
    if (isDemo) return DEMO_REPORT_CONTENT;
    return reportContent ?? DEMO_REPORT_CONTENT;
  }, [isDemo, reportContent]);

  // Actions
  const handleGenerateReport = useCallback(async () => {
    setGeneratingReport(true);
    try {
      const response = await fetch("/api/generate-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scores: computedScores }),
      });
      if (response.ok) {
        const data = await response.json();
        setReportContent(data);
      }
    } catch {
      // Silently handle - user can retry
    } finally {
      setGeneratingReport(false);
    }
  }, [computedScores, setReportContent]);

  const handleShare = useCallback(() => {
    if (shareCode) {
      setShowShareModal(true);
      return;
    }
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    setShareCode(code);
    setShowShareModal(true);
  }, [shareCode, setShareCode]);

  const handleCopyShareCode = useCallback(async () => {
    const code = shareCode ?? "";
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/compare?code=${code}`);
      setShareCodeCopied(true);
      setTimeout(() => setShareCodeCopied(false), 2000);
    } catch {
      // fallback - ignored
    }
  }, [shareCode]);

  const handleRetake = useCallback(() => {
    if (window.confirm("This will erase all your answers and results. Are you sure?")) {
      resetAssessment();
      window.location.href = "/assess";
    }
  }, [resetAssessment]);

  const s = computedScores;

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Crisis Banner */}
      {crisisDetected && <CrisisBanner />}

      {/* Navigation */}
      <nav className="sticky top-0 z-40 border-b border-navy-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-[family-name:var(--font-display)] text-xl text-navy-900">
            Deep <span className="gradient-text">Personality</span>
          </Link>
          <div className="flex items-center gap-3">
            {hasRealData && isDemo && (
              <button
                onClick={() => setIsDemo(false)}
                className="rounded-full border border-navy-200 px-4 py-2 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50"
              >
                View My Results
              </button>
            )}
            {!hasRealData && (
              <Link
                href="/assess"
                className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-800"
              >
                Take Assessment
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Demo Banner */}
      <AnimatePresence>
        {isDemo && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-b border-amber-200 bg-amber-50"
          >
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-3">
              <div className="flex items-center gap-2">
                <svg className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                <p className="text-sm font-medium text-amber-800">
                  You are viewing sample results.{" "}
                  {hasRealData ? (
                    <button onClick={() => setIsDemo(false)} className="underline hover:no-underline">
                      Switch to your results
                    </button>
                  ) : (
                    <Link href="/assess" className="underline hover:no-underline">
                      Take the assessment
                    </Link>
                  )}{" "}
                  to see your real data.
                </p>
              </div>
              {hasRealData && (
                <button
                  onClick={() => setIsDemo(false)}
                  className="shrink-0 text-sm font-semibold text-amber-700 hover:text-amber-900"
                >
                  Dismiss
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="border-b border-navy-100 bg-gradient-to-b from-navy-50/60 to-transparent px-6 py-12 md:py-16"
      >
        <div className="mx-auto max-w-6xl">
          <motion.div variants={fadeIn}>
            <h1 className="font-[family-name:var(--font-display)] text-3xl text-navy-900 sm:text-4xl md:text-5xl">
              Your Results Dashboard
            </h1>
            <p className="mt-3 max-w-2xl text-lg text-navy-600">
              {isDemo
                ? "Explore this sample report to see what your personalized results will look like."
                : completedAt
                  ? `Assessment completed on ${new Date(completedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.`
                  : "Your scores have been computed from your assessment responses."}
            </p>
          </motion.div>

          {/* Quick stats */}
          <motion.div variants={fadeIn} className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              {
                label: "Personality",
                value: `${Math.round(((s.bigFive.openness + s.bigFive.conscientiousness + s.bigFive.extraversion + s.bigFive.agreeableness + (6 - s.bigFive.neuroticism)) / 5 / 5) * 100)}th`,
                sub: "Wellbeing percentile",
              },
              { label: "Attachment", value: s.attachment.style.split("-")[0], sub: s.attachment.style },
              { label: "Mood", value: s.phq9.label, sub: `PHQ-9: ${s.phq9.score}/27` },
              { label: "Anxiety", value: s.gad7.label, sub: `GAD-7: ${s.gad7.score}/21` },
            ].map((stat) => (
              <div key={stat.label} className="rounded-xl border border-navy-100 bg-white px-4 py-3">
                <p className="text-xs font-medium uppercase tracking-wider text-navy-400">{stat.label}</p>
                <p className="mt-1 font-[family-name:var(--font-display)] text-xl text-navy-900">{stat.value}</p>
                <p className="text-xs text-navy-500">{stat.sub}</p>
              </div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      {/* ================================================================== */}
      {/* SCORE OVERVIEW CARDS                                               */}
      {/* ================================================================== */}
      <section className="px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mb-8 font-[family-name:var(--font-display)] text-2xl text-navy-900"
          >
            Score Overview
          </motion.h2>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={stagger}
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
          >
            {/* Big Five */}
            <ScoreCard
              title="Big Five Personality"
              className="md:col-span-2 lg:col-span-2"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              }
            >
              <BigFiveChart scores={s.bigFive} />
            </ScoreCard>

            {/* Attachment */}
            <ScoreCard
              title="Attachment Style"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              }
            >
              <AttachmentQuadrant scores={s.attachment} />
            </ScoreCard>

            {/* PHQ-9 */}
            <ScoreCard
              title="PHQ-9 Depression"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              <div className="text-center">
                <p className="font-[family-name:var(--font-display)] text-5xl text-navy-900">{s.phq9.score}</p>
                <p className="mt-1 text-sm text-navy-500">out of 27</p>
                <div className="mt-4">
                  <SeverityBadge label={s.phq9.label} color={s.phq9.color} />
                </div>
                {/* Severity scale */}
                <div className="mt-6">
                  <div className="flex h-3 overflow-hidden rounded-full">
                    <div className="w-[18.5%] bg-sage-400" title="Minimal (0-4)" />
                    <div className="w-[18.5%] bg-amber-400" title="Mild (5-9)" />
                    <div className="w-[18.5%] bg-amber-500" title="Moderate (10-14)" />
                    <div className="w-[18.5%] bg-coral-500" title="Mod. Severe (15-19)" />
                    <div className="w-[26%] bg-coral-700" title="Severe (20-27)" />
                  </div>
                  <div className="relative mt-1 h-2">
                    <motion.div
                      initial={{ left: 0 }}
                      animate={{ left: `${(s.phq9.score / 27) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      className="absolute -translate-x-1/2"
                    >
                      <div className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-navy-900" />
                    </motion.div>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-navy-400">
                    <span>Minimal</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Mod. Severe</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>
            </ScoreCard>

            {/* GAD-7 */}
            <ScoreCard
              title="GAD-7 Anxiety"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            >
              <div className="text-center">
                <p className="font-[family-name:var(--font-display)] text-5xl text-navy-900">{s.gad7.score}</p>
                <p className="mt-1 text-sm text-navy-500">out of 21</p>
                <div className="mt-4">
                  <SeverityBadge label={s.gad7.label} color={s.gad7.color} />
                </div>
                <div className="mt-6">
                  <div className="flex h-3 overflow-hidden rounded-full">
                    <div className="w-[24%] bg-sage-400" title="Minimal (0-4)" />
                    <div className="w-[24%] bg-amber-400" title="Mild (5-9)" />
                    <div className="w-[24%] bg-amber-500" title="Moderate (10-14)" />
                    <div className="w-[28%] bg-coral-700" title="Severe (15-21)" />
                  </div>
                  <div className="relative mt-1 h-2">
                    <motion.div
                      initial={{ left: 0 }}
                      animate={{ left: `${(s.gad7.score / 21) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      className="absolute -translate-x-1/2"
                    >
                      <div className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-navy-900" />
                    </motion.div>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-navy-400">
                    <span>Minimal</span>
                    <span>Mild</span>
                    <span>Moderate</span>
                    <span>Severe</span>
                  </div>
                </div>
              </div>
            </ScoreCard>

            {/* ADHD */}
            <ScoreCard
              title="ADHD (ASRS)"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              }
            >
              <div className="text-center">
                <div className="mb-4">
                  <ScreenBadge
                    positive={s.adhd.positive}
                    positiveLabel="Positive Screen — Evaluation Recommended"
                    negativeLabel="Negative Screen"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-xl bg-navy-50 px-3 py-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-navy-400">Part A Score</p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-navy-900">{s.adhd.partA}</p>
                    <p className="text-xs text-navy-500">Threshold: 14</p>
                  </div>
                  <div className="rounded-xl bg-navy-50 px-3 py-4">
                    <p className="text-xs font-medium uppercase tracking-wider text-navy-400">Total Score</p>
                    <p className="mt-1 font-[family-name:var(--font-display)] text-2xl text-navy-900">{s.adhd.score}</p>
                    <p className="text-xs text-navy-500">/ 72</p>
                  </div>
                </div>
              </div>
            </ScoreCard>

            {/* ACE */}
            <ScoreCard
              title="ACE Score"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              }
            >
              <div className="text-center">
                <p className="font-[family-name:var(--font-display)] text-5xl text-navy-900">{s.ace.score}</p>
                <p className="mt-1 text-sm text-navy-500">out of 10</p>
                <div className="mt-4">
                  <SeverityBadge label={s.ace.label} color={s.ace.color} />
                </div>
                <div className="mt-4 flex justify-center gap-1">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-3 w-3 rounded-full ${i < s.ace.score ? "bg-coral-500" : "bg-navy-100"}`}
                    />
                  ))}
                </div>
              </div>
            </ScoreCard>

            {/* PSS-10 */}
            <ScoreCard
              title="PSS-10 Stress"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <div className="text-center">
                <p className="font-[family-name:var(--font-display)] text-5xl text-navy-900">{s.pss10.score}</p>
                <p className="mt-1 text-sm text-navy-500">out of 40</p>
                <div className="mt-4">
                  <SeverityBadge label={s.pss10.label} color={s.pss10.color} />
                </div>
                <div className="mt-6">
                  <div className="flex h-3 overflow-hidden rounded-full">
                    <div className="w-[35%] bg-sage-400" />
                    <div className="w-[33%] bg-amber-400" />
                    <div className="w-[32%] bg-coral-500" />
                  </div>
                  <div className="relative mt-1 h-2">
                    <motion.div
                      initial={{ left: 0 }}
                      animate={{ left: `${(s.pss10.score / 40) * 100}%` }}
                      transition={{ duration: 0.6 }}
                      className="absolute -translate-x-1/2"
                    >
                      <div className="h-0 w-0 border-l-[5px] border-r-[5px] border-t-[6px] border-l-transparent border-r-transparent border-t-navy-900" />
                    </motion.div>
                  </div>
                  <div className="mt-2 flex justify-between text-[10px] text-navy-400">
                    <span>Low</span>
                    <span>Moderate</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </ScoreCard>

            {/* PC-PTSD-5 */}
            <ScoreCard
              title="PC-PTSD-5"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              }
            >
              <div className="text-center">
                <div className="mb-4">
                  <ScreenBadge
                    positive={s.pcPtsd5.positive}
                    positiveLabel="Positive Screen — Follow-up Recommended"
                    negativeLabel="Negative Screen"
                  />
                </div>
                <p className="font-[family-name:var(--font-display)] text-5xl text-navy-900">{s.pcPtsd5.score}</p>
                <p className="mt-1 text-sm text-navy-500">out of 5 (cutoff: 3)</p>
                <div className="mt-4 flex justify-center gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div
                      key={i}
                      className={`h-4 w-8 rounded ${i < s.pcPtsd5.score ? "bg-coral-500" : "bg-navy-100"}`}
                    />
                  ))}
                </div>
              </div>
            </ScoreCard>

            {/* AQ-10 */}
            <ScoreCard
              title="AQ-10 Autism"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              }
            >
              <div className="text-center">
                <p className="font-[family-name:var(--font-display)] text-5xl text-navy-900">{s.aq10.score}</p>
                <p className="mt-1 text-sm text-navy-500">out of 10</p>
                <div className="mt-4">
                  <ScreenBadge
                    positive={s.aq10.positive}
                    positiveLabel="Above Threshold — Referral Recommended"
                    negativeLabel="Below Referral Threshold"
                  />
                </div>
                <p className="mt-3 text-xs text-navy-400">
                  Referral threshold: 6+ points
                </p>
              </div>
            </ScoreCard>

            {/* DERS-SF */}
            <ScoreCard
              title="DERS-SF Emotion Regulation"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              }
            >
              <DersChart ders={s.ders} />
            </ScoreCard>

            {/* Values */}
            <ScoreCard
              title="Core Values"
              icon={
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              }
            >
              <div className="space-y-2">
                {s.values.slice(0, 5).map((v, i) => (
                  <div key={v.name} className="flex items-center gap-3">
                    <span
                      className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white ${
                        i === 0
                          ? "bg-amber-500"
                          : i === 1
                            ? "bg-amber-400"
                            : i === 2
                              ? "bg-amber-300 text-amber-800"
                              : "bg-navy-200 text-navy-600"
                      }`}
                    >
                      {i + 1}
                    </span>
                    <span className="text-sm font-medium text-navy-800">{v.name}</span>
                    <div className="ml-auto flex gap-0.5">
                      {Array.from({ length: 6 }).map((_, si) => (
                        <div
                          key={si}
                          className={`h-2 w-2 rounded-full ${si < v.score ? "bg-amber-500" : "bg-navy-100"}`}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScoreCard>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* FREE REPORT SECTION                                                */}
      {/* ================================================================== */}
      <section className="border-t border-navy-100 bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="mb-8">
              <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-sage-100 px-3 py-1 text-xs font-semibold text-sage-700">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                Free Report
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy-900 sm:text-3xl">
                Executive Summary
              </h2>
            </motion.div>

            {/* AI-generated or template executive summary */}
            <motion.div variants={fadeIn} className="space-y-6">
              <div className="rounded-2xl border border-navy-100 bg-navy-50/40 p-6 md:p-8">
                <p className="text-base leading-relaxed text-navy-700">
                  {effectiveReportContent.executiveSummary}
                </p>
              </div>

              {/* Key highlights */}
              <div className="grid gap-4 sm:grid-cols-3">
                <motion.div variants={scaleIn} className="rounded-xl border border-navy-100 bg-white p-5">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                    Personality Snapshot
                  </h4>
                  <p className="text-sm leading-relaxed text-navy-600">
                    High Openness ({s.bigFive.openness.toFixed(1)}) and Agreeableness ({s.bigFive.agreeableness.toFixed(1)}),
                    {s.bigFive.neuroticism < 3
                      ? " with low emotional volatility."
                      : " with moderate-to-high emotional sensitivity."}
                  </p>
                </motion.div>

                <motion.div variants={scaleIn} className="rounded-xl border border-navy-100 bg-white p-5">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                    Attachment Style
                  </h4>
                  <p className="text-sm leading-relaxed text-navy-600">
                    {s.attachment.style} attachment pattern detected. Anxiety: {s.attachment.anxiety.toFixed(1)}/7,
                    Avoidance: {s.attachment.avoidance.toFixed(1)}/7.
                  </p>
                </motion.div>

                <motion.div variants={scaleIn} className="rounded-xl border border-navy-100 bg-white p-5">
                  <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-navy-400">
                    Top Mental Health Flags
                  </h4>
                  <div className="flex flex-col gap-1">
                    {s.gad7.score >= 10 && (
                      <span className="text-sm text-coral-600 font-medium">
                        Moderate anxiety (GAD-7: {s.gad7.score})
                      </span>
                    )}
                    {s.phq9.score >= 10 && (
                      <span className="text-sm text-coral-600 font-medium">
                        Moderate+ depression (PHQ-9: {s.phq9.score})
                      </span>
                    )}
                    {s.adhd.positive && (
                      <span className="text-sm text-coral-600 font-medium">
                        Positive ADHD screen (Part A: {s.adhd.partA})
                      </span>
                    )}
                    {s.pcPtsd5.positive && (
                      <span className="text-sm text-coral-600 font-medium">
                        Positive PTSD screen ({s.pcPtsd5.score}/5)
                      </span>
                    )}
                    {s.gad7.score < 10 && s.phq9.score < 10 && !s.adhd.positive && !s.pcPtsd5.positive && (
                      <span className="text-sm text-sage-600 font-medium">
                        No significant flags detected
                      </span>
                    )}
                  </div>
                </motion.div>
              </div>

              {/* Generate report button */}
              {!reportGenerated && !isDemo && hasRealData && (
                <motion.div variants={fadeIn} className="flex justify-center pt-4">
                  <button
                    onClick={handleGenerateReport}
                    disabled={generatingReport}
                    className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {generatingReport ? (
                      <>
                        <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Generating AI Report...
                      </>
                    ) : (
                      <>
                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Generate AI Report
                      </>
                    )}
                  </button>
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* PAYWALL / UPSELL SECTION                                           */}
      {/* ================================================================== */}
      {!isPaid && (
        <section className="border-t border-navy-100 bg-gradient-to-b from-navy-50/60 to-white px-6 py-16">
          <div className="mx-auto max-w-6xl">
            <motion.div
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={stagger}
            >
              <motion.div variants={fadeIn} className="mb-4 text-center">
                <h2 className="font-[family-name:var(--font-display)] text-2xl text-navy-900 sm:text-3xl">
                  Unlock Your Full 50+ Page Report
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-navy-600">
                  Go beyond the basics with a comprehensive AI-generated deep dive into your psychology.
                </p>
              </motion.div>

              {/* Price banner */}
              <motion.div variants={scaleIn} className="mx-auto mb-10 max-w-md">
                <div className="rounded-2xl border-2 border-amber-500 bg-white p-6 text-center shadow-lg shadow-amber-100/50">
                  <p className="text-sm font-medium text-navy-500">One-time purchase</p>
                  <p className="mt-1 font-[family-name:var(--font-display)] text-5xl text-navy-900">$19</p>
                  <p className="mt-2 text-sm text-navy-500">Instant access. No subscription. Yours forever.</p>
                  <a
                    href="/api/create-checkout"
                    className="mt-6 block rounded-full bg-navy-900 py-3.5 text-center text-sm font-semibold text-white transition-all hover:bg-navy-800 hover:shadow-lg"
                  >
                    Unlock Full Report
                  </a>
                </div>
              </motion.div>

              {/* Locked preview cards */}
              <motion.div variants={stagger} className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                <LockedCard
                  title="Personality Deep Dive"
                  description="Facet-level analysis of all 30 Big Five sub-traits"
                />
                <LockedCard
                  title="Attachment Analysis"
                  description="Detailed relationship patterns and dynamics"
                />
                <LockedCard
                  title="Mental Health Details"
                  description="Comprehensive screening interpretations"
                />
                <LockedCard
                  title="Neurodivergence Profile"
                  description="ADHD and Autism trait deep dive"
                />
                <LockedCard
                  title="Integrated Cross-Domain Insights"
                  description="How your traits interact across all dimensions"
                />
                <LockedCard
                  title="Personalized Recommendations"
                  description="Actionable next steps tailored to your profile"
                />
              </motion.div>

              {/* What is included list */}
              <motion.div variants={fadeIn} className="mx-auto mt-12 max-w-2xl">
                <h3 className="mb-4 text-center font-[family-name:var(--font-display)] text-lg text-navy-900">
                  Everything included in the Full Report
                </h3>
                <div className="grid gap-2 sm:grid-cols-2">
                  {[
                    "50+ page AI-generated narrative",
                    "Facet-level personality analysis",
                    "All mental health screen details",
                    "Neurodivergence profiling",
                    "Trauma & resilience analysis",
                    "Emotion regulation deep dive",
                    "Values & career alignment",
                    "Cross-domain insights",
                    "Personalized recommendations",
                    "Clinical PDF for your therapist",
                    "AI prompt export for ChatGPT/Claude",
                    "Dating bio generator",
                  ].map((item) => (
                    <div key={item} className="flex items-center gap-2 text-sm text-navy-700">
                      <svg className="h-4 w-4 shrink-0 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      {item}
                    </div>
                  ))}
                </div>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* PAID REPORT CONTENT (shown only if paid)                           */}
      {/* ================================================================== */}
      {isPaid && effectiveReportContent && (
        <section className="border-t border-navy-100 bg-white px-6 py-12">
          <div className="mx-auto max-w-4xl">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
              {Object.entries(effectiveReportContent)
                .filter(([key]) => key !== "executiveSummary")
                .map(([key, content]) => (
                  <motion.div key={key} variants={fadeIn} className="mb-10">
                    <h3 className="mb-4 font-[family-name:var(--font-display)] text-xl text-navy-900 capitalize">
                      {key.replace(/([A-Z])/g, " $1").trim()}
                    </h3>
                    <div className="rounded-xl border border-navy-100 bg-navy-50/30 p-6">
                      <p className="leading-relaxed text-navy-700">{content}</p>
                    </div>
                  </motion.div>
                ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ================================================================== */}
      {/* ACTION BUTTONS                                                     */}
      {/* ================================================================== */}
      <section className="border-t border-navy-100 bg-navy-50/40 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeIn} className="mb-6 font-[family-name:var(--font-display)] text-2xl text-navy-900">
              Actions
            </motion.h2>

            <motion.div variants={stagger} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {/* Download Clinical PDF */}
              <motion.div variants={fadeIn}>
                {isPaid ? (
                  <button className="flex w-full items-center gap-4 rounded-xl border border-navy-200 bg-white p-5 text-left transition-all hover:border-navy-300 hover:shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-sage-100 text-sage-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Download Clinical PDF</p>
                      <p className="text-sm text-navy-500">Share with your therapist or doctor</p>
                    </div>
                  </button>
                ) : (
                  <div className="relative flex w-full items-center gap-4 rounded-xl border border-navy-200 bg-white p-5 opacity-60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Download Clinical PDF</p>
                      <p className="text-sm text-navy-500">Unlock with Full Report</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Copy AI Prompt */}
              <motion.div variants={fadeIn}>
                {isPaid ? (
                  <button className="flex w-full items-center gap-4 rounded-xl border border-navy-200 bg-white p-5 text-left transition-all hover:border-navy-300 hover:shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Copy AI Prompt</p>
                      <p className="text-sm text-navy-500">Use with ChatGPT or Claude</p>
                    </div>
                  </button>
                ) : (
                  <div className="relative flex w-full items-center gap-4 rounded-xl border border-navy-200 bg-white p-5 opacity-60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Copy AI Prompt</p>
                      <p className="text-sm text-navy-500">Unlock with Full Report</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Generate Dating Bio */}
              <motion.div variants={fadeIn}>
                {isPaid ? (
                  <button className="flex w-full items-center gap-4 rounded-xl border border-navy-200 bg-white p-5 text-left transition-all hover:border-navy-300 hover:shadow-sm">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-coral-100 text-coral-700">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Generate Dating Bio</p>
                      <p className="text-sm text-navy-500">AI-crafted from your personality</p>
                    </div>
                  </button>
                ) : (
                  <div className="relative flex w-full items-center gap-4 rounded-xl border border-navy-200 bg-white p-5 opacity-60">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-100 text-navy-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold text-navy-900">Generate Dating Bio</p>
                      <p className="text-sm text-navy-500">Unlock with Full Report</p>
                    </div>
                  </div>
                )}
              </motion.div>

              {/* Share for Comparison */}
              <motion.div variants={fadeIn}>
                <button
                  onClick={handleShare}
                  className="flex w-full items-center gap-4 rounded-xl border border-navy-200 bg-white p-5 text-left transition-all hover:border-navy-300 hover:shadow-sm"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-navy-900 text-white">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900">Share for Comparison</p>
                    <p className="text-sm text-navy-500">
                      {shareCode ? `Code: ${shareCode}` : "Generate a share code for your partner"}
                    </p>
                  </div>
                </button>
              </motion.div>

              {/* Retake Assessment */}
              <motion.div variants={fadeIn}>
                <button
                  onClick={handleRetake}
                  className="flex w-full items-center gap-4 rounded-xl border border-coral-200 bg-white p-5 text-left transition-all hover:border-coral-300 hover:bg-coral-50/30"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-coral-100 text-coral-700">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-navy-900">Retake Assessment</p>
                    <p className="text-sm text-navy-500">Start over from the beginning</p>
                  </div>
                </button>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ================================================================== */}
      {/* SHARE MODAL                                                        */}
      {/* ================================================================== */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/40 backdrop-blur-sm p-6"
            onClick={() => setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl"
            >
              <h3 className="font-[family-name:var(--font-display)] text-xl text-navy-900">
                Share for Comparison
              </h3>
              <p className="mt-2 text-sm text-navy-600">
                Send this code or link to your partner. Once they complete the assessment, either of you can
                run the couples comparison.
              </p>

              <div className="mt-6 rounded-xl bg-navy-50 p-4 text-center">
                <p className="text-xs font-medium uppercase tracking-wider text-navy-400">Your Share Code</p>
                <p className="mt-2 font-mono text-3xl font-bold tracking-widest text-navy-900">
                  {shareCode}
                </p>
              </div>

              <button
                onClick={handleCopyShareCode}
                className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-navy-900 py-3 text-sm font-semibold text-white transition-all hover:bg-navy-800"
              >
                {shareCodeCopied ? (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    Link Copied!
                  </>
                ) : (
                  <>
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy Share Link
                  </>
                )}
              </button>

              <button
                onClick={() => setShowShareModal(false)}
                className="mt-3 w-full rounded-xl border border-navy-200 py-3 text-sm font-medium text-navy-700 transition-colors hover:bg-navy-50"
              >
                Close
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================== */}
      {/* DISCLAIMERS FOOTER                                                 */}
      {/* ================================================================== */}
      <footer className="border-t border-navy-100 bg-white px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="rounded-xl border border-navy-100 bg-navy-50/50 p-6">
            <h4 className="mb-3 flex items-center gap-2 text-sm font-semibold text-navy-700">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Important Disclaimers
            </h4>
            <div className="space-y-2 text-xs leading-relaxed text-navy-500">
              <p>
                <strong className="text-navy-600">Screening, not diagnosis:</strong> Deep Personality uses
                clinically-validated screening instruments (PHQ-9, GAD-7, ASRS, AQ-10, PC-PTSD-5, ACE, ECR-R,
                BFI-2, DERS-SF, PSS-10) for educational self-assessment purposes only. Results do not constitute
                a clinical diagnosis. Only a licensed mental health professional can provide a diagnosis based on a
                comprehensive clinical evaluation.
              </p>
              <p>
                <strong className="text-navy-600">Not medical advice:</strong> The information provided in this
                report is not intended to replace professional medical advice, diagnosis, or treatment. Always seek
                the advice of a qualified health provider with any questions you have regarding a medical or
                psychological condition.
              </p>
              <p>
                <strong className="text-navy-600">AI-generated content:</strong> Report narratives are generated
                by artificial intelligence based on your screening scores. While designed to be accurate and
                helpful, AI interpretations may occasionally contain errors or oversimplifications.
              </p>
            </div>
          </div>

          {/* Crisis resources */}
          <div className="mt-6 rounded-xl border border-coral-200 bg-coral-50 p-6">
            <h4 className="mb-2 text-sm font-semibold text-coral-800">
              Crisis Resources — Always Available
            </h4>
            <div className="grid gap-3 text-sm sm:grid-cols-2">
              <div>
                <p className="font-semibold text-coral-700">988 Suicide & Crisis Lifeline</p>
                <p className="text-coral-600">
                  Call or text{" "}
                  <a href="tel:988" className="font-bold underline">
                    988
                  </a>{" "}
                  — 24/7, free, confidential
                </p>
              </div>
              <div>
                <p className="font-semibold text-coral-700">Crisis Text Line</p>
                <p className="text-coral-600">
                  Text{" "}
                  <span className="font-bold">HOME</span> to{" "}
                  <a href="sms:741741&body=HOME" className="font-bold underline">
                    741741
                  </a>
                </p>
              </div>
              <div>
                <p className="font-semibold text-coral-700">International Association for Suicide Prevention</p>
                <p className="text-coral-600">
                  <a href="https://www.iasp.info/resources/Crisis_Centres/" className="underline" target="_blank" rel="noopener noreferrer">
                    iasp.info/resources/Crisis_Centres
                  </a>
                </p>
              </div>
              <div>
                <p className="font-semibold text-coral-700">Emergency Services</p>
                <p className="text-coral-600">
                  Call <span className="font-bold">911</span> (US) or your local emergency number
                </p>
              </div>
            </div>
          </div>

          {/* Footer nav */}
          <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-navy-100 pt-6 sm:flex-row">
            <Link href="/" className="font-[family-name:var(--font-display)] text-lg text-navy-900">
              Deep <span className="gradient-text">Personality</span>
            </Link>
            <div className="flex gap-6 text-sm text-navy-500">
              <a href="#" className="transition-colors hover:text-navy-700">Privacy</a>
              <a href="#" className="transition-colors hover:text-navy-700">Terms</a>
              <a href="#" className="transition-colors hover:text-navy-700">Contact</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
