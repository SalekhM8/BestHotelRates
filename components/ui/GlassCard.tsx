import React from 'react';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  size?: 'small' | 'medium' | 'large';
  onClick?: () => void;
  hover?: boolean;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className = '',
  size = 'medium',
  onClick,
  hover = true,
}) => {
  const sizeClasses = {
    small: 'glass-card-small p-4',
    medium: 'glass-card p-6',
    large: 'glass-card p-8',
  };

  return (
    <div
      className={`${sizeClasses[size]} ${!hover ? 'hover:transform-none hover:shadow-none' : ''} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
};

