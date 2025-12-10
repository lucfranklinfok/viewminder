import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  MapPin,
  User,
  Mail,
  Phone,
  DollarSign,
  ExternalLink,
  Loader2,
  Lock,
  Upload,
  File,
  Trash2,
  Image,
  Video
} from 'lucide-react';
import { db, storage } from './firebase';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';

function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);

  // Fetch all bookings from Firestore
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const appId = import.meta.env.VITE_APP_ID || 'viewminder';
      const bookingsRef = collection(db, 'artifacts', appId, 'public', 'data', 'jobs');
      const q = query(bookingsRef, orderBy('createdAt', 'desc'));

      const querySnapshot = await getDocs(q);
      const bookingsData = [];

      querySnapshot.forEach((doc) => {
        bookingsData.push({
          id: doc.id,
          ...doc.data()
        });
      });

      setBookings(bookingsData);
      setFilteredBookings(bookingsData);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      alert('Failed to load bookings. Please refresh the page.');
    } finally {
      setLoading(false);
    }
  };

  // Check if already authenticated in session
  useEffect(() => {
    const isAuthed = sessionStorage.getItem('adminAuthenticated') === 'true';
    setIsAuthenticated(isAuthed);
  }, []);

  // Fetch bookings when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchBookings();
    } else {
      setLoading(false); // Stop loading if not authenticated
    }
  }, [isAuthenticated]);

  // Filter bookings based on search and status
  useEffect(() => {
    let filtered = bookings;

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(booking => booking.status === statusFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(booking =>
        booking.bookingId?.toLowerCase().includes(term) ||
        booking.customerName?.toLowerCase().includes(term) ||
        booking.customerEmail?.toLowerCase().includes(term) ||
        booking.suburb?.toLowerCase().includes(term)
      );
    }

    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);

  // Handle password submission
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    const correctPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

    if (passwordInput === correctPassword) {
      setIsAuthenticated(true);
      sessionStorage.setItem('adminAuthenticated', 'true');
      setPasswordError('');
    } else {
      setPasswordError('Incorrect password. Please try again.');
      setPasswordInput('');
    }
  };

  // Handle logout
  const handleLogout = () => {
    setIsAuthenticated(false);
    sessionStorage.removeItem('adminAuthenticated');
  };

  // Show password prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center mb-6">
            <Lock className="w-12 h-12 text-teal-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-800">ViewMinder Admin</h1>
            <p className="text-slate-600 mt-2">Enter password to continue</p>
          </div>

          <form onSubmit={handlePasswordSubmit}>
            <div className="mb-4">
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="Enter admin password"
                autoFocus
              />
              {passwordError && (
                <p className="mt-2 text-sm text-red-600">{passwordError}</p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700 transition font-semibold"
            >
              Access Dashboard
            </button>
          </form>

          <div className="mt-6 text-center">
            <a href="/" className="text-sm text-slate-600 hover:text-teal-600 transition">
              ← Back to home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Update booking status
  const updateBookingStatus = async (bookingId, newStatus) => {
    setUpdating(true);
    try {
      const appId = import.meta.env.VITE_APP_ID || 'viewminder';
      const bookingRef = doc(db, 'artifacts', appId, 'public', 'data', 'jobs', bookingId);

      await updateDoc(bookingRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setBookings(prev => prev.map(booking =>
        booking.id === bookingId
          ? { ...booking, status: newStatus, updatedAt: new Date().toISOString() }
          : booking
      ));

      alert(`Booking ${bookingId} updated to ${newStatus}`);
      setSelectedBooking(null);
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking status');
    } finally {
      setUpdating(false);
    }
  };

  // Handle file upload
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setUploading(true);
    setUploadProgress(0);

    try {
      const bookingId = selectedBooking.bookingId;
      const uploadedFiles = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const timestamp = Date.now();
        const fileName = `${timestamp}_${file.name}`;
        const storageRef = ref(storage, `inspections/${bookingId}/${fileName}`);

        // Upload file
        const uploadTask = uploadBytesResumable(storageRef, file);

        await new Promise((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (snapshot) => {
              const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
              setUploadProgress(Math.round(progress));
            },
            (error) => {
              console.error('Upload error:', error);
              reject(error);
            },
            async () => {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              uploadedFiles.push({
                name: file.name,
                url: downloadURL,
                type: file.type,
                size: file.size,
                uploadedAt: new Date().toISOString()
              });
              resolve();
            }
          );
        });
      }

      // Update Firestore with file URLs
      const appId = import.meta.env.VITE_APP_ID || 'viewminder';
      const bookingRef = doc(db, 'artifacts', appId, 'public', 'data', 'jobs', selectedBooking.id);
      const currentFiles = selectedBooking.files || [];

      await updateDoc(bookingRef, {
        files: [...currentFiles, ...uploadedFiles],
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedBooking = {
        ...selectedBooking,
        files: [...currentFiles, ...uploadedFiles]
      };
      setSelectedBooking(updatedBooking);
      setBookings(prev => prev.map(booking =>
        booking.id === selectedBooking.id ? updatedBooking : booking
      ));

      alert(`Successfully uploaded ${uploadedFiles.length} file(s)`);
    } catch (error) {
      console.error('Error uploading files:', error);
      alert('Failed to upload files. Please try again.');
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = ''; // Reset file input
    }
  };

  // Handle file delete
  const handleFileDelete = async (file, index) => {
    if (!confirm(`Are you sure you want to delete ${file.name}?`)) return;

    try {
      // Extract file path from URL
      const filePath = decodeURIComponent(file.url.split('/o/')[1].split('?')[0]);
      const storageRef = ref(storage, filePath);

      // Delete from Firebase Storage
      await deleteObject(storageRef);

      // Update Firestore
      const appId = import.meta.env.VITE_APP_ID || 'viewminder';
      const bookingRef = doc(db, 'artifacts', appId, 'public', 'data', 'jobs', selectedBooking.id);
      const updatedFiles = selectedBooking.files.filter((_, i) => i !== index);

      await updateDoc(bookingRef, {
        files: updatedFiles,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      const updatedBooking = { ...selectedBooking, files: updatedFiles };
      setSelectedBooking(updatedBooking);
      setBookings(prev => prev.map(booking =>
        booking.id === selectedBooking.id ? updatedBooking : booking
      ));

      alert('File deleted successfully');
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  // Get file icon based on type
  const getFileIcon = (fileType) => {
    if (fileType.startsWith('image/')) return Image;
    if (fileType.startsWith('video/')) return Video;
    return File;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  // Status badge component
  const StatusBadge = ({ status }) => {
    const statusConfig = {
      assigned: { bg: 'bg-blue-100', text: 'text-blue-800', icon: Clock },
      completed: { bg: 'bg-green-100', text: 'text-green-800', icon: CheckCircle },
      cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: XCircle },
    };

    const config = statusConfig[status] || statusConfig.assigned;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.bg} ${config.text}`}>
        <Icon className="w-4 h-4 mr-1" />
        {status}
      </span>
    );
  };

  // Format date
  const formatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    try {
      // Handle Firestore Timestamp objects
      let date;
      if (dateValue && typeof dateValue === 'object' && dateValue.seconds) {
        // Firestore Timestamp object
        date = new Date(dateValue.seconds * 1000);
      } else if (typeof dateValue === 'string') {
        // ISO string
        date = new Date(dateValue);
      } else {
        return 'Invalid Date';
      }

      if (isNaN(date.getTime())) {
        return 'Invalid Date';
      }

      return date.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (error) {
      console.error('Date formatting error:', error, dateValue);
      return 'Invalid Date';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-teal-600">ViewMinder Admin Dashboard</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchBookings}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </button>
              <button
                onClick={handleLogout}
                className="flex items-center px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition"
              >
                <Lock className="w-4 h-4 mr-2" />
                Logout
              </button>
              <a href="/" className="text-slate-600 hover:text-teal-600 transition">
                ← Back to Site
              </a>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Bookings</p>
                <p className="text-3xl font-bold text-slate-800">{bookings.length}</p>
              </div>
              <Calendar className="w-10 h-10 text-teal-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Assigned</p>
                <p className="text-3xl font-bold text-blue-600">
                  {bookings.filter(b => b.status === 'assigned').length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-blue-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Completed</p>
                <p className="text-3xl font-bold text-green-600">
                  {bookings.filter(b => b.status === 'completed').length}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Revenue</p>
                <p className="text-3xl font-bold text-teal-600">
                  ${bookings.reduce((sum, b) => sum + (b.price || 0), 0)}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-teal-600" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow-md mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by booking ID, name, email, or suburb..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="assigned">Assigned</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Bookings Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <span className="ml-3 text-slate-600">Loading bookings...</span>
            </div>
          ) : filteredBookings.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-slate-600 text-lg">No bookings found</p>
              {searchTerm || statusFilter !== 'all' ? (
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setStatusFilter('all');
                  }}
                  className="mt-4 text-teal-600 hover:text-teal-700 underline"
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Booking ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Customer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Inspection
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-600 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-slate-200">
                  {filteredBookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-900">{booking.bookingId}</div>
                        <div className="text-xs text-slate-500">{formatDate(booking.createdAt)}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{booking.customerName}</div>
                        <div className="text-xs text-slate-500">{booking.customerEmail}</div>
                        <div className="text-xs text-slate-500">{booking.customerMobile}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-900">{booking.inspectionDate}</div>
                        <div className="text-xs text-slate-500">{booking.inspectionTime}</div>
                        <div className="text-xs text-slate-500">{booking.suburb}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge status={booking.status} />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-teal-600">${booking.price}</div>
                        <div className="text-xs text-slate-500">{booking.pricingTier}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-teal-600 hover:text-teal-900 font-medium"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center">
              <h3 className="text-xl font-bold text-slate-800">Booking Details</h3>
              <button
                onClick={() => setSelectedBooking(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl"
              >
                ×
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Booking Info */}
              <div>
                <h4 className="text-sm font-semibold text-slate-600 uppercase mb-3">Booking Information</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-slate-500">Booking ID</p>
                    <p className="text-sm font-medium text-slate-900">{selectedBooking.bookingId}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Created</p>
                    <p className="text-sm font-medium text-slate-900">{formatDate(selectedBooking.createdAt)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Payment Status</p>
                    <p className="text-sm font-medium text-green-600">{selectedBooking.paymentStatus}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">Stripe Charge ID</p>
                    <p className="text-sm font-medium text-slate-900 truncate">{selectedBooking.stripeChargeId}</p>
                  </div>
                </div>
              </div>

              {/* Customer Info */}
              <div>
                <h4 className="text-sm font-semibold text-slate-600 uppercase mb-3">Customer Information</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <User className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-900">{selectedBooking.customerName}</span>
                  </div>
                  <div className="flex items-center">
                    <Mail className="w-4 h-4 text-slate-400 mr-2" />
                    <a href={`mailto:${selectedBooking.customerEmail}`} className="text-sm text-teal-600 hover:underline">
                      {selectedBooking.customerEmail}
                    </a>
                  </div>
                  <div className="flex items-center">
                    <Phone className="w-4 h-4 text-slate-400 mr-2" />
                    <a href={`tel:${selectedBooking.customerMobile}`} className="text-sm text-teal-600 hover:underline">
                      {selectedBooking.customerMobile}
                    </a>
                  </div>
                </div>
              </div>

              {/* Inspection Details */}
              <div>
                <h4 className="text-sm font-semibold text-slate-600 uppercase mb-3">Inspection Details</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-900">{selectedBooking.inspectionDate} at {selectedBooking.inspectionTime}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-900">{selectedBooking.suburb}</span>
                  </div>
                  <div className="flex items-center">
                    <ExternalLink className="w-4 h-4 text-slate-400 mr-2" />
                    <a
                      href={selectedBooking.propertyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-teal-600 hover:underline"
                    >
                      View Property Listing
                    </a>
                  </div>
                  <div className="flex items-center">
                    <DollarSign className="w-4 h-4 text-slate-400 mr-2" />
                    <span className="text-sm text-slate-900">${selectedBooking.price} ({selectedBooking.pricingTier})</span>
                  </div>
                </div>
              </div>

              {/* Update Status */}
              <div>
                <h4 className="text-sm font-semibold text-slate-600 uppercase mb-3">Update Status</h4>
                <div className="flex space-x-2">
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'assigned')}
                    disabled={updating || selectedBooking.status === 'assigned'}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Assigned'}
                  </button>
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'completed')}
                    disabled={updating || selectedBooking.status === 'completed'}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Completed'}
                  </button>
                  <button
                    onClick={() => updateBookingStatus(selectedBooking.id, 'cancelled')}
                    disabled={updating || selectedBooking.status === 'cancelled'}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {updating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : 'Cancelled'}
                  </button>
                </div>
              </div>

              {/* File Upload Section */}
              <div>
                <h4 className="text-sm font-semibold text-slate-600 uppercase mb-3">Inspection Files</h4>

                {/* Upload Button */}
                <div className="mb-4">
                  <label className="flex items-center justify-center px-4 py-3 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:border-teal-500 hover:bg-teal-50 transition">
                    <input
                      type="file"
                      multiple
                      accept="image/*,video/*,.pdf"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                    <Upload className="w-5 h-5 text-slate-600 mr-2" />
                    <span className="text-sm text-slate-600">
                      {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Photos/Videos'}
                    </span>
                  </label>
                  {uploading && (
                    <div className="mt-2 w-full bg-slate-200 rounded-full h-2">
                      <div
                        className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  )}
                </div>

                {/* Uploaded Files List */}
                {selectedBooking.files && selectedBooking.files.length > 0 ? (
                  <div className="space-y-2">
                    {selectedBooking.files.map((file, index) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition"
                        >
                          <div className="flex items-center space-x-3 flex-1 min-w-0">
                            <FileIcon className="w-5 h-5 text-teal-600 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-slate-900 truncate">{file.name}</p>
                              <p className="text-xs text-slate-500">
                                {formatFileSize(file.size)} • {formatDate(file.uploadedAt)}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2 ml-2">
                            <a
                              href={file.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-teal-600 hover:bg-teal-100 rounded transition"
                              title="View file"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                            <button
                              onClick={() => handleFileDelete(file, index)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded transition"
                              title="Delete file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500 text-center py-4">No files uploaded yet</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
