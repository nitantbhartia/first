"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useState } from "react";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const instruments = [
  { name: "Big Five Personality", icon: "🧠", desc: "Deep trait analysis with facet-level insights" },
  { name: "Attachment Style", icon: "🔗", desc: "How you connect in close relationships" },
  { name: "Depression Screen", icon: "📊", desc: "PHQ-9 gold standard screening" },
  { name: "Anxiety Screen", icon: "📈", desc: "GAD-7 validated assessment" },
  { name: "ADHD Screening", icon: "⚡", desc: "WHO Adult Self-Report Scale" },
  { name: "Autism Spectrum", icon: "🔬", desc: "AQ-10 trait screening" },
  { name: "Trauma & ACEs", icon: "🛡️", desc: "Adverse childhood experiences" },
  { name: "Stress Assessment", icon: "🌡️", desc: "Perceived Stress Scale" },
  { name: "Emotion Regulation", icon: "🎯", desc: "How you manage emotional responses" },
  { name: "Values Profile", icon: "🧭", desc: "Core motivational values mapping" },
  { name: "PTSD Screen", icon: "💭", desc: "Primary Care PTSD assessment" },
  { name: "Sensory Processing", icon: "👁️", desc: "Sensory sensitivity patterns" },
];

const reportSections = [
  "Executive Summary",
  "Personality Deep Dive",
  "Attachment & Relationships",
  "Mental Health Screening",
  "Neurodivergence Profile",
  "Emotional Regulation",
  "Trauma & Experiences",
  "Values & Career Alignment",
  "Integrated Cross-Domain Insights",
  "Personalized Recommendations",
  "Clinical Reference Appendix",
];

const pricingTiers = [
  {
    name: "Basic",
    price: "Free",
    priceDetail: "",
    features: [
      "Complete all assessment screens",
      "High-level Big Five personality results",
      "Attachment style identification",
      "Top mental health flags",
      "Executive summary snapshot",
    ],
    cta: "Start Free Assessment",
    featured: false,
  },
  {
    name: "Full Report",
    price: "$19",
    priceDetail: "one-time",
    features: [
      "Everything in Basic, plus:",
      "50+ page AI-generated deep dive",
      "Facet-level personality analysis",
      "All mental health screen results",
      "Neurodivergence profiling",
      "Personalized recommendations",
      "AI prompt export for ChatGPT/Claude",
      "Clinical PDF for your therapist",
      "Dating bio generator",
    ],
    cta: "Get Full Report",
    featured: true,
  },
  {
    name: "Couples",
    price: "$29",
    priceDetail: "one-time",
    features: [
      "Everything in Full Report for both partners",
      "Relationship compatibility analysis",
      "Attachment dynamics mapping",
      "Communication & conflict insights",
      "Values alignment assessment",
      "Growth roadmap for the relationship",
      "Shared report dashboard",
    ],
    cta: "Compare With Partner",
    featured: false,
  },
];

const testimonialQuotes = [
  {
    text: "This told me more about myself in an hour than years of wondering. The ADHD section alone was worth it — I finally got screened professionally after seeing my results.",
    author: "Sarah K.",
    role: "Software Engineer, 32",
  },
  {
    text: "My partner and I did the couples comparison before starting therapy. Our therapist said it gave her a 3-session head start understanding our dynamics.",
    author: "Marcus & Tia",
    role: "Together 4 years",
  },
  {
    text: "The cross-domain insights blew my mind. Seeing how my high openness + anxious attachment + ADHD traits interact explained patterns I've been repeating for decades.",
    author: "James R.",
    role: "Creative Director, 41",
  },
];

