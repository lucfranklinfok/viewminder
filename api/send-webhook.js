/**
 * Vercel Serverless Function: Webhook Proxy
 *
 * This function acts as a proxy to send webhooks to Zapier from the server side,
 * avoiding CORS issues when testing from localhost.
 */

export default async function handler(req, res) {
  // Set CORS headers to allow requests from localhost during development
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle OPTIONS preflight request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { webhookUrl, data } = req.body;

    // Validate input
    if (!webhookUrl || !data) {
      return res.status(400).json({ error: 'Missing webhookUrl or data' });
    }

    // Validate webhook URL (basic security check)
    const isZapier = webhookUrl.startsWith('https://hooks.zapier.com/');
    const isMake = webhookUrl.startsWith('https://hook.') && webhookUrl.includes('.make.com/');

    if (!isZapier && !isMake) {
      return res.status(400).json({ error: 'Invalid webhook URL. Only Zapier and Make.com webhooks are allowed.' });
    }

    // Forward the webhook request to Zapier/Make.com
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      throw new Error(`Zapier webhook failed with status ${response.status}`);
    }

    // Return success
    return res.status(200).json({
      success: true,
      message: 'Webhook sent successfully'
    });

  } catch (error) {
    console.error('Webhook proxy error:', error);
    return res.status(500).json({
      error: 'Failed to send webhook',
      message: error.message
    });
  }
}
