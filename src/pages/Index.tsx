
import React, { useRef } from 'react';
import Navbar from '@/components/Navbar';
import Hero from '@/components/Hero';
import ImageGenerator from '@/components/ImageGenerator';

const Index = () => {
  const generatorRef = useRef<HTMLDivElement>(null);

  const scrollToGenerator = () => {
    generatorRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow">
        <Hero scrollToGenerator={scrollToGenerator} />
        
        <div 
          ref={generatorRef}
          className="max-w-6xl mx-auto py-16 px-4"
        >
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-imaginate-dark">
              Create Your Image
            </h2>
            <p className="text-gray-600 mt-2">
              Describe what you want to see, and let AI do the rest
            </p>
          </div>
          
          <ImageGenerator />
        </div>

        {/* Features Section */}
        <div className="bg-gray-50 py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-imaginate-dark">
                Experience the Power of AI
              </h2>
              <p className="text-gray-600 mt-2">
                Create stunning visuals with just a few words
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-imaginate-purple/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl text-imaginate-purple">✨</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Unlimited Creativity</h3>
                <p className="text-gray-600">
                  From realistic photos to artistic illustrations, generate any style you can imagine.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-imaginate-blue/10 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl text-imaginate-blue">⚡</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
                <p className="text-gray-600">
                  Create stunning images in seconds, no waiting or complex software needed.
                </p>
              </div>
              
              <div className="bg-white p-6 rounded-lg shadow-sm">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-4">
                  <span className="text-xl text-green-600">🔒</span>
                </div>
                <h3 className="text-xl font-semibold mb-2">Secure & Private</h3>
                <p className="text-gray-600">
                  Your prompts and creations are yours alone, with secure cloud storage.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-white border-t py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-gray-500">
            © {new Date().getFullYear()} Imaginate. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
