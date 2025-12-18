import { NextResponse } from 'next/server';
// @ts-expect-error - midtrans-client may not have types
import midtransClient from 'midtrans-client';

export async function POST(req: Request) {
  try {
    const { userId, planName, amount, email, name } = await req.json();

    const snap = new midtransClient.Snap({
      isProduction: false, // Set to true for live
      serverKey: process.env.MIDTRANS_SERVER_KEY,
    });

    const parameter = {
      transaction_details: {
        order_id: `AIDOC-${userId}-${Date.now()}`,
        gross_amount: amount,
      },
      customer_details: {
        first_name: name,
        email: email,
      },
      item_details: [
        {
          id: 'PRO_MAX',
          price: amount,
          quantity: 1,
          name: planName,
        },
      ],
      callbacks: {
        finish: `${process.env.NEXT_PUBLIC_BASE_URL}/profiles?payment=success`,
        error: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?payment=error`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL}/billing?payment=pending`,
      },
    };

    const transaction = await snap.createTransaction(parameter);
    return NextResponse.json({ token: transaction.token });
  } catch (error: any) {
    console.error('Midtrans API Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
