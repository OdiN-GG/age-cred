import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, RefreshControl, TouchableOpacity, Modal, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { StatCard } from '@/components/ui';
import { formatCurrency, getCurrentDate } from '@/utils';
import { getDashboardStats } from '@/services/database';
import { useClientStore, useLoanStore, useDebugStore } from '@/store';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ENABLE_TIME_TRAVEL } from '@/constants';

export default function Dashboard() {
  const [showDateModal, setShowDateModal] = useState(false);
  const [daysToAdd, setDaysToAdd] = useState('');
  const { simulatedDate, addDays, resetDate } = useDebugStore();
  const currentDate = getCurrentDate();

  const { fetchClients } = useClientStore();
  const { fetchLoans, updateInstallmentsStatus } = useLoanStore();
  const [stats, setStats] = useState({
    totalClients: 0,
    activeLoans: 0,
    totalLent: 0,
    totalReceived: 0,
    totalPending: 0,
    totalOverdue: 0,
  });
  const [refreshing, setRefreshing] = useState(false);

  const loadDashboard = async () => {
    try {
      await fetchClients();
      await fetchLoans();
      await updateInstallmentsStatus();
      const dashboardStats = await getDashboardStats();
      setStats(dashboardStats);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    }
  };

  const handleChangeDays = () => {
    const days = parseInt(daysToAdd);
    if (!isNaN(days)) {
      addDays(days);
      setShowDateModal(false);
      setDaysToAdd('');
      loadDashboard();
    }
  };

  const handleResetDate = () => {
    resetDate();
    setShowDateModal(false);
    loadDashboard();
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadDashboard();
    setRefreshing(false);
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        className="flex-1"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View className="p-4">
          <View className="mb-6">
            <View className="flex-row justify-between items-center">
              <View className="flex-1">
                <Text className="text-3xl font-bold text-gray-900">Dashboard</Text>
                <Text className="text-gray-600 mt-1">
                  {ENABLE_TIME_TRAVEL && simulatedDate ? (
                    <Text className="text-purple-600 font-semibold">
                      📅 {format(currentDate, "dd/MM/yyyy", { locale: ptBR })}
                    </Text>
                  ) : (
                    "Visão geral do seu negócio"
                  )}
                </Text>
              </View>
              {ENABLE_TIME_TRAVEL && (
                <TouchableOpacity
                  onPress={() => setShowDateModal(true)}
                  className={`px-4 py-2 rounded-lg ${simulatedDate ? 'bg-purple-600' : 'bg-gray-600'}`}
                >
                  <Ionicons name="time" size={20} color="white" />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Geral
            </Text>
            <View className="flex-row gap-3 mb-3">
              <StatCard
                title="Clientes"
                value={stats.totalClients.toString()}
                icon={<Ionicons name="people" size={24} color="#2563eb" />}
                color="blue"
              />
              <StatCard
                title="Empréstimos Ativos"
                value={stats.activeLoans.toString()}
                icon={<Ionicons name="cash" size={24} color="#16a34a" />}
                color="green"
              />
            </View>
          </View>

          <View className="mb-4">
            <Text className="text-lg font-semibold text-gray-900 mb-3">
              Financeiro
            </Text>
            <View className="gap-3">
              <StatCard
                title="Total Emprestado"
                value={formatCurrency(stats.totalLent)}
                icon={<Ionicons name="trending-up" size={24} color="#2563eb" />}
                color="blue"
              />
              <StatCard
                title="Total Recebido"
                value={formatCurrency(stats.totalReceived)}
                icon={<Ionicons name="checkmark-circle" size={24} color="#16a34a" />}
                color="green"
              />
              <StatCard
                title="A Receber"
                value={formatCurrency(stats.totalPending)}
                icon={<Ionicons name="time" size={24} color="#eab308" />}
                color="yellow"
              />
              <StatCard
                title="Em Atraso"
                value={formatCurrency(stats.totalOverdue)}
                icon={<Ionicons name="alert-circle" size={24} color="#ef4444" />}
                color="red"
              />
            </View>
          </View>

          {stats.totalOverdue > 0 && (
            <View className="bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
              <View className="flex-row items-center gap-2">
                <Ionicons name="warning" size={24} color="#ef4444" />
                <Text className="text-red-800 font-semibold flex-1">
                  Atenção! Você tem {formatCurrency(stats.totalOverdue)} em atraso
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {ENABLE_TIME_TRAVEL && (
        <Modal
          visible={showDateModal}
          transparent
          animationType="fade"
          onRequestClose={() => setShowDateModal(false)}
        >
          <View className="flex-1 justify-center items-center bg-black/50">
            <View className="bg-white rounded-2xl p-6 m-4 w-80">
              <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-900">Time Travel</Text>
                <TouchableOpacity onPress={() => setShowDateModal(false)}>
                  <Ionicons name="close" size={24} color="#6b7280" />
                </TouchableOpacity>
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-600 mb-2">Data Atual:</Text>
                <Text className="text-lg font-semibold text-gray-900">
                  {format(currentDate, "dd/MM/yyyy", { locale: ptBR })}
                </Text>
                {simulatedDate && (
                  <Text className="text-xs text-purple-600 mt-1">
                    ⚠️ Modo simulação ativo
                  </Text>
                )}
              </View>

              <View className="mb-4">
                <Text className="text-sm text-gray-700 mb-2">Avançar/Voltar dias:</Text>
                <TextInput
                  className="border border-gray-300 rounded-lg px-4 py-3 text-base"
                  placeholder="Ex: 7 (avançar) ou -7 (voltar)"
                  keyboardType="numeric"
                  value={daysToAdd}
                  onChangeText={setDaysToAdd}
                />
              </View>

              <View className="gap-3">
                <View className="flex-row gap-3">
                  <TouchableOpacity
                    onPress={() => { addDays(1); loadDashboard(); }}
                    className="flex-1 bg-blue-500 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-center">+1 dia</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => { addDays(7); loadDashboard(); }}
                    className="flex-1 bg-blue-600 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-center">+7 dias</Text>
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  onPress={handleChangeDays}
                  className="bg-purple-600 py-3 rounded-lg"
                >
                  <Text className="text-white font-semibold text-center">Aplicar</Text>
                </TouchableOpacity>

                {simulatedDate && (
                  <TouchableOpacity
                    onPress={handleResetDate}
                    className="bg-gray-500 py-3 rounded-lg"
                  >
                    <Text className="text-white font-semibold text-center">Resetar para Hoje</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}
