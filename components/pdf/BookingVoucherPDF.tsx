/**
 * Booking Voucher PDF Component
 * 
 * Beautiful PDF voucher for hotel bookings
 */

import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

// Types
type VoucherData = {
  bookingReference: string;
  hotelName: string;
  hotelLocation: string;
  hotelStarRating: number;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  roomType: string;
  ratePlan: string;
  boardType: string;
  adults: number;
  children: number;
  numberOfRooms: number;
  specialRequests: string | null;
  totalAmount: number;
  currency: string;
  status: string;
  createdAt: Date;
  addOns: Array<{ name: string; price: number; quantity: number }>;
};

// Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Helvetica',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#1e40af',
  },
  logo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  tagline: {
    fontSize: 10,
    color: '#64748b',
    marginTop: 4,
  },
  confirmationBox: {
    backgroundColor: '#f0f9ff',
    padding: 15,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#0ea5e9',
    alignItems: 'flex-end',
  },
  confirmationLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  confirmationRef: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  status: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: 'bold',
  },
  statusConfirmed: {
    color: '#16a34a',
  },
  statusCancelled: {
    color: '#dc2626',
  },
  statusPending: {
    color: '#f59e0b',
  },
  hotelSection: {
    marginBottom: 25,
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  hotelName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 6,
  },
  stars: {
    fontSize: 12,
    color: '#f59e0b',
    marginBottom: 8,
  },
  hotelLocation: {
    fontSize: 12,
    color: '#64748b',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  col: {
    flex: 1,
  },
  label: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 3,
    textTransform: 'uppercase',
  },
  value: {
    fontSize: 12,
    color: '#0f172a',
  },
  valueBold: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#0f172a',
  },
  dateBox: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f0f9ff',
    borderRadius: 6,
    alignItems: 'center',
  },
  dateLabel: {
    fontSize: 10,
    color: '#0ea5e9',
    marginBottom: 4,
    fontWeight: 'bold',
  },
  dateValue: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 2,
  },
  dateTime: {
    fontSize: 9,
    color: '#64748b',
  },
  arrow: {
    justifyContent: 'center',
    paddingHorizontal: 15,
    fontSize: 20,
    color: '#94a3b8',
  },
  nights: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 11,
    color: '#64748b',
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    marginVertical: 20,
  },
  guestSection: {
    marginBottom: 20,
  },
  roomSection: {
    marginBottom: 20,
  },
  addOnsSection: {
    marginBottom: 20,
  },
  addOnItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
  },
  addOnName: {
    fontSize: 11,
    color: '#334155',
  },
  addOnPrice: {
    fontSize: 11,
    color: '#0f172a',
    fontWeight: 'bold',
  },
  totalSection: {
    backgroundColor: '#1e40af',
    padding: 15,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 25,
  },
  totalLabel: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  totalAmount: {
    fontSize: 20,
    color: '#ffffff',
    fontWeight: 'bold',
  },
  specialRequests: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 6,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  specialRequestsTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 6,
  },
  specialRequestsText: {
    fontSize: 10,
    color: '#78350f',
    lineHeight: 1.4,
  },
  importantNotice: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: '#fef2f2',
    borderRadius: 6,
  },
  importantTitle: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#991b1b',
    marginBottom: 6,
  },
  importantText: {
    fontSize: 9,
    color: '#7f1d1d',
    lineHeight: 1.4,
    marginBottom: 4,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  footerText: {
    fontSize: 9,
    color: '#94a3b8',
  },
  footerContact: {
    fontSize: 9,
    color: '#64748b',
  },
});

