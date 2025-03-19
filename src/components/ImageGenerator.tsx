
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wand2, 
  Download,
  Loader2,
  ImageIcon
} from 'lucide-react';
import { useImage } from '@/contexts/ImageContext';
import { GeneratedImage } from '@/types/database';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const { generateImage, isGenerating } = useImage();
  const { isAuthenticated } = useAuth();
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [progress, setProgress] = useState(0);

  // Reset image states when a new image is being generated
  useEffect(() => {
    if (isGenerating) {
      setImageLoaded(false);
      setImageError(false);
      
      // Simulate loading progress
      setProgress(0);
      const interval = setInterval(() => {
        setProgress(prev => {
          const newProgress = prev + 10;
          return newProgress > 90 ? 90 : newProgress;
        });
      }, 500);
      
      return () => clearInterval(interval);
    }
  }, [isGenerating]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    // Reset image states
    setImageLoaded(false);
    setImageError(false);
    
    const result = await generateImage(prompt);
    if (result) {
      console.log("Image generation successful, URL:", result.imageUrl);
      setCurrentImage(result);
      setPrompt('');
      setProgress(100);
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    
    try {
      // Add a timestamp parameter to avoid cache issues
      const imageUrl = currentImage.imageUrl.includes('?') 
        ? `${currentImage.imageUrl}&t=${Date.now()}` 
        : `${currentImage.imageUrl}?t=${Date.now()}`;
        
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      
      // Create a download link and trigger it
      const downloadLink = document.createElement('a');
      downloadLink.href = URL.createObjectURL(blob);
      downloadLink.download = `imaginate-${currentImage.id}.jpg`;
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
    console.log("Image loaded successfully");
    setImageLoaded(true);
    setImageError(false);
    setProgress(100);
  };

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>) => {
    console.error("Image failed to load:", currentImage?.imageUrl);
    setImageError(true);
    setImageLoaded(false);
    
    // Try to reload the image with a cache-busting parameter
    if (currentImage && !currentImage.imageUrl.includes('t=')) {
      const newUrl = currentImage.imageUrl.includes('?') 
        ? `${currentImage.imageUrl}&t=${Date.now()}` 
        : `${currentImage.imageUrl}?t=${Date.now()}`;
      
      console.log("Attempting to load image with cache-busting:", newUrl);
      e.currentTarget.src = newUrl;
    } else {
      e.currentTarget.src = "/placeholder.svg";
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt" className="text-lg font-medium">
            What would you like to create?
          </Label>
          <div className="flex gap-2">
            <Input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="A cyberpunk cat astronaut exploring a nebula"
              className="flex-1"
              disabled={isGenerating}
            />
            <Button type="submit" disabled={isGenerating || !prompt.trim()}>
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Wand2 className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </div>
          {!isAuthenticated && (
            <p className="text-sm text-imaginate-gray mt-2">
              <span className="font-medium">Sign in</span> to save your generated images
            </p>
          )}
        </div>
      </form>

      {isGenerating && (
        <div className="mt-8 p-8 border-2 border-dashed border-imaginate-gray/30 rounded-lg flex flex-col items-center justify-center">
          <div className="w-full max-w-md mb-4">
            <Progress value={progress} className="h-2 bg-gray-100" />
          </div>
          <div className="relative w-16 h-16 mb-4">
            <div className="absolute inset-0 bg-gradient-to-r from-imaginate-purple to-imaginate-blue opacity-20 rounded-full animate-pulse"></div>
            <Loader2 className="animate-spin absolute inset-0 m-auto text-imaginate-purple" size={32} />
          </div>
          <p className="text-xl font-medium text-imaginate-gray animate-pulse-opacity">Creating your masterpiece...</p>
          <p className="text-sm text-imaginate-gray/70 mt-2">This may take a few moments</p>
        </div>
      )}

      {currentImage && !isGenerating && (
        <Card className="mt-8 overflow-hidden">
          <div className="relative group">
            {!imageLoaded && !imageError && (
              <div className="w-full aspect-square flex items-center justify-center bg-gray-100">
                <Skeleton className="w-full h-full absolute" />
                <Loader2 className="animate-spin text-imaginate-purple z-10" size={48} />
              </div>
            )}
            
            <img 
              src={currentImage.imageUrl} 
              alt={currentImage.prompt}
              className={`w-full h-auto object-cover rounded-t-lg ${!imageLoaded && !imageError ? 'hidden' : ''}`}
              onLoad={handleImageLoad}
              onError={handleImageError}
              crossOrigin="anonymous"
            />
            
            {imageError && (
              <div className="w-full aspect-square flex flex-col items-center justify-center bg-gray-100 text-gray-500">
                <ImageIcon size={48} />
                <p className="mt-2">Could not load image</p>
                <Button 
                  onClick={() => {
                    if (currentImage) {
                      const reloadUrl = `${currentImage.imageUrl}?reload=${Date.now()}`;
                      const img = document.createElement('img');
                      img.src = reloadUrl;
                      img.onload = () => {
                        setCurrentImage({...currentImage, imageUrl: reloadUrl});
                        setImageError(false);
                      };
                    }
                  }}
                  variant="outline"
                  size="sm"
                  className="mt-2"
                >
                  Try Again
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
          
          <div className="p-4">
            <h3 className="font-medium text-lg">"{currentImage.prompt}"</h3>
            <div className="flex justify-between items-center mt-4">
              <span className="text-sm text-gray-500">
                {new Date(currentImage.createdAt).toLocaleString()}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-imaginate-purple"
                onClick={handleDownload}
                disabled={imageError}
              >
                <Download size={16} className="mr-1" />
                Download
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default ImageGenerator;
