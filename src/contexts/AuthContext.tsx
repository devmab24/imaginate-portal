
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { Profile, mapDbProfileToProfile } from '@/types/database';

// Define types for our authentication context
type AuthUser = Profile & {
  email: string;
};

type AuthContextType = {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  loginWithGithub: () => Promise<void>;
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
  loginWithGoogle: async () => {},
  loginWithGithub: async () => {},
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
      const mappedProfile = mapDbProfileToProfile(profile);
      setUser({
        ...mappedProfile,
        email: authUser.email || '',
      });
    } else {
      // Fallback to just auth data if profile not found
      setUser({
        id: authUser.id,
        email: authUser.email || '',
        name: authUser.user_metadata.name,
        avatarUrl: null,
        bio: null,
        website: null,
        location: null,
        subscriptionTier: 'free',
        credits: 10,
        lastLogin: null,
        createdAt: null,
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
      console.log("Attempting login with email:", email);
      
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Login error details:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please confirm your email address before logging in. Check your inbox for a confirmation link.');
        } else {
          throw error;
        }
      }

      console.log("Login successful, user data:", data.user);

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

  // Social login with Google
  const loginWithGoogle = async () => {
    try {
      setIsLoading(true);
      console.log("Attempting Google login");
      
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('Google login error details:', error);
        throw error;
      }

      if (!data.url) {
        throw new Error('Failed to get OAuth URL from Supabase');
      }

      // The redirect happens automatically
      window.location.href = data.url;
      
    } catch (error) {
      console.error('Google login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login with Google. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Social login with GitHub
  const loginWithGithub = async () => {
    try {
      setIsLoading(true);
      console.log("Attempting GitHub login");
      
      const { error, data } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: window.location.origin,
        },
      });

      if (error) {
        console.error('GitHub login error details:', error);
        throw error;
      }

      if (!data.url) {
        throw new Error('Failed to get OAuth URL from Supabase');
      }

      // The redirect happens automatically
      window.location.href = data.url;
      
    } catch (error) {
      console.error('GitHub login error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to login with GitHub. Please try again.');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Signup function
  const signup = async (email: string, password: string, name?: string) => {
    try {
      setIsLoading(true);
      console.log("Attempting signup with email:", email);
      
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        }
      });

      if (error) {
        console.error('Signup error details:', error);
        throw error;
      }

      console.log("Signup response:", data);
      
      if (data.user) {
        console.log("User created with ID:", data.user.id);
        // Check if email confirmation is required
        if (data.user.identities && data.user.identities.length === 0) {
          toast.error('This email is already registered. Please try logging in instead.');
        } else if (!data.user.confirmed_at) {
          toast.success('Account created successfully! Please check your email for verification.');
        } else {
          toast.success('Account created successfully!');
        }
      }
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
        loginWithGoogle,
        loginWithGithub,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
