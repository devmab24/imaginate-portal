
import type { Database } from '@/integrations/supabase/types';

// Re-export the base Database type
export type { Database } from '@/integrations/supabase/types';

// Define our strongly-typed models based on the database schema
export type Profile = {
  id: string;
  name: string | null;
  avatarUrl: string | null;
  bio: string | null;
  website: string | null;
  location: string | null;
  subscriptionTier: string | null;
  credits: number | null;
  lastLogin: string | null;
  createdAt: string | null;
};

export type GeneratedImage = {
  id: string;
  userId: string;
  prompt: string;
  imageUrl: string;
  cloudinaryPublicId: string | null;
  width: number | null;
  height: number | null;
  createdAt: string;
};

// Helper to convert database row to our model types
export const mapDbProfileToProfile = (row: any): Profile => ({
  id: row.id,
  name: row.name,
  avatarUrl: row.avatar_url,
  bio: row.bio,
  website: row.website,
  location: row.location,
  subscriptionTier: row.subscription_tier,
  credits: row.credits,
  lastLogin: row.last_login,
  createdAt: row.created_at
});

export const mapDbImageToImage = (row: any): GeneratedImage => ({
  id: row.id,
  userId: row.user_id,
  prompt: row.prompt,
  imageUrl: row.image_url,
  cloudinaryPublicId: row.cloudinary_public_id,
  width: row.width,
  height: row.height,
  createdAt: row.created_at
});
