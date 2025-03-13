
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';
import { supabase } from '@/integrations/supabase/client';

export type GeneratedImage = {
  id: string;
  prompt: string;
  imageUrl: string;
  createdAt: string;
};

type ImageContextType = {
  generatedImages: GeneratedImage[];
  isGenerating: boolean;
  generateImage: (prompt: string) => Promise<GeneratedImage | null>;
  history: GeneratedImage[];
  clearHistory: () => void;
};

const ImageContext = createContext<ImageContextType>({
  generatedImages: [],
  isGenerating: false,
  generateImage: async () => null,
  history: [],
  clearHistory: () => {},
});

export const useImage = () => useContext(ImageContext);

export const ImageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const { user, isAuthenticated } = useAuth();

  // Load history from Supabase when user is authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      loadUserImages();
    } else {
      setHistory([]);
    }
  }, [isAuthenticated, user]);

  // Load user's images from Supabase
  const loadUserImages = async () => {
    try {
      const { data, error } = await supabase
        .from('images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedImages: GeneratedImage[] = await Promise.all(
          data.map(async (item) => {
            // Get image URL from storage
            const { data: urlData, error: urlError } = await supabase
              .storage
              .from('images')
              .createSignedUrl(item.storage_path, 60 * 60); // 1 hour expiry

            if (urlError) {
              console.error('Error getting image URL:', urlError);
              return {
                id: item.id,
                prompt: item.prompt,
                imageUrl: '/placeholder.svg', // Fallback
                createdAt: item.created_at,
              };
            }

            return {
              id: item.id,
              prompt: item.prompt,
              imageUrl: urlData.signedUrl,
              createdAt: item.created_at,
            };
          })
        );

        setHistory(formattedImages);
      }
    } catch (error) {
      console.error('Error loading user images:', error);
      toast.error('Failed to load your images.');
    }
  };

  const generateImage = async (prompt: string): Promise<GeneratedImage | null> => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt.');
      return null;
    }

    setIsGenerating(true);

    try {
      // Simulate API call to DALL-E with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random number to avoid caching issues
      const randomSeed = Math.floor(Math.random() * 1000);
      
      // Use a fixed category that always returns images
      const imageCategories = ['nature', 'technology', 'abstract', 'art', 'space'];
      const randomCategory = imageCategories[Math.floor(Math.random() * imageCategories.length)];
      
      // Use Unsplash for demonstration - in a real app, this would be an AI service
      const imageUrl = `https://source.unsplash.com/featured/600x600/?${randomCategory}&sig=${randomSeed}`;
      console.log("Attempting to generate image with URL:", imageUrl);
      
      // Pre-fetch the image to ensure it's valid
      const imgCheck = new Image();
      
      await new Promise<void>((resolve) => {
        imgCheck.onload = () => {
          console.log("Image pre-fetch successful");
          resolve();
        };
        
        imgCheck.onerror = () => {
          console.error("Pre-fetch image failed, using fallback");
          resolve();
        };
        
        // Start loading the image
        imgCheck.src = imageUrl;
      });

      let newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        imageUrl,
        createdAt: new Date().toISOString(),
      };
      
      // Save to Supabase if user is logged in
      if (isAuthenticated && user) {
        try {
          // First, fetch the image as a Blob
          const response = await fetch(imageUrl);
          const blob = await response.blob();
          
          // Create a file from the blob
          const file = new File([blob], `image-${Date.now()}.jpg`, { type: 'image/jpeg' });
          
          // Upload to Supabase Storage
          const filePath = `${user.id}/${Date.now()}-${file.name}`;
          const { data: uploadData, error: uploadError } = await supabase
            .storage
            .from('images')
            .upload(filePath, file);
            
          if (uploadError) {
            throw uploadError;
          }
          
          // Save metadata to 'images' table
          const { data: imageData, error: imageError } = await supabase
            .from('images')
            .insert({
              prompt,
              storage_path: uploadData.path,
              user_id: user.id
            })
            .select('*')
            .single();
            
          if (imageError) {
            throw imageError;
          }
          
          // Get signed URL for the uploaded image
          const { data: urlData, error: urlError } = await supabase
            .storage
            .from('images')
            .createSignedUrl(uploadData.path, 60 * 60); // 1 hour expiry
            
          if (urlError) {
            throw urlError;
          }
          
          // Update newImage with Supabase data
          newImage = {
            id: imageData.id,
            prompt: imageData.prompt,
            imageUrl: urlData.signedUrl,
            createdAt: imageData.created_at
          };
          
          // Refresh history after adding a new image
          await loadUserImages();
        } catch (error) {
          console.error('Error saving image to Supabase:', error);
          toast.error('Image generated but could not be saved to your account.');
        }
      }

      setGeneratedImages(prev => [newImage, ...prev]);
      toast.success('Image generated successfully!');
      return newImage;
    } catch (error) {
      console.error('Error generating image:', error);
      toast.error('Failed to generate image. Please try again.');
      return null;
    } finally {
      setIsGenerating(false);
    }
  };

  const clearHistory = async () => {
    if (isAuthenticated && user) {
      try {
        // Get all user's images
        const { data, error } = await supabase
          .from('images')
          .select('storage_path');
          
        if (error) {
          throw error;
        }
        
        // Delete from storage
        if (data && data.length > 0) {
          const paths = data.map(item => item.storage_path);
          const { error: storageError } = await supabase
            .storage
            .from('images')
            .remove(paths);
            
          if (storageError) {
            console.error('Error removing from storage:', storageError);
          }
        }
        
        // Delete from images table
        const { error: deleteError } = await supabase
          .from('images')
          .delete()
          .eq('user_id', user.id);
          
        if (deleteError) {
          throw deleteError;
        }
        
        setHistory([]);
        toast.success('History cleared successfully!');
      } catch (error) {
        console.error('Error clearing history:', error);
        toast.error('Failed to clear history. Please try again.');
      }
    } else {
      setHistory([]);
      toast.success('History cleared successfully!');
    }
  };

  return (
    <ImageContext.Provider
      value={{
        generatedImages,
        isGenerating,
        generateImage,
        history,
        clearHistory,
      }}
    >
      {children}
    </ImageContext.Provider>
  );
};
