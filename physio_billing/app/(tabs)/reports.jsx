import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBillingStore } from '@/store/billingStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function ReportsScreen() {
  const { invoices, patients, getDashboardStats, getPatientById } = useBillingStore();
  const [selectedPeriod, setSelectedPeriod] = useState('month');
  
  const stats = getDashboardStats();
  
  const getFilteredInvoices = () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startOfWeek = new Date(startOfDay);
    startOfWeek.setDate(startOfDay.getDate() - startOfDay.getDay());
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    
    let startDate;
    switch (selectedPeriod) {
      case 'today':
        startDate = startOfDay;
        break;
      case 'week':
        startDate = startOfWeek;
        break;
      case 'month':
        startDate = startOfMonth;
        break;
    }
    
    return invoices.filter(invoice => new Date(invoice.issuedOn) >= startDate);
  };

  const filteredInvoices = getFilteredInvoices();
  const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid');
  const unpaidInvoices = filteredInvoices.filter(inv => inv.status === 'unpaid');
  
  const periodRevenue = paidInvoices.reduce((sum, inv) => sum + inv.total, 0);
  const periodOutstanding = unpaidInvoices.reduce((sum, inv) => sum + inv.total, 0);

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  const exportData = () => {
    // This would implement CSV export functionality
    console.log('Export data functionality would be implemented here');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Reports</Text>
        <TouchableOpacity onPress={exportData} style={styles.exportButton}>
          <Ionicons name="download" size={20} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Period Selector */}
        <Card>
          <Text style={styles.sectionTitle}>Period</Text>
          <View style={styles.periodSelector}>
            {['today', 'week', 'month'].map((period) => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.selectedPeriod
                ]}
                onPress={() => setSelectedPeriod(period)}
              >
                <Text style={[
                  styles.periodText,
                  selectedPeriod === period && styles.selectedPeriodText
                ]}>
                  {period.charAt(0).toUpperCase() + period.slice(1)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Card>

        {/* Period Stats */}
        <View style={styles.statsGrid}>
          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="trending-up" size={24} color="#34C759" />
              <Text style={styles.statValue}>{formatCurrency(periodRevenue)}</Text>
            </View>
            <Text style={styles.statLabel}>Revenue ({selectedPeriod})</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="time" size={24} color="#FF9500" />
              <Text style={styles.statValue}>{formatCurrency(periodOutstanding)}</Text>
            </View>
            <Text style={styles.statLabel}>Outstanding ({selectedPeriod})</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="document-text" size={24} color="#007AFF" />
              <Text style={styles.statValue}>{filteredInvoices.length}</Text>
            </View>
            <Text style={styles.statLabel}>Invoices ({selectedPeriod})</Text>
          </Card>

          <Card style={styles.statCard}>
            <View style={styles.statHeader}>
              <Ionicons name="checkmark-circle" size={24} color="#34C759" />
              <Text style={styles.statValue}>{paidInvoices.length}</Text>
            </View>
            <Text style={styles.statLabel}>Paid ({selectedPeriod})</Text>
          </Card>
        </View>

        {/* Overall Stats */}
        <Card>
          <Text style={styles.sectionTitle}>Overall Statistics</Text>
          <View style={styles.overallStats}>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatLabel}>Total Revenue</Text>
              <Text style={styles.overallStatValue}>{formatCurrency(stats.totalRevenue)}</Text>
            </View>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatLabel}>Total Outstanding</Text>
              <Text style={styles.overallStatValue}>{formatCurrency(stats.outstandingAmount)}</Text>
            </View>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatLabel}>Total Patients</Text>
              <Text style={styles.overallStatValue}>{stats.totalPatients}</Text>
            </View>
            <View style={styles.overallStatItem}>
              <Text style={styles.overallStatLabel}>Total Invoices</Text>
              <Text style={styles.overallStatValue}>{stats.totalInvoices}</Text>
            </View>
          </View>
        </Card>

        {/* Outstanding Payments */}
        <Card>
          <Text style={styles.sectionTitle}>Outstanding Payments</Text>
          {unpaidInvoices.length === 0 ? (
            <Text style={styles.emptyText}>No outstanding payments</Text>
          ) : (
            unpaidInvoices.map((invoice) => {
              const patient = getPatientById(invoice.patientId);
              return (
                <View key={invoice.id} style={styles.outstandingItem}>
                  <View style={styles.outstandingInfo}>
                    <Text style={styles.patientName}>{patient?.name || 'Unknown'}</Text>
                    <Text style={styles.invoiceDate}>
                      {new Date(invoice.issuedOn).toLocaleDateString()}
                    </Text>
                  </View>
                  <Text style={styles.outstandingAmount}>
                    {formatCurrency(invoice.total)}
                  </Text>
                </View>
              );
            })
          )}
        </Card>

        {/* Recent Transactions */}
        <Card>
          <Text style={styles.sectionTitle}>Recent Transactions</Text>
          {filteredInvoices.length === 0 ? (
            <Text style={styles.emptyText}>No transactions in selected period</Text>
          ) : (
            filteredInvoices
              .sort((a, b) => new Date(b.issuedOn).getTime() - new Date(a.issuedOn).getTime())
              .slice(0, 10)
              .map((invoice) => {
                const patient = getPatientById(invoice.patientId);
                return (
                  <View key={invoice.id} style={styles.transactionItem}>
                    <View style={styles.transactionInfo}>
                      <Text style={styles.patientName}>{patient?.name || 'Unknown'}</Text>
                      <Text style={styles.invoiceDate}>
                        {new Date(invoice.issuedOn).toLocaleDateString()}
                      </Text>
                    </View>
                    <View style={styles.transactionAmount}>
                      <Text style={styles.amountText}>{formatCurrency(invoice.total)}</Text>
                      <View style={[
                        styles.statusBadge,
                        invoice.status === 'paid' ? styles.paidBadge : styles.unpaidBadge
                      ]}>
                        <Text style={[
                          styles.statusText,
                          invoice.status === 'paid' ? styles.paidText : styles.unpaidText
                        ]}>
                          {invoice.status.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
          )}
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  exportButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  periodSelector: {
    flexDirection: 'row',
    gap: 8,
  },
  periodButton: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
  },
  selectedPeriod: {
    backgroundColor: '#007AFF',
  },
  periodText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  selectedPeriodText: {
    color: '#fff',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
  },
  overallStats: {
    gap: 12,
  },
  overallStatItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  overallStatLabel: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  overallStatValue: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  outstandingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  outstandingInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  outstandingAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF9500',
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionAmount: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 4,
  },
  paidBadge: {
    backgroundColor: '#E8F5E8',
  },
  unpaidBadge: {
    backgroundColor: '#FFF2E8',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  paidText: {
    color: '#34C759',
  },
  unpaidText: {
    color: '#FF9500',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
    paddingVertical: 20,
  },
});