// Helpers
const formatDate = (date: Date) => {
  return new Date(date).toLocaleDateString('en-GB', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

const formatCurrency = (amount: number, currency: string = 'GBP') => {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amount);
};

const getBoardTypeLabel = (boardType: string) => {
  const labels: Record<string, string> = {
    ROOM_ONLY: 'Room Only',
    BED_AND_BREAKFAST: 'Bed & Breakfast',
    HALF_BOARD: 'Half Board',
    FULL_BOARD: 'Full Board',
    ALL_INCLUSIVE: 'All Inclusive',
  };
  return labels[boardType] || boardType;
};

const getStatusStyle = (status: string) => {
  switch (status) {
    case 'CONFIRMED':
      return styles.statusConfirmed;
    case 'CANCELLED':
      return styles.statusCancelled;
    default:
      return styles.statusPending;
  }
};

// Component
export function BookingVoucherPDF({ data }: { data: VoucherData }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>BestHotelRates</Text>
            <Text style={styles.tagline}>Save up to 30% on luxury hotels</Text>
          </View>
          <View style={styles.confirmationBox}>
            <Text style={styles.confirmationLabel}>BOOKING REFERENCE</Text>
            <Text style={styles.confirmationRef}>{data.bookingReference}</Text>
            <Text style={[styles.status, getStatusStyle(data.status)]}>
              {data.status}
            </Text>
          </View>
        </View>

        {/* Hotel Info */}
        <View style={styles.hotelSection}>
          <Text style={styles.hotelName}>{data.hotelName}</Text>
          <Text style={styles.stars}>{'★'.repeat(data.hotelStarRating)}</Text>
          <Text style={styles.hotelLocation}>{data.hotelLocation}</Text>
        </View>

        {/* Stay Dates */}
        <View style={{ marginBottom: 20 }}>
          <Text style={styles.sectionTitle}>Stay Dates</Text>
          <View style={styles.row}>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>CHECK-IN</Text>
              <Text style={styles.dateValue}>{formatDate(data.checkIn)}</Text>
              <Text style={styles.dateTime}>From 3:00 PM</Text>
            </View>
            <Text style={styles.arrow}>→</Text>
            <View style={styles.dateBox}>
              <Text style={styles.dateLabel}>CHECK-OUT</Text>
              <Text style={styles.dateValue}>{formatDate(data.checkOut)}</Text>
              <Text style={styles.dateTime}>Until 11:00 AM</Text>
            </View>
          </View>
          <Text style={styles.nights}>{data.nights} night{data.nights > 1 ? 's' : ''}</Text>
        </View>

        <View style={styles.divider} />

        {/* Guest Details */}
        <View style={styles.guestSection}>
          <Text style={styles.sectionTitle}>Guest Details</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Lead Guest</Text>
              <Text style={styles.valueBold}>{data.guestName}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Email</Text>
              <Text style={styles.value}>{data.guestEmail}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Phone</Text>
              <Text style={styles.value}>{data.guestPhone}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Guests</Text>
              <Text style={styles.value}>
                {data.adults} adult{data.adults > 1 ? 's' : ''}
                {data.children > 0 && `, ${data.children} child${data.children > 1 ? 'ren' : ''}`}
              </Text>
            </View>
          </View>
        </View>

        {/* Room Details */}
        <View style={styles.roomSection}>
          <Text style={styles.sectionTitle}>Room Details</Text>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Room Type</Text>
              <Text style={styles.valueBold}>{data.roomType}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Rooms</Text>
              <Text style={styles.value}>{data.numberOfRooms}</Text>
            </View>
          </View>
          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.label}>Rate Plan</Text>
              <Text style={styles.value}>{data.ratePlan}</Text>
            </View>
            <View style={styles.col}>
              <Text style={styles.label}>Board</Text>
              <Text style={styles.value}>{getBoardTypeLabel(data.boardType)}</Text>
            </View>
          </View>
        </View>

        {/* Add-ons */}
        {data.addOns.length > 0 && (
          <View style={styles.addOnsSection}>
            <Text style={styles.sectionTitle}>Add-ons</Text>
            {data.addOns.map((addon, idx) => (
              <View key={idx} style={styles.addOnItem}>
                <Text style={styles.addOnName}>
                  {addon.name} {addon.quantity > 1 && `(×${addon.quantity})`}
                </Text>
                <Text style={styles.addOnPrice}>
                  {formatCurrency(addon.price * addon.quantity, data.currency)}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Total */}
        <View style={styles.totalSection}>
          <Text style={styles.totalLabel}>TOTAL PAID</Text>
          <Text style={styles.totalAmount}>
            {formatCurrency(data.totalAmount, data.currency)}
          </Text>
        </View>

        {/* Special Requests */}
        {data.specialRequests && (
          <View style={styles.specialRequests}>
            <Text style={styles.specialRequestsTitle}>Special Requests</Text>
            <Text style={styles.specialRequestsText}>{data.specialRequests}</Text>
          </View>
        )}

        {/* Important Notice */}
        <View style={styles.importantNotice}>
          <Text style={styles.importantTitle}>Important Information</Text>
          <Text style={styles.importantText}>
            • Please present this voucher at check-in along with a valid photo ID.
          </Text>
          <Text style={styles.importantText}>
            • Check-in time is from 3:00 PM. Early check-in is subject to availability.
          </Text>
          <Text style={styles.importantText}>
            • Check-out time is until 11:00 AM. Late check-out may incur additional charges.
          </Text>
          <Text style={styles.importantText}>
            • Please contact the hotel directly for any special arrangements.
          </Text>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Booked on {new Date(data.createdAt).toLocaleDateString('en-GB')}
          </Text>
          <Text style={styles.footerContact}>
            support@besthotelrates.co.uk | +44 800 123 4567
          </Text>
        </View>
      </Page>
    </Document>
  );
}


