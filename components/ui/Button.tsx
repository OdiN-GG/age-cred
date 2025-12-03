import React from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-blue-600 active:bg-blue-700',
    secondary: 'bg-gray-600 active:bg-gray-700',
    danger: 'bg-red-600 active:bg-red-700',
    success: 'bg-green-600 active:bg-green-700',
    outline: 'bg-transparent border-2 border-blue-600 active:bg-blue-50',
  };

  const textVariantClasses = {
    primary: 'text-white',
    secondary: 'text-white',
    danger: 'text-white',
    success: 'text-white',
    outline: 'text-blue-600',
  };

  const sizeClasses = {
    sm: 'px-3 py-2',
    md: 'px-4 py-3',
    lg: 'px-6 py-4',
  };

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${fullWidth ? 'w-full' : 'w-2/4'}
        ${isDisabled ? 'opacity-50' : ''}
        rounded-lg
        flex-row
        items-center
        justify-center
        ${className}
      `}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'outline' ? '#2563eb' : '#ffffff'}
          size="small"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && <View>{icon}</View>}
          <Text
            className={`
              ${textVariantClasses[variant]}
              ${textSizeClasses[size]}
              font-semibold
            `}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};
