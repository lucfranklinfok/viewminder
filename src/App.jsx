import React, { useState } from 'react';
import {
  CheckCircle,
  Video,
  Clipboard,
  MapPin,
  Smartphone,
  Loader2,
  Droplet,
  Layers,
  Mic,
  Zap,
  Sun,
  Home,
  Thermometer,
  Wifi,
  Users,
  Trash
} from 'lucide-react';
import SuccessPage from './SuccessPage';
import StatusTracker from './StatusTracker';
import Apply from './Apply';
import Terms from './Terms';
import Privacy from './Privacy';

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

  if (path === '/terms' || path === '/terms/') {
    return <Terms />;
  }

  if (path === '/privacy' || path === '/privacy/') {
    return <Privacy />;
  }

  if (urlParams.has('session_id')) {
    return <SuccessPage />;
  }

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    pricingTier: 'Standard',
    propertyLink: '',
    inspectionDate: '',
    inspectionTime: '',
    suburb: 'Bondi / Bondi Junction',
    agreedToTerms: false
  });

  const [errors, setErrors] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);

  // Service areas (matching new UI)
  const serviceAreas = [
    { value: 'Bondi / Bondi Junction', label: 'Bondi / Bondi Junction' },
    { value: 'Coogee / Randwick', label: 'Coogee / Randwick' },
    { value: 'Surry Hills / Darlinghurst', label: 'Surry Hills / Darlinghurst' },
    { value: 'Newtown / Enmore', label: 'Newtown / Enmore' },
    { value: 'Glebe / Chippendale', label: 'Glebe / Chippendale' },
    { value: 'Potts Point / Elizabeth Bay', label: 'Potts Point / Elizabeth Bay' },
    { value: 'Other Sydney Suburbs (Coming Soon)', label: 'Other Sydney Suburbs (Coming Soon)', disabled: true },
  ];

  // Pricing tiers (matching new UI)
  const pricingTiers = [
    {
      id: 'Basic',
      name: 'Basic',
      price: 39,
      description: 'Attendance + Name on List + 5 Photos.',
      highlight: false,
      features: ['Agent check-in', '5 quick photos']
    },
    {
      id: 'Standard',
      name: 'Standard',
      price: 49,
      description: 'BEST VALUE: Live Video OR HD Recorded Walkthrough + Full 15-Point Report.',
      highlight: true,
      features: ['Live Video/HD Recording', '15-Point Quality Report', 'Agent Check-in']
    },
    {
      id: 'Premium',
      name: 'Premium',
      price: 89,
      description: 'All Standard features + Printed Cover Letter delivered to Agent.',
      highlight: false,
      features: ['Printed Cover Letter', 'Live Video/HD Recording', '15-Point Quality Report']
    }
  ];

  // Reality Check List
  const realityCheckList = [
    { point: "Mobile Signal Strength Check (Telstra/Optus/Vodafone)", icon: Smartphone },
    { point: "Water Pressure Check (Shower/Sink)", icon: Droplet },
    { point: "Hidden Mould & Damp Visual Check (Behind Blinds/Under Sinks)", icon: Layers },
    { point: "Noise Levels Assessment (Street, Neighbors, Construction)", icon: Mic },
    { point: "All Appliances Tested (Oven, Dishwasher, A/C)", icon: Zap },
    { point: "Sunlight Orientation and Natural Light (AM/PM)", icon: Sun },
    { point: "Storage Space Confirmation (Built-ins, Linen, Pantry)", icon: Home },
    { point: "Condition of Carpets and Walls (Minor Dents/Stains)", icon: Clipboard },
    { point: "Power Outlet Functionality (Quick check of 2-3 outlets)", icon: Zap },
    { point: "Window/Door Seal Check (Drafts/Security Visual)", icon: Thermometer },
    { point: "NBN/Internet Connection Type Visual Check (Where possible)", icon: Wifi },
    { point: "Pest/Insect Visual Presence (Obvious signs)", icon: Users },
    { point: "Bin/Recycling Location & Access Check", icon: Trash },
    { point: "Proximity to Transport (Bus stop, train station)", icon: MapPin },
    { point: "Leaking Taps/Toilets (Quick running test)", icon: Droplet },
  ];

  // Helper to get the current pricing details
  const currentPricing = pricingTiers.find(p => p.id === formData.pricingTier);

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

  const handlePricingChange = (tierId) => {
    setFormData(prev => ({ ...prev, pricingTier: tierId }));
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
    if (!formData.agreedToTerms) newErrors.agreedToTerms = 'You must agree to the Terms of Service';

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
      // Use production API when running locally (dev server doesn't have API routes)
      const apiUrl = import.meta.env.VITE_API_URL ||
                     (window.location.hostname === 'localhost'
                       ? 'https://viewminder.vercel.app'
                       : window.location.origin);

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
      alert('An error occurred. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Scroll to booking form
  const scrollToBooking = () => {
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Scroll to pricing
  const scrollToPricing = () => {
    document.getElementById('pricing')?.scrollIntoView({ behavior: 'smooth' });
  };

  // Common classes for input fields
  const inputClasses = "w-full p-3 border border-slate-300 rounded-lg focus:border-teal-500 focus:ring focus:ring-teal-200 focus:ring-opacity-50";

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Header/Navigation */}
      <header className="sticky top-0 z-10 bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="text-2xl font-bold text-teal-600 cursor-pointer" onClick={() => window.location.href = '/'}>
            <Smartphone className="inline-block w-6 h-6 mr-2 mb-1" /> ViewMinder
          </div>
          <nav className="space-x-4 flex items-center">
            <a href="/" className="text-slate-700 hover:text-teal-600 transition font-semibold">Book</a>
            <a href="/status" className="text-slate-700 hover:text-teal-600 transition">Check Status</a>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="pb-16">
        <div className="space-y-16">
          {/* Hero Section */}
          <section id="hero" className="text-center pt-16 pb-12 bg-white rounded-b-[4rem] shadow-xl">
            <h1 className="text-4xl md:text-6xl font-extrabold text-slate-800 mb-4 tracking-tight">
              Stop Missing Out. Start Securing.
            </h1>
            <h2 className="text-xl md:text-2xl text-teal-600 font-semibold mb-8 max-w-3xl mx-auto">
              ViewMinder is Your Sydney Inspection Proxy.
            </h2>
            <p className="text-lg text-slate-600 mb-10 max-w-4xl mx-auto px-4">
              We attend the viewing, video call you live <strong>OR send an HD recorded walkthrough</strong>, and ensure you get on the agent's application list. Serving Bondi, Newtown, Surry Hills, and surrounds.
            </p>
            <button
              onClick={scrollToBooking}
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 px-8 rounded-full text-lg shadow-2xl transition duration-300 transform hover:scale-105"
            >
              Book Your ViewMinder (Starts at ${pricingTiers[0].price})
            </button>
          </section>

          {/* USP Section */}
          <section className="max-w-6xl mx-auto px-4">
            <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">How We Win It For You</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-4 transition duration-300 ease-in-out transform rounded-xl shadow-lg hover:shadow-xl border-2 bg-white border-teal-500/50 text-center">
                <MapPin className="w-10 h-10 text-teal-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-slate-800 mb-2">The Agent Check-in</h4>
                <p className="text-slate-600">We introduce ourselves as your representative to ensure the agent marks you as 'Attended'—critical for your application to be processed.</p>
              </div>
              <div className="p-4 transition duration-300 ease-in-out transform rounded-xl shadow-lg hover:shadow-xl border-2 bg-white border-teal-500/50 text-center">
                <Video className="w-10 h-10 text-teal-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-slate-800 mb-2">Live OR HD Recording</h4>
                <p className="text-slate-600">Miss the live call? No problem. We deliver a high-quality, recorded walkthrough video straight to your inbox within 2 hours.</p>
              </div>
              <div className="p-4 transition duration-300 ease-in-out transform rounded-xl shadow-lg hover:shadow-xl border-2 bg-white border-teal-500/50 text-center">
                <Clipboard className="w-10 h-10 text-teal-600 mx-auto mb-4" />
                <h4 className="text-xl font-semibold text-slate-800 mb-2">15-Point Reality Check</h4>
                <p className="text-slate-600">We check what photos hide: water pressure, mold smells, phone signal strength, and noise levels. The details that matter.</p>
              </div>
            </div>
          </section>

          {/* 15-Point Reality Check Details Section */}
          <section className="max-w-6xl mx-auto px-4 py-8">
            <div className="bg-gradient-to-br from-teal-50 to-slate-50 rounded-3xl p-8 md:p-12 shadow-xl border-2 border-teal-200">
              <h3 className="text-3xl font-bold text-center text-slate-800 mb-3">Our Comprehensive 15-Point Reality Check</h3>
              <p className="text-center text-slate-600 mb-10 max-w-3xl mx-auto">
                We inspect what photos can't show you. Every Standard & Premium inspection includes these critical assessments to help you make an informed decision.
              </p>
              <div className="grid md:grid-cols-3 sm:grid-cols-2 grid-cols-1 gap-4">
                {realityCheckList.map((item, index) => {
                  const IconComponent = item.icon;
                  return (
                    <div key={index} className="flex items-start p-4 bg-white rounded-lg shadow-md border border-slate-200 hover:border-teal-400 transition-all duration-200">
                      <IconComponent className="w-5 h-5 text-teal-600 mr-3 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-slate-700 font-medium">{item.point}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Pricing Cards Section */}
          <section id="pricing" className="max-w-6xl mx-auto px-4 pt-10">
            <h3 className="text-3xl font-bold text-center text-slate-800 mb-12">Choose Your Inspection Tier</h3>
            <div className="grid md:grid-cols-3 gap-8">
              {pricingTiers.map(tier => (
                <div
                  key={tier.id}
                  className={`p-6 ${tier.highlight ? 'bg-teal-50 border-teal-600 shadow-2xl scale-[1.02]' : 'bg-white border-slate-200'} border-2 rounded-2xl transition duration-300 cursor-pointer`}
                  onClick={() => handlePricingChange(tier.id)}
                >
                  {tier.highlight && (
                    <div className="text-xs font-bold text-white bg-teal-600 px-3 py-1 rounded-full w-fit mb-3">
                      BEST VALUE
                    </div>
                  )}
                  <h4 className="text-2xl font-bold mb-2 text-slate-900">{tier.name}</h4>
                  <p className="text-4xl font-extrabold text-teal-600 mb-4">${tier.price}</p>
                  <p className="text-slate-600 mb-6">{tier.description}</p>
                  <button
                    onClick={() => handlePricingChange(tier.id)}
                    className={`w-full py-3 rounded-lg font-semibold transition duration-300 ${formData.pricingTier === tier.id ? 'bg-teal-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
                  >
                    {formData.pricingTier === tier.id ? 'Selected' : 'Select Plan'}
                  </button>
                  <ul className="mt-6 space-y-2 text-slate-700">
                    {tier.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm">
                        <CheckCircle className="w-4 h-4 text-teal-500 mr-2 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </section>

          {/* Booking Form Section */}
          <section id="booking" className="max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-2xl my-16 border-t-8 border-teal-600">
            <h3 className="text-3xl font-bold text-center text-slate-800 mb-8">Book Your Inspection Proxy</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selected Tier Confirmation */}
              <div className="p-4 bg-teal-50 border border-teal-300 rounded-lg text-center">
                <p className="text-lg font-semibold text-teal-800">
                  Selected Tier: <strong>{currentPricing.name}</strong> for <strong>${currentPricing.price}</strong>
                </p>
                <button type="button" onClick={scrollToPricing} className="text-sm text-teal-600 underline hover:text-teal-700 mt-1">
                  Change Plan
                </button>
              </div>

              {/* Contact Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="mobile">Mobile Number</label>
                  <input
                    type="tel"
                    id="mobile"
                    name="mobile"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  />
                  {errors.mobile && <p className="mt-1 text-sm text-red-600">{errors.mobile}</p>}
                </div>
              </div>

              {/* Property Details */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="propertyLink">Property Link (e.g., RealEstate.com.au URL)</label>
                <input
                  type="url"
                  id="propertyLink"
                  name="propertyLink"
                  value={formData.propertyLink}
                  onChange={handleInputChange}
                  className={inputClasses}
                  placeholder="https://..."
                  required
                />
                {errors.propertyLink && <p className="mt-1 text-sm text-red-600">{errors.propertyLink}</p>}
              </div>

              {/* Location and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="suburb">Service Area</label>
                  <select
                    id="suburb"
                    name="suburb"
                    value={formData.suburb}
                    onChange={handleInputChange}
                    className={inputClasses}
                    required
                  >
                    {serviceAreas.map(area => (
                      <option key={area.value} value={area.value} disabled={area.disabled}>
                        {area.label}
                      </option>
                    ))}
                  </select>
                  {errors.suburb && <p className="mt-1 text-sm text-red-600">{errors.suburb}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="inspectionDate">Inspection Date</label>
                  <input
                    type="date"
                    id="inspectionDate"
                    name="inspectionDate"
                    value={formData.inspectionDate}
                    onChange={handleInputChange}
                    min={new Date().toISOString().split('T')[0]}
                    className={inputClasses}
                    required
                  />
                  {errors.inspectionDate && <p className="mt-1 text-sm text-red-600">{errors.inspectionDate}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="inspectionTime">Inspection Time</label>
                <input
                  type="time"
                  id="inspectionTime"
                  name="inspectionTime"
                  value={formData.inspectionTime}
                  onChange={handleInputChange}
                  className={inputClasses}
                  required
                />
                {errors.inspectionTime && <p className="mt-1 text-sm text-red-600">{errors.inspectionTime}</p>}
              </div>

              {/* Trust and Guarantee Section */}
              <div className="p-4 bg-yellow-50 border border-yellow-300 rounded-lg">
                <h4 className="text-lg font-semibold text-yellow-800 mb-2">ViewMinder Confidence Guarantee</h4>
                <p className="text-sm text-yellow-700">
                  <strong>100% Refund, No Questions Asked, If:</strong> 1) Our proxy fails to attend the inspection. <strong>OR</strong> 2) We fail to deliver the full video/report within 2 hours of the inspection ending.
                </p>
              </div>

              {/* Mandatory Terms Checkbox */}
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="agreedToTerms"
                  name="agreedToTerms"
                  checked={formData.agreedToTerms}
                  onChange={handleInputChange}
                  className="mt-1 h-5 w-5 rounded border-slate-300 text-teal-600 focus:ring-teal-500"
                  required
                />
                <label htmlFor="agreedToTerms" className="ml-3 text-sm text-slate-600">
                  I agree to the <a href="/terms" className="text-teal-600 hover:text-teal-700 underline font-medium">Terms of Service</a> and Refund Policy.
                </label>
              </div>
              {errors.agreedToTerms && <p className="mt-1 text-sm text-red-600">{errors.agreedToTerms}</p>}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!formData.agreedToTerms || isProcessing}
                className="w-full bg-teal-600 hover:bg-teal-700 text-white font-bold py-4 rounded-lg text-xl shadow-lg transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Processing Booking...
                  </>
                ) : (
                  `Proceed to Payment ($${currentPricing.price})`
                )}
              </button>
            </form>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800 text-white p-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="mb-4 md:mb-0">&copy; {new Date().getFullYear()} ViewMinder. Sydney-based & Insured.</p>
          <div className="space-x-4">
            <a href="/terms" className="text-slate-400 hover:text-teal-400 transition">Terms of Service & Refund Policy</a>
            <a href="/privacy" className="text-slate-400 hover:text-teal-400 transition">Privacy Policy</a>
            <a href="/apply" className="text-teal-400 hover:text-teal-300 transition font-medium">Become a ViewMinder Agent</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
