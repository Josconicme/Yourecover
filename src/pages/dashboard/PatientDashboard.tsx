import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MessageSquare,
  BookOpen,
  FileText,
  Heart,
  TrendingUp,
  Calendar,
  Bell,
  Users,
  Gamepad2,
  Activity,
  Plus,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase, WellnessEntry, Notification, Appointment } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';

export const PatientDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [recentWellness, setRecentWellness] = useState<WellnessEntry[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState(0);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    if (!profile) return;

    try {
      // Fetch recent wellness entries
      const { data: wellnessData } = await supabase
        .from('wellness_entries')
        .select('*')
        .eq('user_id', profile.user_id)
        .order('entry_date', { ascending: false })
        .limit(7);

      if (wellnessData) {
        setRecentWellness(wellnessData);
      }

      // Fetch unread notifications count
      const { count: notificationCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', profile.user_id)
        .eq('is_read', false);

      setUnreadNotifications(notificationCount || 0);

      // Fetch upcoming appointments
      const { data: appointmentsData } = await supabase
        .from('appointments')
        .select(`
          *,
          counsellor:counsellors(
            *,
            profile:profiles(*)
          )
        `)
        .eq('patient_id', profile.user_id)
        .in('status', ['scheduled', 'confirmed'])
        .gte('appointment_date', new Date().toISOString())
        .order('appointment_date', { ascending: true })
        .limit(3);

      if (appointmentsData) {
        setUpcomingAppointments(appointmentsData);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const dashboardItems = [
    {
      title: 'Talk with Counsellor',
      description: 'Connect with your assigned counsellor',
      icon: <MessageSquare className="w-8 h-8 text-u-recover-green" />,
      link: '/talk-to-counsellor',
      badge: null,
    },
    {
      title: 'Messages',
      description: 'Chat with your counsellor in real-time',
      icon: <MessageSquare className="w-8 h-8 text-blue-600" />,
      link: '/messages',
      badge: null,
    },
    {
      title: 'Mental Health Tracker',
      description: 'Track your mood and progress',
      icon: <Activity className="w-8 h-8 text-blue-600" />,
      link: '/tracker',
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
      title: 'Journal',
      description: 'Private journaling and reflection',
      icon: <FileText className="w-8 h-8 text-green-600" />,
      link: '/journal',
      badge: null,
    },
    {
      title: 'Appointments',
      description: 'View and manage your appointments',
      icon: <Calendar className="w-8 h-8 text-indigo-600" />,
      link: '/appointments',
      badge: null,
    },
    {
      title: 'Goals & Habits',
      description: 'Set goals and track habits',
      icon: <TrendingUp className="w-8 h-8 text-indigo-600" />,
      link: '/goals',
      badge: null,
    },
    {
      title: 'Notifications',
      description: 'View your notifications',
      icon: <Bell className="w-8 h-8 text-yellow-600" />,
      link: '/notifications',
      badge: unreadNotifications > 0 ? unreadNotifications : null,
    },
  ];

  const getAverageMood = () => {
    if (recentWellness.length === 0) return 0;
    const validEntries = recentWellness.filter(entry => entry.mood_score);
    if (validEntries.length === 0) return 0;
    const sum = validEntries.reduce((acc, entry) => acc + (entry.mood_score || 0), 0);
    return Math.round(sum / validEntries.length);
  };

  const getMoodTrend = () => {
    if (recentWellness.length < 2) return 'stable';
    const recent = recentWellness[0]?.mood_score || 0;
    const previous = recentWellness[1]?.mood_score || 0;
    if (recent > previous) return 'improving';
    if (recent < previous) return 'declining';
    return 'stable';
  };

  const getWellnessStreak = () => {
    let streak = 0;
    const today = new Date();
    
    for (let i = 0; i < recentWellness.length; i++) {
      const entryDate = new Date(recentWellness[i].entry_date);
      const expectedDate = new Date(today);
      expectedDate.setDate(today.getDate() - i);
      
      if (entryDate.toDateString() === expectedDate.toDateString()) {
        streak++;
      } else {
        break;
      }
    }
    
    return streak;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading your dashboard...</p>
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
            Welcome back, {profile?.full_name}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Here's your mental wellness dashboard. How are you feeling today?
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Average Mood (7 days)
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {getAverageMood()}/10
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <div className="mt-4">
                <span className={`text-sm ${
                  getMoodTrend() === 'improving' ? 'text-green-600' :
                  getMoodTrend() === 'declining' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {getMoodTrend() === 'improving' ? '↗ Improving' :
                   getMoodTrend() === 'declining' ? '↘ Needs attention' : '→ Stable'}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Wellness Streak
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {getWellnessStreak()} days
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                  <Activity className="w-6 h-6 text-green-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/tracker"
                  className="text-sm text-u-recover-green hover:text-green-700"
                >
                  Log today's mood →
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Upcoming Sessions
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {upcomingAppointments.length}
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <div className="mt-4">
                {upcomingAppointments.length > 0 ? (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Next: {new Date(upcomingAppointments[0].appointment_date).toLocaleDateString()}
                  </span>
                ) : (
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    No upcoming sessions
                  </span>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Notifications
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {unreadNotifications}
                  </p>
                </div>
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                  <Bell className="w-6 h-6 text-yellow-600" />
                </div>
              </div>
              <div className="mt-4">
                <Link
                  to="/notifications"
                  className="text-sm text-u-recover-green hover:text-green-700"
                >
                  View all →
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {dashboardItems.map((item, index) => (
            <Link key={index} to={item.link}>
              <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    {item.icon}
                    {item.badge && (
                      <span className="bg-red-500 text-white text-xs rounded-full px-2 py-1">
                        {item.badge}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm">
                    {item.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Recent Activity & Quick Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                  Recent Wellness Entries
                </h2>
                <Link to="/tracker">
                  <Button size="sm" variant="outline">
                    <Plus className="w-4 h-4 mr-2" />
                    Add Entry
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentWellness.slice(0, 5).map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                        <BarChart3 className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-gray-100">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Mood: {entry.mood_score || 'N/A'}/10
                          {entry.anxiety_level && ` • Anxiety: ${entry.anxiety_level}/10`}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {entry.mood_score && (
                        <div className={`w-3 h-3 rounded-full ${
                          entry.mood_score >= 7 ? 'bg-green-500' :
                          entry.mood_score >= 4 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                      )}
                    </div>
                  </div>
                ))}
                {recentWellness.length === 0 && (
                  <div className="text-center py-8">
                    <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400 mb-4">
                      No wellness entries yet
                    </p>
                    <Link to="/tracker">
                      <Button size="sm">
                        Start Tracking
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Quick Actions
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Link to="/tracker">
                  <Button variant="outline" className="w-full justify-start">
                    <Activity className="w-4 h-4 mr-2" />
                    Log Today's Mood
                  </Button>
                </Link>
                <Link to="/talk-to-counsellor">
                  <Button variant="outline" className="w-full justify-start">
                    <MessageSquare className="w-4 h-4 mr-2" />
                    Message Counsellor
                  </Button>
                </Link>
                <Link to="/games">
                  <Button variant="outline" className="w-full justify-start">
                    <Gamepad2 className="w-4 h-4 mr-2" />
                    Play Wellness Game
                  </Button>
                </Link>
                <Link to="/resources">
                  <Button variant="outline" className="w-full justify-start">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Browse Resources
                  </Button>
                </Link>
                <Link to="/articles">
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="w-4 h-4 mr-2" />
                    Read Articles
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};