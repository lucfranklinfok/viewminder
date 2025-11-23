import React from 'react';
import { ArrowLeft } from 'lucide-react';

function Privacy() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <a href="/" className="inline-flex items-center text-teal-100 hover:text-white mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </a>
          <h1 className="text-3xl sm:text-4xl font-bold">Privacy Policy</h1>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-2xl p-8 sm:p-12 border-t-8 border-teal-600">
          <div className="prose prose-slate max-w-none">
            <p className="text-slate-600 mb-8">
              ViewMinder ("we," "our," "us") respects your privacy and is committed to protecting your personal information.
            </p>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Information We Collect</h2>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Personal Information</h3>
            <p className="text-slate-700 mb-2">When you book our service, we collect:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6 ml-4">
              <li><strong>Contact Information:</strong> Full name, email address, mobile phone number</li>
              <li><strong>Booking Details:</strong> Property address, inspection date/time, property listing URL</li>
              <li><strong>Payment Information:</strong> Processed securely by Stripe (we do not store card details)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">Automatically Collected Information</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6 ml-4">
              <li><strong>Device Information:</strong> Browser type, operating system</li>
              <li><strong>Usage Data:</strong> Pages visited, time spent on site</li>
              <li><strong>IP Address:</strong> For security and fraud prevention</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">How We Use Your Information</h2>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">We use your information to:</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6 ml-4">
              <li>Attend property inspections on your behalf</li>
              <li>Create and deliver video walkthroughs and reports</li>
              <li>Communicate with property agents</li>
              <li>Process payments</li>
              <li>Send booking confirmations and service updates</li>
              <li>Improve our service quality</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Information Sharing</h2>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">We Share Information With:</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-4 ml-4">
              <li><strong>Service Providers:</strong> Stripe (payment processing), Vercel (hosting), Email service providers</li>
              <li><strong>Property Agents:</strong> Only the information necessary to register your interest (typically your name and contact details)</li>
            </ul>

            <h3 className="text-xl font-semibold text-slate-900 mt-6 mb-3">We Do NOT:</h3>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6 ml-4">
              <li>Sell your personal information</li>
              <li>Share your information for marketing purposes</li>
              <li>Disclose your information except as described in this policy</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Data Security</h2>
            <p className="text-slate-700 mb-2">We implement appropriate security measures to protect your information:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6 ml-4">
              <li>SSL/TLS encryption for data transmission</li>
              <li>Secure data storage with Vercel</li>
              <li>PCI-compliant payment processing via Stripe</li>
              <li>Regular security audits</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Your Rights</h2>
            <p className="text-slate-700 mb-2">Under Australian Privacy Principles, you have the right to:</p>
            <ul className="list-disc list-inside space-y-2 text-slate-700 mb-6 ml-4">
              <li><strong>Access:</strong> Request a copy of your personal information</li>
              <li><strong>Correction:</strong> Request correction of inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your information (subject to legal requirements)</li>
              <li><strong>Object:</strong> Object to processing of your information</li>
            </ul>

            <h2 className="text-2xl font-bold text-slate-900 mt-8 mb-4">Contact Us</h2>
            <p className="text-slate-700 mb-2">For privacy-related questions or concerns:</p>
            <p className="text-slate-700 mb-6">
              <strong>Email:</strong> <a href="mailto:privacy@viewminder.com.au" className="text-teal-600 hover:text-teal-700 underline">privacy@viewminder.com.au</a><br />
              <strong>Website:</strong> <a href="https://viewminder.vercel.app" className="text-teal-600 hover:text-teal-700 underline">https://viewminder.vercel.app</a>
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

export default Privacy;
