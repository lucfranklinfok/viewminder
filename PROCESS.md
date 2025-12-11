# ViewMinder Process Documentation

## System Overview

ViewMinder is a property inspection booking and management platform that connects customers with inspection agents through an automated workflow.

---

## Complete Booking to Completion Flow

### Step 1: Customer Books Inspection

**Customer Actions:**
1. Visits https://viewminder.vercel.app
2. Fills out booking form:
   - Property address/link
   - Inspection date and time
   - Customer details (name, email, mobile)
   - Selects pricing tier (Standard/Premium/Luxury)
3. Pays via Stripe

**Automatic System Actions:**
- ✅ Stripe processes payment
- ✅ **Webhook 1 (W1)** sends booking data to Make.com
- ✅ Make.com sends **2 emails**:
  - Email to **Customer**: Booking confirmation with booking ID and tracking link
  - Email to **Admin**: New booking alert with all details
- ✅ **Webhook 2 (W2)** saves booking to Firestore with status: `assigned`
- ✅ Customer redirected to success page with tracking link

**Database Storage:**
```
Firestore Path: /artifacts/viewminder/public/data/jobs/{bookingId}
Initial Status: "assigned"
Payment Status: "paid"
```

---

### Step 2: Admin Assigns Agent

**Admin Actions:**
1. Receives email notification of new booking
2. Logs into admin dashboard: https://viewminder.vercel.app/admin
   - Password: `ViewMinder2024!`
3. Views booking details in dashboard
4. Manually contacts agent (Mike/other) via phone/WhatsApp
5. Assigns agent to job

**System State:**
- Status remains: `assigned`
- Booking visible in admin dashboard
- Customer can track at: `/status?id={bookingId}`

---

### Step 3: Agent Completes Inspection

**Agent Actions (Manual Process):**
1. Agent receives job details from admin
2. Visits property at scheduled date/time
3. Performs 15-point inspection:
   - Foundation, roof, walls, plumbing, electrical, HVAC, etc.
4. Takes photos (20-50 images)
5. Records walkthrough video
6. Sends files to admin via WhatsApp/email

**Admin Actions After Receiving Files:**
1. Logs into admin dashboard
2. Finds the booking
3. Clicks "View Details"
4. Scrolls to "Inspection Files" section
5. Clicks "Upload Photos/Videos"
6. Selects all photos and videos
7. Uploads to Firebase Storage (progress bar shows upload)
8. Clicks "Completed" button to update status

**Automatic System Actions:**
- ✅ Files uploaded to Firebase Storage: `/inspections/{bookingId}/`
- ✅ File URLs saved to Firestore in `files` array
- ✅ Booking status updated to: `completed`
- ✅ Timestamp updated in `updatedAt` field

---

### Step 4: Customer Views Report

**Customer Actions:**
1. Receives completion notification (currently manual, will be automated)
2. Visits tracking link: https://viewminder.vercel.app/status?id={bookingId}
3. Views booking status: ✅ Completed
4. Sees uploaded inspection files
5. Clicks to view/download photos and videos

**What Customer Sees:**
- ✅ Booking status badge (Assigned/Completed/Cancelled)
- ✅ Inspection date and time
- ✅ Property location
- 📁 All uploaded files (photos, videos, PDFs)
- 🔗 Clickable links to view/download each file

---

## System Architecture

### Tech Stack

**Frontend:**
- React (Vite)
- Tailwind CSS
- Lucide React Icons
- Deployed on Vercel

**Backend:**
- Firebase Firestore (Database)
- Firebase Storage (File uploads)
- Stripe (Payments)
- Make.com (Workflow automation)
- Vercel Serverless Functions (API endpoints)

**Key Files:**
- `/src/App.jsx` - Main app and booking form
- `/src/AdminDashboard.jsx` - Admin interface for managing bookings
- `/src/StatusTracker.jsx` - Customer-facing status page
- `/src/firebase.js` - Firebase configuration
- `/api/save-booking.js` - Serverless function for Make.com webhook
- `/api/send-webhook.js` - Webhook proxy supporting Make.com and Zapier

---

## Make.com Workflow (Replaces Zapier)

### Overview
Make.com provides free workflow automation (1,000 operations/month) and replaced Zapier after trial expiration.

