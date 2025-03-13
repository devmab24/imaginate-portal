
import React from 'react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { Image, Plus } from 'lucide-react';

interface EmptyStateProps {
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description, action }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 bg-imaginate-purple/10 rounded-full flex items-center justify-center mb-6">
        <Image className="text-imaginate-purple" size={24} />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-md mb-6">{description}</p>
      
      {action && (
        <Button onClick={action.onClick} className="flex items-center">
          <Plus size={16} className="mr-2" />
          {action.label}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
