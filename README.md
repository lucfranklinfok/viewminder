# ViewMinder - Sydney Inspection Proxy Service

A professional single-page React application for ViewMinder, a specialized marketplace connecting Australian renters with inspection proxy services in Sydney's Eastern Suburbs and Inner West.

## Features

- **Mobile-First Design**: Fully responsive with Tailwind CSS
- **Professional UI**: Teal/Light Blue color scheme on White/Grey background
- **Service Area Management**: Hardcoded suburbs for operational safety
- **Decoy Pricing**: Three-tier pricing strategy ($39, $49, $89)
- **Complete Booking Flow**: Form validation and Stripe checkout integration ready
- **Legal Compliance**: Terms agreement checkbox and refund policy
- **Trust Building**: Confidence Guarantee section with 100% refund promise

## Tech Stack

- **React 18.3** - Modern UI library
- **Vite 6** - Fast build tool and dev server
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **Lucide React** - Beautiful icon library

## Getting Started

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
ViewMinder/
├── src/
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles with Tailwind directives
├── index.html           # HTML template
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind configuration
├── postcss.config.js    # PostCSS configuration
└── vite.config.js       # Vite configuration
```

## Key Components

### Hero Section
- Compelling headline and value proposition
- Clear call-to-action button
- Geographic targeting (Bondi, Newtown, Surry Hills)

### USP Features
- Agent Check-in Protocol
- Live/HD Video Options
- 15-Point Quality Report

### Service Area Checker
Hardcoded suburbs:
- Bondi / Bondi Junction
- Coogee / Randwick
- Surry Hills / Darlinghurst
- Newtown / Enmore
- Glebe / Chippendale
- Potts Point / Elizabeth Bay

### Pricing Tiers

1. **Basic ($39)**
   - Attendance at inspection
   - Name on application list
   - 5 high-quality photos

2. **Standard ($49)** - Best Value
   - All Basic features
   - Live Video Call OR HD Recorded Walkthrough
   - Full 15-Point Quality Report
   - Same-day delivery

3. **Premium ($89)**
   - All Standard features
   - Printed Cover Letter to Agent
   - Priority booking
   - Dedicated support

### Booking Form
Complete validation for:
- Personal details (name, email, mobile)
- Service area selection
- Property listing link
- Inspection date and time
- Terms agreement

### Legal & Trust
- ViewMinder Confidence Guarantee (100% refund)
- Mandatory Terms of Service agreement
- Footer with legal links
- "Become a ViewMinder Agent" CTA

## Customization

### Colors
Edit `tailwind.config.js` to customize the primary teal color palette.

### Suburbs
Update the `suburbs` array in `src/App.jsx` to add or modify service areas.

### Pricing
Modify the `pricingTiers` array in `src/App.jsx` to adjust pricing and features.

## Stripe Integration

The application includes full Stripe Checkout integration. Follow these steps to enable payments:

### Frontend Setup (Already Complete)

- ✅ `@stripe/stripe-js` installed
- ✅ Stripe promise configured in `src/stripe.js`
- ✅ Checkout flow implemented in `src/App.jsx`
- ✅ Loading states and error handling

### Environment Variables

Create a `.env.local` file in the root directory (use `.env.local.example` as template):

```bash
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
VITE_API_URL=http://localhost:3001
```

**For Vercel Production:**

1. Go to your Vercel project dashboard
2. Navigate to **Settings** → **Environment Variables**
3. Add:
   - `VITE_STRIPE_PUBLISHABLE_KEY` = Your Stripe publishable key (pk_live_...)
   - `VITE_API_URL` = Your backend API URL

### Backend Setup Required

You need a backend API to create Stripe Checkout sessions. See `backend-example.js` for a complete implementation.

#### Option 1: Node.js/Express Server

1. Create a new directory for your backend
2. Install dependencies:
   ```bash
   npm install express stripe cors dotenv
   ```
3. Copy the code from `backend-example.js`
4. Create `.env` file:
   ```bash
   STRIPE_SECRET_KEY=sk_test_your_secret_key_here
   STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret
   FRONTEND_URL=https://viewminder.vercel.app
   PORT=3001
   ```
5. Run: `node backend-example.js`

#### Option 2: Deploy Backend to Vercel

1. Create a new repository for your backend
2. Add `backend-example.js` as `api/create-checkout-session.js`
3. Deploy to Vercel
4. Add environment variables in Vercel dashboard
5. Update `VITE_API_URL` in your frontend to point to the backend

#### Option 3: Serverless Functions

Deploy as serverless functions on:
- **Vercel Functions**: Place in `/api` directory
- **Netlify Functions**: Place in `/netlify/functions` directory
- **AWS Lambda**: Use AWS API Gateway + Lambda

### Get Your Stripe Keys

1. Sign up at [stripe.com](https://stripe.com)
2. Go to [Dashboard → API Keys](https://dashboard.stripe.com/apikeys)
3. Copy your **Publishable Key** (pk_test_...) for frontend
4. Copy your **Secret Key** (sk_test_...) for backend
5. For production, use **Live Mode** keys (pk_live_... and sk_live_...)

### Test the Integration

Use Stripe test cards:
- **Success**: 4242 4242 4242 4242
- **Decline**: 4000 0000 0000 0002
- Use any future expiry date, any CVC, any ZIP

### Webhook Setup (Production)

1. Go to [Dashboard → Webhooks](https://dashboard.stripe.com/webhooks)
2. Add endpoint: `https://your-backend-url.com/api/webhook`
3. Select events: `checkout.session.completed`, `payment_intent.payment_failed`
4. Copy the webhook secret to your backend `.env`

### What Happens on Successful Payment

The backend webhook receives `checkout.session.completed` event with:
- Customer details (name, email, mobile)
- Booking details (suburb, property link, date/time)
- Pricing tier selected

**Next Steps:**
- Send confirmation email to customer
- Notify ViewMinder agent
- Store booking in database
- Schedule the inspection

## Mobile Optimization

The application is built mobile-first with:
- Responsive grid layouts
- Touch-friendly buttons and inputs
- Optimized font sizes for small screens
- Smooth scrolling behavior

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

Proprietary - ViewMinder 2025
