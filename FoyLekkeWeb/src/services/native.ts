import { Capacitor } from '@capacitor/core';
import { Camera, CameraResultType } from '@capacitor/camera';
import { Geolocation } from '@capacitor/geolocation';
import { PushNotifications } from '@capacitor/push-notifications';
import { Preferences } from '@capacitor/preferences';
import { App } from '@capacitor/app';

export const isNativePlatform = Capacitor.isNativePlatform();

export const NativeServices = {
  // Platform info
  getPlatformInfo: () => {
    const platform = Capacitor.getPlatform();
    return {
      isNative: isNativePlatform,
      isIOS: platform === 'ios',
      isAndroid: platform === 'android',
      platform
    };
  },

  // Camera functionality
  Camera: {
    async takePicture() {
      if (!isNativePlatform) return null;
      try {
        return await Camera.getPhoto({
          quality: 90,
          allowEditing: true,
          resultType: CameraResultType.Uri
        });
      } catch (error) {
        console.error('Camera error:', error);
        throw error;
      }
    },

    async checkPermissions() {
      return await Camera.checkPermissions();
    },

    async requestPermissions() {
      return await Camera.requestPermissions();
    }
  },

  // Location services
  Location: {
    async getCurrentPosition() {
      if (!isNativePlatform) return null;
      try {
        return await Geolocation.getCurrentPosition();
      } catch (error) {
        console.error('Geolocation error:', error);
        throw error;
      }
    },

    async checkPermissions() {
      return await Geolocation.checkPermissions();
    },

    async requestPermissions() {
      return await Geolocation.requestPermissions();
    }
  },

  // Push notifications
  Notifications: {
    async register() {
      if (!isNativePlatform) return;
      try {
        // Request permission to use push notifications
        const permission = await PushNotifications.requestPermissions();
        if (permission.receive === 'granted') {
          // Register with Apple / Google to receive push via APNS/FCM
          await PushNotifications.register();
        }
      } catch (error) {
        console.error('Push notification registration error:', error);
        throw error;
      }
    },

    async getDeliveredNotifications() {
      return await PushNotifications.getDeliveredNotifications();
    },

    addListeners() {
      if (!isNativePlatform) return;

      // On registration success
      PushNotifications.addListener('registration', (token) => {
        console.log('Push registration success:', token.value);
      });

      // On registration error
      PushNotifications.addListener('registrationError', (error) => {
        console.error('Push registration error:', error);
      });

      // On push notification received
      PushNotifications.addListener('pushNotificationReceived', (notification) => {
        console.log('Push notification received:', notification);
      });

      // On push notification clicked
      PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
        console.log('Push notification action performed:', notification);
      });
    }
  },

  // Local storage
  Storage: {
    async set(key: string, value: any) {
      try {
        await Preferences.set({
          key,
          value: JSON.stringify(value)
        });
      } catch (error) {
        console.error('Storage set error:', error);
        throw error;
      }
    },

    async get(key: string) {
      try {
        const { value } = await Preferences.get({ key });
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Storage get error:', error);
        throw error;
      }
    },

    async remove(key: string) {
      try {
        await Preferences.remove({ key });
      } catch (error) {
        console.error('Storage remove error:', error);
        throw error;
      }
    },

    async clear() {
      try {
        await Preferences.clear();
      } catch (error) {
        console.error('Storage clear error:', error);
        throw error;
      }
    }
  },

  // App lifecycle events
  App: {
    addListeners(callbacks: {
      onResume?: () => void;
      onPause?: () => void;
      onAppUrlOpen?: (data: { url: string }) => void;
    }) {
      if (!isNativePlatform) return;

      if (callbacks.onResume) {
        App.addListener('resume', callbacks.onResume);
      }

      if (callbacks.onPause) {
        App.addListener('pause', callbacks.onPause);
      }

      if (callbacks.onAppUrlOpen) {
        App.addListener('appUrlOpen', callbacks.onAppUrlOpen);
      }
    },

    async getInfo() {
      return await App.getInfo();
    },

    async getLaunchUrl() {
      return await App.getLaunchUrl();
    }
  }
}; 