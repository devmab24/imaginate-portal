
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ImageGenerator from '@/components/ImageGenerator';
import ImageCard from '@/components/ImageCard';
import EmptyState from '@/components/EmptyState';
import { useImage } from '@/contexts/ImageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

const Dashboard = () => {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth();
  const { history } = useImage();
  const [pageLoading, setPageLoading] = useState(true);

  // Initialize page and refresh user data
  useEffect(() => {
    console.log("Dashboard page - Auth state:", isAuthenticated ? "authenticated" : "not authenticated");
    console.log("Dashboard page - User:", user ? "exists" : "null");
    
    if (!isLoading) {
      const initPage = async () => {
        try {
          setPageLoading(true);
          if (isAuthenticated && user) {
            await refreshUser();
          }
        } catch (error) {
          console.error("Error initializing dashboard page:", error);
        } finally {
          setPageLoading(false);
        }
      };
      
      initPage();
    }
  }, [isAuthenticated, isLoading, refreshUser, user]);

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
  if (!isAuthenticated || !user) {
    console.log("Not authenticated, redirecting to home");
    return <Navigate to="/" />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-imaginate-dark">
              Dashboard
            </h1>
            <p className="text-gray-600 mt-1">
              Create and manage your AI-generated images
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm mb-10">
            <h2 className="text-xl font-semibold mb-4">Create New Image</h2>
            <ImageGenerator />
          </div>
          
          <div className="mb-6">
            <h2 className="text-xl font-semibold">Recent Creations</h2>
            <p className="text-gray-600 text-sm mt-1">
              Your most recently generated images
            </p>
          </div>
          
          {history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.slice(0, 8).map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="No images yet"
              description="Start creating with AI by entering a prompt above"
              action={{
                label: "Create your first image",
                onClick: () => {
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }
              }}
            />
          )}
          
          {history.length > 8 && (
            <div className="mt-6 text-center">
              <a 
                href="/history" 
                className="text-imaginate-purple hover:underline"
              >
                View all creations →
              </a>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
