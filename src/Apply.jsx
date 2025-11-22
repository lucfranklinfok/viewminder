import React, { useState } from 'react';
import { UserPlus, CheckCircle, ArrowLeft } from 'lucide-react';

function Apply() {
  const [formData, setFormData] = useState({
    fullName: '',
    phone: '',
    email: '',
    hasABN: '',
    hasSmartphone: false,
    suburbs: []
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Service area suburbs
  const availableSuburbs = [
    { id: 'bondi', label: 'Bondi / Bondi Junction' },
    { id: 'coogee', label: 'Coogee / Randwick' },
    { id: 'surry-hills', label: 'Surry Hills / Darlinghurst' },
    { id: 'newtown', label: 'Newtown / Enmore' },
    { id: 'glebe', label: 'Glebe / Chippendale' },
    { id: 'potts-point', label: 'Potts Point / Elizabeth Bay' }
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Handle suburb checkbox changes
  const handleSuburbChange = (suburbId) => {
    setFormData(prev => ({
      ...prev,
      suburbs: prev.suburbs.includes(suburbId)
        ? prev.suburbs.filter(id => id !== suburbId)
        : [...prev.suburbs, suburbId]
    }));

    if (errors.suburbs) {
      setErrors(prev => ({ ...prev, suburbs: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required';
    } else if (!/^04\d{8}$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = 'Please enter a valid Australian mobile (04XX XXX XXX)';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.hasABN) {
      newErrors.hasABN = 'Please answer this question';
    }

    if (!formData.hasSmartphone) {
      newErrors.hasSmartphone = 'A smartphone with video capability is required';
    }

    if (formData.suburbs.length === 0) {
      newErrors.suburbs = 'Please select at least one suburb';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to first error
      const firstErrorField = Object.keys(errors)[0];
      document.getElementById(firstErrorField)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    // Simulate API submission
    setTimeout(() => {
      console.log('Application submitted:', formData);
      setIsSubmitting(false);
      setIsSuccess(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1500);
  };

  // Success screen
  if (isSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
        <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
            Application Received!
          </h1>

          <p className="text-lg text-gray-700 mb-8">
            We will be in touch within 48 hours for onboarding. Thank you for applying.
          </p>

          <div className="bg-primary-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">What Happens Next?</h2>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start">
                <span className="font-bold text-primary-600 mr-2">1.</span>
                <span>We'll review your application and verify your ABN</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary-600 mr-2">2.</span>
                <span>Our team will contact you within 48 hours via email or phone</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary-600 mr-2">3.</span>
                <span>You'll receive onboarding materials and training resources</span>
              </li>
              <li className="flex items-start">
                <span className="font-bold text-primary-600 mr-2">4.</span>
                <span>Start earning by attending inspections in your area</span>
              </li>
            </ul>
          </div>

          <a
            href="/"
            className="inline-flex items-center justify-center bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Return to Home
          </a>
        </div>
      </div>
    );
  }

  // Application form
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/" className="inline-flex items-center text-primary-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold mb-3">
            Join the ViewMinder Network
          </h1>
          <p className="text-xl text-primary-100">
            Become a Certified Proxy
          </p>
        </div>
      </div>

      {/* Form Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Intro */}
        <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Join ViewMinder?</h2>
          <div className="grid sm:grid-cols-3 gap-4 mb-6">
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600 mb-1">$40-90</div>
              <div className="text-sm text-gray-700">Per Inspection</div>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600 mb-1">Flexible</div>
              <div className="text-sm text-gray-700">Choose Your Hours</div>
            </div>
            <div className="text-center p-4 bg-primary-50 rounded-lg">
              <div className="text-3xl font-bold text-primary-600 mb-1">Local</div>
              <div className="text-sm text-gray-700">Your Suburbs</div>
            </div>
          </div>
          <p className="text-gray-700">
            Help Sydney renters secure their dream home while earning income on your own schedule. Perfect for real estate professionals, photographers, or anyone with great communication skills.
          </p>
        </div>

        {/* Application Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Application Form</h2>

          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>

            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.fullName ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="John Smith"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0412 345 678"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
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

          {/* Vetting Questions */}
          <div className="space-y-6 pt-6 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Crucial Requirements</h3>

            {/* ABN Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Do you currently hold an active Australian Business Number (ABN)? *
              </label>
              <div className="space-y-2">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    id="hasABN"
                    name="hasABN"
                    value="yes"
                    checked={formData.hasABN === 'yes'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">Yes, I have an active ABN</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="hasABN"
                    value="no"
                    checked={formData.hasABN === 'no'}
                    onChange={handleChange}
                    className="w-4 h-4 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="ml-3 text-gray-700">No, I don't have an ABN</span>
                </label>
              </div>
              {errors.hasABN && (
                <p className="mt-1 text-sm text-red-600">{errors.hasABN}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">
                An ABN is required to work as a ViewMinder agent. Don't have one? We can guide you through the free application process.
              </p>
            </div>

            {/* Smartphone Question */}
            <div>
              <label className="flex items-start cursor-pointer">
                <input
                  type="checkbox"
                  name="hasSmartphone"
                  checked={formData.hasSmartphone}
                  onChange={handleChange}
                  className={`mt-1 w-5 h-5 text-primary-600 rounded focus:ring-2 focus:ring-primary-500 ${
                    errors.hasSmartphone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                <span className="ml-3 text-sm text-gray-700">
                  I have reliable access to a smartphone with high-quality video recording *
                </span>
              </label>
              {errors.hasSmartphone && (
                <p className="mt-1 ml-8 text-sm text-red-600">{errors.hasSmartphone}</p>
              )}
            </div>

            {/* Suburbs Question */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Which Sydney suburbs are you primarily available in? (Select all that apply) *
              </label>
              <div className="grid sm:grid-cols-2 gap-3">
                {availableSuburbs.map(suburb => (
                  <label
                    key={suburb.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                      formData.suburbs.includes(suburb.id)
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.suburbs.includes(suburb.id)}
                      onChange={() => handleSuburbChange(suburb.id)}
                      className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500"
                    />
                    <span className="ml-3 text-sm text-gray-700">{suburb.label}</span>
                  </label>
                ))}
              </div>
              {errors.suburbs && (
                <p className="mt-1 text-sm text-red-600">{errors.suburbs}</p>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-6">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-primary-600 text-white py-4 px-8 rounded-lg text-lg font-semibold hover:bg-primary-700 focus:outline-none focus:ring-4 focus:ring-primary-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Submitting...
                </>
              ) : (
                <>
                  <UserPlus className="w-5 h-5 mr-2" />
                  Submit Application
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Apply;
