
import React, { useEffect, useState } from 'react';
import Navbar from '@/components/Navbar';
import ImageCard from '@/components/ImageCard';
import EmptyState from '@/components/EmptyState';
import { useImage } from '@/contexts/ImageContext';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { 
  Trash2, 
  AlertTriangle 
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

const History = () => {
  const { isAuthenticated, isLoading, user, refreshUser } = useAuth();
  const { history, clearHistory } = useImage();
  const navigate = useNavigate();
  const [pageLoading, setPageLoading] = useState(true);

  // Initialize page and refresh user data
  useEffect(() => {
    console.log("History page - Auth state:", isAuthenticated ? "authenticated" : "not authenticated");
    console.log("History page - User:", user ? "exists" : "null");
    
    const initPage = async () => {
      try {
        setPageLoading(true);
        if (isAuthenticated) {
          await refreshUser();
        }
      } catch (error) {
        console.error("Error initializing history page:", error);
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
        <div className="max-w-6xl mx-auto py-8 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-imaginate-dark">
                Image History
              </h1>
              <p className="text-gray-600 mt-1">
                Browse all your generated images
              </p>
            </div>
            
            {history.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-500 border-red-200 hover:bg-red-50">
                    <Trash2 size={16} className="mr-2" />
                    Clear History
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center">
                      <AlertTriangle className="text-red-500 mr-2" size={20} />
                      Clear Image History?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      This action cannot be undone. This will permanently delete all your generated images and history.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={clearHistory}
                      className="bg-red-500 hover:bg-red-600"
                    >
                      Delete All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
          
          {history.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {history.map((image) => (
                <ImageCard key={image.id} image={image} />
              ))}
            </div>
          ) : (
            <EmptyState
              title="Your history is empty"
              description="You haven't generated any images yet"
              action={{
                label: "Create an image",
                onClick: () => navigate('/dashboard')
              }}
            />
          )}
        </div>
      </main>
    </div>
  );
};

export default History;
