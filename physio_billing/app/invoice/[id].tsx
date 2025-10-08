import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, router } from 'expo-router';
import { useBillingStore } from '@/store/billingStore';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { generateInvoicePDF, shareInvoicePDF, getDefaultClinicInfo } from '@/utils/pdfGenerator';

export default function InvoiceDetailsScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { 
    invoices, 
    getPatientById, 
    getServiceById, 
    markInvoicePaid, 
    deleteInvoice 
  } = useBillingStore();
  
  const [loading, setLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  const invoice = invoices.find(inv => inv.id === id);
  const patient = invoice ? getPatientById(invoice.patientId) : null;

  if (!invoice || !patient) {
    return (
      <View style={styles.container}>
        <Card>
          <Text style={styles.errorText}>Invoice not found</Text>
          <Button title="Go Back" onPress={() => router.back()} />
        </Card>
      </View>
    );
  }

  const handleMarkPaid = async () => {
    Alert.alert(
      'Mark as Paid',
      'Are you sure you want to mark this invoice as paid?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          onPress: async () => {
            setLoading(true);
            try {
              await markInvoicePaid(invoice.id);
              Alert.alert('Success', 'Invoice marked as paid');
            } catch (error) {
              Alert.alert('Error', 'Failed to update invoice');
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Invoice',
      'Are you sure you want to delete this invoice? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInvoice(invoice.id);
              router.back();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete invoice');
            }
          },
        },
      ]
    );
  };

  const handleGeneratePDF = async () => {
    setPdfLoading(true);
    try {
      const services = invoice.items.map(item => {
        const service = getServiceById(item.serviceId);
        return service || { id: item.serviceId, name: 'Unknown Service', price: item.unitPrice };
      });

      const pdfData = {
        invoice,
        patient,
        services,
        clinicInfo: getDefaultClinicInfo(),
      };

      const fileUri = await generateInvoicePDF(pdfData);
      
      Alert.alert(
        'PDF Generated',
        'Invoice PDF has been generated successfully!',
        [
          { text: 'OK' },
          {
            text: 'Share',
            onPress: () => shareInvoicePDF(fileUri),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to generate PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;
  const formatDate = (date: Date | string) => new Date(date).toLocaleDateString();

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Invoice Header */}
        <Card>
          <View style={styles.invoiceHeader}>
            <View>
              <Text style={styles.invoiceTitle}>Invoice #{invoice.id.slice(-8).toUpperCase()}</Text>
              <Text style={styles.invoiceDate}>Issued: {formatDate(invoice.issuedOn)}</Text>
              {invoice.paidOn && (
                <Text style={styles.paidDate}>Paid: {formatDate(invoice.paidOn)}</Text>
              )}
            </View>
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
        </Card>

        {/* Patient Information */}
        <Card>
          <Text style={styles.sectionTitle}>Patient Information</Text>
          <View style={styles.patientInfo}>
            <Text style={styles.patientName}>{patient.name}</Text>
            <Text style={styles.patientDetails}>Phone: {patient.phone}</Text>
            <Text style={styles.patientDetails}>Age: {patient.age}</Text>
            {patient.notes && (
              <Text style={styles.patientNotes}>Notes: {patient.notes}</Text>
            )}
          </View>
        </Card>

        {/* Services */}
        <Card>
          <Text style={styles.sectionTitle}>Services</Text>
          {invoice.items.map((item) => {
            const service = getServiceById(item.serviceId);
            const serviceName = service?.name || 'Unknown Service';
            const amount = item.quantity * item.unitPrice;

            return (
              <View key={item.id} style={styles.serviceItem}>
                <View style={styles.serviceInfo}>
                  <Text style={styles.serviceName}>{serviceName}</Text>
                  <Text style={styles.serviceDetails}>
                    {formatCurrency(item.unitPrice)} × {item.quantity}
                  </Text>
                </View>
                <Text style={styles.serviceAmount}>{formatCurrency(amount)}</Text>
              </View>
            );
          })}
        </Card>

        {/* Invoice Totals */}
        <Card>
          <Text style={styles.sectionTitle}>Invoice Summary</Text>
          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatCurrency(invoice.subtotal)}</Text>
            </View>
            
            {invoice.discount > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount ({invoice.discount}%):</Text>
                <Text style={styles.totalValue}>
                  -{formatCurrency(invoice.subtotal * (invoice.discount / 100))}
                </Text>
              </View>
            )}
            
            {invoice.taxRate > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({invoice.taxRate}%):</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency((invoice.subtotal - invoice.subtotal * (invoice.discount / 100)) * (invoice.taxRate / 100))}
                </Text>
              </View>
            )}
            
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>{formatCurrency(invoice.total)}</Text>
            </View>
          </View>
        </Card>

        {/* Notes */}
        {invoice.notes && (
          <Card>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{invoice.notes}</Text>
          </Card>
        )}

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <Button
            title="Generate PDF"
            onPress={handleGeneratePDF}
            loading={pdfLoading}
            variant="secondary"
          />
          
          {invoice.status === 'unpaid' && (
            <Button
              title="Mark as Paid"
              onPress={handleMarkPaid}
              loading={loading}
            />
          )}
          
          <Button
            title="Delete Invoice"
            onPress={handleDelete}
            variant="danger"
          />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  invoiceDate: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 4,
  },
  paidDate: {
    fontSize: 14,
    color: '#34C759',
    marginTop: 2,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  paidBadge: {
    backgroundColor: '#E8F5E8',
  },
  unpaidBadge: {
    backgroundColor: '#FFF2E8',
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
  },
  paidText: {
    color: '#34C759',
  },
  unpaidText: {
    color: '#FF9500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  patientInfo: {
    gap: 4,
  },
  patientName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  patientDetails: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  patientNotes: {
    fontSize: 14,
    color: '#6D6D70',
    fontStyle: 'italic',
    marginTop: 8,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  serviceDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  serviceAmount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  totalsSection: {
    gap: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: 16,
    color: '#1C1C1E',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  finalTotal: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#C7C7CC',
  },
  finalTotalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  finalTotalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1C1C1E',
  },
  notesText: {
    fontSize: 16,
    color: '#1C1C1E',
    lineHeight: 24,
  },
  actionsContainer: {
    gap: 12,
    marginVertical: 24,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 20,
  },
});
