/**
 * Backend API Example for ViewMinder Stripe Integration
 *
 * This is a sample Node.js/Express server that creates Stripe Checkout sessions.
 * You can deploy this to Vercel, Netlify Functions, AWS Lambda, or any Node.js server.
 *
 * SETUP:
 * 1. npm install express stripe cors dotenv
 * 2. Create a .env file with: STRIPE_SECRET_KEY=sk_test_your_key_here
 * 3. Run: node backend-example.js
 */

const express = require('express');
const cors = require('cors');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
require('dotenv').config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Create Stripe Checkout Session
app.post('/api/create-checkout-session', async (req, res) => {
  try {
    const { pricingTier, price, customerEmail, customerName, metadata } = req.body;

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `ViewMinder ${metadata.pricingTierName} Service`,
              description: `Inspection proxy for ${metadata.suburb} on ${metadata.inspectionDate}`,
            },
            unit_amount: price * 100, // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL || 'http://localhost:5173'}?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        customerName,
        mobile: metadata.mobile,
        suburb: metadata.suburb,
        propertyLink: metadata.propertyLink,
        inspectionDate: metadata.inspectionDate,
        inspectionTime: metadata.inspectionTime,
        pricingTier: pricingTier,
      },
    });

    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ error: error.message });
  }
});

// Webhook endpoint for Stripe events (for production)
app.post('/api/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Payment successful:', session);

      // TODO: Send confirmation email to customer
      // TODO: Send notification to ViewMinder agent
      // TODO: Store booking in database

      break;

    case 'payment_intent.payment_failed':
      const paymentIntent = event.data.object;
      console.log('Payment failed:', paymentIntent);

      // TODO: Handle failed payment

      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`);
  console.log(`Stripe is ${process.env.STRIPE_SECRET_KEY ? 'configured' : 'NOT configured'}`);
});

// Export for serverless deployment (Vercel, Netlify, etc.)
module.exports = app;
