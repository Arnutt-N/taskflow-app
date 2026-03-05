// components/ui/Avatar.tsx
'use client';

interface AvatarProps {
  name: string;
}

export const Avatar = ({ name }: AvatarProps) => (
  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 text-white flex items-center justify-center text-[10px] font-bold shadow-sm ring-2 ring-white">
    {(name && name.charAt(0)) || '?'}
  </div>
);
