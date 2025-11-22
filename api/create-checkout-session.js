/**
 * Vercel Serverless Function - Create Stripe Checkout Session
 *
 * This function creates a Stripe Checkout session for ViewMinder bookings.
 * Deploy automatically with your Vercel frontend.
 */

import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { pricingTier, price, customerEmail, customerName, metadata } = req.body;

    // Validate required fields
    if (!price || !customerEmail || !metadata) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get the frontend URL
    const frontendUrl = process.env.FRONTEND_URL || 'https://viewminder.vercel.app';

    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'aud',
            product_data: {
              name: `ViewMinder ${metadata.pricingTierName} Service`,
              description: `Inspection proxy for ${metadata.suburb} on ${metadata.inspectionDate} at ${metadata.inspectionTime}`,
              images: [], // You can add ViewMinder logo URL here later
            },
            unit_amount: Math.round(price * 100), // Stripe expects amount in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${frontendUrl}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${frontendUrl}/?canceled=true`,
      customer_email: customerEmail,
      metadata: {
        customerName,
        mobile: metadata.mobile,
        suburb: metadata.suburb,
        propertyLink: metadata.propertyLink,
        inspectionDate: metadata.inspectionDate,
        inspectionTime: metadata.inspectionTime,
        pricingTier: pricingTier,
        pricingTierName: metadata.pricingTierName,
      },
      // Billing address collection
      billing_address_collection: 'auto',
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({
      error: error.message || 'Failed to create checkout session'
    });
  }
}
