/**
 * Vercel Serverless Function: Webhook Proxy
 *
 * This function acts as a proxy to send webhooks to Zapier from the server side,
 * avoiding CORS issues when testing from localhost.
 */

export default async function handler(req, res) {
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
    if (!webhookUrl.startsWith('https://hooks.zapier.com/')) {
      return res.status(400).json({ error: 'Invalid webhook URL' });
    }

    // Forward the webhook request to Zapier
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
