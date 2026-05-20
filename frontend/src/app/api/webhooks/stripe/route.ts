import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  // Forward raw body to Laravel API for Stripe signature verification
  const body = await request.text();
  const signature = request.headers.get('stripe-signature') ?? '';

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000/api';

  const res = await fetch(`${apiUrl}/webhooks/stripe`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Stripe-Signature': signature,
    },
    body,
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