**Scenario Name:** Integration Webhooks
**Webhook URL:** https://hook.eu1.make.com/huwf45nrnhom73jykvhh2sr8acfvy7qn

### Module 1: Custom Webhook (Trigger)
**Type:** Webhook trigger
**Function:** Receives booking data from booking form after Stripe payment

### Module 2: Admin Email Notification
**Type:** Gmail - Send an Email
**Connection:** Gmail OAuth (webstudioperth@gmail.com)
**To:** webstudioperth@gmail.com
**Subject:** `New ViewMinder Booking - {{1.bookingId}}`
**Body:** HTML email with all booking details

### Module 3: Customer Confirmation Email
**Type:** Gmail - Send an Email
**Connection:** Gmail OAuth (webstudioperth@gmail.com)
**To:** `{{1.customerEmail}}`
**Subject:** `Booking Confirmed - ViewMinder Inspection #{{1.bookingId}}`
**Body:** HTML email with booking confirmation and tracking link

### Module 4: Save to Firestore
**Type:** HTTP - Make a request
**Method:** POST
**URL:** `https://viewminder.vercel.app/api/save-booking`
**Authentication:** None
**Headers:** `Content-Type: application/json`
**Body Input Method:** Data structure
**Data Saved:**
```javascript
{
  jobId: bookingId,
  bookingId: bookingId,
  customerName: string,
  customerEmail: string,
  customerMobile: string,
  suburb: string,
  propertyLink: string,
  inspectionDate: string,
  inspectionTime: string,
  pricingTier: string,
  price: number,
  status: "assigned",
  paymentStatus: "paid",
  stripeChargeId: string,
  createdAt: timestamp, // Server-generated, not sent from Make.com
  files: [] // Added when inspection files uploaded
}
```

### Google OAuth Configuration for Gmail
**Purpose:** Required for Make.com to send emails via Gmail API

**Google Cloud Project:** ViewMinder Automation
**OAuth Client Name:** ViewMinder Make.com
**Client ID:** `60833953054-9cupv1gktfqrm691la507p7fpers00nb.apps.googleusercontent.com`
**Authorized Redirect URIs:**
- `https://www.make.com/oauth/cb/google-email`
- `https://www.integromat.com/oauth/cb/google-email`
- `https://eu1.make.com/oauth/cb/google-email`

**Gmail API Scopes:**
- gmail.modify
- gmail.readonly
- gmail.compose
- gmail.send

**Connected Account:** webstudioperth@gmail.com

---

## File Upload System

### Storage Structure
```
Firebase Storage:
/inspections/
  /{bookingId}/
    /1234567890_photo1.jpg
    /1234567891_photo2.jpg
    /1234567892_video.mp4
```

### File Metadata (Stored in Firestore)
```javascript
files: [
  {
    name: "photo1.jpg",
    url: "https://firebasestorage.googleapis.com/...",
    type: "image/jpeg",
    size: 2048000, // bytes
    uploadedAt: "2025-12-08T10:30:00.000Z"
  }
]
```

### Upload Process
1. Admin selects files in booking modal
2. Files uploaded to Firebase Storage with progress indicator
3. Download URLs generated
4. File metadata saved to Firestore `files` array
5. Local state updated to show files immediately

---

## Admin Dashboard Features

**URL:** https://viewminder.vercel.app/admin
**Password:** `ViewMinder2024!` (stored in `VITE_ADMIN_PASSWORD`)

**Features:**
- 📊 Dashboard statistics (total bookings, assigned, completed, revenue)
- 🔍 Search bookings by ID, name, email, or suburb
- 🎯 Filter by status (all, assigned, completed, cancelled)
- 📋 View all booking details
- 📤 Upload inspection files (photos, videos, PDFs)
- 🗑️ Delete uploaded files
- ✅ Update booking status (assigned/completed/cancelled)
- 🔄 Real-time data refresh

**Security:**
- Password protected with session storage
- Only admins can upload/delete files
- Customers can only view files (read-only)

---

## Status Tracking System

**URL:** https://viewminder.vercel.app/status?id={bookingId}

**Customer View:**
- 🔵 Status badge (Assigned = pending, Completed = ready, Cancelled = cancelled)
- 📅 Inspection date and time
- 📍 Property location
- 💰 Price paid
- 📂 Uploaded files section (will be added)

