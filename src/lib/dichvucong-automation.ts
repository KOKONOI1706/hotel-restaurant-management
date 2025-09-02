// Service để quản lý thông báo lưu trú
export class AccommodationNotificationService {
  
  // Lưu thông tin thông báo lưu trú của một booking
  static async saveAccommodationNotification(bookingId: string, guestData: any[]) {
    try {
      const response = await fetch('/api/bookings/' + bookingId + '/accommodation-notification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          guests: guestData,
          notificationDate: new Date().toISOString(),
          status: 'completed'
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save accommodation notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error saving accommodation notification:', error);
      throw error;
    }
  }

  // Lấy thông tin thông báo lưu trú
  static async getAccommodationNotification(bookingId: string) {
    try {
      const response = await fetch('/api/bookings/' + bookingId + '/accommodation-notification');
      
      if (!response.ok) {
        if (response.status === 404) {
          return null; // Chưa có thông báo lưu trú
        }
        throw new Error('Failed to get accommodation notification');
      }

      return await response.json();
    } catch (error) {
      console.error('Error getting accommodation notification:', error);
      throw error;
    }
  }

  // Cập nhật trạng thái thông báo lưu trú
  static async updateNotificationStatus(bookingId: string, status: 'pending' | 'completed' | 'cancelled') {
    try {
      const response = await fetch('/api/bookings/' + bookingId + '/accommodation-notification', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update notification status');
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating notification status:', error);
      throw error;
    }
  }

  // Format dữ liệu khách để hiển thị
  static formatGuestInfo(guest: any) {
    return {
      fullName: guest.fullName || '',
      dateOfBirth: guest.dateOfBirth || '',
      gender: guest.gender || '',
      idNumber: guest.idNumber || '',
      passportNumber: guest.passportNumber || '',
      nationality: guest.nationality || 'Vietnam',
      phoneNumber: guest.phoneNumber || '',
      address: guest.address || '',
      checkInDate: guest.checkInDate || '',
      estimatedCheckOutDate: guest.estimatedCheckOutDate || '',
      purpose: guest.purpose || 'tourism',
      roomNumber: guest.roomNumber || ''
    };
  }

  // Tạo danh sách khách từ booking
  static createGuestListFromBooking(booking: any) {
    const guests = [];
    
    // Thêm khách chính
    if (booking.customer) {
      guests.push({
        ...this.formatGuestInfo(booking.customer),
        checkInDate: booking.checkInDate,
        estimatedCheckOutDate: booking.checkOutDate,
        roomNumber: booking.room?.roomNumber || '',
        isMainGuest: true
      });
    }

    // Thêm khách đi cùng nếu có
    if (booking.additionalGuests && booking.additionalGuests.length > 0) {
      booking.additionalGuests.forEach((guest: any) => {
        guests.push({
          ...this.formatGuestInfo(guest),
          checkInDate: booking.checkInDate,
          estimatedCheckOutDate: booking.checkOutDate,
          roomNumber: booking.room?.roomNumber || '',
          isMainGuest: false
        });
      });
    }

    return guests;
  }

  // Kiểm tra xem booking có cần thông báo lưu trú không
  static needsAccommodationNotification(booking: any) {
    // Chỉ cần thông báo cho booking đã check-in
    return booking.status === 'checked-in' || booking.status === 'completed';
  }

  // Tạo báo cáo thông báo lưu trú
  static generateNotificationReport(notifications: any[]) {
    const summary = {
      total: notifications.length,
      completed: notifications.filter(n => n.status === 'completed').length,
      pending: notifications.filter(n => n.status === 'pending').length,
      cancelled: notifications.filter(n => n.status === 'cancelled').length,
      totalGuests: notifications.reduce((sum, n) => sum + (n.guests?.length || 0), 0)
    };

    return {
      summary,
      details: notifications.map(n => ({
        bookingId: n.bookingId,
        customerName: n.guests?.[0]?.fullName || 'N/A',
        guestCount: n.guests?.length || 0,
        notificationDate: n.notificationDate,
        status: n.status,
        roomNumber: n.guests?.[0]?.roomNumber || 'N/A'
      }))
    };
  }
}
