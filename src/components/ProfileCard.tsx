
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

type ProfileCardProps = {
  loading?: boolean;
};

const ProfileCard: React.FC<ProfileCardProps> = ({ loading = false }) => {
  const { user } = useAuth();
  
  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-2">
          <Skeleton className="h-6 w-24" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center space-x-4">
            <Skeleton className="h-16 w-16 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-48" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  // Extract initials from name for avatar fallback
  const getInitials = (name: string | undefined) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <CardTitle>Profile</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={user.avatarUrl || '/placeholder.svg'} alt={user.name || 'User'} />
            <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{user.name || 'Anonymous User'}</h3>
            <p className="text-sm text-gray-500">{user.email}</p>
            <div className="flex flex-wrap gap-2 mt-2">
              <Badge variant="outline" className="bg-imaginate-purple/10 text-imaginate-purple">
                {user.subscriptionTier === 'premium' ? 'Premium' : 'Free'} Account
              </Badge>
              <Badge variant="outline" className="bg-green-100 text-green-800">
                {user.credits || 0} Credits
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileCard;
