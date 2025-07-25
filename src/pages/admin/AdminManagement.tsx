import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { 
  Shield, 
  Plus, 
  User, 
  Mail, 
  Calendar,
  Settings,
  Eye,
  EyeOff,
  UserPlus,
  Send
} from 'lucide-react';
import toast from 'react-hot-toast';

interface AdminUser {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  role_type: string;
  permissions: string[];
  is_active: boolean;
  granted_at: string;
  granted_by?: string;
}

interface CounsellorInvitation {
  id: string;
  email: string;
  invitation_token: string;
  expires_at: string;
  used_at?: string;
  created_at: string;
}

export const AdminManagement: React.FC = () => {
  const { profile } = useAuth();
  const [adminUsers, setAdminUsers] = useState<AdminUser[]>([]);
  const [invitations, setInvitations] = useState<CounsellorInvitation[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [inviting, setInviting] = useState(false);

  const [newAdmin, setNewAdmin] = useState({
    email: '',
    password: '',
    fullName: '',
    roleType: 'content_admin'
  });

  const [inviteEmail, setInviteEmail] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    fetchAdminUsers();
    fetchInvitations();
  }, []);

  const fetchAdminUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_roles')
        .select(`
          *,
          user:profiles!admin_roles_user_id_fkey(
            email,
            full_name
          )
        `)
        .eq('is_active', true)
        .order('granted_at', { ascending: false });

      if (error) throw error;

      const formattedData = data?.map(item => ({
        id: item.id,
        user_id: item.user_id,
        email: item.user?.email || '',
        full_name: item.user?.full_name || '',
        role_type: item.role_type,
        permissions: item.permissions,
        is_active: item.is_active,
        granted_at: item.granted_at,
        granted_by: item.granted_by
      })) || [];

      setAdminUsers(formattedData);
    } catch (error) {
      console.error('Error fetching admin users:', error);
      toast.error('Failed to load admin users');
    } finally {
      setLoading(false);
    }
  };

  const fetchInvitations = async () => {
    try {
      const { data, error } = await supabase
        .from('counsellor_invitations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvitations(data || []);
    } catch (error) {
      console.error('Error fetching invitations:', error);
    }
  };

  const handleCreateAdmin = async () => {
    if (!newAdmin.email || !newAdmin.password || !newAdmin.fullName) {
      toast.error('Please fill in all required fields');
      return;
    }

    setCreating(true);
    try {
      const { data, error } = await supabase.rpc('create_admin_user', {
        admin_email: newAdmin.email,
        admin_password: newAdmin.password,
        admin_name: newAdmin.fullName,
        admin_role_type: newAdmin.roleType,
        creator_user_id: profile?.user_id
      });

      if (error) throw error;

      toast.success('Admin user created successfully!');
      setShowCreateModal(false);
      setNewAdmin({ email: '', password: '', fullName: '', roleType: 'content_admin' });
      fetchAdminUsers();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast.error(error.message || 'Failed to create admin user');
    } finally {
      setCreating(false);
    }
  };

  const handleInviteCounsellor = async () => {
    if (!inviteEmail) {
      toast.error('Please enter an email address');
      return;
    }

    setInviting(true);
    try {
      const { data, error } = await supabase.rpc('invite_counsellor', {
        counsellor_email: inviteEmail,
        admin_user_id: profile?.user_id
      });

      if (error) throw error;

      toast.success('Counsellor invitation sent successfully!');
      setShowInviteModal(false);
      setInviteEmail('');
      fetchInvitations();
    } catch (error: any) {
      console.error('Error inviting counsellor:', error);
      toast.error(error.message || 'Failed to send invitation');
    } finally {
      setInviting(false);
    }
  };

  const getRoleColor = (roleType: string) => {
    switch (roleType) {
      case 'super_admin':
        return 'bg-red-100 text-red-800';
      case 'content_admin':
        return 'bg-blue-100 text-blue-800';
      case 'counsellor_admin':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getRoleDescription = (roleType: string) => {
    switch (roleType) {
      case 'super_admin':
        return 'Full system access and control';
      case 'content_admin':
        return 'Manage articles, blogs, and resources';
      case 'counsellor_admin':
        return 'Manage counsellors and assignments';
      default:
        return 'Basic administrative access';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin management...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Management
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Manage admin users and counsellor invitations
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <Button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Create Admin User</span>
          </Button>
          <Button
            onClick={() => setShowInviteModal(true)}
            variant="outline"
            className="flex items-center space-x-2"
          >
            <UserPlus className="w-4 h-4" />
            <span>Invite Counsellor</span>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Admin Users */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Admin Users ({adminUsers.length})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adminUsers.map((admin) => (
                  <div
                    key={admin.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
                          <Shield className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {admin.full_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {admin.email}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${getRoleColor(admin.role_type)}`}>
                        {admin.role_type.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {getRoleDescription(admin.role_type)}
                    </p>
                    <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Created: {new Date(admin.granted_at).toLocaleDateString()}</span>
                      <span className="flex items-center space-x-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Active</span>
                      </span>
                    </div>
                  </div>
                ))}
                {adminUsers.length === 0 && (
                  <div className="text-center py-8">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No admin users found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Counsellor Invitations */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Counsellor Invitations ({invitations.length})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div
                    key={invitation.id}
                    className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                          <Mail className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {invitation.email}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            Sent: {new Date(invitation.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invitation.used_at 
                          ? 'bg-green-100 text-green-800' 
                          : new Date(invitation.expires_at) < new Date()
                          ? 'bg-red-100 text-red-800'
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {invitation.used_at 
                          ? 'Used' 
                          : new Date(invitation.expires_at) < new Date()
                          ? 'Expired'
                          : 'Pending'
                        }
                      </span>
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {invitation.used_at ? (
                        <span>Used on: {new Date(invitation.used_at).toLocaleDateString()}</span>
                      ) : (
                        <span>Expires: {new Date(invitation.expires_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                ))}
                {invitations.length === 0 && (
                  <div className="text-center py-8">
                    <Send className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">No invitations sent</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Create Admin Modal */}
        <Modal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          title="Create New Admin User"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Full Name"
              value={newAdmin.fullName}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, fullName: e.target.value }))}
              placeholder="John Doe"
              required
            />
            
            <Input
              label="Email Address"
              type="email"
              value={newAdmin.email}
              onChange={(e) => setNewAdmin(prev => ({ ...prev, email: e.target.value }))}
              placeholder="admin@example.com"
              required
            />

            <div className="relative">
              <Input
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={newAdmin.password}
                onChange={(e) => setNewAdmin(prev => ({ ...prev, password: e.target.value }))}
                placeholder="Secure password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Admin Role
              </label>
              <select
                value={newAdmin.roleType}
                onChange={(e) => setNewAdmin(prev => ({ ...prev, roleType: e.target.value }))}
                className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-u-recover-green dark:bg-gray-800 dark:border-gray-600"
              >
                <option value="content_admin">Content Admin</option>
                <option value="counsellor_admin">Counsellor Admin</option>
                <option value="super_admin">Super Admin</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">
                {getRoleDescription(newAdmin.roleType)}
              </p>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowCreateModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateAdmin}
                loading={creating}
                className="flex-1"
              >
                Create Admin
              </Button>
            </div>
          </div>
        </Modal>

        {/* Invite Counsellor Modal */}
        <Modal
          isOpen={showInviteModal}
          onClose={() => setShowInviteModal(false)}
          title="Invite Counsellor"
          size="md"
        >
          <div className="space-y-4">
            <Input
              label="Counsellor Email"
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="counsellor@example.com"
              required
            />

            <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
              <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                Invitation Process
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Counsellor will receive an email with registration link</li>
                <li>• Link expires in 7 days</li>
                <li>• They'll complete their profile and credentials</li>
                <li>• Account requires admin approval before activation</li>
              </ul>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowInviteModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleInviteCounsellor}
                loading={inviting}
                className="flex-1"
              >
                Send Invitation
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};