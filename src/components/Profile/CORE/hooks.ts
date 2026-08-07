import { useState, useEffect } from 'react';
import { ProfileService } from './services';
import { ProfileActions } from './actions';
import { Profile, ProfileFormData } from './types';
import { toast } from 'sonner';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const service = new ProfileService();
  const actions = new ProfileActions();

  const loadProfile = async () => {
    try {
      setLoading(true);
      const data = await service.getProfile();
      setProfile(data);
    } catch (e) {
      toast.error('Failed to load profile settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async (formData: ProfileFormData) => {
    if (!actions.validate(formData)) return false;
    try {
      const updated = await service.updateProfile({
        full_name: formData.full_name,
        currency: formData.currency
      });
      setProfile(updated);
      toast.success('Profile settings updated successfully');
      actions.notifyUpdate();
      return true;
    } catch (e) {
      toast.error('Failed to update profile settings');
      return false;
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  return {
    profile,
    loading,
    updateProfile: handleUpdateProfile
  };
}
