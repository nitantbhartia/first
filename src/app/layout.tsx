import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deep Personality — The Owner's Manual for Your Mind",
  description:
    "30+ clinically-validated psychological screens. One hour. A lifetime of clarity. Get your AI-generated 50+ page personality report covering traits, attachment, mental health, neurodivergence, values, and more.",
  keywords: [
    "personality test",
    "psychological assessment",
    "mental health screening",
    "Big Five personality",
    "attachment style",
    "ADHD screening",
    "anxiety test",
    "depression screening",
    "couples compatibility",
    "AI personality report",
  ],
  openGraph: {
    title: "Deep Personality — Finally understand yourself",
    description:
      "30+ psychological screens, one hour, a lifetime of clarity. Backed by science, powered by AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
