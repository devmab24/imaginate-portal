
import React from 'react';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface HeroProps {
  scrollToGenerator: () => void;
}

const Hero: React.FC<HeroProps> = ({ scrollToGenerator }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="bg-hero-gradient py-16 px-4 sm:py-24">
      <div className="max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-imaginate-purple/10 text-imaginate-purple mb-8">
          <Sparkles size={16} className="mr-2" />
          <span className="text-sm font-medium">AI-Powered Image Generation</span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-bold text-imaginate-dark mb-6">
          Transform your <span className="text-imaginate-purple">ideas</span> into stunning <span className="text-imaginate-blue">images</span>
        </h1>
        
        <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
          Just type a description, and watch as AI brings your imagination to life with beautiful, detailed images in seconds.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            onClick={scrollToGenerator}
            className="flex items-center text-base px-8"
          >
            Create Now
            <ArrowRight size={16} className="ml-2" />
          </Button>
          
          {!isAuthenticated && (
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                // Find an account icon in the Navbar and trigger it
                const accountButton = document.querySelector('nav button:not([class*="md:hidden"])');
                if (accountButton) {
                  (accountButton as HTMLButtonElement).click();
                }
              }}
              className="text-base px-8"
            >
              Create Account
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Hero;
