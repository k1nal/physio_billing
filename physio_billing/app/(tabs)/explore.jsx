import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, Alert } from 'react-native';
import { useBillingStore } from '@/store/billingStore';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';

export default function SettingsScreen() {
  const { patients, services, invoices } = useBillingStore();
  const [clinicName, setClinicName] = useState('Physiotherapy Clinic');
  const [clinicAddress, setClinicAddress] = useState('123 Health Street, Medical District, City - 123456');
  const [clinicPhone, setClinicPhone] = useState('+91 98765 43210');
  const [clinicEmail, setClinicEmail] = useState('info@physioclinic.com');
  const [consultantName, setConsultantName] = useState('');

  const handleSaveSettings = () => {
    Alert.alert('Success', 'Settings saved successfully!');
  };

  const handleExportData = () => {
    const data = {
      patients,
      services,
      invoices,
      exportDate: new Date().toISOString(),
    };
    
    // In a real app, this would export to CSV or JSON file
    console.log('Export data:', data);
    Alert.alert('Export', 'Data export functionality would be implemented here');
  };

  const handleImportData = () => {
    Alert.alert('Import', 'Data import functionality would be implemented here');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Settings</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Clinic Information */}
        <Card>
          <Text style={styles.sectionTitle}>Clinic Information</Text>
          
          <Input
            label="Clinic Name"
            value={clinicName}
            onChangeText={setClinicName}
            placeholder="Enter clinic name"
          />
          
          <Input
            label="Address"
            value={clinicAddress}
            onChangeText={setClinicAddress}
            placeholder="Enter clinic address"
            multiline
            numberOfLines={3}
          />

          <Input
            label="Consultant Name"
            value={consultantName}
            onChangeText={setConsultantName}
            placeholder="Enter consultant name"
          />
          
          <Input
            label="Phone"
            value={clinicPhone}
            onChangeText={setClinicPhone}
            placeholder="Enter phone number"
            keyboardType="phone-pad"
          />
          
          <Input
            label="Email"
            value={clinicEmail}
            onChangeText={setClinicEmail}
            placeholder="Enter email address"
            keyboardType="email-address"
          />
          
          <Button
            title="Save Settings"
            onPress={handleSaveSettings}
          />
        </Card>

        {/* Data Management */}
        <Card>
          <Text style={styles.sectionTitle}>Data Management</Text>
          
          <View style={styles.dataStats}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{patients.length}</Text>
              <Text style={styles.statLabel}>Patients</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{services.length}</Text>
              <Text style={styles.statLabel}>Services</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{invoices.length}</Text>
              <Text style={styles.statLabel}>Invoices</Text>
            </View>
          </View>
          
          <View style={styles.dataActions}>
            <Button
              title="Export Data"
              onPress={handleExportData}
              variant="secondary"
            />
            <Button
              title="Import Data"
              onPress={handleImportData}
              variant="secondary"
            />
          </View>
        </Card>

        {/* App Information */}
        <Card>
          <Text style={styles.sectionTitle}>About</Text>
          
          <View style={styles.aboutInfo}>
            <Text style={styles.aboutText}>
              <Text style={styles.aboutLabel}>App Version:</Text> 1.0.0
            </Text>
            <Text style={styles.aboutText}>
              <Text style={styles.aboutLabel}>Build:</Text> Production
            </Text>
            <Text style={styles.aboutText}>
              <Text style={styles.aboutLabel}>Platform:</Text> React Native + Expo
            </Text>
          </View>
          
          <Text style={styles.description}>
            A simple, offline-first billing application designed specifically for physiotherapy clinics. 
            All your data is stored locally on your device for complete privacy.
          </Text>
        </Card>

        {/* Features List */}
        <Card>
          <Text style={styles.sectionTitle}>Features</Text>
          
          <View style={styles.featuresList}>
            <Text style={styles.featureItem}>✓ Patient Management</Text>
            <Text style={styles.featureItem}>✓ Service Management</Text>
            <Text style={styles.featureItem}>✓ Invoice Generation</Text>
            <Text style={styles.featureItem}>✓ PDF Export & Sharing</Text>
            <Text style={styles.featureItem}>✓ Reports & Analytics</Text>
            <Text style={styles.featureItem}>✓ Offline-First Storage</Text>
            <Text style={styles.featureItem}>✓ No Subscription Required</Text>
          </View>
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
    padding: 20,
    paddingTop: 60,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
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
  dataStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  statLabel: {
    fontSize: 14,
    color: '#D1D1D6',
    marginTop: 4,
  },
  dataActions: {
    flexDirection: 'row',
    gap: 12,
  },
  aboutInfo: {
    marginBottom: 16,
  },
  aboutText: {
    fontSize: 16,
    color: '#FFFFFF',
    marginBottom: 8,
  },
  aboutLabel: {
    fontWeight: '600',
  },
  description: {
    fontSize: 16,
    color: '#D1D1D6',
    lineHeight: 24,
  },
  featuresList: {
    gap: 8,
  },
  featureItem: {
    fontSize: 16,
    color: '#FFFFFF',
    paddingVertical: 4,
  },
});
