import React from 'react';
import { View, Text } from 'react-native';
import { Card } from './Card';

interface StatCardProps {
  title: string;
  value: string;
  icon?: React.ReactNode;
  color?: 'blue' | 'green' | 'red' | 'yellow' | 'gray';
  onPress?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  color = 'blue',
  onPress,
}) => {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    gray: 'bg-gray-100 text-gray-600',
  };

  return (
    <Card onPress={onPress} className="flex-1">
      <View className="flex-row items-center justify-between">
        <View className="flex-1">
          <Text className="text-gray-600 text-sm mb-1">{title}</Text>
          <Text className="text-gray-900 text-2xl font-bold">{value}</Text>
        </View>
        {icon && (
          <View className={`p-3 rounded-full ${colorClasses[color]}`}>
            {icon}
          </View>
        )}
      </View>
    </Card>
  );
};
