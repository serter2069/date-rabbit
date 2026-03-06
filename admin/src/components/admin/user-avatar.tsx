import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { getInitials } from '@/lib/utils';

interface UserAvatarProps {
  name: string | null;
  avatarUrl: string | null;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'h-7 w-7 text-xs',
  md: 'h-9 w-9 text-sm',
  lg: 'h-12 w-12 text-base',
};

export function UserAvatar({ name, avatarUrl, size = 'md' }: UserAvatarProps) {
  return (
    <Avatar className={sizeClasses[size]}>
      {avatarUrl && <AvatarImage src={avatarUrl} alt={name || 'User'} />}
      <AvatarFallback className="bg-rose-100 text-rose-700 dark:bg-rose-900 dark:text-rose-200">
        {getInitials(name)}
      </AvatarFallback>
    </Avatar>
  );
}
