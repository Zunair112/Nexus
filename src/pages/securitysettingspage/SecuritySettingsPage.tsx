import React, { useState } from 'react';
import { 
  Shield, Eye, EyeOff, Smartphone, Key, AlertTriangle, 
  CheckCircle, XCircle, Clock, MapPin, Monitor, 
  Download, Trash2, Bell, Lock, Unlock, RefreshCw,
  Zap, Check, X
} from 'lucide-react';

// Password strength checker
const checkPasswordStrength = (password: string) => {
  let score = 0;
  let feedback: string[] = [];
  
  if (password.length >= 8) {
    score += 25;
  } else {
    feedback.push("At least 8 characters");
  }
  
  if (/[a-z]/.test(password)) {
    score += 25;
  } else {
    feedback.push("Lowercase letter");
  }
  
  if (/[A-Z]/.test(password)) {
    score += 25;
  } else {
    feedback.push("Uppercase letter");
  }
  
  if (/[0-9]/.test(password)) {
    score += 12.5;
  } else {
    feedback.push("Number");
  }
  
  if (/[^A-Za-z0-9]/.test(password)) {
    score += 12.5;
  } else {
    feedback.push("Special character");
  }
  
  let strength = 'weak';
  let colorClass = 'error';
  
  if (score >= 75) {
    strength = 'strong';
    colorClass = 'success';
  } else if (score >= 50) {
    strength = 'medium';
    colorClass = 'warning';
  }
  
  return { score, strength, colorClass, feedback };
};

// Mock data for demonstration
const mockUser = {
  id: '1',
  name: 'John Entrepreneur',
  email: 'john@example.com',
  role: 'entrepreneur',
  twoFactorEnabled: true,
  lastLogin: '2024-01-15T10:30:00Z',
  loginSessions: [
    { id: '1', device: 'MacBook Pro', location: 'New York, US', lastActive: '2024-01-15T10:30:00Z', current: true },
    { id: '2', device: 'iPhone 14', location: 'New York, US', lastActive: '2024-01-14T18:22:00Z', current: false },
    { id: '3', device: 'Chrome Browser', location: 'California, US', lastActive: '2024-01-12T09:15:00Z', current: false }
  ],
  securityLog: [
    { id: '1', action: 'Login', timestamp: '2024-01-15T10:30:00Z', location: 'New York, US', status: 'success' },
    { id: '2', action: 'Password Change', timestamp: '2024-01-14T16:45:00Z', location: 'New York, US', status: 'success' },
    { id: '3', action: 'Failed Login', timestamp: '2024-01-13T14:20:00Z', location: 'Unknown', status: 'failed' }
  ]
};

