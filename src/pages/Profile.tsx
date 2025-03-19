
import React, { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ProfileCard from '@/components/ProfileCard';
import ProfileForm from '@/components/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth();
  const [pageLoading, setPageLoading] = useState(true);
  const navigate = useNavigate();

  // Call refreshUser when the component mounts to ensure we have the latest user data
  useEffect(() => {
    console.log("Profile page - Auth state:", isAuthenticated ? "authenticated" : "not authenticated");
    console.log("Profile page - User:", user ? "exists" : "null");
    
    const initPage = async () => {
      try {
        setPageLoading(true);
        if (isAuthenticated) {
          await refreshUser();
        }
      } catch (error) {
        console.error("Error initializing profile page:", error);
      } finally {
        setPageLoading(false);
      }
    };

    if (!isLoading) {
      initPage();
    }
  }, [isAuthenticated, isLoading, refreshUser]);

  // Handle loading state
  if (isLoading || pageLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <div className="flex-grow flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-imaginate-purple"></div>
        </div>
      </div>
    );
  }

  // Redirect if not authenticated
  if (!isAuthenticated || !user) {
    console.log("Not authenticated, redirecting to home");
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-4xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-imaginate-dark">
              My Profile
            </h1>
            <p className="text-gray-600 mt-1">
              View and manage your profile information
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-1">
            <ProfileCard />
            <ProfileForm />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;
