/**
 * GPS Service for Real-Time Location Tracking
 * Handles geolocation API and continuous tracking
 */

class GPSService {
  constructor() {
    this.watchId = null;
    this.currentPosition = null;
    this.isTracking = false;
    this.callbacks = [];
    this.errorCallbacks = [];
  }

  /**
   * Request user permission and start tracking
   * @param {Object} options - Options for tracking
   * @param {number} options.timeout - Timeout for geolocation request (ms)
   * @param {number} options.enableHighAccuracy - Use high accuracy GPS
   * @param {number} options.maxAge - Max age of cached position (ms)
   * @returns {Promise<boolean>} - Whether tracking started successfully
   */
  startTracking(options = {}) {
    return new Promise((resolve, reject) => {
      const defaultOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
        ...options,
      };

      // Check if geolocation is available
      if (!navigator.geolocation) {
        const error = new Error('Geolocation is not supported by this browser');
        this.notifyError(error);
        reject(error);
        return;
      }

      // Start watching position
      this.watchId = navigator.geolocation.watchPosition(
        (position) => {
          this.currentPosition = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp),
          };

          this.isTracking = true;
          this.notifyCallbacks(this.currentPosition);
          resolve(true);
        },
        (error) => {
          const errorMessage = this.getErrorMessage(error);
          this.notifyError(new Error(errorMessage));
          reject(new Error(errorMessage));
        },
        defaultOptions
      );
    });
  }

  /**
   * Get current position without watching
   * @returns {Promise<Object>} - Current position coordinates
   */
  getCurrentPosition() {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const currentPos = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            altitude: position.coords.altitude,
            altitudeAccuracy: position.coords.altitudeAccuracy,
            heading: position.coords.heading,
            speed: position.coords.speed,
            timestamp: new Date(position.timestamp),
          };
          this.currentPosition = currentPos;
          resolve(currentPos);
        },
        (error) => {
          const errorMessage = this.getErrorMessage(error);
          this.notifyError(new Error(errorMessage));
          reject(new Error(errorMessage));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    });
  }

  /**
   * Stop tracking location
   */
  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
      this.isTracking = false;
      console.log('GPS tracking stopped');
    }
  }

  /**
   * Register callback for location updates
   * @param {Function} callback - Function to call with new position
   */
  onLocationUpdate(callback) {
    if (typeof callback === 'function') {
      this.callbacks.push(callback);
    }
  }

  /**
   * Register callback for errors
   * @param {Function} callback - Function to call on error
   */
  onError(callback) {
    if (typeof callback === 'function') {
      this.errorCallbacks.push(callback);
    }
  }

  /**
   * Remove location update callback
   * @param {Function} callback - Callback to remove
   */
  removeLocationCallback(callback) {
    this.callbacks = this.callbacks.filter((cb) => cb !== callback);
  }

  /**
   * Get last known position
   * @returns {Object|null} - Last known position or null
   */
  getLastPosition() {
    return this.currentPosition;
  }

  /**
   * Check if currently tracking
   * @returns {boolean} - Whether tracking is active
   */
  isCurrentlyTracking() {
    return this.isTracking;
  }

  /**
   * Calculate distance between two coordinates (in km)
   * Using Haversine formula
   * @param {number} lat1 - First latitude
   * @param {number} lng1 - First longitude
   * @param {number} lat2 - Second latitude
   * @param {number} lng2 - Second longitude
   * @returns {number} - Distance in kilometers
   */
  static calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Check if device is moving
   * @returns {boolean} - True if speed > 0.5 m/s
   */
  isMoving() {
    if (!this.currentPosition || this.currentPosition.speed === null) {
      return false;
    }
    return this.currentPosition.speed > 0.5; // More than 0.5 m/s
  }

  /**
   * Get current speed in km/h
   * @returns {number|null} - Speed in km/h or null if not available
   */
  getSpeedKmh() {
    if (!this.currentPosition || this.currentPosition.speed === null) {
      return null;
    }
    return this.currentPosition.speed * 3.6; // Convert m/s to km/h
  }

  /**
   * Private method to notify all callbacks
   * @private
   */
  notifyCallbacks(position) {
    this.callbacks.forEach((callback) => {
      try {
        callback(position);
      } catch (error) {
        console.error('Error in GPS callback:', error);
      }
    });
  }

  /**
   * Private method to notify error callbacks
   * @private
   */
  notifyError(error) {
    this.errorCallbacks.forEach((callback) => {
      try {
        callback(error);
      } catch (err) {
        console.error('Error in error callback:', err);
      }
    });
  }

  /**
   * Get user-friendly error message
   * @private
   */
  getErrorMessage(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'Location permission denied. Please enable location access in your browser settings.';
      case error.POSITION_UNAVAILABLE:
        return 'Location information is unavailable.';
      case error.TIMEOUT:
        return 'The request to get user location timed out.';
      default:
        return 'An unknown error occurred while retrieving your location.';
    }
  }
}

// Create singleton instance
export const gpsService = new GPSService();

export default GPSService;
