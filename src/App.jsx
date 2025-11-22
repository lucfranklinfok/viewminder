import React, { useState, useEffect } from 'react';
import {
  CheckCircle2,
  Video,
  ClipboardCheck,
  MapPin,
  Shield,
  Phone,
  Mail,
  Calendar,
  Link as LinkIcon,
  User,
  DollarSign,
  Loader2
} from 'lucide-react';
import stripePromise from './stripe';
import SuccessPage from './SuccessPage';
import StatusTracker from './StatusTracker';
import Apply from './Apply';

function App() {
  // Simple routing based on URL path
  const path = window.location.pathname;
  const urlParams = new URLSearchParams(window.location.search);

  // Route to different pages
  if (path === '/status' || path === '/status/') {
    return <StatusTracker />;
  }

  if (path === '/apply' || path === '/apply/') {
    return <Apply />;
  }

  if (urlParams.has('session_id')) {
    return <SuccessPage />;
  }
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    pricingTier: 'standard',
    propertyLink: '',
    inspectionDate: '',
    inspectionTime: '',
    suburb: '',
    termsAgreed: false
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Hardcoded suburbs for operational safety
  const suburbs = [
    { value: '', label: 'Select Suburb', disabled: true },
    { value: 'bondi', label: 'Bondi / Bondi Junction', disabled: false },
    { value: 'coogee', label: 'Coogee / Randwick', disabled: false },
    { value: 'surry-hills', label: 'Surry Hills / Darlinghurst', disabled: false },
    { value: 'newtown', label: 'Newtown / Enmore', disabled: false },
    { value: 'glebe', label: 'Glebe / Chippendale', disabled: false },
    { value: 'potts-point', label: 'Potts Point / Elizabeth Bay', disabled: false },
    { value: 'other', label: 'Other Sydney Suburbs (Coming Soon)', disabled: true }
  ];

  // Pricing tiers
  const pricingTiers = [
    {
      id: 'basic',
      name: 'Basic',
      price: 39,
      features: [
        'Attendance at inspection',
        'Your name on application list',
        '5 high-quality photos'
      ],
      highlight: false
    },
    {
      id: 'standard',
      name: 'Standard',
      price: 49,
      badge: 'Best Value',
      features: [
        'All Basic features',
        'Live Video Call OR HD Recorded Walkthrough',
        'Full 15-Point Quality Report',
        'Same-day delivery'
      ],
      highlight: true
    },
    {
      id: 'premium',
      name: 'Premium',
      price: 89,
      features: [
        'All Standard features',
        'Printed Cover Letter delivered to Agent',
        'Priority booking',
        'Dedicated support'
      ],
      highlight: false
    }
  ];

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    let processedValue = value;

    // Auto-fix URL input - add https:// if missing
    if (name === 'propertyLink' && value && !value.match(/^https?:\/\//)) {
      processedValue = `https://${value}`;
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : processedValue
    }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required';
    } else if (!/^04\d{8}$/.test(formData.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Please enter a valid Australian mobile (04XX XXX XXX)';
    }
    if (!formData.suburb) newErrors.suburb = 'Please select a suburb';
    if (!formData.propertyLink.trim()) {
      newErrors.propertyLink = 'Property link is required';
    } else {
      // Auto-fix URL if needed before validation
      let urlToValidate = formData.propertyLink;
      if (!urlToValidate.match(/^https?:\/\//)) {
        urlToValidate = `https://${urlToValidate}`;
        // Update formData with the fixed URL
        setFormData(prev => ({ ...prev, propertyLink: urlToValidate }));
      }
      // Basic URL validation - check for domain pattern
      if (!urlToValidate.match(/^https?:\/\/.+\..+/)) {
        newErrors.propertyLink = 'Please enter a valid property listing URL';
      }
    }
    if (!formData.inspectionDate) newErrors.inspectionDate = 'Inspection date is required';
    if (!formData.inspectionTime) newErrors.inspectionTime = 'Inspection time is required';
    if (!formData.termsAgreed) newErrors.termsAgreed = 'You must agree to the Terms of Service';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission with Stripe Checkout
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsProcessing(true);

    try {
      // Get the selected pricing tier details
      const selectedTier = pricingTiers.find(tier => tier.id === formData.pricingTier);

      // Call Vercel serverless function to create Stripe Checkout session
      const apiUrl = import.meta.env.VITE_API_URL || window.location.origin;

      const response = await fetch(`${apiUrl}/api/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pricingTier: formData.pricingTier,
          price: selectedTier.price,
          customerEmail: formData.email,
          customerName: formData.name,
          metadata: {
            mobile: formData.mobile,
            suburb: formData.suburb,
            propertyLink: formData.propertyLink,
            inspectionDate: formData.inspectionDate,
            inspectionTime: formData.inspectionTime,
            pricingTierName: selectedTier.name
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create checkout session');
      }

      const { url } = await response.json();

      // Redirect to Stripe Checkout URL
      window.location.href = url;
    } catch (error) {
      console.error('Checkout error:', error);

      // For development/demo: show alert if backend is not set up
      if (error.message.includes('fetch') || error.message.includes('Failed to create')) {
        alert(
          'Backend API not configured.\n\n' +
          'To complete Stripe integration:\n' +
          '1. Set up a backend API endpoint\n' +
          '2. Add VITE_API_URL to your environment variables\n' +
          '3. Configure Stripe secret key on your backend\n\n' +
          'See README.md for detailed instructions.'
        );
      } else {
        alert('An error occurred. Please try again.');
      }
    } finally {
      setIsProcessing(false);
    }
  };

  // Scroll to booking form
  const scrollToBooking = () => {
    document.getElementById('booking-form')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
              Stop Missing Out.<br />Start Securing.
            </h1>
            <p className="text-xl sm:text-2xl font-semibold mb-4">
              ViewMinder is Your Sydney Inspection Proxy.
            </p>
            <p className="text-lg sm:text-xl mb-8 max-w-3xl mx-auto text-primary-50">
              We attend the viewing, video call you live OR send an HD recorded walkthrough,
              and ensure you get on the agent's application list. Serving Bondi, Newtown,
              Surry Hills, and surrounds.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={scrollToBooking}
                className="bg-white text-primary-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-50 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all"
              >
                Book Your ViewMinder (Starts at $39)
              </button>
              <a
                href="/status"
                className="bg-primary-700 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-800 transition-colors shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all text-center"
              >
                Check Status
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* USP/Feature Section */}
      <section className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-12 text-gray-900">
            Why ViewMinder Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <CheckCircle2 className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Agent Check-in Protocol
              </h3>
              <p className="text-gray-600">
                We check in with the agent, provide your details, and ensure
                your name is officially added to the application list.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <Video className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                Live or HD Video Option
              </h3>
              <p className="text-gray-600">
                Choose a live video call during the inspection OR receive a
                professional HD recorded walkthrough within hours.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="text-center p-6 rounded-lg border border-gray-200 hover:border-primary-300 hover:shadow-lg transition-all">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                <ClipboardCheck className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-gray-900">
                15-Point Quality Report
              </h3>
              <p className="text-gray-600">
                Detailed assessment covering everything from natural light and
                noise levels to appliance condition and maintenance issues.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Form Section */}
      <section id="booking-form" className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-center mb-4 text-gray-900">
            Book Your ViewMinder
          </h2>
          <p className="text-center text-gray-600 mb-12">
            Complete the form below to secure your inspection proxy
          </p>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Service Area Checker */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <MapPin className="w-5 h-5 mr-2 text-primary-600" />
                Service Area
              </h3>
              <div>
                <label htmlFor="suburb" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Suburb *
                </label>
                <select
                  id="suburb"
                  name="suburb"
                  value={formData.suburb}
                  onChange={handleInputChange}
                  className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                    errors.suburb ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {suburbs.map(suburb => (
                    <option
                      key={suburb.value}
                      value={suburb.value}
                      disabled={suburb.disabled}
                    >
                      {suburb.label}
                    </option>
                  ))}
                </select>
                {errors.suburb && (
                  <p className="mt-1 text-sm text-red-600">{errors.suburb}</p>
                )}
              </div>
            </div>

            {/* Pricing Cards */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <DollarSign className="w-5 h-5 mr-2 text-primary-600" />
                Choose Your Service
              </h3>
              <div className="grid sm:grid-cols-3 gap-4">
                {pricingTiers.map(tier => (
                  <div
                    key={tier.id}
                    className={`relative border-2 rounded-lg p-5 cursor-pointer transition-all ${
                      formData.pricingTier === tier.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-primary-300'
                    } ${tier.highlight ? 'ring-2 ring-primary-400' : ''}`}
                    onClick={() => setFormData(prev => ({ ...prev, pricingTier: tier.id }))}
                  >
                    {tier.badge && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className="bg-primary-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                          {tier.badge}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center mb-3">
                      <input
                        type="radio"
                        name="pricingTier"
                        value={tier.id}
                        checked={formData.pricingTier === tier.id}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                      />
                      <label className="ml-2 font-semibold text-gray-900">
                        {tier.name}
                      </label>
                    </div>
                    <div className="mb-3">
                      <span className="text-3xl font-bold text-primary-600">
                        ${tier.price}
                      </span>
                    </div>
                    <ul className="space-y-2 text-sm">
                      {tier.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start">
                          <CheckCircle2 className="w-4 h-4 text-primary-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-gray-700">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>

            {/* Personal Information */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <User className="w-5 h-5 mr-2 text-primary-600" />
                Your Details
              </h3>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.name ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="John Smith"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.mobile ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0412 345 678"
                  />
                  {errors.mobile && (
                    <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.email ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="john@example.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600">{errors.email}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Property & Inspection Details */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <Calendar className="w-5 h-5 mr-2 text-primary-600" />
                Inspection Details
              </h3>
              <div className="space-y-4">
                <div>
                  <label htmlFor="propertyLink" className="block text-sm font-medium text-gray-700 mb-2">
                    Property Listing Link *
                  </label>
                  <input
                    type="text"
                    id="propertyLink"
                    name="propertyLink"
                    value={formData.propertyLink}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                      errors.propertyLink ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="www.domain.com.au/12345-bondi-road or paste full URL"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    Paste the link from Domain, realestate.com.au, or any property website
                  </p>
                  {errors.propertyLink && (
                    <p className="mt-1 text-sm text-red-600">{errors.propertyLink}</p>
                  )}
                </div>

                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="inspectionDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Inspection Date *
                    </label>
                    <input
                      type="date"
                      id="inspectionDate"
                      name="inspectionDate"
                      value={formData.inspectionDate}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.inspectionDate ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.inspectionDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.inspectionDate}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="inspectionTime" className="block text-sm font-medium text-gray-700 mb-2">
                      Inspection Time *
                    </label>
                    <input
                      type="time"
                      id="inspectionTime"
                      name="inspectionTime"
                      value={formData.inspectionTime}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                        errors.inspectionTime ? 'border-red-500' : 'border-gray-300'
                      }`}
                    />
                    {errors.inspectionTime && (
                      <p className="mt-1 text-sm text-red-600">{errors.inspectionTime}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Section with Legal */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h3 className="text-xl font-semibold mb-4 flex items-center text-gray-900">
                <Shield className="w-5 h-5 mr-2 text-primary-600" />
                ViewMinder Confidence Guarantee
              </h3>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4 mb-6">
                <p className="text-gray-800 font-medium mb-2">
                  100% Refund Guarantee
                </p>
                <p className="text-gray-700 text-sm">
                  If we miss your inspection or fail to deliver your video/report as promised,
                  you receive a complete refund—no questions asked. Your trust is our priority.
                </p>
              </div>

              <div className="mb-6">
                <label className="flex items-start cursor-pointer group">
                  <input
                    type="checkbox"
                    id="termsAgreed"
                    name="termsAgreed"
                    checked={formData.termsAgreed}
                    onChange={handleInputChange}
                    className={`mt-1 w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 ${
                      errors.termsAgreed ? 'border-red-500' : 'border-gray-300'
                    }`}
                  />
                  <span className="ml-3 text-sm text-gray-700">
                    I agree to the{' '}
                    <a
                      href="#terms"
                      className="text-primary-600 hover:text-primary-700 underline font-medium"
                      onClick={(e) => {
                        e.preventDefault();
                        alert('Terms of Service would be displayed here');
                      }}
                    >
                      Terms of Service
                    </a>
                    {' '}and Refund Policy *
                  </span>
                </label>
                {errors.termsAgreed && (
                  <p className="mt-1 ml-8 text-sm text-red-600">{errors.termsAgreed}</p>
                )}
              </div>

              <button
                type="submit"
                className="w-full bg-primary-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-colors shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                disabled={!formData.termsAgreed || isProcessing}
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  'Pay Now (Secure Stripe Checkout)'
                )}
              </button>

              <p className="text-xs text-gray-500 text-center mt-3">
                Secure payment processing powered by Stripe
              </p>
            </div>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h3 className="text-white text-xl font-bold mb-4">ViewMinder</h3>
              <p className="text-sm text-gray-400">
                Your trusted Sydney inspection proxy service. Never miss a property viewing again.
              </p>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="/status"
                    className="hover:text-primary-400 transition-colors"
                  >
                    Check Booking Status
                  </a>
                </li>
                <li>
                  <a
                    href="/TERMS_OF_SERVICE.md"
                    className="hover:text-primary-400 transition-colors"
                    target="_blank"
                  >
                    Terms of Service
                  </a>
                </li>
                <li>
                  <a
                    href="/REFUND_POLICY.md"
                    className="hover:text-primary-400 transition-colors"
                    target="_blank"
                  >
                    Refund Policy
                  </a>
                </li>
                <li>
                  <a
                    href="/PRIVACY_POLICY.md"
                    className="hover:text-primary-400 transition-colors"
                    target="_blank"
                  >
                    Privacy Policy
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-white font-semibold mb-4">Join Our Team</h4>
              <a
                href="/apply"
                className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg hover:bg-primary-700 transition-colors text-sm font-medium"
              >
                Become a ViewMinder Agent
              </a>
            </div>
          </div>

          <div className="border-t border-gray-800 pt-8 text-center text-sm text-gray-500">
            <p>&copy; {new Date().getFullYear()} ViewMinder. All rights reserved. Serving Sydney's Eastern Suburbs & Inner West.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
