# ViewMinder Zapier Webhook Setup Guide

## Overview

This guide explains how to set up the two-webhook architecture for ViewMinder's booking and payment flow.

## Architecture Diagram

```
Renter App → Webhook 1 (Booking) → Zapier Storage → Stripe Payment → Webhook 2 (Confirmation) → Firestore
```

## Prerequisites

- Zapier account (Free or Paid)
- Stripe account with webhook endpoint configured
- Firebase/Firestore database set up

---

## Part 1: Setting Up Webhook 1 (Booking Submission)

### Step 1: Create Zapier Zap for Webhook 1

1. Log into Zapier
2. Click "Create Zap"
3. Name it: **"ViewMinder - Booking Submission (W1)"**

### Step 2: Configure Trigger (Catch Hook)

1. **Trigger**: Search for "Webhooks by Zapier"
2. **Event**: Select "Catch Hook"
3. Click "Continue"
4. **Copy the Webhook URL** provided by Zapier
   - Example: `https://hooks.zapier.com/hooks/catch/123456/abcdefg/`
5. **Paste this URL** into your `.env.local` file:
   ```
   VITE_ZAPIER_BOOKING_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_ID/
   ```

### Step 3: Test the Webhook

1. Fill out the ViewMinder booking form on localhost
2. Submit the form (it will fail at Stripe since we're testing)
3. Return to Zapier and click "Test Trigger"
4. You should see the booking data appear

Expected data structure:
```json
{
  "bookingId": "VM-1234567890-abc123",
  "timestamp": "2025-01-24T10:30:00Z",
  "customerName": "John Doe",
  "customerEmail": "john@example.com",
  "customerMobile": "0412345678",
  "suburb": "Bondi / Bondi Junction",
  "propertyLink": "https://domain.com.au/property",
  "inspectionDate": "2025-01-25",
  "inspectionTime": "14:00",
  "pricingTier": "Standard",
  "pricingTierName": "Standard",
  "price": 49,
  "status": "pending_payment"
}
```

### Step 4: Store Data in Zapier Storage

1. Click "+" to add a new action
2. **Action**: Search for "Storage by Zapier"
3. **Event**: Select "Set Value"
4. Configure:
   - **Key**: Use the `bookingId` field from Step 1
   - **Value**: Map all the booking data as JSON

Example configuration:
```
Key: {{bookingId}}
Value: {{entire_webhook_payload}}
```

5. **Test this action** to ensure data is stored

---

## Part 2: Setting Up Webhook 2 (Stripe Payment Confirmation)

### Step 1: Configure Stripe Webhook in Stripe Dashboard

1. Go to Stripe Dashboard → Developers → Webhooks
2. Click "+ Add endpoint"
3. **Endpoint URL**: Use Zapier's webhook URL (we'll get this next)
4. **Events to send**: Select `charge.succeeded`
5. Click "Add endpoint"
6. **Copy the Signing Secret** (starts with `whsec_`)

### Step 2: Create Zapier Zap for Webhook 2

1. Create a new Zap
2. Name it: **"ViewMinder - Payment Confirmation (W2)"**

### Step 3: Configure Trigger (Stripe Webhook)

1. **Trigger**: Search for "Webhooks by Zapier"
2. **Event**: Select "Catch Hook"
3. Click "Continue"
4. **Copy the Webhook URL**
5. **Paste this URL** into Stripe Dashboard (from Part 2, Step 1)

### Step 4: Test Stripe Webhook

1. Use Stripe test card: `4242 4242 4242 4242`
2. Complete a test payment on ViewMinder
3. Return to Zapier and click "Test Trigger"
4. You should see Stripe payment data

Expected data includes:
```json
{
  "id": "ch_xxx",
  "amount": 4900,
  "metadata": {
    "bookingId": "VM-1234567890-abc123",
    "mobile": "0412345678",
    "propertyLink": "https://domain.com.au/property",
    ...
  }
}
```

### Step 5: Retrieve Booking Data from Storage

1. Click "+" to add a new action
2. **Action**: Search for "Storage by Zapier"
3. **Event**: Select "Get Value"
4. Configure:
   - **Key**: Map to `{{metadata__bookingId}}` from Stripe webhook

### Step 6: Filter - Only Proceed if Data Exists

1. Click "+" to add a Filter
2. **Condition**: `Storage Value` (from Step 5) → `exists`

This prevents processing payments without matching booking data (race condition protection).

### Step 7: Generate Job ID

1. Click "+" to add a Code action
2. **Action**: "Code by Zapier"
3. **Event**: Run JavaScript
4. Code:
```javascript
// Use booking ID as job ID (or generate new one)
const bookingId = inputData.bookingId;
const jobId = bookingId; // Simple: reuse booking ID

return {
  jobId: jobId,
  createdAt: new Date().toISOString(),
  status: 'assigned'
};
```

5. **Input Data**: Map `bookingId` from Storage

### Step 8: Write to Firestore

1. Click "+" to add a new action
2. **Action**: Search for "Firestore" or use HTTP Request
3. **Event**: Create Document

**Using HTTP Request (Recommended)**:

Method: POST
URL: `https://firestore.googleapis.com/v1/projects/YOUR_PROJECT/databases/(default)/documents/artifacts/YOUR_APP_ID/public/data/jobs`

Headers:
```
Authorization: Bearer YOUR_SERVICE_ACCOUNT_TOKEN
Content-Type: application/json
```

