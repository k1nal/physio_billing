import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useBillingStore } from '@/store/billingStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function DashboardScreen() {
  const { getDashboardStats, invoices } = useBillingStore();
  const stats = getDashboardStats();
  
  const recentInvoices = invoices
    .sort((a, b) => new Date(b.issuedOn).getTime() - new Date(a.issuedOn).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.title}>Dashboard</Text>
        <Text style={styles.subtitle}>Physio Billing</Text>
      </View>

      {/* Quick Actions */}
      <Card>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionButtons}>
          <Link href="/invoice/create" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="add-circle" size={24} color="#FF6B35" />
              <Text style={styles.actionText}>New Invoice</Text>
            </TouchableOpacity>
          </Link>
          <Link href="/reports" asChild>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons name="bar-chart" size={24} color="#FF6B35" />
              <Text style={styles.actionText}>View Reports</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </Card>

      {/* Stats Cards */}
      <View style={styles.statsGrid}>
        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="wallet" size={24} color="#34C759" />
            <Text style={styles.statValue}>{formatCurrency(stats.totalRevenue)}</Text>
          </View>
          <Text style={styles.statLabel}>Total Revenue</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="time" size={24} color="#FF9500" />
            <Text style={styles.statValue}>{formatCurrency(stats.outstandingAmount)}</Text>
          </View>
          <Text style={styles.statLabel}>Outstanding</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="people" size={24} color="#007AFF" />
            <Text style={styles.statValue}>{stats.totalPatients}</Text>
          </View>
          <Text style={styles.statLabel}>Patients</Text>
        </Card>

        <Card style={styles.statCard}>
          <View style={styles.statHeader}>
            <Ionicons name="document-text" size={24} color="#5856D6" />
            <Text style={styles.statValue}>{stats.totalInvoices}</Text>
          </View>
          <Text style={styles.statLabel}>Invoices</Text>
        </Card>
      </View>

      {/* Recent Invoices */}
      <Card>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Invoices</Text>
          <Link href="/reports" asChild>
            <TouchableOpacity>
              <Text style={styles.seeAllText}>See All</Text>
            </TouchableOpacity>
          </Link>
        </View>
        
        {recentInvoices.length === 0 ? (
          <Text style={styles.emptyText}>No invoices yet</Text>
        ) : (
          recentInvoices.map((invoice) => {
            const patient = useBillingStore.getState().getPatientById(invoice.patientId);
            return (
              <Link key={invoice.id} href={`/invoice/${invoice.id}`} asChild>
                <TouchableOpacity style={styles.invoiceItem}>
                  <View style={styles.invoiceInfo}>
                    <Text style={styles.patientName}>{patient?.name || 'Unknown'}</Text>
                    <Text style={styles.invoiceDate}>
                      {new Date(invoice.issuedOn).toLocaleDateString()}
                    </Text>
                  </View>
                  <View style={styles.invoiceAmount}>
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
                </TouchableOpacity>
              </Link>
            );
          })
        )}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C1C1E',
  },
  header: {
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 16,
    color: '#8E8E93',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  seeAllText: {
    color: '#FF6B35',
    fontSize: 16,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
  },
  actionText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '500',
    color: '#FF6B35',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 16,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 4,
  },
  invoiceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  invoiceInfo: {
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
  invoiceAmount: {
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
