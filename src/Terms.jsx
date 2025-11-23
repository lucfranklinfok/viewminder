import React from 'react';
import { ArrowLeft } from 'lucide-react';

function Terms() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/" className="inline-flex items-center text-teal-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold">Terms of Service & Refund Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 border-t-8 border-teal-600">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-8">
              This document outlines the agreement between ViewMinder and the client using our inspection proxy services.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">1. Scope of Service (The Liability Shield)</h2>
            <p className="text-slate-700 mb-4">
              ViewMinder provides a visual inspection and proxy attendance service only. Our proxies report on visible conditions at the time of inspection. We are not licensed building inspectors, structural engineers, or pest controllers. We do not guarantee the approval of your tenancy application.
            </p>
            <p className="text-slate-700 mb-6">
              By using this service, you acknowledge that you are applying for the property at your own risk and ViewMinder is not liable for any defects discovered after the lease commences (e.g., termites, major structural issues, boundary disputes, or changes in neighborhood conditions).
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">2. ViewMinder Confidence Guarantee (Refunds)</h2>
            <p className="text-slate-700 mb-4">
              We offer a <strong>100% Money-Back Guarantee</strong> under two strict conditions, ensuring the service is delivered as promised:
            </p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4 ml-4">
              <li><strong>Non-Attendance:</strong> If our assigned proxy fails to attend the scheduled inspection, you will receive a full refund.</li>
              <li><strong>Non-Delivery:</strong> If we fail to deliver the promised components (the Agent Check-in, the 15-Point Report, and the HD Recorded Walkthrough/Live Call Summary) to your provided email address within 2 hours of the inspection ending.</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">No Refund Scenarios:</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6 ml-4">
              <li>If your tenancy application is unsuccessful.</li>
              <li>If you dislike the property based on the information provided in the report (the service is to report, not to endorse).</li>
              <li>If you cancel the booking less than 24 hours prior to the inspection time.</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">3. Data and Privacy</h2>
            <p className="text-slate-700 mb-6">
              We use your booking data to facilitate the inspection and communicate with you. Your data is not shared with third parties except as necessary for payment processing (Stripe) and lead capture (Webhook/Zapier).
            </p>

            <div className="mt-12 pt-8 border-t border-slate-200">
              <p className="text-sm text-slate-500 text-center">
                Last updated: November 22, 2025
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Terms;
