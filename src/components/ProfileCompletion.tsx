import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Card, CardContent, CardHeader } from './ui/Card';
import { Modal } from './ui/Modal';
import { User, Phone, Calendar, Users } from 'lucide-react';

interface ProfileCompletionProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const ProfileCompletion: React.FC<ProfileCompletionProps> = ({
  isOpen,
  onClose,
  onComplete,
}) => {
  const { profile, updateProfile } = useAuth();
  const [formData, setFormData] = useState({
    phone: profile?.phone || '',
    dateOfBirth: profile?.date_of_birth || '',
    emergencyContact: profile?.emergency_contact || '',
    emergencyPhone: profile?.emergency_phone || '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.phone) newErrors.phone = 'Phone number is required';
    if (!formData.dateOfBirth) newErrors.dateOfBirth = 'Date of birth is required';
    if (!formData.emergencyContact) newErrors.emergencyContact = 'Emergency contact is required';
    if (!formData.emergencyPhone) newErrors.emergencyPhone = 'Emergency phone is required';

    // Validate age (must be 18+)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      if (age < 18) {
        newErrors.dateOfBirth = 'You must be at least 18 years old';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);

    try {
      await updateProfile({
        phone: formData.phone,
        date_of_birth: formData.dateOfBirth,
        emergency_contact: formData.emergencyContact,
        emergency_phone: formData.emergencyPhone,
        profile_completed: true,
      });
      
      onComplete();
    } catch (error) {
      console.error('Profile completion error:', error);
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

  return (
    <Modal isOpen={isOpen} onClose={() => {}} title="Complete Your Profile" size="md">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-u-recover-green rounded-full flex items-center justify-center mx-auto mb-4">
          <User className="w-8 h-8 text-white" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
          Complete Your Profile
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          To connect with a counsellor, we need some additional information to ensure your safety and provide the best care.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          <div className="flex items-center space-x-3 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
            <Phone className="w-5 h-5 text-blue-600" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Contact Information</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">For appointment reminders and emergency contact</p>
            </div>
          </div>

          <Input
            label="Phone Number"
            type="tel"
            value={formData.phone}
            onChange={(e) => handleChange('phone', e.target.value)}
            error={errors.phone}
            placeholder="Enter your phone number"
            required
          />

          <div className="flex items-center space-x-3 p-4 bg-green-50 dark:bg-green-900 rounded-lg">
            <Calendar className="w-5 h-5 text-green-600" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Personal Information</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">To verify you're eligible for our services</p>
            </div>
          </div>

          <Input
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={(e) => handleChange('dateOfBirth', e.target.value)}
            error={errors.dateOfBirth}
            required
          />

          <div className="flex items-center space-x-3 p-4 bg-purple-50 dark:bg-purple-900 rounded-lg">
            <Users className="w-5 h-5 text-purple-600" />
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100">Emergency Contact</h4>
              <p className="text-sm text-gray-600 dark:text-gray-400">Someone we can contact in case of emergency</p>
            </div>
          </div>

          <Input
            label="Emergency Contact Name"
            type="text"
            value={formData.emergencyContact}
            onChange={(e) => handleChange('emergencyContact', e.target.value)}
            error={errors.emergencyContact}
            placeholder="Full name of emergency contact"
            required
          />

          <Input
            label="Emergency Contact Phone"
            type="tel"
            value={formData.emergencyPhone}
            onChange={(e) => handleChange('emergencyPhone', e.target.value)}
            error={errors.emergencyPhone}
            placeholder="Emergency contact phone number"
            required
          />
        </div>

        <div className="bg-yellow-50 dark:bg-yellow-900 border border-yellow-200 dark:border-yellow-700 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Privacy Notice
              </h3>
              <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                <p>
                  Your information is encrypted and secure. We only use this data to provide you with the best mental health support and will never share it without your consent.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Complete Later
          </Button>
          <Button
            type="submit"
            className="flex-1"
            loading={loading}
          >
            Complete Profile
          </Button>
        </div>
      </form>
    </Modal>
  );
};