Body:
```json
{
  "fields": {
    "jobId": {"stringValue": "{{jobId}}"},
    "bookingId": {"stringValue": "{{metadata__bookingId}}"},
    "customerName": {"stringValue": "{{customerName}}"},
    "customerEmail": {"stringValue": "{{customerEmail}}"},
    "customerMobile": {"stringValue": "{{metadata__mobile}}"},
    "suburb": {"stringValue": "{{metadata__suburb}}"},
    "propertyLink": {"stringValue": "{{metadata__propertyLink}}"},
    "inspectionDate": {"stringValue": "{{metadata__inspectionDate}}"},
    "inspectionTime": {"stringValue": "{{metadata__inspectionTime}}"},
    "pricingTier": {"stringValue": "{{metadata__pricingTierName}}"},
    "price": {"integerValue": "{{amount}}"},
    "status": {"stringValue": "assigned"},
    "paymentStatus": {"stringValue": "paid"},
    "stripeChargeId": {"stringValue": "{{id}}"},
    "createdAt": {"timestampValue": "{{createdAt}}"}
  }
}
```

### Step 9: Send Alert Email to You

1. Click "+" to add a new action
2. **Action**: Email by Zapier (or Gmail)
3. **To**: your@email.com
4. **Subject**: `New ViewMinder Job - {{jobId}}`
5. **Body**:
```
New inspection booking received and paid!

Job ID: {{jobId}}
Customer: {{customerName}} ({{customerEmail}})
Mobile: {{metadata__mobile}}
Property: {{metadata__propertyLink}}
Inspection: {{metadata__inspectionDate}} at {{metadata__inspectionTime}}
Suburb: {{metadata__suburb}}
Tier: {{metadata__pricingTierName}} (${{amount}})

Next steps:
1. Find a Minder on Airtasker
2. Send them this URL: https://viewminder.vercel.app/minder-console?jobId={{jobId}}

Firestore path: /artifacts/YOUR_APP_ID/public/data/jobs/{{jobId}}
```

### Step 10: Clean Up Storage (Optional)

1. Click "+" to add a final action
2. **Action**: Storage by Zapier
3. **Event**: Delete Value
4. **Key**: `{{metadata__bookingId}}`

This prevents storage from filling up with old bookings.

---

## Part 3: Testing the Complete Flow

### Test Scenario 1: Successful Payment

1. Fill out ViewMinder booking form
2. Use Stripe test card: `4242 4242 4242 4242`
3. Complete payment
4. **Expected Results**:
   - Webhook 1 fires → Data stored in Zapier
   - Stripe processes payment
   - Webhook 2 fires → Retrieves booking data → Creates Firestore document
   - You receive email alert with job ID

5. **Verify in Firestore**:
   - Document exists at `/artifacts/YOUR_APP_ID/public/data/jobs/{bookingId}`
   - Status = "assigned"

### Test Scenario 2: Webhook 1 Failure

1. Disable Webhook 1 URL temporarily (set to empty in `.env.local`)
2. Try to submit booking
3. **Expected Result**: Form submission blocked with error message

### Test Scenario 3: Payment Failure

1. Use Stripe decline card: `4000 0000 0000 0002`
2. Submit booking
3. **Expected Results**:
   - Webhook 1 fires → Data stored
   - Payment fails → Webhook 2 never fires
   - No Firestore document created
   - Booking data remains in Storage (can be cleaned up later)

---

## Part 4: Handling Race Conditions

### Problem: W2 arrives before W1

**Solution**: Zapier Storage + Retry

1. In W2 Zap, add a delay BEFORE retrieving from Storage
2. **Delay**: 5 seconds
3. **Retry Logic**: If storage value doesn't exist, wait 30 seconds and retry (use Paths)

Alternative: Use Zapier's built-in delay and retry features.

---

## Part 5: Production Checklist

Before going live:

- [ ] Zapier webhook URL added to `.env.local`
- [ ] `.env.local` added to `.gitignore` (don't commit webhook URLs!)
- [ ] Stripe webhook secret verified
- [ ] Firestore security rules configured
- [ ] Test successful payment flow end-to-end
- [ ] Test failed payment flow
- [ ] Email alerts working
- [ ] Minder Console URL format correct
- [ ] Storage cleanup working

---

## Troubleshooting

### Issue: "Booking data sent to Zapier successfully" but no email received

**Check**:
1. Zapier Zap history → Is W1 triggering?
2. Stripe Dashboard → Is payment succeeding?
3. Zapier Zap history → Is W2 triggering?
4. Storage → Does booking data exist with correct bookingId?

### Issue: Firestore document not created

**Check**:
1. Firebase service account token valid?
2. Firestore path correct? (`/artifacts/{appId}/public/data/jobs/`)
3. Firestore security rules allow writes?

### Issue: Race condition - W2 fires before W1

**Solution**:
1. Add 5-second delay in W2 before retrieving from Storage
2. Add retry logic (wait 30s, retry once)

---

## Environment Variables Summary

Add these to your `.env.local`:

```env
# Zapier Webhook URL for Booking Submission (Webhook 1)
VITE_ZAPIER_BOOKING_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_ID/
```

Add this to Vercel Environment Variables (for production):

```
VITE_ZAPIER_BOOKING_WEBHOOK_URL=https://hooks.zapier.com/hooks/catch/YOUR_ID/
```

---

## Firebase Configuration

Your App.jsx expects these global variables for Firebase initialization:

```javascript
window.__firebase_config = {
  apiKey: "...",
  authDomain: "...",
  projectId: "...",
  // ... other config
};

window.__app_id = "your-app-id";
window.__initial_auth_token = "optional-custom-token";
```

Make sure these are injected via your index.html or server-side rendering.

---

## Next Steps

1. Set up Webhook 1 in Zapier
2. Test booking submission
3. Set up Webhook 2 with Stripe
4. Test complete payment flow
5. Deploy to production

For help: support@viewminder.com.au
