import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBillingStore } from '@/store/billingStore';
import { Card } from '@/components/ui/Card';
import { SearchBar } from '@/components/ui/SearchBar';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function PatientsScreen() {
  const { patients, searchPatients, addPatient, updatePatient, deletePatient } = useBillingStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [modalVisible, setModalVisible] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    age: '',
    sex: '',
    notes: '',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const filteredPatients = searchPatients(searchQuery);

  const openModal = (patient) => {
    if (patient) {
      setEditingPatient(patient);
      setFormData({
        name: patient.name,
        phone: patient.phone,
        age: patient.age.toString(),
        sex: patient.sex || '',
        notes: patient.notes || '',
      });
    } else {
      setEditingPatient(null);
      setFormData({ name: '', phone: '', age: '', sex: '', notes: '' });
    }
    setErrors({});
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingPatient(null);
    setFormData({ name: '', phone: '', age: '', sex: '', notes: '' });
    setErrors({});
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    }
    
    if (!formData.age.trim()) {
      newErrors.age = 'Age is required';
    } else if (isNaN(Number(formData.age)) || Number(formData.age) <= 0) {
      newErrors.age = 'Please enter a valid age';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      const patientData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        age: Number(formData.age),
        sex: (formData.sex || '').trim(),
        notes: formData.notes.trim(),
      };

      if (editingPatient) {
        await updatePatient(editingPatient.id, patientData);
      } else {
        await addPatient(patientData);
      }
      
      closeModal();
    } catch (error) {
      Alert.alert('Error', 'Failed to save patient');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (patient) => {
    Alert.alert(
      'Delete Patient',
      `Are you sure you want to delete ${patient.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deletePatient(patient.id),
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Patients</Text>
        <TouchableOpacity onPress={() => openModal()} style={styles.addButton}>
          <Ionicons name="add" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search patients..."
        />

        <ScrollView showsVerticalScrollIndicator={false}>
          {filteredPatients.length === 0 ? (
            <Card>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No patients found' : 'No patients yet. Add your first patient!'}
              </Text>
            </Card>
          ) : (
            filteredPatients.map((patient) => (
              <Card key={patient.id}>
                <View style={styles.patientItem}>
                  <View style={styles.patientInfo}>
                    <Text style={styles.patientName}>{patient.name}</Text>
                    <Text style={styles.patientDetails}>
                      {patient.phone} • Age {patient.age}{patient.sex ? ` • ${patient.sex}` : ''}
                    </Text>
                    {patient.notes && (
                      <Text style={styles.patientNotes}>{patient.notes}</Text>
                    )}
                  </View>
                  <View style={styles.patientActions}>
                    <TouchableOpacity
                      onPress={() => openModal(patient)}
                      style={styles.actionButton}
                    >
                      <Ionicons name="pencil" size={20} color="#007AFF" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleDelete(patient)}
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
        title={editingPatient ? 'Edit Patient' : 'Add Patient'}
      >
        <Input
          label="Name"
          value={formData.name}
          onChangeText={(text) => setFormData({ ...formData, name: text })}
          placeholder="Enter patient name"
          error={errors.name}
          required
        />

        <Input
          label="Phone"
          value={formData.phone}
          onChangeText={(text) => setFormData({ ...formData, phone: text })}
          placeholder="Enter phone number"
          keyboardType="phone-pad"
          error={errors.phone}
          required
        />

        <Input
          label="Age"
          value={formData.age}
          onChangeText={(text) => setFormData({ ...formData, age: text })}
          placeholder="Enter age"
          keyboardType="numeric"
          error={errors.age}
          required
        />

        <Input
          label="Sex"
          value={formData.sex}
          onChangeText={(text) => setFormData({ ...formData, sex: text })}
          placeholder="Male / Female / Other"
        />

        <Input
          label="Notes"
          value={formData.notes}
          onChangeText={(text) => setFormData({ ...formData, notes: text })}
          placeholder="Additional notes (optional)"
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
            title={editingPatient ? 'Update' : 'Add'}
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  patientItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  patientInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  patientDetails: {
    fontSize: 14,
    color: '#8E8E93',
    marginTop: 2,
  },
  patientNotes: {
    fontSize: 14,
    color: '#6D6D70',
    fontStyle: 'italic',
  },
  patientActions: {
    flexDirection: 'row',
    gap: 8,
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
