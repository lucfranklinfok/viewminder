import React, { useState } from 'react';
import { Search, CheckCircle, Clock, FileText, ArrowLeft } from 'lucide-react';

function StatusTracker() {
  const [formData, setFormData] = useState({
    email: '',
    bookingId: ''
  });
  const [status, setStatus] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }
    if (!formData.bookingId.trim()) {
      newErrors.bookingId = 'Booking reference is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSearching(true);
    setHasSearched(true);

    // Simulate API lookup with delay
    setTimeout(() => {
      // For MVP: Demo logic - randomly assign status based on booking ID
      const demoStatuses = ['assigned', 'inspected', 'completed'];
      const randomStatus = demoStatuses[formData.bookingId.length % 3];

      setStatus(randomStatus);
      setIsSearching(false);
    }, 1000);
  };

  // Status configurations
  const statusConfig = {
    assigned: {
      label: 'Agent Assigned',
      icon: CheckCircle,
      bgColor: 'bg-teal-500',
      textColor: 'text-white',
      message: 'Your local ViewMinder agent has been assigned and is ready to attend.'
    },
    inspected: {
      label: 'Inspection Complete',
      icon: Clock,
      bgColor: 'bg-yellow-500',
      textColor: 'text-white',
      message: 'Inspection complete. Report and video are being processed.'
    },
    completed: {
      label: 'Report Sent',
      icon: FileText,
      bgColor: 'bg-green-500',
      textColor: 'text-white',
      message: 'Success! Your full report and video link have been sent to your email.'
    }
  };

  const currentStatus = status ? statusConfig[status] : null;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/" className="inline-flex items-center text-teal-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold">Check Booking Status</h1>
          <p className="text-teal-100 mt-2">Track your ViewMinder inspection in real-time</p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Form */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 mb-8 border-t-8 border-teal-600">
          <h2 className="text-2xl font-bold text-slate-800 mb-6">Enter Your Booking Details</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Email Address *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.email ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="email@example.com"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="bookingId" className="block text-sm font-medium text-slate-700 mb-2">
                Stripe Payment Reference or Booking ID *
              </label>
              <input
                type="text"
                id="bookingId"
                name="bookingId"
                value={formData.bookingId}
                onChange={handleChange}
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent ${
                  errors.bookingId ? 'border-red-500' : 'border-slate-300'
                }`}
                placeholder="cs_test_... or booking reference"
              />
              {errors.bookingId && (
                <p className="mt-1 text-sm text-red-600">{errors.bookingId}</p>
              )}
              <p className="mt-2 text-xs text-slate-500">
                You can find this in your confirmation email from Stripe
              </p>
            </div>

            <button
              type="submit"
              disabled={isSearching}
              className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-teal-700 focus:outline-none focus:ring-4 focus:ring-teal-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isSearching ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 mr-2" />
                  Check Status
                </>
              )}
            </button>
          </form>
        </div>

        {/* Status Display */}
        {currentStatus && (
          <div className={`${currentStatus.bgColor} ${currentStatus.textColor} rounded-lg shadow-lg p-8 sm:p-10 transform transition-all duration-500 animate-fadeIn`}>
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <currentStatus.icon className="w-12 h-12 sm:w-16 sm:h-16" />
              </div>
              <div className="ml-6">
                <h3 className="text-2xl sm:text-3xl font-bold mb-3">
                  Status: {currentStatus.label}
                </h3>
                <p className="text-lg sm:text-xl opacity-90">
                  {currentStatus.message}
                </p>

                {/* Additional info based on status */}
                <div className="mt-6 pt-6 border-t border-white border-opacity-30">
                  {status === 'assigned' && (
                    <p className="text-sm opacity-80">
                      Your agent will arrive 5-10 minutes before the scheduled inspection time. You'll receive a notification when they check in with the property agent.
                    </p>
                  )}
                  {status === 'inspected' && (
                    <p className="text-sm opacity-80">
                      We're currently processing your HD video walkthrough and preparing your detailed 15-point quality report. Expected delivery: within 24 hours.
                    </p>
                  )}
                  {status === 'completed' && (
                    <p className="text-sm opacity-80">
                      Check your inbox (and spam folder) for an email from ViewMinder. The email contains your video link and PDF report. Questions? Contact support@viewminder.com.au
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Help Section */}
        <div className="mt-8 bg-teal-50 border border-teal-200 rounded-lg p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Need Help?</h3>
          <p className="text-slate-700 text-sm mb-3">
            If you can't find your booking or have questions about your inspection:
          </p>
          <a
            href="mailto:support@viewminder.com.au"
            className="text-teal-600 hover:text-teal-700 font-medium text-sm"
          >
            Contact Support: support@viewminder.com.au
          </a>
        </div>
      </div>
    </div>
  );
}

export default StatusTracker;
