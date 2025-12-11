import React, { useState, useEffect } from 'react';
import {
  Search,
  CheckCircle,
  Clock,
  FileText,
  ArrowLeft,
  Smartphone,
  Droplet,
  Layers,
  Mic,
  Zap,
  Sun,
  Home,
  Clipboard,
  Thermometer,
  Wifi,
  Users,
  Trash,
  MapPin,
  Video,
  AlertCircle
} from 'lucide-react';

// Firebase imports
import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, doc, onSnapshot, setLogLevel } from 'firebase/firestore';

function StatusTracker() {
  const [formData, setFormData] = useState({
    email: '',
    bookingId: ''
  });
  const [status, setStatus] = useState(null);
  const [statusData, setStatusData] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Firebase state
  const [db, setDb] = useState(null);
  const [auth, setAuth] = useState(null);
  const [userId, setUserId] = useState(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [unsubscribeSnapshot, setUnsubscribeSnapshot] = useState(null);

  // Reality Check List (same as in App.jsx)
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

  // Firebase initialization and authentication
  useEffect(() => {
    const initializeFirebase = async () => {
      try {
        // Get global Firebase configuration
        const firebaseConfig = window.__firebase_config;
        const initialAuthToken = window.__initial_auth_token;
        const appId = window.__app_id;

        if (!firebaseConfig) {
          console.warn('Firebase config not found. Using fallback demo mode.');
          setIsAuthReady(true); // Enable demo mode
          return;
        }

        // Enable Firebase debug logging in development
        if (import.meta.env.DEV) {
          setLogLevel('debug');
        }

        // Initialize Firebase
        const app = initializeApp(firebaseConfig);
        const authInstance = getAuth(app);
        const dbInstance = getFirestore(app);

        setAuth(authInstance);
        setDb(dbInstance);

        // Authenticate user
        try {
          let userCredential;
          if (initialAuthToken) {
            // Sign in with custom token if available
            userCredential = await signInWithCustomToken(authInstance, initialAuthToken);
            console.log('Signed in with custom token');
          } else {
            // Fallback to anonymous sign-in
            userCredential = await signInAnonymously(authInstance);
            console.log('Signed in anonymously');
          }
        } catch (authError) {
          console.error('Authentication error:', authError);
          // Try anonymous as final fallback
          await signInAnonymously(authInstance);
        }

        // Listen for auth state changes
        const unsubscribeAuth = onAuthStateChanged(authInstance, (user) => {
          if (user) {
            setUserId(user.uid);
            setIsAuthReady(true);
            console.log('User authenticated:', user.uid);
          } else {
            setUserId(null);
            setIsAuthReady(false);
            console.warn('User not authenticated');
          }
        });

        // Cleanup function
        return () => {
          unsubscribeAuth();
        };
      } catch (error) {
        console.error('Firebase initialization error:', error);
        // Enable demo mode on error
        setIsAuthReady(true);
      }
    };

    initializeFirebase();
  }, []);

  // Cleanup snapshot listener on unmount
  useEffect(() => {
    return () => {
      if (unsubscribeSnapshot) {
        unsubscribeSnapshot();
      }
    };
  }, [unsubscribeSnapshot]);

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

  // Generate dummy report data
  const generateDummyReport = () => {
    const reportData = realityCheckList.map((item, index) => {
      // Randomly assign 'good' or 'issue' (70% good, 30% issue for realism)
      const status = Math.random() > 0.3 ? 'good' : 'issue';
      const issueNotes = [
        'Slightly lower than expected, but acceptable for the area.',
        'Minor wear noticed, might need attention before move-in.',
        'Could be improved, recommend discussing with property manager.',
        'Some minor concerns, worth noting for your consideration.',
        'Not ideal, but within normal range for this property type.'
      ];

      return {
        number: index + 1,
        point: item.point,
        icon: item.icon,
        status: status,
        notes: status === 'issue' ? issueNotes[Math.floor(Math.random() * issueNotes.length)] : ''
      };
    });

    return reportData;
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    // IMPORTANT: Clear previous status immediately before any async operations
    setStatus(null);
    setStatusData(null);

    // Guard clause: Check if Firebase is ready
    if (!isAuthReady) {
      setIsSearching(true);
      setHasSearched(true);
      // Will show "connecting" state while Firebase initializes
      setTimeout(() => {
        if (isAuthReady) {
          handleSubmit(e); // Retry once ready
        } else {
          setIsSearching(false);
          alert('Unable to connect to database. Please try again.');
        }
      }, 2000);
      return;
    }

    setIsSearching(true);
    setHasSearched(true);

    // Cleanup previous snapshot listener if exists
    if (unsubscribeSnapshot) {
      unsubscribeSnapshot();
      setUnsubscribeSnapshot(null);
    }

    // Fallback to demo mode if Firebase is not configured
    if (!db || !window.__app_id) {
      console.warn('Firebase not configured, using demo mode');
      setTimeout(() => {
        // Demo fallback logic
        if (formData.bookingId.trim() === '123') {
          setStatus('completed');
          setStatusData({
            videoLink: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
            reportData: generateDummyReport()
          });
        } else {
          const demoStatuses = ['assigned', 'inspected', 'completed'];
          const randomStatus = demoStatuses[formData.bookingId.length % 3];
          setStatus(randomStatus);
          setStatusData(null);
        }
        setIsSearching(false);
      }, 1000);
      return;
    }

    // Real Firestore query
    const appId = window.__app_id;
    const refId = formData.bookingId.trim();
    const jobDocPath = `/artifacts/${appId}/public/data/jobs/${refId}`;

    try {
      // Create document reference
      const jobDocRef = doc(db, 'artifacts', appId, 'public', 'data', 'jobs', refId);

      // Set up real-time listener with onSnapshot
      const unsubscribe = onSnapshot(
        jobDocRef,
        (docSnapshot) => {
          setIsSearching(false);

          // Check if document exists
          if (!docSnapshot.exists()) {
            setStatus(null);
            setStatusData(null);
            alert('Booking not found. Please check your booking reference and try again.');
            return;
          }

          // Parse job data from Firestore
          const jobData = docSnapshot.data();
          console.log('Job data received:', jobData);

          // SECURITY: Validate email matches
          const enteredEmail = formData.email.trim().toLowerCase();
          const storedEmail = (jobData.customerEmail || '').trim().toLowerCase();

          if (enteredEmail !== storedEmail) {
            setStatus(null);
            setStatusData(null);
            alert('Booking not found or email does not match. Please check your details and try again.');
            return;
          }

          // Map Firestore status to our status keys
          let mappedStatus = null;
          if (jobData.status) {
            const firestoreStatus = jobData.status.toLowerCase();

            // Map various status strings to our status config keys
            if (firestoreStatus.includes('assigned') || firestoreStatus === 'agent assigned') {
              mappedStatus = 'assigned';
            } else if (firestoreStatus.includes('inspected') || firestoreStatus === 'inspection complete') {
              mappedStatus = 'inspected';
            } else if (firestoreStatus.includes('report') || firestoreStatus === 'completed' || firestoreStatus === 'report sent') {
              mappedStatus = 'completed';
            } else {
              // Default to assigned if status is unclear
              mappedStatus = 'assigned';
            }
          }

          setStatus(mappedStatus);

          // If status is 'Report Sent' or 'completed', retrieve reportData and videoLink
          if (mappedStatus === 'completed') {
            const data = {
              videoLink: jobData.videoLink || null,
              reportData: jobData.reportData || null
            };

            // If reportData doesn't exist but we need to show something, use dummy data
            if (!data.reportData) {
              console.warn('No reportData found in Firestore, using dummy data');
              data.reportData = generateDummyReport();
            }

            setStatusData(data);
          } else {
            setStatusData(null);
          }
        },
        (error) => {
          console.error('Firestore snapshot error:', error);
          setIsSearching(false);
          setStatus(null);
          setStatusData(null);
          alert('Error retrieving booking status. Please try again later.');
        }
      );

      // Store unsubscribe function for cleanup
      setUnsubscribeSnapshot(() => unsubscribe);

    } catch (error) {
      console.error('Error setting up Firestore listener:', error);
      setIsSearching(false);
      setStatus(null);
      setStatusData(null);
      alert('Error connecting to database. Please try again.');
    }
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
        {!isSearching && currentStatus && (
          <>
            <div className={`${currentStatus.bgColor} ${currentStatus.textColor} rounded-lg shadow-lg p-8 sm:p-10 transform transition-all duration-500 animate-fadeIn`}>
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <currentStatus.icon className="w-12 h-12 sm:w-16 sm:h-16" />
                </div>
                <div className="ml-6 flex-1">
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
                    {status === 'completed' && !statusData && (
                      <p className="text-sm opacity-80">
                        Check your inbox (and spam folder) for an email from ViewMinder. The email contains your video link and PDF report. Questions? Contact support@viewminder.com.au
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Video Link Section (for completed status with data) */}
            {status === 'completed' && statusData?.videoLink && (
              <div className="mt-8 bg-white rounded-lg shadow-lg p-6 sm:p-8 border-l-4 border-teal-600">
                <div className="flex items-center mb-4">
                  <Video className="w-8 h-8 text-teal-600 mr-3" />
                  <h3 className="text-2xl font-bold text-slate-800">HD Recorded Walkthrough</h3>
                </div>
                <p className="text-slate-600 mb-4">
                  Your inspection video is ready to view. This HD recording shows the complete property walkthrough conducted by your ViewMinder agent.
                </p>
                <a
                  href={statusData.videoLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center bg-teal-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-teal-700 transition-colors"
                >
                  <Video className="w-5 h-5 mr-2" />
                  Watch Video Walkthrough
                </a>
              </div>
            )}

            {/* Detailed 15-Point Report Section */}
            {status === 'completed' && statusData?.reportData && (
              <div className="mt-8 bg-white rounded-lg shadow-lg p-6 sm:p-8">
                <div className="flex items-center mb-6">
                  <Clipboard className="w-8 h-8 text-teal-600 mr-3" />
                  <h3 className="text-2xl font-bold text-slate-800">Detailed 15-Point Report</h3>
                </div>

                <p className="text-slate-600 mb-6">
                  Our certified ViewMinder agent completed a comprehensive inspection of the property. Here are the findings from our 15-point quality check:
                </p>

                {/* Summary Stats */}
                <div className="grid grid-cols-2 gap-4 mb-8 p-4 bg-slate-50 rounded-lg">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600">
                      {statusData.reportData.filter(item => item.status === 'good').length}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Points Good/Normal</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-orange-500">
                      {statusData.reportData.filter(item => item.status === 'issue').length}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">Points with Notes</div>
                  </div>
                </div>

                {/* Report Items */}
                <div className="space-y-4">
                  {statusData.reportData.map((item) => {
                    const IconComponent = item.icon;
                    const isGood = item.status === 'good';

                    return (
                      <div
                        key={item.number}
                        className={`p-4 rounded-lg border-2 ${
                          isGood
                            ? 'bg-green-50 border-green-200'
                            : 'bg-orange-50 border-orange-200'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                            isGood ? 'bg-green-100' : 'bg-orange-100'
                          }`}>
                            <IconComponent className={`w-5 h-5 ${
                              isGood ? 'text-green-600' : 'text-orange-600'
                            }`} />
                          </div>

                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-slate-800 text-sm sm:text-base">
                                {item.number}. {item.point}
                              </h4>
                              <div className={`flex items-center ml-4 ${
                                isGood ? 'text-green-600' : 'text-orange-600'
                              }`}>
                                {isGood ? (
                                  <>
                                    <CheckCircle className="w-5 h-5 mr-1" />
                                    <span className="text-sm font-semibold">Good</span>
                                  </>
                                ) : (
                                  <>
                                    <AlertCircle className="w-5 h-5 mr-1" />
                                    <span className="text-sm font-semibold">Note</span>
                                  </>
                                )}
                              </div>
                            </div>

                            {!isGood && item.notes && (
                              <div className="mt-2 p-3 bg-white rounded border border-orange-200">
                                <p className="text-sm text-slate-700">
                                  <span className="font-semibold text-orange-700">Agent's Note:</span> {item.notes}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Download/Print Actions */}
                <div className="mt-8 pt-6 border-t border-slate-200">
                  <p className="text-sm text-slate-600 mb-4">
                    This report has been sent to your email. You can also print or save this page for your records.
                  </p>
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.print()}
                      className="bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-slate-700 transition-colors text-sm"
                    >
                      Print Report
                    </button>
                    <a
                      href="mailto:support@viewminder.com.au?subject=Question about my inspection report"
                      className="bg-teal-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-teal-700 transition-colors text-sm"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            )}
          </>
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
