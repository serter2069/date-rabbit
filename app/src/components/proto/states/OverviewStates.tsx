import React from 'react';
import { View, Text, ScrollView, StyleSheet, Platform } from 'react-native';

export function OverviewStates() {
  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>DateRabbit</Text>
        <Text style={styles.subtitle}>Premium companion dating platform (21+)</Text>

        <Text style={styles.sectionTitle}>Roles</Text>
        <Text style={styles.item}>Seeker (male) -- browse companions, book dates, pay, leave reviews</Text>
        <Text style={styles.item}>Companion (female) -- manage profile, accept/decline requests, earn money</Text>
        <Text style={styles.item}>Admin -- manage cities, moderation</Text>

        <Text style={styles.sectionTitle}>Pages</Text>
        <Text style={styles.groupTitle}>Landing</Text>
        <Text style={styles.item}>Landing Page (gender splash on first visit)</Text>

        <Text style={styles.groupTitle}>Auth</Text>
        <Text style={styles.item}>Welcome, Email Login, OTP, Role Selection, Profile Setup</Text>

        <Text style={styles.groupTitle}>Seeker Verification</Text>
        <Text style={styles.item}>Intro, Photo ID, Selfie, Consent, Pending, Approved</Text>

        <Text style={styles.groupTitle}>Companion Onboarding</Text>
        <Text style={styles.item}>Setup (min 4 photos), Verify, Pending, Approved</Text>

        <Text style={styles.groupTitle}>Seeker Dashboard</Text>
        <Text style={styles.item}>Browse Companions, My Bookings, Messages, Profile, Favorites</Text>

        <Text style={styles.groupTitle}>Companion Dashboard</Text>
        <Text style={styles.item}>Home, Booking Requests, Calendar, Earnings, Profile, Stripe Connect</Text>

        <Text style={styles.groupTitle}>Booking</Text>
        <Text style={styles.item}>Detail, Payment, Request Sent, Declined</Text>

        <Text style={styles.groupTitle}>Reviews</Text>
        <Text style={styles.item}>View Reviews, Write Review</Text>

        <Text style={styles.groupTitle}>Settings</Text>
        <Text style={styles.item}>Settings, Edit Profile, Notification Preferences</Text>

        <Text style={styles.groupTitle}>Admin</Text>
        <Text style={styles.item}>Cities Management</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { minHeight: Platform.OS === 'web' ? ('100vh' as any) : 844, backgroundColor: '#fff' },
  content: { padding: 32, maxWidth: 600 },
  title: { fontSize: 28, fontWeight: '700', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 32 },
  sectionTitle: { fontSize: 18, fontWeight: '600', marginBottom: 12, marginTop: 24 },
  groupTitle: { fontSize: 14, fontWeight: '600', color: '#444', marginTop: 12, marginBottom: 4 },
  item: { fontSize: 14, color: '#555', marginBottom: 4, paddingLeft: 12 },
});
