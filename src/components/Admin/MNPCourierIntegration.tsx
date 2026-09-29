import React, { useState } from 'react';
import { 
  Truck, 
  ShieldCheck, 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  Check, 
  X, 
  Copy, 
  AlertCircle, 
  Sparkles, 
  Building2, 
  MapPin, 
  RefreshCw, 
  FileText, 
  Package, 
  CheckCircle2, 
  ExternalLink,
  MessageCircle,
  Clock,
  Printer
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';
import { Order, MNPShipmentBooking } from '../../types';
import { STORE_ADDRESS, STORE_WHATSAPP_NUMBER } from '../../utils/whatsapp';

export const MNPCourierIntegration: React.FC = () => {
  const { 
    mnpConfig, 
    updateMNPConfig, 
    connectMNP, 
    disconnectMNP, 
    orders, 
    updateOrderTracking, 
    prepareMNPShipmentBooking 
  } = useStore();

  // Form state
  const [accountNumber, setAccountNumber] = useState(mnpConfig.accountNumber || '');
  const [username, setUsername] = useState(mnpConfig.username || '');
  const [password, setPassword] = useState(mnpConfig.password || '');
  const [apiKey, setApiKey] = useState(mnpConfig.apiKey || '');
  const [originCity, setOriginCity] = useState(mnpConfig.originCity || 'Liaqatpur');
  const [pickupAddress, setPickupAddress] = useState(
    mnpConfig.pickupAddress || STORE_ADDRESS
  );
  const [serviceType, setServiceType] = useState(mnpConfig.defaultServiceType || 'Overnight');
  const [environment, setEnvironment] = useState<'production' | 'staging' | 'custom'>(
    mnpConfig.environment || 'production'
  );
  const [apiBaseUrl, setApiBaseUrl] = useState(mnpConfig.apiBaseUrl || '');
  const [autoAssignTracking, setAutoAssignTracking] = useState(
    mnpConfig.autoAssignTracking !== false
  );

  // Visibility toggles for sensitive credentials
  const [showPassword, setShowPassword] = useState(false);
  const [showApiKey, setShowApiKey] = useState(false);

  // Status banners & feedback
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [copiedTracking, setCopiedTracking] = useState<string | null>(null);

  // Booking Modal State
  const [bookingOrder, setBookingOrder] = useState<Order | null>(null);
  const [parcelWeight, setParcelWeight] = useState<number>(0.5);
  const [parcelPieces, setParcelPieces] = useState<number>(1);
  const [bookingService, setBookingService] = useState<string>('Overnight COD Express');
  const [customConsignmentNo, setCustomConsignmentNo] = useState<string>('');
  const [bookingRemarks, setBookingRemarks] = useState<string>('Fragile - Footwear Parcel');
  const [bookingSuccessOrder, setBookingSuccessOrder] = useState<Order | null>(null);

  // Quick Tracking Edit Modal
  const [editingTrackingOrder, setEditingTrackingOrder] = useState<Order | null>(null);
  const [trackingInput, setTrackingInput] = useState('');

  const showNotification = (type: 'success' | 'error', text: string) => {
    setStatusMessage({ type, text });
    setTimeout(() => {
      setStatusMessage(null);
    }, 4000);
  };

  // Handle Save / Update Credentials
  const handleSaveCredentials = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    updateMNPConfig({
      courierName: 'MNP Courier',
      accountNumber: accountNumber.trim(),
      username: username.trim(),
      password: password.trim(),
      apiKey: apiKey.trim(),
      originCity: originCity.trim(),
      pickupAddress: pickupAddress.trim(),
      defaultServiceType: serviceType,
      environment,
      apiBaseUrl: apiBaseUrl.trim(),
      autoAssignTracking,
    });
    showNotification('success', 'MNP Courier configuration saved successfully.');
  };

  // Handle Connect
  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) {
      showNotification('error', 'Please enter your MNP Account Number / Client Code.');
      return;
    }
    if (!username.trim()) {
      showNotification('error', 'Please enter your MNP Portal Username.');
      return;
    }
    if (!password.trim()) {
      showNotification('error', 'Please enter your MNP Account Password.');
      return;
    }

    const updates = {
      courierName: 'MNP Courier',
      accountNumber: accountNumber.trim(),
      username: username.trim(),
      password: password.trim(),
      apiKey: apiKey.trim(),
      originCity: originCity.trim(),
      pickupAddress: pickupAddress.trim(),
      defaultServiceType: serviceType,
      environment,
      apiBaseUrl: apiBaseUrl.trim(),
      autoAssignTracking,
    };

    connectMNP(updates);
    showNotification('success', 'Connected to MNP Courier Portal account successfully! Website orders can now be booked.');
  };

  // Handle Disconnect
  const handleDisconnect = () => {
    if (confirm('Are you sure you want to disconnect this MNP Courier account? You can reconnect anytime.')) {
      disconnectMNP();
      showNotification('success', 'MNP Courier account has been disconnected.');
    }
  };

  // Copy tracking number
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedTracking(text);
    setTimeout(() => setCopiedTracking(null), 2000);
  };

  // Open Shipment Booking
  const handleOpenBooking = (order: Order) => {
    setBookingOrder(order);
    const totalQty = order.items.reduce((s, i) => s + i.quantity, 0);
    setParcelPieces(Math.max(1, totalQty));
    setParcelWeight(Math.max(0.5, totalQty * 0.4));
    setBookingService(serviceType === 'Second Day' ? 'Second Day COD' : 'Overnight COD Express');
    // Pre-suggest standard MNP format
    const random8 = Math.floor(10000000 + Math.random() * 90000000);
    setCustomConsignmentNo(order.trackingNumber || `MNP-${random8}`);
    setBookingRemarks(`Footwear - Order #${order.id}`);
  };

  // Submit Shipment Booking
  const handleConfirmShipmentBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingOrder) return;

    const consignmentNo = customConsignmentNo.trim() || `MNP-${Math.floor(10000000 + Math.random() * 90000000)}`;
    const codToCollect = bookingOrder.paymentMethod === 'cod' ? bookingOrder.finalAmount : 0;

    const booking: MNPShipmentBooking = {
      consignmentNumber: consignmentNo,
      bookedAt: new Date().toISOString(),
      weightKg: parcelWeight,
      pieces: parcelPieces,
      serviceType: bookingService,
      codAmount: codToCollect,
      destinationCity: bookingOrder.city,
      consigneeName: bookingOrder.customerName,
      consigneeAddress: `${bookingOrder.address}, ${bookingOrder.city}`,
      consigneeContact: bookingOrder.contactNumber || bookingOrder.whatsappNumber,
      remarks: bookingRemarks,
      pickupLocation: pickupAddress || originCity,
    };

    prepareMNPShipmentBooking(bookingOrder.id, booking);
    
    // Update local state copy to show success slip
    const updatedOrder: Order = {
      ...bookingOrder,
      trackingNumber: consignmentNo,
      courierName: 'MNP Courier',
      status: 'Shipped',
      mnpShipment: booking,
    };

    setBookingOrder(null);
    setBookingSuccessOrder(updatedOrder);
    showNotification('success', `Shipment booked with MNP Courier! Consignment #${consignmentNo}`);
  };

  // Save manual tracking number
  const handleSaveManualTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTrackingOrder) return;
    if (!trackingInput.trim()) {
      showNotification('error', 'Tracking / Consignment number cannot be empty.');
      return;
    }

    updateOrderTracking(editingTrackingOrder.id, trackingInput.trim(), 'MNP Courier');
    setEditingTrackingOrder(null);
    setTrackingInput('');
    showNotification('success', 'Tracking / Consignment number updated successfully.');
  };

  // Customer WhatsApp Dispatch Message
  const getWhatsAppDispatchUrl = (order: Order) => {
    const text = encodeURIComponent(
      `Assalam-o-Alaikum ${order.customerName}! 📦\n\n` +
      `Your order *#${order.id}* from *Hasnain Zarri Chappal Store* has been dispatched via *MNP Courier*.\n\n` +
      `🚚 *Courier:* MNP Courier (M&P Express Logistics)\n` +
      `🔢 *Tracking / Consignment Number:* ${order.trackingNumber}\n` +
      `💰 *Amount:* Rs. ${order.finalAmount.toLocaleString()} (${order.paymentMethod === 'advance' ? 'Advance Paid (5% Discount)' : 'Cash on Delivery'})\n` +
      `📍 *Destination:* ${order.city}\n\n` +
      `Customer Protection Policy:\n` +
      `• Allowed to open parcel & inspect before accepting\n` +
      `• 7 Days Return Policy\n` +
      `• 100% Full Payment Refund guarantee\n\n` +
      `Thank you for choosing Hasnain Zarri!`
    );
    const cleanPhone = order.whatsappNumber.replace(/[^0-9]/g, '');
    const phoneWithCountry = cleanPhone.startsWith('92') 
      ? cleanPhone 
      : cleanPhone.startsWith('0') 
      ? '92' + cleanPhone.slice(1) 
      : '92' + cleanPhone;
    return `https://wa.me/${phoneWithCountry}?text=${text}`;
  };

  // Filter orders for MNP booking
  const pendingBookingOrders = orders.filter(
    (o) => o.status !== 'Cancelled' && (!o.trackingNumber || o.status === 'Confirmed' || o.status === 'Pending')
  );

  const bookedOrders = orders.filter((o) => !!o.trackingNumber);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Header Banner */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-600 text-white shadow-md relative overflow-hidden">
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shrink-0">
              <Truck className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-extrabold tracking-tight">
                  MNP Courier Integration
                </h2>
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-[10px] font-bold uppercase tracking-wider border border-white/30">
                  Official Portal
                </span>
              </div>
              <p className="text-amber-100 text-xs sm:text-sm mt-0.5">
                Connect your MNP Courier (M&P Express Logistics) account for automated COD parcel booking & tracking.
              </p>
            </div>
          </div>

          {/* Status */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className={`px-4 py-2 rounded-2xl flex items-center gap-2 border font-bold text-xs shadow-sm ${
              mnpConfig.isConnected 
                ? 'bg-emerald-500/90 text-white border-emerald-400' 
                : 'bg-white/20 text-white border-white/30'
            }`}>
              <div className={`w-2.5 h-2.5 rounded-full ${
                mnpConfig.isConnected ? 'bg-white animate-pulse' : 'bg-amber-200'
              }`} />
              <span>Status: {mnpConfig.isConnected ? 'Connected' : 'Not Connected'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Status Feedback Banner */}
      {statusMessage && (
        <div className={`p-4 rounded-2xl border text-xs sm:text-sm flex items-center gap-3 transition-all ${
          statusMessage.type === 'success'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
            : 'bg-red-50 border-red-300 text-red-800'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          )}
          <span className="font-semibold">{statusMessage.text}</span>
        </div>
      )}

      {/* Main Grid: Connection & Credentials on Left, Account Overview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Account & API Credentials Settings (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-gray-100">
            <div>
              <h3 className="font-serif-luxury font-bold text-base text-gray-900 flex items-center gap-2">
                <Key className="w-4 h-4 text-amber-600" />
                <span>MNP Account & API Credentials</span>
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Enter your merchant credentials provided by MNP Courier / M&P Express Logistics.
              </p>
            </div>
            
            <div className="text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 font-semibold flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
              <span>Encrypted & Masked</span>
            </div>
          </div>

          <form onSubmit={handleConnect} className="space-y-4 text-xs sm:text-sm">
            
            {/* Courier Company Name (Fixed MNP Courier) */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Courier Company
              </label>
              <div className="relative">
                <input
                  type="text"
                  disabled
                  value="MNP Courier (M&P Express Logistics COD)"
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-800 font-semibold cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                  Active Courier
                </span>
              </div>
            </div>

            {/* Account Number & Portal Username */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  MNP Account # / Client Code <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MNP-584920 or Client ID"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 font-mono text-xs sm:text-sm focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Your MNP COD customer account ID</span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  MNP Portal Username / User ID <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. hasnainzarri_cod"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 text-xs sm:text-sm focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">Login ID for MNP courier booking portal</span>
              </div>
            </div>

            {/* Password & API Key (Masked with Eye Toggles) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center justify-between">
                  <span>Portal Password <span className="text-red-500">*</span></span>
                  <span className="text-[10px] text-amber-700 font-normal">Hidden & Secure</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl pl-4 pr-10 py-2.5 text-gray-900 text-xs sm:text-sm focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 top-2.5 p-1 rounded text-gray-400 hover:text-gray-700"
                    title={showPassword ? 'Hide Password' : 'Show Password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Account login password for API authentication</span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1 flex items-center justify-between">
                  <span>API Key / Token <span className="text-gray-400 font-normal">(Optional)</span></span>
                  <span className="text-[10px] text-amber-700 font-normal">Hidden & Secure</span>
                </label>
                <div className="relative">
                  <input
                    type={showApiKey ? 'text' : 'password'}
                    placeholder="e.g. mnp_api_live_••••••••••••"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl pl-4 pr-10 py-2.5 text-gray-900 text-xs sm:text-sm focus:outline-none font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowApiKey(!showApiKey)}
                    className="absolute right-2.5 top-2.5 p-1 rounded text-gray-400 hover:text-gray-700"
                    title={showApiKey ? 'Hide API Key' : 'Show API Key'}
                  >
                    {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">Integration key if assigned by your MNP account manager</span>
              </div>
            </div>

            {/* Origin City & Pickup Address */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Origin Booking City <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Liaqatpur"
                  value={originCity}
                  onChange={(e) => setOriginCity(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 text-xs sm:text-sm focus:outline-none"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">City where courier picks up packages</span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Default Service Type
                </label>
                <select
                  value={serviceType}
                  onChange={(e) => setServiceType(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 text-xs sm:text-sm focus:outline-none"
                >
                  <option value="Overnight">Overnight Express COD (1-2 Days)</option>
                  <option value="Second Day">Second Day COD (2-3 Days)</option>
                  <option value="Same Day">Same Day Express (Within City)</option>
                </select>
                <span className="text-[10px] text-gray-400 mt-1 block">Standard dispatch speed for customer orders</span>
              </div>
            </div>

            {/* Warehouse / Store Pickup Address */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Store Pickup Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={pickupAddress}
                onChange={(e) => setPickupAddress(e.target.value)}
                className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 text-xs sm:text-sm focus:outline-none"
              />
              <span className="text-[10px] text-gray-400 mt-1 block">Exact location where MNP courier rider collects shipments</span>
            </div>

            {/* Environment & Custom Endpoint (Ready for official MNP API) */}
            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-800">
                  API Environment & Gateway Configuration
                </span>
                <span className="text-[10px] text-gray-500">Official MNP Architecture</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                  environment === 'production' 
                    ? 'bg-white border-amber-500 shadow-2xs' 
                    : 'bg-gray-100 border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="env"
                    checked={environment === 'production'}
                    onChange={() => setEnvironment('production')}
                    className="accent-amber-600"
                  />
                  <div>
                    <span className="font-bold text-xs block text-gray-900">Production Live</span>
                    <span className="text-[10px] text-gray-500">Official Portal</span>
                  </div>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                  environment === 'staging' 
                    ? 'bg-white border-amber-500 shadow-2xs' 
                    : 'bg-gray-100 border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="env"
                    checked={environment === 'staging'}
                    onChange={() => setEnvironment('staging')}
                    className="accent-amber-600"
                  />
                  <div>
                    <span className="font-bold text-xs block text-gray-900">Staging / Sandbox</span>
                    <span className="text-[10px] text-gray-500">Testing Portal</span>
                  </div>
                </label>

                <label className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-colors ${
                  environment === 'custom' 
                    ? 'bg-white border-amber-500 shadow-2xs' 
                    : 'bg-gray-100 border-gray-200'
                }`}>
                  <input
                    type="radio"
                    name="env"
                    checked={environment === 'custom'}
                    onChange={() => setEnvironment('custom')}
                    className="accent-amber-600"
                  />
                  <div>
                    <span className="font-bold text-xs block text-gray-900">Custom Endpoint</span>
                    <span className="text-[10px] text-gray-500">Direct Gateway</span>
                  </div>
                </label>
              </div>

              {environment === 'custom' && (
                <div className="pt-2">
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Custom API Endpoint URL
                  </label>
                  <input
                    type="text"
                    placeholder="https://api.mnpcourier.com/v1/booking"
                    value={apiBaseUrl}
                    onChange={(e) => setApiBaseUrl(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs font-mono focus:outline-none"
                  />
                </div>
              )}
            </div>

            {/* Actions: Connect Account, Save, Disconnect */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
              <div className="flex items-center gap-2.5">
                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-amber-700 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center gap-2 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{mnpConfig.isConnected ? 'Reconnect / Update Account' : 'Connect MNP Account'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSaveCredentials()}
                  className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs sm:text-sm border border-gray-300 transition-colors"
                >
                  Save Settings
                </button>
              </div>

              {mnpConfig.isConnected && (
                <button
                  type="button"
                  onClick={handleDisconnect}
                  className="py-2 px-3.5 rounded-xl bg-red-50 hover:bg-red-100 text-red-700 font-bold text-xs border border-red-200 transition-colors"
                >
                  Disconnect Account
                </button>
              )}
            </div>

          </form>
        </div>

        {/* Right: Active Account Profile & Quick Metrics (1 col) */}
        <div className="space-y-5">
          
          {/* Connection Summary Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-4">
            <h3 className="font-serif-luxury font-bold text-base text-gray-900 pb-2 border-b border-gray-100 flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-600" />
              <span>Integration Status</span>
            </h3>

            {mnpConfig.isConnected ? (
              <div className="space-y-3.5 text-xs">
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-extrabold text-sm text-emerald-900">Account Connected</div>
                    <div className="text-[11px] text-emerald-700 mt-0.5">
                      Ready to book and dispatch customer shipments via MNP Courier.
                    </div>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Courier Company:</span>
                    <strong className="text-gray-900">MNP Courier</strong>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Account Code:</span>
                    <strong className="font-mono text-amber-800">{mnpConfig.accountNumber || '—'}</strong>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Portal User:</span>
                    <strong className="text-gray-900">{mnpConfig.username || '—'}</strong>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Origin City:</span>
                    <strong className="text-gray-900">{mnpConfig.originCity || 'Liaqatpur'}</strong>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-gray-500">Environment:</span>
                    <span className="uppercase text-[10px] font-extrabold px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                      {mnpConfig.environment}
                    </span>
                  </div>
                  {mnpConfig.lastConnectedAt && (
                    <div className="py-2 flex justify-between">
                      <span className="text-gray-500">Last Synced:</span>
                      <span className="text-gray-600 text-[11px]">
                        {new Date(mnpConfig.lastConnectedAt).toLocaleDateString('en-GB', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 text-amber-900 text-xs space-y-2">
                <div className="flex items-center gap-2 font-bold text-amber-800">
                  <Clock className="w-4 h-4" />
                  <span>Not Connected</span>
                </div>
                <p className="text-[11px] text-amber-700 leading-relaxed">
                  Enter your MNP Courier account number and portal login details in the form to activate automated consignment booking.
                </p>
              </div>
            )}
          </div>

          {/* Quick Shipment Stats */}
          <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-3">
            <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider">
              Shipment Quick Stats
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
                <div className="text-2xl font-black text-amber-800 font-mono">
                  {bookedOrders.length}
                </div>
                <div className="text-[11px] font-bold text-amber-900 mt-0.5">
                  Booked Shipments
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-center">
                <div className="text-2xl font-black text-blue-800 font-mono">
                  {pendingBookingOrders.length}
                </div>
                <div className="text-[11px] font-bold text-blue-900 mt-0.5">
                  Pending Booking
                </div>
              </div>
            </div>

            <div className="text-[11px] text-gray-500 pt-1">
              Store Pickup: <strong className="text-gray-800">{STORE_ADDRESS}</strong>
            </div>
          </div>

        </div>

      </div>

      {/* Prepare Shipment Booking for Confirmed Orders */}
      <div className="bg-white border border-gray-200 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-gray-100">
          <div>
            <h3 className="font-serif-luxury font-bold text-base sm:text-lg text-gray-900 flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              <span>Prepare & Book Shipments via MNP Courier</span>
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              Select confirmed website orders to generate MNP consignments, book shipments, and assign tracking numbers.
            </p>
          </div>
          
          <span className="text-xs font-bold text-amber-800 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200 self-start sm:self-auto">
            {orders.length} Total Store Orders
          </span>
        </div>

        {/* Orders Ready for Booking Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 uppercase font-semibold text-[11px]">
              <tr>
                <th className="py-3 px-4">Order ID</th>
                <th className="py-3 px-4">Customer & City</th>
                <th className="py-3 px-4">Payment Method</th>
                <th className="py-3 px-4">COD / Amount</th>
                <th className="py-3 px-4">Tracking / Consignment #</th>
                <th className="py-3 px-4">Booking Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {orders.map((ord) => {
                const hasTracking = !!ord.trackingNumber;
                return (
                  <tr key={ord.id} className="hover:bg-gray-50/80 transition-colors">
                    
                    {/* Order ID */}
                    <td className="py-3.5 px-4 font-mono font-bold text-amber-800">
                      #{ord.id}
                      <span className="block text-[10px] text-gray-400 font-sans font-normal">
                        {new Date(ord.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </td>

                    {/* Customer */}
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-gray-900">{ord.customerName}</div>
                      <div className="text-[11px] text-gray-500 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-amber-600" />
                        <span>{ord.city}</span>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        ord.paymentMethod === 'advance'
                          ? 'bg-amber-100 text-amber-800 border border-amber-200'
                          : 'bg-blue-100 text-blue-800 border border-blue-200'
                      }`}>
                        {ord.paymentMethod === 'advance' ? 'Advance Paid (5% OFF)' : 'COD'}
                      </span>
                    </td>

                    {/* COD / Amount */}
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">
                      {ord.paymentMethod === 'cod' ? (
                        <span className="text-amber-800">Rs. {ord.finalAmount.toLocaleString()}</span>
                      ) : (
                        <span className="text-emerald-700">Rs. 0 (Paid)</span>
                      )}
                    </td>

                    {/* Tracking / Consignment Number */}
                    <td className="py-3.5 px-4">
                      {hasTracking ? (
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono font-bold text-xs bg-amber-50 text-amber-900 px-2 py-1 rounded-lg border border-amber-300">
                            {ord.trackingNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(ord.trackingNumber!)}
                            className="p-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-600"
                            title="Copy Consignment #"
                          >
                            {copiedTracking === ord.trackingNumber ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic text-[11px]">Not assigned</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {hasTracking ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Check className="w-3 h-3" />
                          <span>Booked (MNP)</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-700 border border-gray-300">
                          <span>Ready to Book</span>
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Book with MNP button */}
                        <button
                          type="button"
                          onClick={() => handleOpenBooking(ord)}
                          className="px-2.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs flex items-center gap-1 shadow-2xs transition-colors"
                          title="Prepare and Book Shipment with MNP"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>{hasTracking ? 'Re-book' : 'Book MNP'}</span>
                        </button>

                        {/* Edit Tracking manually */}
                        <button
                          type="button"
                          onClick={() => {
                            setEditingTrackingOrder(ord);
                            setTrackingInput(ord.trackingNumber || '');
                          }}
                          className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 transition-colors"
                          title="Set / Update Tracking Number"
                        >
                          <Key className="w-3.5 h-3.5" />
                        </button>

                        {/* Direct WhatsApp notify */}
                        {hasTracking && (
                          <a
                            href={getWhatsAppDispatchUrl(ord)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 transition-colors"
                            title="Send Tracking to Customer on WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>
                        )}

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL: PREPARE SHIPMENT BOOKING */}
      {bookingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 text-white">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base">Book Consignment via MNP Courier</h3>
                  <p className="text-xs text-amber-100">Order #{bookingOrder.id} • {bookingOrder.customerName}</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setBookingOrder(null)}
                className="p-1.5 rounded-lg hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmShipmentBooking} className="p-5 sm:p-6 space-y-4 text-xs sm:text-sm">
              
              {/* Consignee Summary */}
              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Customer Name:</span>
                  <strong className="text-gray-900">{bookingOrder.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Contact Number:</span>
                  <strong className="font-mono text-gray-900">{bookingOrder.whatsappNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500 text-xs">Destination Address:</span>
                  <strong className="text-gray-900 text-right max-w-xs">{bookingOrder.address}, {bookingOrder.city}</strong>
                </div>
                <div className="flex justify-between pt-1 border-t border-amber-200/80">
                  <span className="text-gray-700 font-bold text-xs">COD Amount to Collect:</span>
                  <strong className="font-mono text-amber-800 text-sm">
                    {bookingOrder.paymentMethod === 'cod' ? `Rs. ${bookingOrder.finalAmount.toLocaleString()}` : 'Rs. 0 (Already Paid Advance)'}
                  </strong>
                </div>
              </div>

              {/* Consignment Tracking Number */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  MNP Consignment / Tracking Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={customConsignmentNo}
                    onChange={(e) => setCustomConsignmentNo(e.target.value)}
                    className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 text-gray-900 font-mono font-bold text-sm focus:outline-none"
                    placeholder="e.g. MNP-58492019"
                  />
                  <button
                    type="button"
                    onClick={() => setCustomConsignmentNo(`MNP-${Math.floor(10000000 + Math.random() * 90000000)}`)}
                    className="absolute right-2.5 top-2.5 px-2 py-0.5 rounded bg-gray-100 hover:bg-gray-200 text-gray-700 text-[11px] font-semibold"
                  >
                    Auto Generate
                  </button>
                </div>
                <span className="text-[10px] text-gray-400 mt-1 block">
                  You can use the auto-generated number or enter the exact tracking number from your physical MNP airway bill / booking slip.
                </span>
              </div>

              {/* Weight & Pieces */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Parcel Weight (KG)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    value={parcelWeight}
                    onChange={(e) => setParcelWeight(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Number of Pieces
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={parcelPieces}
                    onChange={(e) => setParcelPieces(Number(e.target.value))}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm font-mono focus:outline-none"
                  />
                </div>
              </div>

              {/* Service & Remarks */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Service Type
                  </label>
                  <select
                    value={bookingService}
                    onChange={(e) => setBookingService(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none"
                  >
                    <option value="Overnight COD Express">Overnight COD Express</option>
                    <option value="Second Day COD">Second Day COD</option>
                    <option value="Same Day Express">Same Day Express</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">
                    Special Instructions / Remarks
                  </label>
                  <input
                    type="text"
                    value={bookingRemarks}
                    onChange={(e) => setBookingRemarks(e.target.value)}
                    className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs sm:text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Submit Booking */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setBookingOrder(null)}
                  className="py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs transition-colors"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 text-white font-extrabold text-xs sm:text-sm shadow-md hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer flex items-center gap-2"
                >
                  <Check className="w-4 h-4" />
                  <span>Confirm MNP Consignment Booking</span>
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* MODAL: BOOKING CONFIRMATION & AIRWAY BILL SLIP */}
      {bookingSuccessOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div 
            className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden my-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-emerald-600 text-white">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-6 h-6 text-white" />
                <h3 className="font-extrabold text-base">MNP Consignment Booked Successfully</h3>
              </div>
              <button
                type="button"
                onClick={() => setBookingSuccessOrder(null)}
                className="p-1 rounded hover:bg-white/20 text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="text-center p-4 rounded-2xl bg-amber-50 border border-amber-300">
                <span className="text-xs text-amber-800 font-bold uppercase tracking-wider block">
                  MNP Tracking / Consignment Number
                </span>
                <span className="font-mono text-2xl font-black text-amber-900 block my-1">
                  {bookingSuccessOrder.trackingNumber}
                </span>
                <button
                  type="button"
                  onClick={() => handleCopy(bookingSuccessOrder.trackingNumber!)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-white border border-amber-300 text-amber-800 font-bold text-xs mt-1 shadow-2xs"
                >
                  {copiedTracking === bookingSuccessOrder.trackingNumber ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Number</span>
                    </>
                  )}
                </button>
              </div>

              {/* Airway Bill Summary */}
              <div className="border border-gray-200 rounded-2xl p-4 bg-gray-50 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-gray-500">Consignee:</span>
                  <strong className="text-gray-900">{bookingSuccessOrder.customerName}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Contact / Phone:</span>
                  <strong className="font-mono">{bookingSuccessOrder.whatsappNumber}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Destination:</span>
                  <strong className="text-gray-900">{bookingSuccessOrder.city}</strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">COD Collection:</span>
                  <strong className="text-amber-800 font-mono">
                    {bookingSuccessOrder.paymentMethod === 'cod' ? `Rs. ${bookingSuccessOrder.finalAmount.toLocaleString()}` : 'Rs. 0 (Advance Paid)'}
                  </strong>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Origin / Pickup:</span>
                  <span className="text-gray-700">{STORE_ADDRESS}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-2">
                <a
                  href={getWhatsAppDispatchUrl(bookingSuccessOrder)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 px-4 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4 fill-white" />
                  <span>Notify Customer on WhatsApp ({bookingSuccessOrder.whatsappNumber})</span>
                </a>

                <button
                  type="button"
                  onClick={() => setBookingSuccessOrder(null)}
                  className="w-full py-2.5 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs transition-colors"
                >
                  Done
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* MODAL: MANUAL TRACKING NUMBER EDIT */}
      {editingTrackingOrder && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div 
            className="w-full max-w-md bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <h3 className="font-serif-luxury font-bold text-base text-gray-900">
                Update Tracking Number
              </h3>
              <button
                type="button"
                onClick={() => setEditingTrackingOrder(null)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualTracking} className="p-5 space-y-4 text-xs sm:text-sm">
              <div>
                <span className="text-xs text-gray-500 block">Order ID:</span>
                <span className="font-mono font-bold text-amber-800 text-sm">#{editingTrackingOrder.id}</span>
                <span className="text-gray-600 block text-xs mt-0.5">{editingTrackingOrder.customerName} • {editingTrackingOrder.city}</span>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Tracking Number / Consignment Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. MNP-74910284"
                  value={trackingInput}
                  onChange={(e) => setTrackingInput(e.target.value)}
                  className="w-full bg-white border border-gray-300 focus:border-amber-500 rounded-xl px-4 py-2.5 font-mono text-sm focus:outline-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingTrackingOrder(null)}
                  className="py-2 px-4 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shadow-xs"
                >
                  Save Tracking Number
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
