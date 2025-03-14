
import React from 'react';
import { Navigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import ProfileCard from '@/components/ProfileCard';
import ProfileForm from '@/components/ProfileForm';
import { useAuth } from '@/contexts/AuthContext';

const Profile = () => {
  const { isAuthenticated, isLoading } = useAuth();

  // Handle loading state
  if (isLoading) {
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
  if (!isAuthenticated) {
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
