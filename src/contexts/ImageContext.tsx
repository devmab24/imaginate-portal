
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useAuth } from './AuthContext';

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
  const { user } = useAuth();

  // Load history from localStorage on component mount
  useEffect(() => {
    if (user) {
      try {
        const savedHistory = localStorage.getItem(`imageHistory-${user.id}`);
        if (savedHistory) {
          setHistory(JSON.parse(savedHistory));
        }
      } catch (error) {
        console.error('Error loading image history:', error);
      }
    } else {
      setHistory([]);
    }
  }, [user]);

  // Save history to localStorage when it changes
  useEffect(() => {
    if (user && history.length > 0) {
      localStorage.setItem(`imageHistory-${user.id}`, JSON.stringify(history));
    }
  }, [history, user]);

  const generateImage = async (prompt: string): Promise<GeneratedImage | null> => {
    if (!prompt.trim()) {
      toast.error('Please enter a prompt.');
      return null;
    }

    setIsGenerating(true);

    try {
      // Simulate API call to DALL-E with a timeout
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Create a more reliable image URL for testing
      // Instead of using dynamic search queries which might not return results,
      // we'll use a more reliable approach
      
      // Generate a random number to avoid caching issues
      const randomSeed = Math.floor(Math.random() * 1000);
      
      // Use a fixed category that always returns images
      const imageCategories = ['nature', 'technology', 'abstract', 'art', 'space'];
      const randomCategory = imageCategories[Math.floor(Math.random() * imageCategories.length)];
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        prompt,
        // Use a reliable image source with random seed to avoid caching
        imageUrl: `https://source.unsplash.com/featured/600x600/?${randomCategory}&sig=${randomSeed}`,
        createdAt: new Date().toISOString(),
      };

      console.log("Attempting to generate image with URL:", newImage.imageUrl);
      
      // Pre-fetch the image to ensure it's valid
      const imgCheck = new Image();
      
      await new Promise<void>((resolve) => {
        imgCheck.onload = () => {
          console.log("Image pre-fetch successful");
          resolve();
        };
        
        imgCheck.onerror = () => {
          console.error("Pre-fetch image failed, using fallback");
          // Use a very reliable fallback that always works
          newImage.imageUrl = `https://picsum.photos/seed/${randomSeed}/600/600`;
          resolve();
        };
        
        // Start loading the image
        imgCheck.src = newImage.imageUrl;
      });

      console.log("Generated image with final URL:", newImage.imageUrl);
      
      setGeneratedImages(prev => [newImage, ...prev]);
      
      // Add to history if user is logged in
      if (user) {
        setHistory(prev => [newImage, ...prev]);
      }
      
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

  const clearHistory = () => {
    if (user) {
      localStorage.removeItem(`imageHistory-${user.id}`);
    }
    setHistory([]);
    toast.success('History cleared successfully!');
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
