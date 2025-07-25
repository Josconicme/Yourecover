import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ProfileCompletion } from '../components/ProfileCompletion';
import { Button } from '../components/ui/Button';
import { Card, CardContent, CardHeader } from '../components/ui/Card';
import { Modal } from '../components/ui/Modal';
import { 
  MessageSquare, 
  Video, 
  Phone, 
  Calendar, 
  Clock, 
  User, 
  Star,
  Shield,
  Heart,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

interface Counsellor {
  id: string;
  full_name: string;
  title: string;
  specialties: string[];
  experience_years: number;
  rating: number;
  total_reviews: number;
  bio: string;
  avatar_url?: string;
  is_available: boolean;
}

export const TalkToCounsellor: React.FC = () => {
  const { profile } = useAuth();
  const [showProfileCompletion, setShowProfileCompletion] = useState(false);
  const [availableCounsellors, setAvailableCounsellors] = useState<Counsellor[]>([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState<Counsellor | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile) {
      checkProfileCompletion();
      fetchAvailableCounsellors();
    }
  }, [profile]);

  const checkProfileCompletion = () => {
    if (!profile?.profile_completed) {
      setShowProfileCompletion(true);
    }
  };

  const fetchAvailableCounsellors = async () => {
    if (!profile) return;

    try {
      const { data, error } = await supabase
        .from('counsellors')
        .select(`
          id,
          full_name,
          title,
          specialties,
          experience_years,
          rating,
          total_reviews,
          bio,
          avatar_url,
          is_available
        `)
        .eq('status', 'approved')
        .eq('is_available', true)
        .eq('gender', profile.gender) // Gender matching
        .order('rating', { ascending: false });

      if (error) throw error;
      setAvailableCounsellors(data || []);
    } catch (error) {
      console.error('Error fetching counsellors:', error);
      toast.error('Failed to load counsellors');
    } finally {
      setLoading(false);
    }
  };

  const handleProfileCompletion = () => {
    setShowProfileCompletion(false);
    toast.success('Profile completed! You can now connect with counsellors.');
  };

  const handleRequestSession = async (counsellor: Counsellor) => {
    if (!profile?.profile_completed) {
      setShowProfileCompletion(true);
      return;
    }

    setSelectedCounsellor(counsellor);
    setShowBookingModal(true);
  };

  const handleBookSession = async (sessionType: 'video' | 'audio' | 'chat') => {
    if (!selectedCounsellor || !profile) return;

    try {
      // Create appointment request
      const { error } = await supabase
        .from('appointments')
        .insert({
          user_id: profile.id,
          counsellor_id: selectedCounsellor.id,
          session_type: sessionType,
          status: 'requested',
          appointment_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
          duration_minutes: 60,
          notes: `Session request from ${profile.full_name}`
        });

      if (error) throw error;

      // Create notification for counsellor
      await supabase
        .from('notifications')
        .insert({
          user_id: selectedCounsellor.id,
          title: 'New Session Request',
          message: `${profile.full_name} has requested a ${sessionType} session with you.`,
          type: 'appointment',
          action_url: '/counsellor/appointments'
        });

      toast.success('Session request sent! The counsellor will contact you soon.');
      setShowBookingModal(false);
      setSelectedCounsellor(null);
    } catch (error) {
      console.error('Error booking session:', error);
      toast.error('Failed to book session. Please try again.');
    }
  };

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Connect with a Counsellor
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Get professional mental health support from licensed counsellors who understand your needs.
          </p>
        </div>

        {/* Profile Completion Check */}
        {!profile.profile_completed && (
          <Card className="mb-8 border-yellow-200 bg-yellow-50 dark:bg-yellow-900 dark:border-yellow-700">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <AlertCircle className="w-8 h-8 text-yellow-600" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200">
                    Complete Your Profile
                  </h3>
                  <p className="text-yellow-700 dark:text-yellow-300">
                    To connect with a counsellor, please complete your profile with additional information for your safety and better care.
                  </p>
                </div>
                <Button
                  onClick={() => setShowProfileCompletion(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Complete Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Features Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardContent className="p-6 text-center">
              <Shield className="w-12 h-12 text-u-recover-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Safe & Secure
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                All conversations are encrypted and confidential, following healthcare privacy standards.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Heart className="w-12 h-12 text-u-recover-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Gender Matched
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with counsellors who understand your perspective and experiences.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 text-center">
              <Clock className="w-12 h-12 text-u-recover-green mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Flexible Sessions
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Choose from video, audio, or chat sessions that fit your comfort level.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Available Counsellors */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            Available Counsellors
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded mb-4"></div>
                    <div className="h-8 bg-gray-300 rounded"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : availableCounsellors.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                  No Counsellors Available
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  There are currently no counsellors available that match your preferences. Please check back later.
                </p>
                <Button onClick={fetchAvailableCounsellors}>
                  Refresh
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {availableCounsellors.map((counsellor) => (
                <Card key={counsellor.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <div className="w-16 h-16 bg-u-recover-green rounded-full flex items-center justify-center mx-auto mb-3">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {counsellor.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {counsellor.title}
                      </p>
                    </div>

                    <div className="space-y-3 mb-6">
                      <div className="flex items-center justify-center space-x-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(counsellor.rating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                          ({counsellor.total_reviews} reviews)
                        </span>
                      </div>

                      <div className="text-center">
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {counsellor.experience_years} years experience
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 justify-center">
                        {counsellor.specialties.slice(0, 2).map((specialty, index) => (
                          <span
                            key={index}
                            className="px-2 py-1 bg-u-recover-green bg-opacity-10 text-u-recover-green text-xs rounded-full"
                          >
                            {specialty}
                          </span>
                        ))}
                      </div>
                    </div>

                    <Button
                      onClick={() => handleRequestSession(counsellor)}
                      className="w-full"
                      disabled={!profile.profile_completed}
                    >
                      <MessageSquare className="w-4 h-4 mr-2" />
                      Request Session
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Profile Completion Modal */}
        <ProfileCompletion
          isOpen={showProfileCompletion}
          onClose={() => setShowProfileCompletion(false)}
          onComplete={handleProfileCompletion}
        />

        {/* Booking Modal */}
        {selectedCounsellor && (
          <Modal
            isOpen={showBookingModal}
            onClose={() => setShowBookingModal(false)}
            title="Choose Session Type"
            size="md"
          >
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-u-recover-green rounded-full flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                {selectedCounsellor.full_name}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {selectedCounsellor.title}
              </p>
            </div>

            <div className="space-y-4">
              <Button
                onClick={() => handleBookSession('video')}
                variant="outline"
                className="w-full justify-start p-4 h-auto"
              >
                <Video className="w-6 h-6 mr-4 text-blue-600" />
                <div className="text-left">
                  <div className="font-medium">Video Call</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Face-to-face session with video and audio
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleBookSession('audio')}
                variant="outline"
                className="w-full justify-start p-4 h-auto"
              >
                <Phone className="w-6 h-6 mr-4 text-green-600" />
                <div className="text-left">
                  <div className="font-medium">Audio Call</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Voice-only session for privacy
                  </div>
                </div>
              </Button>

              <Button
                onClick={() => handleBookSession('chat')}
                variant="outline"
                className="w-full justify-start p-4 h-auto"
              >
                <MessageSquare className="w-6 h-6 mr-4 text-purple-600" />
                <div className="text-left">
                  <div className="font-medium">Text Chat</div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Written conversation at your own pace
                  </div>
                </div>
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
              <div className="flex items-start space-x-3">
                <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800 dark:text-blue-200">
                  <p className="font-medium mb-1">What happens next?</p>
                  <p>
                    Your counsellor will receive your request and contact you within 24 hours to schedule your session.
                  </p>
                </div>
              </div>
            </div>
          </Modal>
        )}
      </div>
    </div>
  );
};