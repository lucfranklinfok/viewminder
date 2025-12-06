/**
 * Vercel Serverless Function: Save Booking to Firestore
 *
 * This function receives booking data from Zapier (W2) and saves it to Firestore
 */

import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin (only once)
if (getApps().length === 0) {
  initializeApp({
    projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'viewminder-1dc1c',
  });
}

const db = getFirestore();

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const bookingData = req.body;

    // Validate required fields
    if (!bookingData.bookingId) {
      return res.status(400).json({ error: 'Missing bookingId' });
    }

    const appId = process.env.VITE_APP_ID || 'viewminder';
    const bookingId = bookingData.bookingId;

    // Reference to Firestore document
    const docRef = db
      .collection('artifacts')
      .doc(appId)
      .collection('public')
      .doc('data')
      .collection('jobs')
      .doc(bookingId);

    // Prepare booking data for Firestore
    const firestoreData = {
      jobId: bookingId,
      bookingId: bookingId,
      customerName: bookingData.customerName || '',
      customerEmail: bookingData.customerEmail || '',
      customerMobile: bookingData.customerMobile || '',
      suburb: bookingData.suburb || '',
      propertyLink: bookingData.propertyLink || '',
      inspectionDate: bookingData.inspectionDate || '',
      inspectionTime: bookingData.inspectionTime || '',
      pricingTier: bookingData.pricingTier || '',
      price: parseInt(bookingData.price) || 0,
      status: 'assigned',
      paymentStatus: 'paid',
      stripeChargeId: bookingData.stripeChargeId || '',
      createdAt: new Date().toISOString(),
    };

    // Write to Firestore
    await docRef.set(firestoreData);

    console.log(`Booking ${bookingId} saved to Firestore successfully`);

    return res.status(200).json({
      success: true,
      message: 'Booking saved to Firestore',
      bookingId: bookingId,
      path: `/artifacts/${appId}/public/data/jobs/${bookingId}`,
    });

  } catch (error) {
    console.error('Error saving booking to Firestore:', error);
    return res.status(500).json({
      error: 'Failed to save booking',
      message: error.message,
    });
  }
}