**Status Options:**
- `assigned` - Job assigned, awaiting inspection
- `completed` - Inspection done, files uploaded
- `cancelled` - Booking cancelled

---

## Environment Variables

### Local Development (`.env.local`)
```bash
# Stripe
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Backend API
VITE_API_URL=

# Make.com Webhook (formerly Zapier)
# Old Zapier URL (commented out): https://hooks.zapier.com/hooks/catch/25475925/uzcy4o8/
VITE_ZAPIER_BOOKING_WEBHOOK_URL=https://hook.eu1.make.com/huwf45nrnhom73jykvhh2sr8acfvy7qn

# Firebase
VITE_FIREBASE_PROJECT_ID=viewminder-1dc1c
VITE_FIREBASE_API_KEY=AIzaSyCkYup8Xf2xK4ALmaL030BRz0E06xWxNBQ
VITE_APP_ID=viewminder

# Admin
VITE_ADMIN_PASSWORD=ViewMinder2024!
```

### Production (Vercel)
Same variables configured in Vercel dashboard under:
Project Settings → Environment Variables

---

## Firebase Configuration

### Firestore Database
**Plan:** Spark (Free)
**Database Path:** `/artifacts/viewminder/public/data/jobs/`
**Security Rules:** Read/write allowed for testing (should be secured for production)

### Firebase Storage
**Plan:** Blaze (Pay-as-you-go) - $300 credit available
**Location:** US-CENTRAL1
**Storage Path:** `/inspections/{bookingId}/`
**Security Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow anyone to read files (customers can view)
    match /{allPaths=**} {
      allow read: if true;
    }

    // Allow writes to inspections folder
    match /inspections/{bookingId}/{allPaths=**} {
      allow write: if true;
      allow delete: if true;
    }
  }
}
```

---

## Email Templates

### Email 1: Admin Notification ✅ CONFIGURED
**To:** webstudioperth@gmail.com
**Subject:** New ViewMinder Booking - {bookingId}
**Purpose:** Alert admin of new booking requiring agent assignment
**Sent via:** Make.com Module 2 (Gmail)

### Email 2: Customer Confirmation ✅ CONFIGURED
**To:** Customer email
**Subject:** Booking Confirmed - ViewMinder Inspection #{bookingId}
**Purpose:** Confirm booking and provide tracking link
**Sent via:** Make.com Module 3 (Gmail)
**Template:** See section below

### Email 3: Inspection Complete (FUTURE)
**To:** Customer email
**Subject:** Your ViewMinder Inspection is Complete!
**Purpose:** Notify customer inspection is done with link to view files
**Status:** Not yet implemented - currently manual

---

## Customer Confirmation Email Template

```
Hi {{Customer Name}},

Thank you for booking your property inspection with ViewMinder!

