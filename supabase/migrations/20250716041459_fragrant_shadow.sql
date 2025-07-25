/*
  # Add profile completion tracking

  1. Changes
    - Add profile_completed field to profiles table
    - Update existing profiles to have profile_completed = false
    - Add index for better query performance

  2. Security
    - Maintain existing RLS policies
*/

-- Add profile_completed field to profiles table
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS profile_completed boolean DEFAULT false;

-- Update existing profiles to have profile_completed = false
UPDATE profiles SET profile_completed = false WHERE profile_completed IS NULL;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_profiles_profile_completed ON profiles(profile_completed);