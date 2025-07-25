import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  User, 
  Search,
  Filter,
  Calendar,
  BarChart3,
  Heart,
  Brain,
  Moon,
  Zap
} from 'lucide-react';

interface WellnessData {
  id: string;
  user_id: string;
  entry_date: string;
  mood_score?: number;
  anxiety_level?: number;
  stress_level?: number;
  sleep_hours?: number;
  exercise_minutes: number;
  meditation_minutes: number;
  notes?: string;
  created_at: string;
  user?: {
    full_name: string;
    email: string;
    gender?: string;
  };
}

interface PatientSummary {
  user_id: string;
  full_name: string;
  email: string;
  gender?: string;
  total_entries: number;
  avg_mood: number;
  avg_anxiety: number;
  last_entry: string;
  trend: 'improving' | 'declining' | 'stable';
}

export const MentalHealthTrackerAdmin: React.FC = () => {
  const { profile } = useAuth();
  const [wellnessData, setWellnessData] = useState<WellnessData[]>([]);
  const [patientSummaries, setPatientSummaries] = useState<PatientSummary[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [loading, setLoading] = useState(true);
  const [selectedPatient, setSelectedPatient] = useState<string | null>(null);

  useEffect(() => {
    fetchWellnessData();
  }, [selectedTimeframe]);

  const fetchWellnessData = async () => {
    try {
      const daysAgo = parseInt(selectedTimeframe);
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - daysAgo);

      // Fetch wellness entries with user details
      const { data: wellnessEntries, error } = await supabase
        .from('wellness_entries')
        .select(`
          *,
          user:profiles!wellness_entries_user_id_fkey(
            full_name,
            email,
            gender
          )
        `)
        .gte('entry_date', startDate.toISOString().split('T')[0])
        .order('entry_date', { ascending: false });

      if (error) throw error;

      setWellnessData(wellnessEntries || []);

      // Calculate patient summaries
      const summaries = calculatePatientSummaries(wellnessEntries || []);
      setPatientSummaries(summaries);
    } catch (error) {
      console.error('Error fetching wellness data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculatePatientSummaries = (entries: WellnessData[]): PatientSummary[] => {
    const patientMap = new Map<string, WellnessData[]>();

    // Group entries by patient
    entries.forEach(entry => {
      if (!patientMap.has(entry.user_id)) {
        patientMap.set(entry.user_id, []);
      }
      patientMap.get(entry.user_id)!.push(entry);
    });

    // Calculate summaries
    return Array.from(patientMap.entries()).map(([userId, userEntries]) => {
      const validMoodEntries = userEntries.filter(e => e.mood_score);
      const validAnxietyEntries = userEntries.filter(e => e.anxiety_level);
      
      const avgMood = validMoodEntries.length > 0 
        ? validMoodEntries.reduce((sum, e) => sum + (e.mood_score || 0), 0) / validMoodEntries.length
        : 0;
      
      const avgAnxiety = validAnxietyEntries.length > 0
        ? validAnxietyEntries.reduce((sum, e) => sum + (e.anxiety_level || 0), 0) / validAnxietyEntries.length
        : 0;

      // Calculate trend (comparing first half vs second half of entries)
      const sortedEntries = userEntries.sort((a, b) => new Date(a.entry_date).getTime() - new Date(b.entry_date).getTime());
      const midPoint = Math.floor(sortedEntries.length / 2);
      const firstHalf = sortedEntries.slice(0, midPoint).filter(e => e.mood_score);
      const secondHalf = sortedEntries.slice(midPoint).filter(e => e.mood_score);
      
      let trend: 'improving' | 'declining' | 'stable' = 'stable';
      if (firstHalf.length > 0 && secondHalf.length > 0) {
        const firstAvg = firstHalf.reduce((sum, e) => sum + (e.mood_score || 0), 0) / firstHalf.length;
        const secondAvg = secondHalf.reduce((sum, e) => sum + (e.mood_score || 0), 0) / secondHalf.length;
        
        if (secondAvg > firstAvg + 0.5) trend = 'improving';
        else if (secondAvg < firstAvg - 0.5) trend = 'declining';
      }

      const user = userEntries[0].user;
      return {
        user_id: userId,
        full_name: user?.full_name || 'Unknown',
        email: user?.email || '',
        gender: user?.gender,
        total_entries: userEntries.length,
        avg_mood: Math.round(avgMood * 10) / 10,
        avg_anxiety: Math.round(avgAnxiety * 10) / 10,
        last_entry: userEntries[0].entry_date,
        trend
      };
    }).sort((a, b) => b.total_entries - a.total_entries);
  };

  const filteredSummaries = patientSummaries.filter(summary =>
    summary.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    summary.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getPatientEntries = (userId: string) => {
    return wellnessData.filter(entry => entry.user_id === userId);
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-600" />;
      default:
        return <BarChart3 className="w-4 h-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600 bg-green-50';
      case 'declining':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const overallStats = {
    totalPatients: patientSummaries.length,
    totalEntries: wellnessData.length,
    avgMoodAll: patientSummaries.length > 0 
      ? Math.round((patientSummaries.reduce((sum, p) => sum + p.avg_mood, 0) / patientSummaries.length) * 10) / 10
      : 0,
    improvingPatients: patientSummaries.filter(p => p.trend === 'improving').length,
    decliningPatients: patientSummaries.filter(p => p.trend === 'declining').length,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading mental health data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Mental Health Tracker - All Patients
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Monitor and analyze mental health data across all platform users
          </p>
        </div>

        {/* Overall Stats */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Patients
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {overallStats.totalPatients}
                  </p>
                </div>
                <User className="w-8 h-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Entries
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {overallStats.totalEntries}
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Avg Mood Score
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {overallStats.avgMoodAll}/10
                  </p>
                </div>
                <Heart className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Improving
                  </p>
                  <p className="text-2xl font-bold text-green-600">
                    {overallStats.improvingPatients}
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Need Attention
                  </p>
                  <p className="text-2xl font-bold text-red-600">
                    {overallStats.decliningPatients}
                  </p>
                </div>
                <TrendingDown className="w-8 h-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search patients by name or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select
                  value={selectedTimeframe}
                  onChange={(e) => setSelectedTimeframe(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-u-recover-green dark:bg-gray-800 dark:border-gray-600"
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="365">Last year</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Patient Summaries */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                Patient Overview ({filteredSummaries.length})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {filteredSummaries.map((patient) => (
                  <div
                    key={patient.user_id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedPatient === patient.user_id
                        ? 'border-u-recover-green bg-green-50 dark:bg-green-900'
                        : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                    onClick={() => setSelectedPatient(patient.user_id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-u-recover-green rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {patient.full_name}
                          </p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {patient.email}
                          </p>
                        </div>
                      </div>
                      <div className={`px-2 py-1 rounded-full text-xs ${getTrendColor(patient.trend)}`}>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(patient.trend)}
                          <span>{patient.trend}</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Entries</p>
                        <p className="font-medium">{patient.total_entries}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Avg Mood</p>
                        <p className="font-medium">{patient.avg_mood}/10</p>
                      </div>
                      <div>
                        <p className="text-gray-600 dark:text-gray-400">Avg Anxiety</p>
                        <p className="font-medium">{patient.avg_anxiety}/10</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
                {selectedPatient ? 'Patient Details' : 'Select a Patient'}
              </h2>
            </CardHeader>
            <CardContent>
              {selectedPatient ? (
                <div className="space-y-4">
                  {getPatientEntries(selectedPatient).slice(0, 10).map((entry) => (
                    <div
                      key={entry.id}
                      className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {new Date(entry.entry_date).toLocaleDateString()}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {new Date(entry.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {entry.mood_score && (
                          <div className="flex items-center space-x-2">
                            <Heart className="w-4 h-4 text-red-500" />
                            <span>Mood: {entry.mood_score}/10</span>
                          </div>
                        )}
                        {entry.anxiety_level && (
                          <div className="flex items-center space-x-2">
                            <Brain className="w-4 h-4 text-purple-500" />
                            <span>Anxiety: {entry.anxiety_level}/10</span>
                          </div>
                        )}
                        {entry.sleep_hours && (
                          <div className="flex items-center space-x-2">
                            <Moon className="w-4 h-4 text-blue-500" />
                            <span>Sleep: {entry.sleep_hours}h</span>
                          </div>
                        )}
                        {entry.exercise_minutes > 0 && (
                          <div className="flex items-center space-x-2">
                            <Zap className="w-4 h-4 text-green-500" />
                            <span>Exercise: {entry.exercise_minutes}min</span>
                          </div>
                        )}
                      </div>
                      {entry.notes && (
                        <div className="mt-2 p-2 bg-white dark:bg-gray-700 rounded text-sm">
                          <p className="text-gray-700 dark:text-gray-300">{entry.notes}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Select a patient from the list to view their detailed mental health data
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};