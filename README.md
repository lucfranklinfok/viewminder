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

The "Pay Now" button is ready for Stripe Checkout integration. In production:

1. Set up Stripe account
2. Add Stripe.js library
3. Replace the form submission handler with Stripe Checkout redirect
4. Include pricing tier and form data in checkout session

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
