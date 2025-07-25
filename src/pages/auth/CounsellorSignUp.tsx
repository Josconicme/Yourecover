import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card, CardContent, CardHeader } from '../../components/ui/Card';
import { UserCheck, AlertCircle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export const CounsellorSignUp: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    title: '',
    gender: '',
    specialties: '',
    experienceYears: '',
    bio: '',
    licenseNumber: '',
  });
  const [loading, setLoading] = useState(false);
  const [verifyingToken, setVerifyingToken] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [invitationEmail, setInvitationEmail] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const token = searchParams.get('token');

  useEffect(() => {
    if (token) {
      verifyInvitationToken();
    } else {
      setVerifyingToken(false);
    }
  }, [token]);

  const verifyInvitationToken = async () => {
    try {
      const { data, error } = await supabase
        .from('counsellor_invitations')
        .select('email, expires_at, used_at')
        .eq('invitation_token', token)
        .single();

      if (error || !data) {
        toast.error('Invalid invitation link');
        setTokenValid(false);
        return;
      }

      if (data.used_at) {
        toast.error('This invitation has already been used');
        setTokenValid(false);
        return;
      }

      if (new Date(data.expires_at) < new Date()) {
        toast.error('This invitation has expired');
        setTokenValid(false);
        return;
      }

      setInvitationEmail(data.email);
      setFormData(prev => ({ ...prev, email: data.email }));
      setTokenValid(true);
    } catch (error) {
      console.error('Error verifying token:', error);
      setTokenValid(false);
    } finally {
      setVerifyingToken(false);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.title.trim()) newErrors.title = 'Professional title is required';
    if (!formData.gender) newErrors.gender = 'Gender is required';
    if (!formData.password) newErrors.password = 'Password is required';
    if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.specialties.trim()) newErrors.specialties = 'Specialties are required';
    if (!formData.experienceYears) newErrors.experienceYears = 'Experience years is required';
    if (parseInt(formData.experienceYears) < 0) newErrors.experienceYears = 'Experience years must be positive';
    if (!formData.bio.trim()) newErrors.bio = 'Bio is required';
    if (formData.bio.length < 50) newErrors.bio = 'Bio must be at least 50 characters';
    if (!formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            full_name: formData.fullName,
            role: 'counsellor'
          }
        }
      });

      if (authError) throw authError;

      if (authData.user) {
        // Create counsellor profile
        const { error: counsellorError } = await supabase
          .from('counsellors')
          .insert({
            user_id: authData.user.id,
            full_name: formData.fullName,
            title: formData.title,
            gender: formData.gender,
            specialties: formData.specialties.split(',').map(s => s.trim()),
            experience_years: parseInt(formData.experienceYears),
            bio: formData.bio,
            license_number: formData.licenseNumber,
            status: 'pending',
            is_available: false
          });

        if (counsellorError) throw counsellorError;

        // Mark invitation as used
        await supabase
          .from('counsellor_invitations')
          .update({ used_at: new Date().toISOString() })
          .eq('invitation_token', token);

        toast.success('Account created successfully! Please check your email to verify your account.');
        navigate('/signin', { 
          state: { 
            message: 'Counsellor account created! Please verify your email and wait for admin approval before signing in.' 
          }
        });
      }
    } catch (error: any) {
      console.error('Counsellor sign up error:', error);
      toast.error(error.message || 'Failed to create counsellor account');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (verifyingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-u-recover-green mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Verifying invitation...</p>
        </div>
      </div>
    );
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Invalid Invitation
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              This invitation link is invalid, expired, or has already been used.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl w-full">
        <Card>
          <CardHeader>
            <div className="text-center">
              <div className="w-12 h-12 bg-u-recover-green rounded-lg flex items-center justify-center mx-auto mb-4">
                <UserCheck className="w-6 h-6 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                Complete Your Counsellor Profile
              </h2>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                You've been invited to join MindHeal as a counsellor
              </p>
              <div className="mt-4 p-3 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg">
                <div className="flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                  <span className="text-sm text-green-800 dark:text-green-200">
                    Invitation verified for: {invitationEmail}
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Full Name"
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => handleChange('fullName', e.target.value)}
                  error={errors.fullName}
                  placeholder="Dr. Jane Smith"
                  required
                />

                <Input
                  label="Professional Title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  error={errors.title}
                  placeholder="Licensed Clinical Psychologist"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Email Address"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100 dark:bg-gray-800"
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Gender *
                  </label>
                  <select
                    value={formData.gender}
                    onChange={(e) => handleChange('gender', e.target.value)}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-u-recover-green focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                    required
                  >
                    <option value="">Select gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                    <option value="other">Other</option>
                  </select>
                  {errors.gender && (
                    <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.gender}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange('password', e.target.value)}
                  error={errors.password}
                  placeholder="Create a secure password (min. 8 characters)"
                  required
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => handleChange('confirmPassword', e.target.value)}
                  error={errors.confirmPassword}
                  placeholder="Confirm your password"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Input
                  label="Specialties"
                  type="text"
                  value={formData.specialties}
                  onChange={(e) => handleChange('specialties', e.target.value)}
                  error={errors.specialties}
                  placeholder="Anxiety, Depression, PTSD (comma separated)"
                  required
                />

                <Input
                  label="Years of Experience"
                  type="number"
                  value={formData.experienceYears}
                  onChange={(e) => handleChange('experienceYears', e.target.value)}
                  error={errors.experienceYears}
                  placeholder="5"
                  min="0"
                  required
                />
              </div>

              <Input
                label="License Number"
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => handleChange('licenseNumber', e.target.value)}
                error={errors.licenseNumber}
                placeholder="Your professional license number"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Professional Bio *
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => handleChange('bio', e.target.value)}
                  rows={4}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-u-recover-green focus:border-transparent dark:bg-gray-800 dark:border-gray-600 dark:text-gray-100"
                  placeholder="Tell us about your background, approach to therapy, and what makes you passionate about mental health..."
                  required
                />
                {errors.bio && (
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">{errors.bio}</p>
                )}
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Minimum 50 characters. This will be visible to patients.
                </p>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-4">
                <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                  What happens next?
                </h3>
                <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• Your account will be created and pending admin approval</li>
                  <li>• You'll receive an email verification link</li>
                  <li>• Once approved, you can sign in and start helping patients</li>
                  <li>• You'll be assigned patients based on gender matching</li>
                </ul>
              </div>

              <Button
                type="submit"
                className="w-full"
                loading={loading}
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Complete Registration'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};