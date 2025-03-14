
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Download, ImageIcon, RefreshCw } from 'lucide-react';
import { GeneratedImage } from '@/contexts/ImageContext';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface ImageCardProps {
  image: GeneratedImage;
}

const ImageCard: React.FC<ImageCardProps> = ({ image }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(image.imageUrl);
  const { isAuthenticated } = useAuth();
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const refreshSignedUrl = async () => {
      if (isAuthenticated && image.imageUrl.includes('token=') && image.imageUrl.includes('supabase')) {
        try {
          const pathMatch = image.imageUrl.match(/\/storage\/v1\/object\/public\/images\/([^?]+)/);
          if (pathMatch && pathMatch[1]) {
            const path = decodeURIComponent(pathMatch[1]);
            
            const { data, error } = await supabase
              .storage
              .from('images')
              .createSignedUrl(path, 60 * 60);
              
            if (error) {
              throw error;
            }
            
            if (data) {
              setImageUrl(data.signedUrl);
            }
          }
        } catch (error) {
          console.error('Error refreshing signed URL:', error);
        }
      }
    };
    
    refreshSignedUrl();
  }, [image.imageUrl, isAuthenticated]);

  const handleDownload = async () => {
    try {
      // Add cache-busting parameter
      const downloadUrl = imageUrl.includes('?') 
        ? `${imageUrl}&t=${Date.now()}` 
        : `${imageUrl}?t=${Date.now()}`;
      
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `imaginate-${image.id}.jpg`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
      
      toast.success('Image downloaded successfully');
    } catch (error) {
      console.error('Error downloading image:', error);
      toast.error('Failed to download image');
    }
  };

  const handleImageLoad = () => {
    console.log("Image loaded successfully:", imageUrl);
    setImageLoaded(true);
    setImageError(false);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image failed to load:", imageUrl);
    
    // Try to reload with cache busting if we haven't tried too many times
    if (retryCount < 2) {
      setRetryCount(prev => prev + 1);
      const newUrl = imageUrl.includes('?') 
        ? `${imageUrl}&retry=${Date.now()}` 
        : `${imageUrl}?retry=${Date.now()}`;
      console.log("Retrying with new URL:", newUrl);
      setImageUrl(newUrl);
    } else {
      setImageError(true);
      setImageLoaded(false);
      e.currentTarget.src = "/placeholder.svg";
    }
  };

  const handleRetry = () => {
    setImageError(false);
    setRetryCount(0);
    
    // Create a new URL with cache busting
    const refreshedUrl = imageUrl.includes('?') 
      ? imageUrl.split('?')[0] + `?refresh=${Date.now()}` 
      : `${imageUrl}?refresh=${Date.now()}`;
    
    console.log("Manually retrying with URL:", refreshedUrl);
    setImageUrl(refreshedUrl);
  };

  return (
    <Card className="overflow-hidden h-full flex flex-col">
      <div className="relative group aspect-square">
        {!imageLoaded && !imageError && (
          <div className="w-full h-full flex items-center justify-center bg-gray-100">
            <Skeleton className="w-full h-full absolute" />
            <div className="animate-pulse w-12 h-12 rounded-full bg-gray-200 z-10"></div>
          </div>
        )}
        
        <img 
          src={imageUrl} 
          alt={image.prompt}
          className={`w-full h-full object-cover rounded-t-lg ${!imageLoaded && !imageError ? 'hidden' : ''}`}
          loading="lazy"
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
        
        {imageError && (
          <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500">
            <ImageIcon size={32} />
            <p className="mt-2 text-xs">Image not available</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2 flex items-center gap-1"
              onClick={handleRetry}
            >
              <RefreshCw size={14} />
              <span>Retry</span>
            </Button>
          </div>
        )}
        
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <Button 
            onClick={handleDownload}
            variant="secondary"
            className="flex items-center space-x-2"
            disabled={imageError}
          >
            <Download size={16} />
            <span>Download</span>
          </Button>
        </div>
      </div>
      
      <div className="p-3 flex flex-col flex-grow">
        <h3 className="font-medium text-sm line-clamp-2 flex-grow">
          "{image.prompt}"
        </h3>
        <div className="flex justify-between items-center mt-2">
          <span className="text-xs text-gray-500">
            {new Date(image.createdAt).toLocaleDateString()}
          </span>
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-imaginate-purple hover:bg-imaginate-purple/10 h-8 px-2"
            onClick={handleDownload}
            disabled={imageError}
          >
            <Download size={14} />
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default ImageCard;
