import React from 'react';
import { CheckCircle, Home, Mail } from 'lucide-react';

function SuccessPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-white flex items-center justify-center px-4">
      <div className="max-w-2xl w-full bg-white rounded-2xl shadow-xl p-8 sm:p-12 text-center">
        {/* Success Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
          Booking Confirmed!
        </h1>

        {/* Message */}
        <p className="text-lg text-gray-700 mb-6">
          Your ViewMinder inspection has been successfully booked and paid for.
        </p>

        {/* What happens next */}
        <div className="bg-primary-50 rounded-lg p-6 mb-8 text-left">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <Mail className="w-5 h-5 mr-2 text-primary-600" />
            What happens next?
          </h2>
          <ul className="space-y-3 text-gray-700">
            <li className="flex items-start">
              <span className="font-bold text-primary-600 mr-2">1.</span>
              <span>You'll receive a confirmation email with your booking details</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary-600 mr-2">2.</span>
              <span>A ViewMinder agent will be assigned to your inspection</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary-600 mr-2">3.</span>
              <span>We'll attend the inspection on your behalf at the scheduled time</span>
            </li>
            <li className="flex items-start">
              <span className="font-bold text-primary-600 mr-2">4.</span>
              <span>You'll receive your video walkthrough and 15-point quality report within 24 hours</span>
            </li>
          </ul>
        </div>

        {/* Contact info */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-600">
            Questions? Contact us at{' '}
            <a href="mailto:support@viewminder.com.au" className="text-primary-600 hover:text-primary-700 font-medium">
              support@viewminder.com.au
            </a>
          </p>
        </div>

        {/* Return home button */}
        <a
          href="/"
          className="inline-flex items-center justify-center bg-primary-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-primary-700 transition-colors shadow-lg hover:shadow-xl"
        >
          <Home className="w-5 h-5 mr-2" />
          Return to Home
        </a>
      </div>
    </div>
  );
}

export default SuccessPage;
