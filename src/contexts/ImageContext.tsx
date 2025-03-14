
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
      // Generate a variety of random categories for more reliable image generation
      const imageCategories = [
        'landscape', 'portrait', 'animal', 'nature', 'city', 'abstract', 
        'technology', 'food', 'architecture', 'art', 'space', 'ocean'
      ];
      
      // Create a timestamp to avoid caching issues
      const timestamp = Date.now();
      
      // Use multiple random values for more variety
      const randomCategory = imageCategories[Math.floor(Math.random() * imageCategories.length)];
      const randomSeed = Math.floor(Math.random() * 10000);
      
      // Use higher resolution images and multiple parameters to avoid caching
      const imageUrl = `https://source.unsplash.com/featured/800x800/?${randomCategory},${prompt.split(' ').join(',')}&sig=${randomSeed}&t=${timestamp}`;
      
      console.log("Attempting to generate image with URL:", imageUrl);
      
      // Pre-load the image to ensure it's valid
      await new Promise<void>((resolve, reject) => {
        const imgCheck = new Image();
        
        const timeoutId = setTimeout(() => {
          reject(new Error("Image loading timed out"));
        }, 15000); // 15 second timeout
        
        imgCheck.onload = () => {
          console.log("Image pre-fetch successful:", imgCheck.src);
          clearTimeout(timeoutId);
          resolve();
        };
        
        imgCheck.onerror = () => {
          console.error("Pre-fetch image failed, trying fallback");
          clearTimeout(timeoutId);
          
          // Try a different category as fallback
          const fallbackCategory = imageCategories[Math.floor(Math.random() * imageCategories.length)];
          imgCheck.src = `https://source.unsplash.com/featured/800x800/?${fallbackCategory}&sig=${Date.now()}`;
        };
        
        // Start loading the image
        imgCheck.crossOrigin = "anonymous";
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
          
          if (!blob || blob.size === 0) {
            throw new Error("Empty image blob received");
          }
          
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
