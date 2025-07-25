import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export type UserRole = 'user' | 'counsellor' | 'admin';
export type GenderType = 'male' | 'female' | 'other';
export type CounsellorStatus = 'pending' | 'approved' | 'suspended' | 'rejected';
export type AssignmentStatus = 'active' | 'completed' | 'cancelled';
export type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no-show';
export type MessageType = 'text' | 'image' | 'file' | 'system';
export type NotificationType = 'appointment' | 'message' | 'wellness' | 'system' | 'reminder';
export type AdminRoleType = 'super_admin' | 'content_admin' | 'counsellor_admin' | 'support_admin';

export interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: GenderType;
  emergency_contact?: string;
  emergency_phone?: string;
  role: UserRole;
  is_verified: boolean;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Counsellor {
  id: string;
  user_id: string;
  profile_id: string;
  license_number?: string;
  specializations: string[];
  experience_years: number;
  education?: string[];
  bio?: string;
  hourly_rate?: number;
  languages: string[];
  status: CounsellorStatus;
  approved_by?: string;
  approved_at?: string;
  is_available: boolean;
  max_patients: number;
  current_patients: number;
  rating: number;
  total_reviews: number;
  created_at: string;
  updated_at: string;
  profile?: Profile;
}

export interface CounsellorAssignment {
  id: string;
  patient_id: string;
  counsellor_id: string;
  status: AssignmentStatus;
  assigned_by?: string;
  assigned_at: string;
  completed_at?: string;
  notes?: string;
  created_at: string;
  patient?: Profile;
  counsellor?: Counsellor;
}

export interface Conversation {
  id: string;
  patient_id: string;
  counsellor_id: string;
  assignment_id?: string;
  is_active: boolean;
  last_message_at: string;
  created_at: string;
  updated_at: string;
  patient?: Profile;
  counsellor?: Counsellor;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  message_type: MessageType;
  is_read: boolean;
  read_at?: string;
  created_at: string;
  sender?: Profile;
}

export interface Appointment {
  id: string;
  patient_id: string;
  counsellor_id: string;
  appointment_date: string;
  duration_minutes: number;
  session_type: string;
  status: AppointmentStatus;
  notes?: string;
  meeting_link?: string;
  reminder_sent: boolean;
  created_at: string;
  updated_at: string;
  patient?: Profile;
  counsellor?: Counsellor;
}

export interface WellnessEntry {
  id: string;
  user_id: string;
  entry_date: string;
  mood_score?: number;
  anxiety_level?: number;
  stress_level?: number;
  energy_level?: number;
  sleep_hours?: number;
  sleep_quality?: number;
  exercise_minutes: number;
  meditation_minutes: number;
  social_interaction?: number;
  productivity?: number;
  notes?: string;
  symptoms?: string[];
  triggers?: string[];
  coping_strategies?: string[];
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description?: string;
  category?: string;
  target_value?: number;
  current_value: number;
  unit?: string;
  target_date?: string;
  is_completed: boolean;
  completed_at?: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  description?: string;
  content: string;
  featured_image_url?: string;
  author_id?: string;
  category: string;
  tags: string[];
  difficulty_level: string;
  read_time_minutes: number;
  is_published: boolean;
  is_featured: boolean;
  views_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt?: string;
  content: string;
  featured_image_url?: string;
  author_id?: string;
  category: string;
  tags: string[];
  is_published: boolean;
  is_featured: boolean;
  read_time_minutes: number;
  views_count: number;
  published_at?: string;
  created_at: string;
  updated_at: string;
  author?: Profile;
}

export interface Resource {
  id: string;
  title: string;
  description?: string;
  category: string;
  resource_type: string;
  file_url?: string;
  file_size_mb?: number;
  download_count: number;
  is_premium: boolean;
  tags: string[];
  created_by?: string;
  created_at: string;
  updated_at: string;
  creator?: Profile;
}

export interface Testimonial {
  id: string;
  user_id?: string;
  counsellor_id?: string;
  rating: number;
  title?: string;
  content: string;
  is_anonymous: boolean;
  is_approved: boolean;
  is_featured: boolean;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  user?: Profile;
  counsellor?: Counsellor;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: NotificationType;
  is_read: boolean;
  action_url?: string;
  read_at?: string;
  created_at: string;
}

export interface AdminRole {
  id: string;
  user_id: string;
  role_type: AdminRoleType;
  permissions: string[];
  granted_by?: string;
  granted_at: string;
  is_active: boolean;
  created_at: string;
  user?: Profile;
}

// Helper functions
export const getUserProfile = async (userId: string): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }
  return data;
};

export const updateUserProfile = async (userId: string, updates: Partial<Profile>): Promise<Profile | null> => {
  const { data, error } = await supabase
    .from('profiles')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
  return data;
};

export const getAdminRoles = async (userId: string): Promise<AdminRoleType[]> => {
  const { data, error } = await supabase
    .from('admin_roles')
    .select('role_type')
    .eq('user_id', userId)
    .eq('is_active', true);

  if (error) return [];
  return data?.map(role => role.role_type) || [];
};

export const assignCounsellor = async (patientId: string, patientGender: GenderType) => {
  const { data, error } = await supabase.rpc('get_available_counsellor', {
    patient_gender: patientGender
  });

  if (error || !data) {
    throw new Error('No available counsellor found');
  }

  const { error: assignError } = await supabase
    .from('counsellor_assignments')
    .insert({
      patient_id: patientId,
      counsellor_id: data,
      status: 'active'
    });

  if (assignError) {
    throw new Error('Failed to assign counsellor');
  }

  return data;
};

export const createConversation = async (patientId: string, counsellorId: string, assignmentId?: string) => {
  const { data, error } = await supabase
    .from('conversations')
    .insert({
      patient_id: patientId,
      counsellor_id: counsellorId,
      assignment_id: assignmentId
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create conversation');
  }

  return data;
};

export const sendMessage = async (conversationId: string, senderId: string, content: string, messageType: MessageType = 'text') => {
  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
      message_type: messageType
    })
    .select()
    .single();

  if (error) {
    throw new Error('Failed to send message');
  }

  return data;
};

export const createWellnessEntry = async (entry: Partial<WellnessEntry>) => {
  const { data, error } = await supabase
    .from('wellness_entries')
    .upsert(entry)
    .select()
    .single();

  if (error) {
    throw new Error('Failed to create wellness entry');
  }

  return data;
};

export const getWellnessStats = async (userId: string, days: number = 30) => {
  const { data, error } = await supabase
    .from('wellness_entries')
    .select('*')
    .eq('user_id', userId)
    .gte('entry_date', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
    .order('entry_date', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch wellness stats');
  }

  return data;
};