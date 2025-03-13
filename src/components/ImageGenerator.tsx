
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Wand2, 
  Download,
  Loader2 
} from 'lucide-react';
import { useImage, GeneratedImage } from '@/contexts/ImageContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Card } from '@/components/ui/card';

const ImageGenerator = () => {
  const [prompt, setPrompt] = useState('');
  const { generateImage, isGenerating } = useImage();
  const { isAuthenticated } = useAuth();
  const [currentImage, setCurrentImage] = useState<GeneratedImage | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) {
      toast.error('Please enter a prompt');
      return;
    }

    const result = await generateImage(prompt);
    if (result) {
      setCurrentImage(result);
      setPrompt('');
    }
  };

  const handleDownload = async () => {
    if (!currentImage) return;
    
    try {
      const response = await fetch(currentImage.imageUrl);
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
            <img 
              src={currentImage.imageUrl} 
              alt={currentImage.prompt}
              className="w-full h-auto object-cover rounded-t-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <Button 
                onClick={handleDownload}
                variant="secondary"
                className="flex items-center space-x-2"
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
