import { NextRequest, NextResponse } from 'next/server';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const PRICE_CONFIG = {
  full: {
    amount: 1900, // $19.00 in cents
    name: 'Deep Personality — Full Report',
    description: '50+ page AI-generated personality report with facet-level analysis, mental health screening, neurodivergence profiling, and personalized recommendations.',
  },
  couples: {
    amount: 2900, // $29.00 in cents
    name: 'Deep Personality — Couples Comparison',
    description: 'Full reports for both partners plus detailed relationship dynamics analysis, attachment compatibility, and growth roadmap.',
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { tier, assessmentId } = body;

    if (!tier || !['full', 'couples'].includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be "full" or "couples".' },
        { status: 400 }
      );
    }

    const priceConfig = PRICE_CONFIG[tier as keyof typeof PRICE_CONFIG];

    // If Stripe is configured, create a real checkout session
    if (STRIPE_SECRET_KEY) {
      const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${STRIPE_SECRET_KEY}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          'mode': 'payment',
          'success_url': `${BASE_URL}/results?payment=success&tier=${tier}`,
          'cancel_url': `${BASE_URL}/results?payment=cancelled`,
          'line_items[0][price_data][currency]': 'usd',
          'line_items[0][price_data][product_data][name]': priceConfig.name,
          'line_items[0][price_data][product_data][description]': priceConfig.description,
          'line_items[0][price_data][unit_amount]': priceConfig.amount.toString(),
          'line_items[0][quantity]': '1',
          ...(assessmentId ? { 'metadata[assessmentId]': assessmentId } : {}),
          'metadata[tier]': tier,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        console.error('Stripe error:', error);
        return NextResponse.json(
          { error: 'Payment service error. Please try again.' },
          { status: 502 }
        );
      }

      const session = await response.json();
      return NextResponse.json({ url: session.url });
    }

    // Demo mode - no Stripe key configured
    // Simulate successful payment for development
    return NextResponse.json({
      url: `${BASE_URL}/results?payment=success&tier=${tier}&demo=true`,
      demo: true,
      message: 'Stripe not configured. Redirecting to results with demo access.',
    });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
