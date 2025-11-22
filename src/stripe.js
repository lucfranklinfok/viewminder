import { loadStripe } from '@stripe/stripe-js';

// Load Stripe publishable key from environment variable
// In development, this will come from .env.local
// In production (Vercel), this will come from Environment Variables in dashboard
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '');

export default stripePromise;
