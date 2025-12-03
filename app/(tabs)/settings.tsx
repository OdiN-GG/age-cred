import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '@/components/ui';

export default function Settings() {
  const handleExportData = () => {
    Alert.alert(
      'Exportar Dados',
      'Funcionalidade em desenvolvimento',
      [{ text: 'OK' }]
    );
  };

  const handleBackup = () => {
    Alert.alert(
      'Backup',
      'Funcionalidade em desenvolvimento',
      [{ text: 'OK' }]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'Sobre',
      'Age Cred v1.0.0\nApp de gerenciamento de empréstimos',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <View className="p-4 border-b border-gray-200 bg-white">
        <Text className="text-2xl font-bold text-gray-900">Configurações</Text>
      </View>

      <ScrollView className="flex-1">
        <View className="p-4 gap-3">
          <Card>
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={handleExportData}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="download" size={24} color="#2563eb" />
                <Text className="text-base text-gray-900">Exportar Dados</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </Card>

          <Card>
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={handleBackup}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="cloud-upload" size={24} color="#16a34a" />
                <Text className="text-base text-gray-900">Backup</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </Card>

          <Card>
            <TouchableOpacity
              className="flex-row items-center justify-between py-2"
              onPress={handleAbout}
            >
              <View className="flex-row items-center gap-3">
                <Ionicons name="information-circle" size={24} color="#6b7280" />
                <Text className="text-base text-gray-900">Sobre</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </Card>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
