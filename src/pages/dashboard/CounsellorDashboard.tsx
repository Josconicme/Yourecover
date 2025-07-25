import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  MessageSquare,
  Calendar,
  FileText,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, CounsellorAssignment, Appointment, Message, Counsellor } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const CounsellorDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [counsellorData, setCounsellorData] = useState<Counsellor | null>(null);
  const [assignments, setAssignments] = useState<CounsellorAssignment[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      // Get counsellor record
      const { data: counsellorRecord } = await supabase
        .from('counsellors')
        .select('*')
        .eq('user_id', profile.user_id)
        .single();

      if (!counsellorRecord) {
        console.error('Counsellor record not found');
        return;
      }

      setCounsellorData(counsellorRecord);

      // Fetch active assignments with patient details
      const { data: assignmentsData } = await supabase
        .from('counsellor_assignments')
        .select(`
          *,
          patient:profiles!counsellor_assignments_patient_id_fkey(*)
        `)
        .eq('counsellor_id', counsellorRecord.id)
        .eq('status', 'active');

      if (assignmentsData) {
        setAssignments(assignmentsData);
      }

      // Fetch unread messages count
      const { data: conversationsData } = await supabase
        .from('conversations')
        .select('id')
        .eq('counsellor_id', counsellorRecord.id);

      if (conversationsData) {
        const conversationIds = conversationsData.map(c => c.id);
        
        const { count: messageCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .in('conversation_id', conversationIds)
          .neq('sender_id', profile.user_id)
          .eq('is_read', false);

        setUnreadMessages(messageCount || 0);
      }

      // Fetch today's appointments
      const today = new Date();
      const startOfDay = new Date(today.setHours(0, 0, 0, 0)).toISOString();
      const endOfDay = new Date(today.setHours(23, 59, 59, 999)).toISOString();

      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          patient:profiles!appointments_patient_id_fkey(*)
        `)
        .eq('counsellor_id', counsellorRecord.id)
        .gte('appointment_date', startOfDay)
        .lte('appointment_date', endOfDay)
        .in('status', ['scheduled', 'confirmed'])
        .order('appointment_date', { ascending: true });

      if (appointmentsData) {
        setTodaysAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardStats = [
    {
      title: 'Active Patients',
      value: assignments.length,
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: 'blue',
    },
    {
      title: 'Unread Messages',
      value: unreadMessages,
      icon: <MessageSquare className="w-6 h-6 text-green-600" />,
      color: 'green',
    },
    {
      title: "Today's Sessions",
      value: todaysAppointments.length,
      icon: <Calendar className="w-6 h-6 text-purple-600" />,
      color: 'purple',
    },
    {
      title: 'Rating',
      value: `${counsellorData?.rating || 0}/5`,
      icon: <TrendingUp className="w-6 h-6 text-orange-600" />,
      color: 'orange',
    },
  ];

  const quickActions = [
    {
      title: 'Messages',
      description: 'Chat with your patients',
      icon: <MessageSquare className="w-8 h-8 text-green-600" />,
      link: '/counsellor/messages',
      badge: unreadMessages > 0 ? unreadMessages : null,
    },
    {
      title: 'My Patients',
      description: 'View and manage your assigned patients',
      icon: <Users className="w-8 h-8 text-blue-600" />,
      link: '/counsellor/patients',
      badge: null,
    },
    {
      title: 'Patient Mental Health Records',
      description: 'View patient wellness data and progress',
      icon: <BarChart3 className="w-8 h-8 text-purple-600" />,
      link: '/counsellor/patient-records',
      badge: null,
    },
    {
      title: 'Session Notes',
      description: 'Manage session notes and treatment plans',
      icon: <FileText className="w-8 h-8 text-indigo-600" />,
      link: '/counsellor/notes',
      badge: null,
    },
    {
      title: 'Blogs',
      description: 'Read mental health blogs and insights',
      icon: <Heart className="w-8 h-8 text-red-600" />,
      link: '/blogs',
      badge: null,
    },
    {
      title: 'Articles',
      description: 'Educational mental health articles',
      icon: <FileText className="w-8 h-8 text-orange-600" />,
      link: '/articles',
      badge: null,
    },
    {
      title: 'Resources',
      description: 'Access helpful mental health resources',
      icon: <BookOpen className="w-8 h-8 text-purple-600" />,
      link: '/resources',
      badge: null,
    },
    {
      title: 'Schedule',
      description: 'Manage appointments and availability',
      icon: <Calendar className="w-8 h-8 text-orange-600" />,
      link: '/counsellor/schedule',
      badge: null,
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!counsellorData) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Counsellor Profile Not Found
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Your counsellor profile is still being set up or approved by an administrator.
            </p>
            <Button variant="outline">
              Contact Support
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Welcome, Dr. {profile?.full_name}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's your counselling dashboard. You have {assignments.length} active patients.
          </p>
          {counsellorData.status !== 'approved' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="w-5 h-5 text-yellow-600 mr-2" />
                <p className="text-yellow-800 dark:text-yellow-200">
                  Your account is currently {counsellorData.status}. Please wait for admin approval.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardStats.map((stat, index) => (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      {stat.title}
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stat.value}
                    </p>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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

        {/* Recent Patients & Today's Schedule */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Active Patients
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {assignments.slice(0, 5).map((assignment) => (
                  <div
                    key={assignment.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-u-recover-green rounded-full flex items-center justify-center">
                        <User className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {assignment.patient?.full_name || 'Patient'}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Assigned {new Date(assignment.assigned_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        Active
                      </span>
                      <Link
                        to={`/counsellor/patient/${assignment.patient_id}`}
                        className="text-u-recover-green hover:text-green-700"
                      >
                        <MessageSquare className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                ))}
                {assignments.length === 0 && (
                  <div className="text-center py-8">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No active patients assigned yet.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Today's Schedule
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {todaysAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center space-x-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <Clock className="w-5 h-5 text-gray-600" />
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-gray-100">
                        {new Date(appointment.appointment_date).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })} - {appointment.patient?.full_name}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {appointment.session_type} session ({appointment.duration_minutes} min)
                      </p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      appointment.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {appointment.status}
                    </span>
                  </div>
                ))}
                {todaysAppointments.length === 0 && (
                  <div className="text-center py-8">
                    <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      No appointments scheduled for today.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};