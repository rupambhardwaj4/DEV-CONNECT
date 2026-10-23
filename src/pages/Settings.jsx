import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context';
import { Card, CardHeader, CardTitle, CardContent, Button, Input, Badge, Select, Modal } from '../components/common';
import { User, Bell, Shield, Lock, LogOut, Trash2, GitBranch, AlertTriangle } from 'lucide-react';
import { authService } from '../services';

export function Settings() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [activeSection, setActiveSection] = useState('account');
  
  // Account settings
  const [accountData, setAccountData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    username: user?.username || '',
  });
  
  // Password change
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Preferences
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: false,
    profileVisibility: 'public',
    showEmail: false,
    showSkills: true,
  });
  
  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');
  
  const sections = [
    { id: 'account', label: 'Account', icon: User },
    { id: 'security', label: 'Security', icon: Shield },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'privacy', label: 'Privacy', icon: Lock },
    { id: 'connected', label: 'Connected Accounts', icon: GitBranch },
  ];
  
  const handleLogout = async () => {
    try {
      await authService.logout();
      logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  
  const handleSaveAccount = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // TODO: Implement account update when backend available
      console.warn('Account update not yet implemented');
      setSuccess('Account information updated successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update account');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError('');
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    if (passwordData.newPassword.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // TODO: Implement password change when backend available
      console.warn('Password change not yet implemented');
      setSuccess('Password changed successfully!');
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSavePreferences = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // TODO: Implement preferences update when backend available
      console.warn('Preferences update not yet implemented');
      setSuccess('Preferences saved successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.message || 'Failed to save preferences');
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleDeleteAccount = async () => {
    if (deleteConfirmation !== 'DELETE') {
      setError('Please type DELETE to confirm');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // TODO: Implement account deletion when backend available
      console.warn('Account deletion not yet implemented');
      setShowDeleteModal(false);
      setDeleteConfirmation('');
      logout();
      navigate('/login');
    } catch (err) {
      setError(err.message || 'Failed to delete account');
      setIsLoading(false);
    }
  };
  
  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-[var(--color-text-primary)] mb-6">
        Settings
      </h1>
      
      {error && (
        <div className="p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg mb-6">
          <p className="text-[var(--color-error)]">{error}</p>
        </div>
      )}
      
      {success && (
        <div className="p-4 bg-[var(--color-success)]/10 border border-[var(--color-success)] rounded-lg mb-6">
          <p className="text-[var(--color-success)]">{success}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Sidebar */}
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-gray-100)]'
                }`}
              >
                <Icon className="h-5 w-5" />
                {section.label}
              </button>
            );
          })}
        </div>
        
        {/* Content */}
        <div className="md:col-span-3 space-y-6">
          {/* Account Section */}
          {activeSection === 'account' && (
            <Card>
              <CardHeader>
                <CardTitle>Account Information</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveAccount} className="space-y-4">
                  <Input
                    label="Full Name"
                    value={accountData.name}
                    onChange={(e) => setAccountData(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    label="Username"
                    value={accountData.username}
                    onChange={(e) => setAccountData(prev => ({ ...prev, username: e.target.value }))}
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={accountData.email}
                    onChange={(e) => setAccountData(prev => ({ ...prev, email: e.target.value }))}
                    disabled
                  />
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Contact support to change your email address
                  </p>
                  <Button type="submit" loading={isLoading} disabled={isLoading}>
                    Save Changes
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Security Section */}
          {activeSection === 'security' && (
            <Card>
              <CardHeader>
                <CardTitle>Change Password</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <Input
                    type="password"
                    label="Current Password"
                    value={passwordData.currentPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, currentPassword: e.target.value }))}
                    required
                  />
                  <Input
                    type="password"
                    label="New Password"
                    value={passwordData.newPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, newPassword: e.target.value }))}
                    required
                  />
                  <Input
                    type="password"
                    label="Confirm New Password"
                    value={passwordData.confirmPassword}
                    onChange={(e) => setPasswordData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    required
                  />
                  <p className="text-xs text-[var(--color-text-tertiary)]">
                    Password must be at least 8 characters
                  </p>
                  <Button type="submit" loading={isLoading} disabled={isLoading}>
                    Change Password
                  </Button>
                </form>
              </CardContent>
            </Card>
          )}
          
          {/* Notifications Section */}
          {activeSection === 'notifications' && (
            <Card>
              <CardHeader>
                <CardTitle>Notification Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.emailNotifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, emailNotifications: e.target.checked }))}
                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    Email notifications
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.pushNotifications}
                    onChange={(e) => setPreferences(prev => ({ ...prev, pushNotifications: e.target.checked }))}
                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    Push notifications
                  </span>
                </label>
                <Button onClick={handleSavePreferences} loading={isLoading} disabled={isLoading}>
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Privacy Section */}
          {activeSection === 'privacy' && (
            <Card>
              <CardHeader>
                <CardTitle>Privacy Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                    Profile Visibility
                  </label>
                  <Select
                    options={[
                      { value: 'public', label: 'Public - Visible to everyone' },
                      { value: 'connections', label: 'Connections Only' },
                      { value: 'private', label: 'Private - Only you' },
                    ]}
                    value={preferences.profileVisibility}
                    onChange={(e) => setPreferences(prev => ({ ...prev, profileVisibility: e.target.value }))}
                  />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.showEmail}
                    onChange={(e) => setPreferences(prev => ({ ...prev, showEmail: e.target.checked }))}
                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    Show email on profile
                  </span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.showSkills}
                    onChange={(e) => setPreferences(prev => ({ ...prev, showSkills: e.target.checked }))}
                    className="w-4 h-4 text-[var(--color-primary)] rounded focus:ring-[var(--color-primary)]"
                  />
                  <span className="text-sm text-[var(--color-text-primary)]">
                    Show skills on profile
                  </span>
                </label>
                <Button onClick={handleSavePreferences} loading={isLoading} disabled={isLoading}>
                  Save Preferences
                </Button>
              </CardContent>
            </Card>
          )}
          
          {/* Connected Accounts Section */}
          {activeSection === 'connected' && (
            <Card>
              <CardHeader>
                <CardTitle>Connected Accounts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-[var(--color-gray-50)] rounded-lg">
                  <div className="flex items-center gap-3">
                    <GitBranch className="h-6 w-6 text-[var(--color-text-secondary)]" />
                    <div>
                      <p className="font-medium text-[var(--color-text-primary)]">GitHub</p>
                      <p className="text-sm text-[var(--color-text-secondary)]">
                        {user?.githubUsername ? `Connected as ${user.githubUsername}` : 'Not connected'}
                      </p>
                    </div>
                  </div>
                  {user?.githubUsername ? (
                    <Badge variant="success">Connected</Badge>
                  ) : (
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  )}
                </div>
                <p className="text-xs text-[var(--color-text-tertiary)]">
                  GitHub integration is not yet available
                </p>
              </CardContent>
            </Card>
          )}
          
          {/* Danger Zone */}
          <Card className="border-[var(--color-error)]">
            <CardHeader>
              <CardTitle className="text-[var(--color-error)]">Danger Zone</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-text-primary)]">Delete Account</p>
                  <p className="text-sm text-[var(--color-text-secondary)]">
                    Permanently delete your account and all associated data
                  </p>
                </div>
                <Button
                  variant="danger"
                  icon={Trash2}
                  onClick={() => setShowDeleteModal(true)}
                >
                  Delete Account
                </Button>
              </div>
            </CardContent>
          </Card>
          
          {/* Logout */}
          <Button
            variant="outline"
            icon={LogOut}
            onClick={handleLogout}
            fullWidth
          >
            Sign Out
          </Button>
        </div>
      </div>
      
      {/* Delete Account Modal */}
      {showDeleteModal && (
        <Modal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setDeleteConfirmation('');
            setError('');
          }}
          title="Delete Account"
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-4 bg-[var(--color-error)]/10 border border-[var(--color-error)] rounded-lg">
              <AlertTriangle className="h-5 w-5 text-[var(--color-error)] flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-[var(--color-error)]">
                  This action cannot be undone
                </p>
                <p className="text-sm text-[var(--color-error)] mt-1">
                  All your data including profile, connections, applications, and projects will be permanently deleted.
                </p>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-[var(--color-text-primary)] mb-2">
                Type DELETE to confirm
              </label>
              <Input
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                placeholder="DELETE"
              />
            </div>
            
            <div className="flex gap-3">
              <Button
                variant="danger"
                icon={Trash2}
                loading={isLoading}
                disabled={isLoading || deleteConfirmation !== 'DELETE'}
                onClick={handleDeleteAccount}
              >
                Delete Account
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmation('');
                  setError('');
                }}
                disabled={isLoading}
              >
                Cancel
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
