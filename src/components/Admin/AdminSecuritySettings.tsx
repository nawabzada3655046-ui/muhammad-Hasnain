import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  Key, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertCircle, 
  LogOut, 
  Check, 
  ShieldAlert,
  Clock,
  Sparkles,
  Info
} from 'lucide-react';
import { useStore } from '../../context/StoreContext';

interface AdminSecuritySettingsProps {
  onLogout?: () => void;
}

export const AdminSecuritySettings: React.FC<AdminSecuritySettingsProps> = ({ onLogout }) => {
  const { changeAdminPassword, logoutAdmin } = useStore();

  // Password form states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Password visibility states
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Status feedback
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Handle password submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    // 1. Validation: required fields
    if (!currentPassword) {
      setFeedback({ type: 'error', message: 'Please enter your current admin password.' });
      return;
    }

    if (!newPassword) {
      setFeedback({ type: 'error', message: 'Please enter a new password.' });
      return;
    }

    if (!confirmPassword) {
      setFeedback({ type: 'error', message: 'Please confirm your new password.' });
      return;
    }

    // 2. Validation: new passwords match
    if (newPassword !== confirmPassword) {
      setFeedback({
        type: 'error',
        message: 'New Password and Confirm New Password do not match. Please ensure both fields are identical.',
      });
      return;
    }

    // 3. Validation: minimum length
    if (newPassword.length < 4) {
      setFeedback({
        type: 'error',
        message: 'New password must be at least 4 characters long.',
      });
      return;
    }

    // 4. Change password through StoreContext
    setIsSubmitting(true);
    try {
      const result = changeAdminPassword(currentPassword, newPassword);
      if (result.success) {
        setFeedback({
          type: 'success',
          message: result.message,
        });
        // Clear input fields for security
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setFeedback({
          type: 'error',
          message: result.message,
        });
      }
    } catch {
      setFeedback({
        type: 'error',
        message: 'An unexpected error occurred while updating the password.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFeedback(null);
  };

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    } else {
      logoutAdmin();
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner / Heading */}
      <div className="bg-gradient-to-r from-amber-500/10 via-amber-400/5 to-transparent border border-amber-200/80 rounded-3xl p-5 sm:p-7">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start sm:items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-sm shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg sm:text-xl font-bold font-serif-luxury text-gray-900">
                  Admin Settings & Security
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase tracking-wide border border-emerald-300">
                  Protected
                </span>
              </div>
              <p className="text-xs text-gray-600 mt-0.5">
                Manage your administrator credentials, access passcode protection, and active sessions.
              </p>
            </div>
          </div>

          {/* Quick Logout Button near security settings as requested */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleLogout}
              className="px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-700 border border-red-200 text-xs font-bold flex items-center gap-2 transition-all shadow-2xs cursor-pointer"
              title="Terminate current admin session"
            >
              <LogOut className="w-4 h-4 text-red-600" />
              <span>Logout Admin Session</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid: Change Password Form & Security Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT 2 COLS: Change Admin Password Form */}
        <div className="lg:col-span-2 bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="space-y-1 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-2 text-amber-700">
              <Key className="w-4 h-4" />
              <h3 className="font-serif-luxury font-bold text-base sm:text-lg text-gray-900">
                Change Admin Password
              </h3>
            </div>
            <p className="text-xs text-gray-500">
              Enter your current password and your new password twice. The existing password is never shown or exposed.
            </p>
          </div>

          {/* Feedback Alerts */}
          {feedback && (
            <div
              className={`p-4 rounded-2xl flex items-start gap-3 text-xs sm:text-sm animate-in fade-in ${
                feedback.type === 'success'
                  ? 'bg-emerald-50 border border-emerald-300 text-emerald-900'
                  : 'bg-red-50 border border-red-300 text-red-900'
              }`}
            >
              {feedback.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{feedback.message}</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            
            {/* Field 1: Current Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Current Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showCurrent ? 'text' : 'password'}
                  required
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter your current password"
                  autoComplete="current-password"
                  className="w-full bg-gray-50/70 border border-gray-300 rounded-xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                  tabIndex={-1}
                  title={showCurrent ? 'Hide password' : 'Show password'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-gray-400 block">
                Required to verify administrator identity before making changes.
              </span>
            </div>

            {/* Field 2: New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <Key className="w-4 h-4" />
                </div>
                <input
                  type={showNew ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new admin password"
                  autoComplete="new-password"
                  className="w-full bg-gray-50/70 border border-gray-300 rounded-xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:border-amber-500 focus:bg-white transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                  tabIndex={-1}
                  title={showNew ? 'Hide password' : 'Show password'}
                >
                  {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <span className="text-[11px] text-gray-400 block">
                Must be at least 4 characters long.
              </span>
            </div>

            {/* Field 3: Confirm New Password */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-gray-700">
                Confirm New Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <input
                  type={showConfirm ? 'text' : 'password'}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Re-enter new password to confirm"
                  autoComplete="new-password"
                  className={`w-full bg-gray-50/70 border rounded-xl pl-10 pr-11 py-2.5 text-xs sm:text-sm text-gray-900 focus:outline-none focus:bg-white transition-colors ${
                    confirmPassword && newPassword && confirmPassword !== newPassword
                      ? 'border-red-400 focus:border-red-500'
                      : confirmPassword && newPassword && confirmPassword === newPassword
                      ? 'border-emerald-400 focus:border-emerald-500'
                      : 'border-gray-300 focus:border-amber-500'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(!showConfirm)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-700 cursor-pointer"
                  tabIndex={-1}
                  title={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Match indicator */}
              {confirmPassword.length > 0 && (
                <div className="text-[11px] flex items-center gap-1.5 mt-1">
                  {confirmPassword === newPassword ? (
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                      Passwords match perfectly
                    </span>
                  ) : (
                    <span className="text-red-600 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 text-red-500" />
                      Passwords do not match
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="pt-3 flex flex-col sm:flex-row items-center gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-sm flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] cursor-pointer disabled:opacity-60"
              >
                <Lock className="w-4 h-4" />
                <span>{isSubmitting ? 'Saving New Password...' : 'Save & Update Password'}</span>
              </button>

              <button
                type="button"
                onClick={handleClear}
                className="w-full sm:w-auto px-5 py-3 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold transition-colors cursor-pointer"
              >
                Clear Form
              </button>
            </div>
          </form>
        </div>

        {/* RIGHT COL: Session Status & Security Info */}
        <div className="space-y-6">
          
          {/* Active Session Card */}
          <div className="bg-white border border-gray-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-gray-900 font-bold text-sm">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>Current Session Status</span>
            </div>

            <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Status:</span>
                <span className="font-bold text-emerald-700 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active & Authenticated
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Access Level:</span>
                <span className="font-bold text-gray-800">Store Administrator</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-500">Storage:</span>
                <span className="font-mono text-gray-700 text-[11px]">Secure Local Storage</span>
              </div>
            </div>

            {/* Logout button near security settings */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout Admin Panel</span>
              </button>
              <span className="text-[10px] text-gray-400 text-center block mt-1.5">
                Logs out immediately and locks the administration portal.
              </span>
            </div>
          </div>

          {/* Security Best Practices */}
          <div className="bg-gradient-to-br from-gray-50 to-amber-50/30 border border-gray-200 rounded-3xl p-6 shadow-sm space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-800 font-bold">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>Security Highlights</span>
            </div>

            <ul className="space-y-2.5 text-gray-600 text-[11px] leading-relaxed">
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Existing password is never revealed, printed, or sent over unencrypted channels.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>Double password confirmation prevents accidental typos before saving.</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                <span>New password takes effect immediately for all subsequent admin logins.</span>
              </li>
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
};
