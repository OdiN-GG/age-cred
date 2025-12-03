import React from 'react';
import { View, TouchableOpacity } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  onPress,
  className = '',
}) => {
  const cardClasses = `
    bg-white
    rounded-xl
    p-4
    shadow-sm
    border
    border-gray-200
    ${className}
  `;

  if (onPress) {
    return (
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.7}
        className={cardClasses}
      >
        {children}
      </TouchableOpacity>
    );
  }

  return <View className={cardClasses}>{children}</View>;
};
