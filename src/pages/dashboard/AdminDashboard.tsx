import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  UserCheck,
  FileText,
  MessageSquare,
  TrendingUp,
  Shield,
  Settings,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, AdminRole } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

interface DashboardStats {
  totalUsers: number;
  totalCounsellors: number;
  pendingCounsellors: number;
  totalArticles: number;
  totalBlogs: number;
  totalResources: number;
  activeConversations: number;
  totalAppointments: number;
}

export const AdminDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [adminRoles, setAdminRoles] = useState<AdminRole[]>([]);
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalCounsellors: 0,
    pendingCounsellors: 0,
    totalArticles: 0,
    totalBlogs: 0,
    totalResources: 0,
    activeConversations: 0,
    totalAppointments: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      // Fetch admin roles
      const { data: rolesData } = await supabase
        .from('admin_roles')
        .select('*')
        .eq('user_id', profile.user_id)
        .eq('is_active', true);

      if (rolesData) {
        setAdminRoles(rolesData);
      }

      // Fetch user counts
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'user');

      const { count: counsellorCount } = await supabase
        .from('counsellors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');

      const { count: pendingCount } = await supabase
        .from('counsellors')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending');

      // Fetch content counts
      const { count: articleCount } = await supabase
        .from('articles')
        .select('*', { count: 'exact', head: true });

      const { count: blogCount } = await supabase
        .from('blog_posts')
        .select('*', { count: 'exact', head: true });

      const { count: resourceCount } = await supabase
        .from('resources')
        .select('*', { count: 'exact', head: true });

      const { count: conversationCount } = await supabase
        .from('conversations')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

      const { count: appointmentCount } = await supabase
        .from('appointments')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalUsers: userCount || 0,
        totalCounsellors: counsellorCount || 0,
        pendingCounsellors: pendingCount || 0,
        totalArticles: articleCount || 0,
        totalBlogs: blogCount || 0,
        totalResources: resourceCount || 0,
        activeConversations: conversationCount || 0,
        totalAppointments: appointmentCount || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: 'blue',
      change: '+12%',
    },
    {
      title: 'Active Counsellors',
      value: stats.totalCounsellors,
      icon: <UserCheck className="w-6 h-6 text-green-600" />,
      color: 'green',
      change: '+5%',
    },
    {
      title: 'Pending Approvals',
      value: stats.pendingCounsellors,
      icon: <AlertTriangle className="w-6 h-6 text-yellow-600" />,
      color: 'yellow',
      urgent: stats.pendingCounsellors > 0,
    },
    {
      title: 'Published Articles',
      value: stats.totalArticles,
      icon: <FileText className="w-6 h-6 text-purple-600" />,
      color: 'purple',
      change: '+8%',
    },
    {
      title: 'Blog Posts',
      value: stats.totalBlogs,
      icon: <MessageSquare className="w-6 h-6 text-indigo-600" />,
      color: 'indigo',
      change: '+15%',
    },
    {
      title: 'Resources',
      value: stats.totalResources,
      icon: <BarChart3 className="w-6 h-6 text-orange-600" />,
      color: 'orange',
      change: '+3%',
    },
    {
      title: 'Active Conversations',
      value: stats.activeConversations,
      icon: <MessageSquare className="w-6 h-6 text-teal-600" />,
      color: 'teal',
    },
    {
      title: 'Total Appointments',
      value: stats.totalAppointments,
      icon: <Clock className="w-6 h-6 text-pink-600" />,
      color: 'pink',
    },
  ];

  const isSuperAdmin = adminRoles.some(role => role.role_type === 'super_admin');
  const isContentAdmin = adminRoles.some(role => role.role_type === 'content_admin');
  const isCounsellorAdmin = adminRoles.some(role => role.role_type === 'counsellor_admin');

  const quickActions = [
    {
      title: 'Patient Management',
      description: 'Manage all patients on the platform',
      icon: <Users className="w-8 h-8 text-blue-600" />,
      link: '/admin/patients',
      color: 'blue',
      show: true,
    },
    {
      title: 'Counsellor Management',
      description: 'Approve, manage and assign counsellors',
      icon: <UserCheck className="w-8 h-8 text-green-600" />,
      link: '/admin/counsellors',
      color: 'green',
      badge: stats.pendingCounsellors > 0 ? stats.pendingCounsellors : null,
      show: true,
    },
    {
      title: 'Security & Roles',
      description: 'Manage admin roles, permissions and security',
      icon: <Shield className="w-8 h-8 text-red-600" />,
      link: '/admin/security',
      color: 'red',
      show: isSuperAdmin,
    },
    {
      title: 'Mental Health Tracker - All Patients',
      description: 'Monitor mental health data for all patients',
      icon: <Activity className="w-8 h-8 text-purple-600" />,
      link: '/admin/mental-health-tracker',
      color: 'purple',
      show: true,
    },
    {
      title: 'Messages & Communications',
      description: 'Monitor platform communications',
      icon: <MessageSquare className="w-8 h-8 text-teal-600" />,
      link: '/admin/messages',
      color: 'teal',
      show: true,
    },
    {
      title: 'Content Management',
      description: 'Manage articles, blogs, resources and testimonials',
      icon: <FileText className="w-8 h-8 text-orange-600" />,
      link: '/admin/content',
      color: 'orange',
      show: true,
    },
    {
      title: 'Analytics & Reports',
      description: 'View platform analytics and detailed reports',
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      link: '/admin/analytics',
      color: 'indigo',
      show: isSuperAdmin,
    },
    {
      title: 'System Settings',
      description: 'Configure platform settings and preferences',
      icon: <Settings className="w-8 h-8 text-gray-600" />,
      link: '/admin/settings',
      color: 'gray',
      show: isSuperAdmin,
    },
  ].filter(action => action.show);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Admin Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Welcome back, {profile?.full_name}. Here's your platform overview.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {adminRoles.map((role) => (
              <span
                key={role.id}
                className="px-3 py-1 bg-u-recover-green text-white text-sm rounded-full"
              >
                {role.role_type.replace('_', ' ').toUpperCase()}
              </span>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index} className={stat.urgent ? 'border-yellow-500' : ''}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
                    {stat.change && (
                      <p className="text-sm text-green-600 mt-1">
                        {stat.change} from last month
                      </p>
                    )}
                    {stat.urgent && (
                      <p className="text-sm text-yellow-600 mt-1">
                        Requires attention
                      </p>
                    )}
                  </div>
                  <div className={`p-3 bg-${stat.color}-100 dark:bg-${stat.color}-900 rounded-full`}>
                    {stat.icon}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <Link key={index} to={action.link}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      {action.icon}
                      {action.badge && (
                        <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                          {action.badge}
                        </span>
                      )}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                      {action.title}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">
                      {action.description}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity & System Health */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Recent Activity
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      New counsellor approved
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Dr. Sarah Johnson - 2 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      New article published
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      "Managing Anxiety in Daily Life" - 4 hours ago
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Users className="w-5 h-5 text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      New user registered
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      15 new users today
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <Activity className="w-5 h-5 text-orange-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      System maintenance completed
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Database optimization - 6 hours ago
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                System Health
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Database</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Healthy</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">API Response</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">Fast (120ms)</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Storage</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-yellow-600">75% Used</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Active Sessions</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-green-600">{stats.activeConversations} Active</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Pending Approvals</span>
                  <div className="flex items-center space-x-2">
                    <div className={`w-2 h-2 rounded-full ${
                      stats.pendingCounsellors > 0 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}></div>
                    <span className={`text-sm ${
                      stats.pendingCounsellors > 0 ? 'text-yellow-600' : 'text-green-600'
                    }`}>
                      {stats.pendingCounsellors} Pending
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};