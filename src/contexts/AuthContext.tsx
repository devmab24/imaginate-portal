
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';

// Define types for our authentication context
type AuthUser = {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
  bio?: string;
  website?: string;
  location?: string;
  subscriptionTier?: string;
  credits?: number;
  lastLogin?: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
};

// Create the context with a default value
const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  isAuthenticated: false,
  login: async () => {},
  signup: async () => {},
  logout: async () => {},
  refreshUser: async () => {},
});

// Custom hook to use the auth context
export const useAuth = () => useContext(AuthContext);

// Provider component to wrap your app
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<Session | null>(null);

  // Fetch user profile data from the profiles table
  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
    
    return data;
  };

  // Update user state with profile data
  const setUserWithProfile = async (authUser: User) => {
    const profile = await fetchUserProfile(authUser.id);
    
    if (profile) {
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: profile.name,
        avatarUrl: profile.avatar_url,
        bio: profile.bio,
        website: profile.website,
        location: profile.location,
        subscriptionTier: profile.subscription_tier,
        credits: profile.credits,
        lastLogin: profile.last_login,
      });
    } else {
      // Fallback to just auth data if profile not found
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata.name,
      });
    }
  };

  // Refresh user data from the database
  const refreshUser = async () => {
    if (!session?.user) return;
    
    try {
      await setUserWithProfile(session.user);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  // Initialize auth state and setup listener for auth changes
  useEffect(() => {
    setIsLoading(true);

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        setUserWithProfile(session.user).then(() => {
          setIsLoading(false);
        });
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setSession(session);
        if (session?.user) {
          await setUserWithProfile(session.user);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Update last login timestamp
  const updateLastLogin = async (userId: string) => {
    try {
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', userId);
    } catch (error) {
      console.error('Error updating last login:', error);
    }
  };

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await updateLastLogin(data.user.id);
      }

      toast.success('Logged in successfully!');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        }
      });

      if (error) {
        throw error;
      }

      toast.success('Account created successfully! Please check your email for verification.');
    } catch (error) {
      console.error('Signup error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to create account. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout function
  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      toast.success('Logged out successfully!');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to logout. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