export default function Home() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: "Is this a clinical diagnosis?",
      a: "No. Deep Personality uses clinically-validated screening instruments (the same tools your doctor or therapist would use for initial assessment), but screening is not diagnosis. Our reports clearly indicate when professional follow-up is recommended. Think of it as a comprehensive roadmap to bring to a qualified mental health professional.",
    },
    {
      q: "How long does the assessment take?",
      a: "The full assessment takes 45-60 minutes. You can save your progress and return anytime — your answers are automatically saved after each question. A core-only version (Big Five, Attachment, Depression, Anxiety) takes about 20 minutes.",
    },
    {
      q: "What instruments do you use?",
      a: "We use peer-reviewed, clinically-validated instruments including the BFI-2 (Big Five), ECR-R (Attachment), PHQ-9 (Depression), GAD-7 (Anxiety), ASRS (ADHD), ACE (Trauma), PSS-10 (Stress), PC-PTSD-5, AQ-10 (Autism), and DERS-SF (Emotion Regulation). All scoring follows published methodology exactly.",
    },
    {
      q: "Is my data safe?",
      a: "Your assessment data is encrypted at rest. When we generate your AI report, only anonymized scores are sent to the AI model — never your name, email, or any identifying information. You can delete all your data at any time.",
    },
    {
      q: "How does the couples comparison work?",
      a: "Both partners complete the full assessment independently. One partner generates a share code and sends it to the other. Once both assessments are complete, either partner can initiate the comparison to receive a detailed relationship dynamics analysis.",
    },
    {
      q: "Can I share results with my therapist?",
      a: "Yes. The Clinical PDF export is specifically designed for mental health practitioners — it includes raw scores, severity classifications, and clinical thresholds without narrative interpretation, which is what clinicians prefer.",
    },
  ];

  return (
    <div className="min-h-screen bg-[#fafbfc]">
      {/* Navigation */}
      <nav className="fixed top-0 z-50 w-full border-b border-navy-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="font-[family-name:var(--font-display)] text-xl text-navy-900">
            Deep <span className="gradient-text">Personality</span>
          </Link>
          <div className="hidden items-center gap-8 md:flex">
            <a href="#how-it-works" className="text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors">
              How It Works
            </a>
            <a href="#instruments" className="text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors">
              Instruments
            </a>
            <a href="#pricing" className="text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors">
              Pricing
            </a>
            <a href="#faq" className="text-sm font-medium text-navy-600 hover:text-navy-900 transition-colors">
              FAQ
            </a>
          </div>
          <Link
            href="/assess"
            className="rounded-full bg-navy-900 px-5 py-2.5 text-sm font-semibold text-white transition-all hover:bg-navy-800 hover:shadow-lg"
          >
            Take Assessment
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={stagger}
        className="relative overflow-hidden px-6 pb-20 pt-32 md:pt-40"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-amber-50/50 via-transparent to-transparent" />
        <div className="relative mx-auto max-w-4xl text-center">
          <motion.div variants={fadeIn} className="mb-6 inline-flex items-center gap-2 rounded-full bg-amber-100 px-4 py-2 text-sm font-medium text-amber-800">
            <span className="h-2 w-2 rounded-full bg-amber-500" />
            30+ validated psychological screens in one assessment
          </motion.div>

          <motion.h1
            variants={fadeIn}
            className="font-[family-name:var(--font-display)] text-4xl leading-tight text-navy-900 sm:text-5xl md:text-6xl"
          >
            The owner&apos;s manual
            <br />
            <span className="gradient-text">for your mind</span>
          </motion.h1>

          <motion.p
            variants={fadeIn}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-navy-600 md:text-xl"
          >
            Complete one beautifully designed assessment. Get a 50+ page AI-generated report covering personality, attachment, mental health, neurodivergence, values, and more.{" "}
            <span className="font-semibold text-navy-800">
              What costs $10,000+ in professional evaluations, delivered in under an hour.
            </span>
          </motion.p>

          <motion.div variants={fadeIn} className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/assess"
              className="inline-flex items-center gap-2 rounded-full bg-navy-900 px-8 py-4 text-base font-semibold text-white shadow-lg transition-all hover:bg-navy-800 hover:shadow-xl hover:-translate-y-0.5"
            >
              Start Free Assessment
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
            <span className="text-sm text-navy-500">Free basic results &middot; No credit card required</span>
          </motion.div>

          <motion.div variants={fadeIn} className="mx-auto mt-16 grid max-w-3xl grid-cols-3 gap-8 border-t border-navy-100 pt-8">
            <div>
              <div className="font-[family-name:var(--font-display)] text-3xl text-navy-900">204+</div>
              <div className="mt-1 text-sm text-navy-500">Validated questions</div>
            </div>
            <div>
              <div className="font-[family-name:var(--font-display)] text-3xl text-navy-900">&lt;1hr</div>
              <div className="mt-1 text-sm text-navy-500">To complete</div>
            </div>
            <div>
              <div className="font-[family-name:var(--font-display)] text-3xl text-navy-900">50+</div>
              <div className="mt-1 text-sm text-navy-500">Page report</div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* How It Works */}
      <section id="how-it-works" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 variants={fadeIn} className="font-[family-name:var(--font-display)] text-3xl text-navy-900 sm:text-4xl">
              How it works
            </motion.h2>
            <motion.p variants={fadeIn} className="mx-auto mt-4 max-w-2xl text-lg text-navy-600">
              Three steps to the most comprehensive self-assessment you&apos;ve ever taken.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-16 grid gap-8 md:grid-cols-3"
          >
            {[
              {
                step: "01",
                title: "Take the Assessment",
                desc: "Answer 204+ questions across 7 themed sections. It feels like one cohesive experience, not 12 separate tests. Auto-saves after every answer.",
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                ),
              },
              {
                step: "02",
                title: "Get Your Scores",
                desc: "Validated scoring algorithms compute your results across every instrument — personality traits, attachment dimensions, mental health screens, and more.",
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
              },
              {
                step: "03",
                title: "Read Your Report",
                desc: "AI synthesizes your scores into a 50+ page narrative report with cross-domain insights, personalized recommendations, and actionable next steps.",
                icon: (
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
              },
            ].map((item) => (
              <motion.div
                key={item.step}
                variants={fadeIn}
                className="assessment-card p-8"
              >
                <div className="mb-4 flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
                    {item.icon}
                  </div>
                  <span className="font-[family-name:var(--font-display)] text-4xl text-navy-200">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-[family-name:var(--font-display)] text-xl text-navy-900">
                  {item.title}
                </h3>
                <p className="mt-3 leading-relaxed text-navy-600">{item.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Instruments */}
      <section id="instruments" className="bg-navy-900 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 variants={fadeIn} className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">
              12 validated instruments, one experience
            </motion.h2>
            <motion.p variants={fadeIn} className="mx-auto mt-4 max-w-2xl text-lg text-navy-300">
              Every screen we use is peer-reviewed and clinically validated. We combine them into a seamless flow that feels like one cohesive assessment.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-16 grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {instruments.map((inst) => (
              <motion.div
                key={inst.name}
                variants={fadeIn}
                className="rounded-xl border border-navy-700 bg-navy-800/50 p-5 transition-colors hover:border-amber-500/30 hover:bg-navy-800"
              >
                <div className="mb-2 text-2xl">{inst.icon}</div>
                <h3 className="font-semibold text-white">{inst.name}</h3>
                <p className="mt-1 text-sm text-navy-400">{inst.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Report Preview */}
      <section className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.div variants={fadeIn} className="text-center">
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-navy-900 sm:text-4xl">
                Your 50+ page report covers everything
              </h2>
              <p className="mx-auto mt-4 max-w-2xl text-lg text-navy-600">
                Not a generic summary — a deeply personalized analysis that connects dots across every dimension of your psychology.
              </p>
            </motion.div>

            <motion.div variants={fadeIn} className="mt-16 grid gap-3 md:grid-cols-2">
              {reportSections.map((section, i) => (
                <div
                  key={section}
                  className="flex items-center gap-4 rounded-xl border border-navy-100 bg-white p-4 transition-colors hover:border-amber-200"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-500 to-coral-500 text-xs font-bold text-white">
                    {i + 1}
                  </div>
                  <span className="font-medium text-navy-800">{section}</span>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Couples Section */}
      <section className="bg-gradient-to-br from-navy-50 to-amber-50/30 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="grid items-center gap-12 md:grid-cols-2"
          >
            <motion.div variants={fadeIn}>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-coral-100 px-4 py-2 text-sm font-medium text-coral-700">
                Relationship Comparison
              </div>
              <h2 className="font-[family-name:var(--font-display)] text-3xl text-navy-900 sm:text-4xl">
                Understand your relationship dynamics
              </h2>
              <p className="mt-4 text-lg leading-relaxed text-navy-600">
                Both partners take the assessment independently, then unlock a detailed comparison report. See how your attachment styles interact, where your values align, and get specific strategies for your unique dynamic.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  "Attachment dynamics (e.g., anxious-avoidant trap detection)",
                  "Communication & conflict pattern prediction",
                  "Emotional regulation interplay",
                  "Values alignment & negotiation areas",
                  "Actionable growth roadmap",
                ].map((item) => (
                  <li key={item} className="flex items-start gap-3 text-navy-700">
                    <svg className="mt-1 h-5 w-5 shrink-0 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div variants={fadeIn} className="relative">
              <div className="assessment-card p-8">
                <div className="mb-6 text-center font-[family-name:var(--font-display)] text-xl text-navy-900">
                  Compatibility Overview
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Attachment Compatibility", value: 72 },
                    { label: "Values Alignment", value: 85 },
                    { label: "Communication Style", value: 64 },
                    { label: "Emotional Regulation", value: 78 },
                    { label: "Growth Potential", value: 91 },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="mb-1 flex justify-between text-sm">
                        <span className="text-navy-700">{item.label}</span>
                        <span className="font-semibold text-navy-900">{item.value}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-navy-100">
                        <div
                          className="h-2 rounded-full bg-gradient-to-r from-amber-500 to-coral-500"
                          style={{ width: `${item.value}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="text-center"
          >
            <motion.h2 variants={fadeIn} className="font-[family-name:var(--font-display)] text-3xl text-navy-900 sm:text-4xl">
              Simple, transparent pricing
            </motion.h2>
            <motion.p variants={fadeIn} className="mx-auto mt-4 max-w-2xl text-lg text-navy-600">
              The assessment is always free. Pay only for the depth of insight you want.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
            className="mt-16 grid gap-8 md:grid-cols-3"
          >
            {pricingTiers.map((tier) => (
              <motion.div
                key={tier.name}
                variants={fadeIn}
                className={`relative rounded-2xl p-8 ${
                  tier.featured
                    ? "border-2 border-amber-500 bg-white shadow-xl shadow-amber-100"
                    : "border border-navy-200 bg-white"
                }`}
              >
                {tier.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-amber-500 px-4 py-1 text-xs font-bold text-white">
                    MOST POPULAR
                  </div>
                )}
                <h3 className="font-[family-name:var(--font-display)] text-2xl text-navy-900">
                  {tier.name}
                </h3>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="font-[family-name:var(--font-display)] text-4xl text-navy-900">
                    {tier.price}
                  </span>
                  {tier.priceDetail && (
                    <span className="text-sm text-navy-500">{tier.priceDetail}</span>
                  )}
                </div>
                <ul className="mt-8 space-y-3">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3 text-sm text-navy-700">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/assess"
                  className={`mt-8 block rounded-full py-3 text-center text-sm font-semibold transition-all ${
                    tier.featured
                      ? "bg-navy-900 text-white hover:bg-navy-800 hover:shadow-lg"
                      : "border border-navy-200 text-navy-700 hover:border-navy-300 hover:bg-navy-50"
                  }`}
                >
                  {tier.cta}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-navy-50 px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={stagger}
          >
            <motion.h2 variants={fadeIn} className="text-center font-[family-name:var(--font-display)] text-3xl text-navy-900 sm:text-4xl">
              What people are saying
            </motion.h2>
            <motion.div variants={fadeIn} className="mt-16 grid gap-8 md:grid-cols-3">
              {testimonialQuotes.map((quote) => (
                <div key={quote.author} className="assessment-card p-6">
                  <p className="leading-relaxed text-navy-700">&ldquo;{quote.text}&rdquo;</p>
                  <div className="mt-4 border-t border-navy-100 pt-4">
                    <div className="font-semibold text-navy-900">{quote.author}</div>
                    <div className="text-sm text-navy-500">{quote.role}</div>
                  </div>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="px-6 py-24">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center font-[family-name:var(--font-display)] text-3xl text-navy-900 sm:text-4xl">
            Frequently asked questions
          </h2>
          <div className="mt-12 space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="rounded-xl border border-navy-100 bg-white overflow-hidden"
              >
                <button
                  onClick={() => setExpandedFaq(expandedFaq === i ? null : i)}
                  className="flex w-full items-center justify-between p-5 text-left"
                >
                  <span className="font-semibold text-navy-900">{faq.q}</span>
                  <svg
                    className={`h-5 w-5 shrink-0 text-navy-400 transition-transform ${
                      expandedFaq === i ? "rotate-180" : ""
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {expandedFaq === i && (
                  <div className="border-t border-navy-100 px-5 pb-5 pt-3">
                    <p className="leading-relaxed text-navy-600">{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-navy-900 px-6 py-24">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-[family-name:var(--font-display)] text-3xl text-white sm:text-4xl">
            Ready to finally understand yourself?
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-navy-300">
            30+ psychological screens. One hour. A lifetime of clarity.
          </p>
          <Link
            href="/assess"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-amber-500 px-8 py-4 text-base font-semibold text-navy-900 shadow-lg transition-all hover:bg-amber-400 hover:shadow-xl hover:-translate-y-0.5"
          >
            Start Your Free Assessment
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-navy-100 bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div>
              <div className="font-[family-name:var(--font-display)] text-lg text-navy-900">
                Deep <span className="gradient-text">Personality</span>
              </div>
              <p className="mt-1 text-sm text-navy-500">
                Backed by science, powered by AI.
              </p>
            </div>
            <div className="flex gap-6 text-sm text-navy-500">
              <a href="#" className="hover:text-navy-700 transition-colors">Privacy</a>
              <a href="#" className="hover:text-navy-700 transition-colors">Terms</a>
              <a href="#" className="hover:text-navy-700 transition-colors">Contact</a>
            </div>
          </div>
          <div className="mt-8 border-t border-navy-100 pt-6 text-center text-xs text-navy-400">
            <p>
              Deep Personality is a screening tool, not a diagnostic instrument. Results are not a clinical diagnosis.
              This product is not a substitute for professional mental health evaluation or treatment.
            </p>
            <p className="mt-2">
              If you are in crisis, contact{" "}
              <a href="tel:988" className="font-semibold text-coral-600 hover:underline">
                988
              </a>{" "}
              (Suicide &amp; Crisis Lifeline) or your local emergency services.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
