import { getCurrentUser } from '@/lib/auth';
import { checkSponsorAccess, SponsorAccess } from '@/lib/sponsor-access';

export interface UserWithSponsorAccess {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string | null;
  preferredLanguage?: string;
  createdAt: Date;
  updatedAt: Date;
  sponsorAccess: SponsorAccess;
}

export async function getCurrentUserWithSponsorAccess(): Promise<UserWithSponsorAccess> {
  const user = await getCurrentUser();
  const sponsorAccess = await checkSponsorAccess(user.id);

  return {
    ...user,
    sponsorAccess
  };
}

export async function requireSponsorAccess(): Promise<UserWithSponsorAccess> {
  const userWithAccess = await getCurrentUserWithSponsorAccess();
  
  if (!userWithAccess.sponsorAccess.hasAccess) {
    throw new Error('Sponsor access required');
  }

  return userWithAccess;
}