const SecuritySettingsPage: React.FC = () => {
  const [user] = useState(mockUser);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: user.twoFactorEnabled,
    emailNotifications: true,
    smsNotifications: false,
    loginAlerts: true,
    sessionTimeout: '30',
    ipWhitelist: false
  });

  const handlePasswordChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSecuritySettingChange = (setting: string, value: string | boolean) => {
    setSecuritySettings(prev => ({ ...prev, [setting]: value }));
  };

  const handlePasswordSubmit = () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Passwords do not match');
      return;
    }
    const strength = checkPasswordStrength(passwordForm.newPassword);
    if (strength.score < 50) {
      alert('Password is too weak. Please choose a stronger password.');
      return;
    }
    alert('Password updated successfully!');
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
  };

  const handleToggle2FA = () => {
    if (!securitySettings.twoFactorEnabled) {
      // Show OTP modal for enabling 2FA
      setShowOtpModal(true);
    } else {
      // Disable 2FA directly
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: false }));
      alert('2FA Disabled');
    }
  };

  const handleOtpSubmit = () => {
    if (otpCode.length === 6) {
      setSecuritySettings(prev => ({ ...prev, twoFactorEnabled: true }));
      setShowOtpModal(false);
      setOtpCode('');
      alert('2FA Enabled Successfully!');
    } else {
      alert('Please enter a valid 6-digit code');
    }
  };

  const handleTerminateSession = (sessionId: string) => {
    alert(`Session ${sessionId} terminated successfully`);
  };

  const handleDownloadSecurityLog = () => {
    alert('Security log download started...');
  };

  const passwordStrength = checkPasswordStrength(passwordForm.newPassword);

  const tabs = [
    { id: 'overview', label: 'Security Overview', icon: <Shield size={18} /> },
    { id: 'password', label: 'Password & 2FA', icon: <Key size={18} /> },
    { id: 'sessions', label: 'Active Sessions', icon: <Monitor size={18} /> },
    { id: 'logs', label: 'Security Logs', icon: <Clock size={18} /> }
  ];

  // OTP Modal Component
  const OtpModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-900">Verify Your Phone</h3>
          <button 
            onClick={() => setShowOtpModal(false)}
            className="text-secondary-400 hover:text-secondary-600"
          >
            <X size={20} />
          </button>
        </div>
        
        <p className="text-sm text-secondary-600 mb-4">
          We've sent a 6-digit code to your phone number ending in ••••1234. Enter it below to enable 2FA.
        </p>
        
        <div className="mb-4">
          <label className="block text-sm font-medium text-primary-700 mb-2">
            Verification Code
          </label>
          <input
            type="text"
            value={otpCode}
            onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full px-3 py-2 border border-secondary-300 rounded-md text-center text-lg tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="000000"
            maxLength={6}
          />
        </div>
        
        <div className="flex space-x-3">
          <button
            onClick={() => setShowOtpModal(false)}
            className="flex-1 px-4 py-2 text-primary-700 border border-secondary-300 rounded-md hover:bg-secondary-50"
          >
            Cancel
          </button>
          <button
            onClick={handleOtpSubmit}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700"
          >
            Verify
          </button>
        </div>
        
        <button className="w-full mt-3 text-sm text-primary-600 hover:text-primary-500">
          Didn't receive code? Resend
        </button>
      </div>
    </div>
  );

  // Password Strength Indicator
  const PasswordStrengthMeter: React.FC<{ password: string }> = ({ password }) => {
    const strength = checkPasswordStrength(password);
    
    if (!password) return null;
    
    return (
      <div className="mt-2">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-primary-700">Password Strength</span>
          <span className={`text-xs font-medium ${
            strength.colorClass === 'success' ? 'text-success-700' :
            strength.colorClass === 'warning' ? 'text-warning-700' :
            'text-error-700'
          }`}>
            {strength.strength.toUpperCase()}
          </span>
        </div>
        <div className="w-full bg-secondary-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              strength.colorClass === 'success' ? 'bg-success-500' :
              strength.colorClass === 'warning' ? 'bg-warning-500' :
              'bg-error-500'
            }`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
        {strength.feedback.length > 0 && (
          <div className="mt-2 text-xs text-secondary-600">
            <p>Missing:</p>
            <ul className="list-disc list-inside">
              {strength.feedback.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Security Overview Tab
  const SecurityOverview = () => (
    <div className="space-y-6">
      {/* Security Score */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-900">Security Score</h3>
          <div className="flex items-center space-x-2">
            <div className="w-12 h-12 rounded-full bg-success-50 flex items-center justify-center">
              <span className="text-xl font-bold text-success-700">85</span>
            </div>
            <span className="text-sm text-secondary-600">Good</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success-700" />
            <div>
              <p className="text-sm font-medium text-success-700">Two-Factor Authentication</p>
              <p className="text-xs text-success-500">Enabled</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-success-50 rounded-lg">
            <CheckCircle className="h-5 w-5 text-success-700" />
            <div>
              <p className="text-sm font-medium text-success-700">Strong Password</p>
              <p className="text-xs text-success-500">Active</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-warning-50 rounded-lg">
            <AlertTriangle className="h-5 w-5 text-warning-700" />
            <div>
              <p className="text-sm font-medium text-warning-700">Session Management</p>
              <p className="text-xs text-warning-500">Review recommended</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 bg-error-50 rounded-lg">
            <XCircle className="h-5 w-5 text-error-700" />
            <div>
              <p className="text-sm font-medium text-error-700">IP Whitelist</p>
              <p className="text-xs text-error-500">Not configured</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Security Activity */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Recent Security Activity</h3>
        <div className="space-y-3">
          {user.securityLog.slice(0, 3).map((log) => (
            <div key={log.id} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                {log.status === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-success-500" />
                ) : (
                  <XCircle className="h-4 w-4 text-error-500" />
                )}
                <div>
                  <p className="text-sm font-medium text-primary-900">{log.action}</p>
                  <p className="text-xs text-secondary-500">{log.location}</p>
                </div>
              </div>
              <span className="text-xs text-secondary-500">
                {new Date(log.timestamp).toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <button className="mt-4 text-sm text-primary-600 hover:text-primary-500 font-medium">
          View all activity
        </button>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button 
            onClick={() => setActiveTab('password')}
            className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left"
          >
            <div className="flex items-center space-x-3">
              <Key className="h-5 w-5 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-primary-900">Change Password</p>
                <p className="text-xs text-secondary-500">Update your account password</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('password')}
            className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left"
          >
            <div className="flex items-center space-x-3">
              <Smartphone className="h-5 w-5 text-success-700" />
              <div>
                <p className="text-sm font-medium text-primary-900">Setup 2FA</p>
                <p className="text-xs text-secondary-500">Configure two-factor authentication</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={() => setActiveTab('sessions')}
            className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left"
          >
            <div className="flex items-center space-x-3">
              <Monitor className="h-5 w-5 text-accent-600" />
              <div>
                <p className="text-sm font-medium text-primary-900">Manage Sessions</p>
                <p className="text-xs text-secondary-500">Review active login sessions</p>
              </div>
            </div>
          </button>
          
          <button 
            onClick={handleDownloadSecurityLog}
            className="p-4 border border-secondary-200 rounded-lg hover:bg-secondary-50 text-left"
          >
            <div className="flex items-center space-x-3">
              <Download className="h-5 w-5 text-secondary-600" />
              <div>
                <p className="text-sm font-medium text-primary-900">Export Data</p>
                <p className="text-xs text-secondary-500">Download security logs</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </div>
  );

  // Password & 2FA Tab
  const PasswordAndTwoFA = () => (
    <div className="space-y-6">
      {/* Change Password */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Change Password</h3>
        <div className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Current Password
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4 text-secondary-400" /> : <Eye className="h-4 w-4 text-secondary-400" />}
              </button>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              New Password
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter new password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showNewPassword ? <EyeOff className="h-4 w-4 text-secondary-400" /> : <Eye className="h-4 w-4 text-secondary-400" />}
              </button>
            </div>
            <PasswordStrengthMeter password={passwordForm.newPassword} />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-primary-700 mb-1">
              Confirm New Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={passwordForm.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e.target.value)}
                className="w-full px-3 py-2 pr-10 border border-secondary-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Confirm new password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4 text-secondary-400" /> : <Eye className="h-4 w-4 text-secondary-400" />}
              </button>
            </div>
            {passwordForm.confirmPassword && passwordForm.newPassword !== passwordForm.confirmPassword && (
              <p className="mt-1 text-xs text-error-500">Passwords do not match</p>
            )}
          </div>
          
          <button
            onClick={handlePasswordSubmit}
            className="w-full bg-primary-600 text-white py-2 px-4 rounded-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            Update Password
          </button>
        </div>
      </div>

      {/* Two-Factor Authentication */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-900">Two-Factor Authentication</h3>
          <div className="flex items-center space-x-2">
            {securitySettings.twoFactorEnabled ? (
              <span className="px-2 py-1 bg-success-50 text-success-700 text-xs font-medium rounded-full">
                Enabled
              </span>
            ) : (
              <span className="px-2 py-1 bg-error-50 text-error-700 text-xs font-medium rounded-full">
                Disabled
              </span>
            )}
          </div>
        </div>
        
        <p className="text-sm text-secondary-600 mb-4">
          Add an extra layer of security to your account by requiring a second form of authentication.
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 border border-secondary-200 rounded-lg">
            <div className="flex items-center space-x-3">
              <Smartphone className="h-6 w-6 text-primary-600" />
              <div>
                <p className="text-sm font-medium text-primary-900">SMS Authentication</p>
                <p className="text-xs text-secondary-500">Receive codes via text message</p>
              </div>
            </div>
            <button
              onClick={handleToggle2FA}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securitySettings.twoFactorEnabled ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securitySettings.twoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          {securitySettings.twoFactorEnabled && (
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <CheckCircle className="h-5 w-5 text-primary-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-primary-800">2FA is Active</p>
                  <p className="text-xs text-primary-600 mt-1">
                    Your account is protected with two-factor authentication via SMS to +1 ••••• 1234
                  </p>
                  <button className="mt-2 text-xs text-primary-600 hover:text-primary-500 underline">
                    Update phone number
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Backup Codes */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Backup Recovery Codes</h3>
        <p className="text-sm text-secondary-600 mb-4">
          Generate backup codes to access your account if you lose your phone.
        </p>
        <button className="bg-secondary-100 text-primary-700 py-2 px-4 rounded-md hover:bg-secondary-200">
          Generate Backup Codes
        </button>
      </div>
    </div>
  );

  // Active Sessions Tab
  const ActiveSessions = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-900">Active Sessions</h3>
          <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
            Terminate All Other Sessions
          </button>
        </div>
        
        <div className="space-y-4">
          {user.loginSessions.map((session) => (
            <div key={session.id} className="border border-secondary-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${session.current ? 'bg-success-500' : 'bg-secondary-400'}`} />
                  <div>
                    <div className="flex items-center space-x-2">
                      <Monitor className="h-4 w-4 text-secondary-500" />
                      <p className="text-sm font-medium text-primary-900">{session.device}</p>
                      {session.current && (
                        <span className="px-2 py-1 bg-success-50 text-success-700 text-xs font-medium rounded-full">
                          Current
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-secondary-500">
                      <div className="flex items-center space-x-1">
                        <MapPin className="h-3 w-3" />
                        <span>{session.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-3 w-3" />
                        <span>Last active: {new Date(session.lastActive).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {!session.current && (
                  <button
                    onClick={() => handleTerminateSession(session.id)}
                    className="text-error-500 hover:text-error-700 text-sm font-medium"
                  >
                    Terminate
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Session Settings */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Session Settings</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">Session Timeout</p>
              <p className="text-xs text-secondary-500">Automatically log out after inactivity</p>
            </div>
            <select
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleSecuritySettingChange('sessionTimeout', e.target.value)}
              className="border border-secondary-300 rounded-md px-3 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
              <option value="never">Never</option>
            </select>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">IP Whitelist</p>
              <p className="text-xs text-secondary-500">Only allow access from trusted IP addresses</p>
            </div>
            <button
              onClick={() => handleSecuritySettingChange('ipWhitelist', !securitySettings.ipWhitelist)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securitySettings.ipWhitelist ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securitySettings.ipWhitelist ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Security Logs Tab
  const SecurityLogs = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-primary-900">Security Activity Log</h3>
          <button 
            onClick={handleDownloadSecurityLog}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-md hover:bg-primary-700 text-sm"
          >
            <Download className="h-4 w-4" />
            <span>Export Log</span>
          </button>
        </div>
        
        <div className="space-y-3">
          {user.securityLog.map((log) => (
            <div key={log.id} className="border-l-4 border-l-secondary-200 pl-4 py-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {log.status === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-success-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-error-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-primary-900">{log.action}</p>
                    <div className="flex items-center space-x-4 text-xs text-secondary-500">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                      <span>•</span>
                      <span>{log.location}</span>
                      <span>•</span>
                      <span className={log.status === 'success' ? 'text-success-700' : 'text-error-700'}>
                        {log.status === 'success' ? 'Success' : 'Failed'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-6 text-center">
          <button className="text-sm text-primary-600 hover:text-primary-500 font-medium">
            Load More Activity
          </button>
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white rounded-lg border border-secondary-200 p-6">
        <h3 className="text-lg font-semibold text-primary-900 mb-4">Security Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">Email Notifications</p>
              <p className="text-xs text-secondary-500">Get notified about security events via email</p>
            </div>
            <button
              onClick={() => handleSecuritySettingChange('emailNotifications', !securitySettings.emailNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securitySettings.emailNotifications ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securitySettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">SMS Notifications</p>
              <p className="text-xs text-secondary-500">Get notified about suspicious activities via SMS</p>
            </div>
            <button
              onClick={() => handleSecuritySettingChange('smsNotifications', !securitySettings.smsNotifications)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securitySettings.smsNotifications ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securitySettings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary-900">Login Alerts</p>
              <p className="text-xs text-secondary-500">Alert me when my account is accessed</p>
            </div>
            <button
              onClick={() => handleSecuritySettingChange('loginAlerts', !securitySettings.loginAlerts)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                securitySettings.loginAlerts ? 'bg-primary-600' : 'bg-secondary-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  securitySettings.loginAlerts ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* OTP Modal */}
      {showOtpModal && <OtpModal />}
      
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary-900 mb-2">Security & Access Control</h1>
        <p className="text-secondary-600">Manage your account security settings and monitor access activity</p>
      </div>

      {/* Security Status Banner */}
      <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg p-6 text-white mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">Account Security Status</h2>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Security Score: 85/100</span>
              </div>
              <div className="flex items-center space-x-2">
                <Lock className="h-5 w-5" />
                <span className="text-sm">2FA Enabled</span>
              </div>
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5" />
                <span className="text-sm">Last Login: {new Date(user.lastLogin).toLocaleString()}</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">✓</div>
            <p className="text-sm opacity-90">Protected</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200">
        <div className="border-b border-secondary-200">
          <nav className="-mb-px flex space-x-8 px-6">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-primary-700 hover:border-secondary-300'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'overview' && <SecurityOverview />}
          {activeTab === 'password' && <PasswordAndTwoFA />}
          {activeTab === 'sessions' && <ActiveSessions />}
          {activeTab === 'logs' && <SecurityLogs />}
        </div>
      </div>
    </div>
  );
};

export default SecuritySettingsPage;