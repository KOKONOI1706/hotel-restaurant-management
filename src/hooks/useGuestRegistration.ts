'use client';

import { useState } from 'react';

export interface Guest {
  fullName: string;
  dateOfBirth: string;
  idNumber: string;
  idType: 'cccd' | 'passport' | 'cmnd';
  nationality: string;
  address: string;
  phoneNumber: string;
  checkInDate: string;
  estimatedCheckOutDate: string;
  purpose: 'tourism' | 'business' | 'education' | 'medical' | 'other';
  otherPurpose: string;
}

export interface GuestRegistrationState {
  isOpen: boolean;
  bookingId: string | null;
  guests: Guest[];
  isSubmitting: boolean;
}

export const useGuestRegistration = () => {
  const [state, setState] = useState<GuestRegistrationState>({
    isOpen: false,
    bookingId: null,
    guests: [],
    isSubmitting: false
  });

  const openModal = (bookingId: string, initialGuests: Guest[] = []) => {
    const defaultGuest: Guest = {
      fullName: '',
      dateOfBirth: '',
      idNumber: '',
      idType: 'cccd',
      nationality: 'Việt Nam',
      address: '',
      phoneNumber: '',
      checkInDate: new Date().toISOString().split('T')[0],
      estimatedCheckOutDate: '',
      purpose: 'tourism',
      otherPurpose: ''
    };

    setState({
      isOpen: true,
      bookingId,
      guests: initialGuests.length > 0 ? initialGuests : [defaultGuest],
      isSubmitting: false
    });
  };

  const closeModal = () => {
    setState({
      isOpen: false,
      bookingId: null,
      guests: [],
      isSubmitting: false
    });
  };

  const updateGuest = (index: number, updatedGuest: Partial<Guest>) => {
    setState(prev => ({
      ...prev,
      guests: prev.guests.map((guest, i) => 
        i === index ? { ...guest, ...updatedGuest } : guest
      )
    }));
  };

  const addGuest = () => {
    const defaultGuest: Guest = {
      fullName: '',
      dateOfBirth: '',
      idNumber: '',
      idType: 'cccd',
      nationality: 'Việt Nam',
      address: '',
      phoneNumber: '',
      checkInDate: new Date().toISOString().split('T')[0],
      estimatedCheckOutDate: '',
      purpose: 'tourism',
      otherPurpose: ''
    };

    setState(prev => ({
      ...prev,
      guests: [...prev.guests, defaultGuest]
    }));
  };

  const removeGuest = (index: number) => {
    setState(prev => ({
      ...prev,
      guests: prev.guests.filter((_, i) => i !== index)
    }));
  };

  const submitRegistration = async () => {
    if (!state.bookingId) return;

    setState(prev => ({ ...prev, isSubmitting: true }));

    try {
      const response = await fetch(`/api/bookings/${state.bookingId}/accommodation-notification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guests: state.guests
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Đã gửi thông báo lưu trú thành công!');
        closeModal();
        // Reload page to update UI
        window.location.reload();
      } else {
        alert(`❌ Lỗi: ${data.error}`);
      }
    } catch (error) {
      console.error('Error submitting guest registration:', error);
      alert('❌ Có lỗi xảy ra khi gửi thông báo lưu trú');
    } finally {
      setState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return {
    state,
    openModal,
    closeModal,
    updateGuest,
    addGuest,
    removeGuest,
    submitRegistration
  };
};
