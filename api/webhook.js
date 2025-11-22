/**
 * Vercel Serverless Function - Stripe Webhook Handler
 *
 * This function handles Stripe webhook events for payment confirmations.
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(buf, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', {
        id: session.id,
        customer: session.customer_email,
        amount: session.amount_total / 100,
        metadata: session.metadata,
      });

      // TODO: Implement your business logic here:
      // 1. Send confirmation email to customer
      // 2. Send notification to ViewMinder agent
      // 3. Store booking in database
      // 4. Schedule the inspection
      // 5. Add to calendar/scheduling system

      // Example: You might want to call an email service here
      // await sendConfirmationEmail(session.customer_email, session.metadata);
      // await notifyAgent(session.metadata);

      break;

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      console.log('Payment failed:', {
        id: paymentIntent.id,
        customer: paymentIntent.customer,
      });

      // TODO: Handle failed payment
      // - Send notification to customer
      // - Log the failure

      break;

    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  res.json({ received: true });
}
