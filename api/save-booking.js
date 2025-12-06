/**
 * Vercel Serverless Function: Save Booking to Firestore
 *
 * This function receives booking data from Zapier (W2) and saves it to Firestore
 * using the Firestore REST API (no service account needed)
 */

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

    const projectId = process.env.VITE_FIREBASE_PROJECT_ID || 'viewminder-1dc1c';
    const apiKey = process.env.VITE_FIREBASE_API_KEY;
    const appId = process.env.VITE_APP_ID || 'viewminder';
    const bookingId = bookingData.bookingId;

    // Firestore REST API URL
    const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/artifacts/${appId}/public/data/jobs/${bookingId}?key=${apiKey}`;

    // Prepare booking data in Firestore REST API format
    const firestoreDocument = {
      fields: {
        jobId: { stringValue: bookingId },
        bookingId: { stringValue: bookingId },
        customerName: { stringValue: bookingData.customerName || '' },
        customerEmail: { stringValue: bookingData.customerEmail || '' },
        customerMobile: { stringValue: bookingData.customerMobile || '' },
        suburb: { stringValue: bookingData.suburb || '' },
        propertyLink: { stringValue: bookingData.propertyLink || '' },
        inspectionDate: { stringValue: bookingData.inspectionDate || '' },
        inspectionTime: { stringValue: bookingData.inspectionTime || '' },
        pricingTier: { stringValue: bookingData.pricingTier || '' },
        price: { integerValue: String(bookingData.price || 0) },
        status: { stringValue: 'assigned' },
        paymentStatus: { stringValue: 'paid' },
        stripeChargeId: { stringValue: bookingData.stripeChargeId || '' },
        createdAt: { timestampValue: new Date().toISOString() },
      }
    };

    // Write to Firestore using REST API
    const response = await fetch(firestoreUrl, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(firestoreDocument),
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Firestore API error: ${response.status} - ${errorData}`);
    }

    const result = await response.json();

    console.log(`Booking ${bookingId} saved to Firestore successfully`);

    return res.status(200).json({
      success: true,
      message: 'Booking saved to Firestore',
      bookingId: bookingId,
      path: `/artifacts/${appId}/public/data/jobs/${bookingId}`,
      firestoreResponse: result,
    });

  } catch (error) {
    console.error('Error saving booking to Firestore:', error);
    return res.status(500).json({
      error: 'Failed to save booking',
      message: error.message,
    });
  }
}