Your booking has been confirmed and payment of ${{Price}} has been received.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 BOOKING DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Booking ID: {{Booking Id}}
Inspection Date: {{Inspection Date}}
Inspection Time: {{Inspection Time}}
Property Location: {{Suburb}}
Property Link: {{Property Link}}
Pricing Tier: {{Pricing Tier}}
Total Paid: ${{Price}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📍 WHAT HAPPENS NEXT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. We'll assign an experienced ViewMinder agent to your inspection
2. Our agent will visit your property on the scheduled date/time
3. You'll receive an email once the inspection is complete with photos and video
4. Track your booking anytime at:
   https://viewminder.vercel.app/status?id={{Booking Id}}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Questions? Simply reply to this email and we'll get back to you.

Thanks for choosing ViewMinder!

Best regards,
The ViewMinder Team
https://viewminder.vercel.app
```

---

## Pricing Tiers

| Tier | Price | Description |
|------|-------|-------------|
| Standard | $49 | Basic inspection with photos |
| Premium | $99 | Detailed inspection with photos and video |
| Luxury | $149 | Comprehensive inspection with extensive media |

---

## Future Enhancements

### High Priority
1. ✅ **Customer confirmation email** - COMPLETED (Make.com Module 3)
2. ⏳ **Show uploaded files on status tracker** - Customer can't see files yet
3. ⏳ **Automated completion email** - Manual notification required currently

### Medium Priority
4. ⏳ **Agent portal** - Agents can't upload files directly
5. ⏳ **15-point inspection form** - Agent fills out digitally
6. ⏳ **Download all files as ZIP** - Bulk download option

### Low Priority
7. ⏳ **Email notifications on status change** - Automated customer updates
8. ⏳ **SMS notifications** - Text alerts for customers
9. ⏳ **Agent mobile app** - iOS/Android app for agents

---

## Common Issues and Solutions

### Issue: Customer not receiving email
**Cause:** Gmail OAuth not connected or Make.com scenario not active
**Solution:** Check Gmail connection in Make.com, ensure scenario is active

### Issue: Files not uploading
**Cause:** Firebase Storage not enabled or on free Spark plan
**Solution:** Upgrade to Blaze plan, enable Firebase Storage, update security rules

### Issue: Admin password not working in production
**Cause:** Environment variable not set in Vercel
**Solution:** Add `VITE_ADMIN_PASSWORD` to Vercel environment variables, redeploy

### Issue: Status tracker shows "Invalid Date" ✅ RESOLVED
**Cause:** Firestore Timestamp object not handled correctly by formatDate function
**Solution:** Updated formatDate function in AdminDashboard.jsx to handle both Firestore Timestamp objects (with `seconds` property) and ISO strings

### Issue: Webhook not saving to Firestore
**Cause:** Vercel environment variables not set for `/api/save-booking`
**Solution:** Add `VITE_FIREBASE_PROJECT_ID` and `VITE_FIREBASE_API_KEY` to Vercel

### Issue: Make.com webhook blocked
**Cause:** `/api/send-webhook.js` only validated Zapier URLs
**Solution:** Updated webhook proxy to accept both Zapier and Make.com URLs

---

## Support and Maintenance

### Regular Tasks
- Monitor Make.com scenario execution logs for failures
- Check Firebase Storage usage (stay within budget)
- Review Stripe dashboard for payments
- Clean up old test bookings in Firestore
- Verify Gmail OAuth connection remains active

### Emergency Contacts
- Stripe Support: https://support.stripe.com
- Firebase Support: https://firebase.google.com/support
- Vercel Support: https://vercel.com/support
- Make.com Support: https://www.make.com/en/help

---

## Changelog

### 2025-12-11
- ✅ **Migrated from Zapier to Make.com** due to expired trial
- ✅ Updated webhook URL to Make.com in `.env.local` and Vercel
- ✅ Modified `/api/send-webhook.js` to support both Zapier and Make.com URLs
- ✅ **Configured Google OAuth 2.0** for Gmail API access in Make.com
- ✅ Created 4-module Make.com scenario: Webhook → Admin Email → Customer Email → Save to Firestore
- ✅ **Implemented customer confirmation email** via Make.com (Gmail)
- ✅ **Fixed "Invalid Date" display** in admin dashboard - updated formatDate function to handle Firestore Timestamp objects
- ✅ Tested complete end-to-end workflow successfully
- 📝 Updated PROCESS.md with Make.com configuration and OAuth setup

### 2025-12-08
- ✅ Added Firebase Storage integration
- ✅ Implemented file upload system in admin dashboard
- ✅ Enabled file uploads for inspection photos/videos
- ✅ Added file metadata storage in Firestore
- 📝 Documented complete booking process
- 📝 Created customer confirmation email template

### 2025-12-07
- ✅ Built admin dashboard with password protection
- ✅ Added status update functionality
- ✅ Integrated Firebase Firestore database
- ✅ Created two-webhook Zapier flow

### Earlier
- ✅ Initial booking form and Stripe payment
- ✅ Status tracker page
- ✅ Basic email notifications via Zapier

---

## Repository Information

**GitHub:** https://github.com/lucfranklinfok/viewminder
**Live Site:** https://viewminder.vercel.app
**Admin Dashboard:** https://viewminder.vercel.app/admin

**Key Branches:**
- `main` - Production branch (auto-deploys to Vercel)

**Deployment:**
- Automatic deployment on push to `main` via Vercel GitHub integration
- Build command: `npm run build`
- Output directory: `dist`

---

*Last Updated: 2025-12-11*
