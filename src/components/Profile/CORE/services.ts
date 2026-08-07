import { db, Profile } from '@/lib/db';

export class ProfileService {
  async getProfile(): Promise<Profile> {
    return db.getProfile();
  }

  async updateProfile(profile: Partial<Profile>): Promise<Profile> {
    return db.updateProfile(profile);
  }
}
