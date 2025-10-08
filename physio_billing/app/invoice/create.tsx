import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useBillingStore } from '@/store/billingStore';
import { Patient, Service, InvoiceItem } from '@/types';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SearchBar } from '@/components/ui/SearchBar';
import { Modal } from '@/components/ui/Modal';

export default function CreateInvoiceScreen() {
  const { 
    patients, 
    services, 
    createInvoice, 
    searchPatients, 
    searchServices,
    calculateInvoiceTotal 
  } = useBillingStore();
  
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([]);
  const [discount, setDiscount] = useState('0');
  const [taxRate, setTaxRate] = useState('0');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Modal states
  const [patientModalVisible, setPatientModalVisible] = useState(false);
  const [serviceModalVisible, setServiceModalVisible] = useState(false);
  const [patientSearchQuery, setPatientSearchQuery] = useState('');
  const [serviceSearchQuery, setServiceSearchQuery] = useState('');

  const filteredPatients = searchPatients(patientSearchQuery);
  const filteredServices = searchServices(serviceSearchQuery);

  const addServiceToInvoice = (service: Service) => {
    const existingItem = invoiceItems.find(item => item.serviceId === service.id);
    
    if (existingItem) {
      setInvoiceItems(items =>
        items.map(item =>
          item.serviceId === service.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      );
    } else {
      const newItem: InvoiceItem = {
        id: Date.now().toString(),
        serviceId: service.id,
        quantity: 1,
        unitPrice: service.price,
      };
      setInvoiceItems(items => [...items, newItem]);
    }
    
    setServiceModalVisible(false);
    setServiceSearchQuery('');
  };

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      setInvoiceItems(items => items.filter(item => item.id !== itemId));
    } else {
      setInvoiceItems(items =>
        items.map(item =>
          item.id === itemId ? { ...item, quantity } : item
        )
      );
    }
  };

  const removeItem = (itemId: string) => {
    setInvoiceItems(items => items.filter(item => item.id !== itemId));
  };

  const getServiceById = (serviceId: string) => {
    return services.find(s => s.id === serviceId);
  };

  const { subtotal, total } = calculateInvoiceTotal(
    invoiceItems,
    Number(discount) || 0,
    Number(taxRate) || 0
  );

  const handleCreateInvoice = async () => {
    if (!selectedPatient) {
      Alert.alert('Error', 'Please select a patient');
      return;
    }

    if (invoiceItems.length === 0) {
      Alert.alert('Error', 'Please add at least one service');
      return;
    }

    setLoading(true);
    try {
      const invoiceId = await createInvoice({
        patientId: selectedPatient.id,
        items: invoiceItems,
        discount: Number(discount) || 0,
        taxRate: Number(taxRate) || 0,
        status: 'unpaid',
        notes: notes.trim(),
      });

      Alert.alert(
        'Success',
        'Invoice created successfully!',
        [
          {
            text: 'View Invoice',
            onPress: () => router.replace(`/invoice/${invoiceId}`),
          },
          {
            text: 'Create Another',
            onPress: () => {
              setSelectedPatient(null);
              setInvoiceItems([]);
              setDiscount('0');
              setTaxRate('0');
              setNotes('');
            },
          },
        ]
      );
    } catch (error) {
      Alert.alert('Error', 'Failed to create invoice');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Patient Selection */}
        <Card>
          <Text style={styles.sectionTitle}>Patient</Text>
          {selectedPatient ? (
            <View style={styles.selectedPatient}>
              <View style={styles.patientInfo}>
                <Text style={styles.patientName}>{selectedPatient.name}</Text>
                <Text style={styles.patientDetails}>
                  {selectedPatient.phone} • Age {selectedPatient.age}
                </Text>
              </View>
              <TouchableOpacity onPress={() => setPatientModalVisible(true)}>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Button
              title="Select Patient"
              onPress={() => setPatientModalVisible(true)}
              variant="secondary"
            />
          )}
        </Card>

        {/* Services */}
        <Card>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Services</Text>
            <TouchableOpacity onPress={() => setServiceModalVisible(true)}>
              <Ionicons name="add" size={24} color="#007AFF" />
            </TouchableOpacity>
          </View>

          {invoiceItems.length === 0 ? (
            <Text style={styles.emptyText}>No services added yet</Text>
          ) : (
            invoiceItems.map((item) => {
              const service = getServiceById(item.serviceId);
              return (
                <View key={item.id} style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <Text style={styles.serviceName}>{service?.name}</Text>
                    <Text style={styles.servicePrice}>
                      {formatCurrency(item.unitPrice)} × {item.quantity}
                    </Text>
                  </View>
                  <View style={styles.serviceControls}>
                    <TouchableOpacity
                      onPress={() => updateItemQuantity(item.id, item.quantity - 1)}
                      style={styles.quantityButton}
                    >
                      <Ionicons name="remove" size={16} color="#007AFF" />
                    </TouchableOpacity>
                    <Text style={styles.quantityText}>{item.quantity}</Text>
                    <TouchableOpacity
                      onPress={() => updateItemQuantity(item.id, item.quantity + 1)}
                      style={styles.quantityButton}
                    >
                      <Ionicons name="add" size={16} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => removeItem(item.id)}
                      style={styles.removeButton}
                    >
                      <Ionicons name="trash" size={16} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })
          )}
        </Card>

        {/* Calculations */}
        <Card>
          <Text style={styles.sectionTitle}>Calculations</Text>
          
          <View style={styles.inputRow}>
            <View style={styles.inputHalf}>
              <Input
                label="Discount (%)"
                value={discount}
                onChangeText={setDiscount}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
            <View style={styles.inputHalf}>
              <Input
                label="Tax Rate (%)"
                value={taxRate}
                onChangeText={setTaxRate}
                keyboardType="numeric"
                placeholder="0"
              />
            </View>
          </View>

          <View style={styles.totalsSection}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Subtotal:</Text>
              <Text style={styles.totalValue}>{formatCurrency(subtotal)}</Text>
            </View>
            {Number(discount) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Discount ({discount}%):</Text>
                <Text style={styles.totalValue}>
                  -{formatCurrency(subtotal * (Number(discount) / 100))}
                </Text>
              </View>
            )}
            {Number(taxRate) > 0 && (
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Tax ({taxRate}%):</Text>
                <Text style={styles.totalValue}>
                  {formatCurrency((subtotal - subtotal * (Number(discount) / 100)) * (Number(taxRate) / 100))}
                </Text>
              </View>
            )}
            <View style={[styles.totalRow, styles.finalTotal]}>
              <Text style={styles.finalTotalLabel}>Total:</Text>
              <Text style={styles.finalTotalValue}>{formatCurrency(total)}</Text>
            </View>
          </View>
        </Card>

        {/* Notes */}
        <Card>
          <Input
            label="Notes (Optional)"
            value={notes}
            onChangeText={setNotes}
            placeholder="Additional notes..."
            multiline
            numberOfLines={3}
          />
        </Card>

        {/* Create Button */}
        <View style={styles.createButtonContainer}>
          <Button
            title="Create Invoice"
            onPress={handleCreateInvoice}
            loading={loading}
            disabled={!selectedPatient || invoiceItems.length === 0}
          />
        </View>
      </ScrollView>

      {/* Patient Selection Modal */}
      <Modal
        visible={patientModalVisible}
        onClose={() => setPatientModalVisible(false)}
        title="Select Patient"
      >
        <SearchBar
          value={patientSearchQuery}
          onChangeText={setPatientSearchQuery}
          placeholder="Search patients..."
        />
        {filteredPatients.map((patient) => (
          <TouchableOpacity
            key={patient.id}
            style={styles.modalItem}
            onPress={() => {
              setSelectedPatient(patient);
              setPatientModalVisible(false);
              setPatientSearchQuery('');
            }}
          >
            <Text style={styles.modalItemTitle}>{patient.name}</Text>
            <Text style={styles.modalItemSubtitle}>
              {patient.phone} • Age {patient.age}
            </Text>
          </TouchableOpacity>
        ))}
      </Modal>

      {/* Service Selection Modal */}
      <Modal
        visible={serviceModalVisible}
        onClose={() => setServiceModalVisible(false)}
        title="Add Service"
      >
        <SearchBar
          value={serviceSearchQuery}
          onChangeText={setServiceSearchQuery}
          placeholder="Search services..."
        />
        {filteredServices.map((service) => (
          <TouchableOpacity
            key={service.id}
            style={styles.modalItem}
            onPress={() => addServiceToInvoice(service)}
          >
            <View style={styles.serviceModalItem}>
              <Text style={styles.modalItemTitle}>{service.name}</Text>
              <Text style={styles.serviceModalPrice}>{formatCurrency(service.price)}</Text>
            </View>
            {service.description && (
              <Text style={styles.modalItemSubtitle}>{service.description}</Text>
            )}
          </TouchableOpacity>
        ))}
      </Modal>
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1C1C1E',
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  selectedPatient: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1C1C1E',
  },
  patientDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  changeText: {
    color: '#007AFF',
    fontSize: 16,
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
  servicePrice: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  serviceControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    minWidth: 30,
    textAlign: 'center',
  },
  removeButton: {
    padding: 8,
    marginLeft: 8,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 16,
  },
  inputHalf: {
    flex: 1,
  },
  totalsSection: {
    marginTop: 16,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
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
  createButtonContainer: {
    marginVertical: 24,
  },
  modalItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  modalItemSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  serviceModalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  serviceModalPrice: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
    paddingVertical: 20,
  },
});
