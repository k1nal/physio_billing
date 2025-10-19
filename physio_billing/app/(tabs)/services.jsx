import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBillingStore } from '@/store/billingStore';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function ServicesScreen() {
  const { services, searchServices, addService, updateService, deleteService } = useBillingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingService, setEditingService] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const filteredServices = searchServices(searchQuery);

  const openModal = (service) => {
    if (service) {
      setEditingService(service);
      setFormData({
        name: service.name,
        price: service.price.toString(),
        description: service.description || '',
      });
    } else {
      setEditingService(null);
      setFormData({ name: '', price: '', description: '' });
    }
    setErrors({});
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingService(null);
    setFormData({ name: '', price: '', description: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Service name is required';
    }
    
    if (!formData.price.trim()) {
      newErrors.price = 'Price is required';
    } else if (isNaN(Number(formData.price)) || Number(formData.price) <= 0) {
      newErrors.price = 'Please enter a valid price';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const serviceData = {
        name: formData.name.trim(),
        price: Number(formData.price),
        description: formData.description.trim(),
      };

      if (editingService) {
        await updateService(editingService.id, serviceData);
      } else {
        await addService(serviceData);
      }
      
      closeModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to save service');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (service) => {
    Alert.alert(
      'Delete Service',
      `Are you sure you want to delete "${service.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteService(service.id),
        },
      ]
    );
  };

  const formatCurrency = (amount) => `₹${amount.toFixed(2)}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Services</Text>
        <TouchableOpacity onPress={() => openModal()} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search services..."
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredServices.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No services found' : 'No services yet. Add your first service!'}
              </Text>
            </Card>
          ) : (
            filteredServices.map((service) => (
              <Card key={service.id}>
                <View style={styles.serviceItem}>
                  <View style={styles.serviceInfo}>
                    <View style={styles.serviceHeader}>
                      <Text style={styles.serviceName}>{service.name}</Text>
                      <Text style={styles.servicePrice}>{formatCurrency(service.price)}</Text>
                    </View>
                    {service.description && (
                      <Text style={styles.serviceDescription}>{service.description}</Text>
                    )}
                  </View>
                  <View style={styles.serviceActions}>
                    <TouchableOpacity
                      onPress={() => openModal(service)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="pencil" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(service)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="trash" size={20} color="#FF3B30" />
                    </TouchableOpacity>
                  </View>
                </View>
              </Card>
            ))
          )}
        </ScrollView>
      </View>

      <Modal
        visible={modalVisible}
        onClose={closeModal}
        title={editingService ? 'Edit Service' : 'Add Service'}
      >
        <Input
          label="Service Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter service name"
          error={errors.name}
          required
        />

        <Input
          label="Price (₹)"
          value={formData.price}
          onChangeText={(text) => setFormData({ ...formData, price: text })}
          placeholder="Enter price"
          keyboardType="numeric"
          error={errors.price}
          required
        />

        <Input
          label="Description"
          value={formData.description}
          onChangeText={(text) => setFormData({ ...formData, description: text })}
          placeholder="Service description (optional)"
          multiline
          numberOfLines={3}
        />

        <View style={styles.modalActions}>
          <Button
            title="Cancel"
            onPress={closeModal}
            variant="secondary"
            style={{ flex: 1 }}
          />
          <Button
            title={editingService ? 'Update' : 'Add'}
            onPress={handleSave}
            loading={loading}
            style={{ flex: 1 }}
          />
        </View>
      </Modal>
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
  addButton: {
    padding: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
  },
  serviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  serviceInfo: {
    flex: 1,
  },
  serviceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  serviceName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  servicePrice: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#34C759',
  },
  serviceDescription: {
    fontSize: 14,
    color: '#6D6D70',
    marginTop: 4,
  },
  serviceActions: {
    flexDirection: 'row',
    gap: 8,
    marginLeft: 16,
  },
  actionButton: {
    padding: 8,
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    fontSize: 16,
    paddingVertical: 40,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 24,
  },
});
