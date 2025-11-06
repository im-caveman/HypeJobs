import { Job, JobFilters, UserPreferences, UserProfile, SavedSearch, JobAlert } from '@/types';
import { STORAGE_CONFIG, ERROR_MESSAGES, SUCCESS_MESSAGES } from '@/lib/config';

// Storage utility class for managing localStorage
class StorageManager {
  private prefix: string;
  private maxSize: number;

  constructor() {
    this.prefix = STORAGE_CONFIG.prefix;
    this.maxSize = STORAGE_CONFIG.maxSize;
  }

  // Check if localStorage is available
  private isStorageAvailable(): boolean {
    try {
      const testKey = '__storage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch (error) {
      console.warn('localStorage is not available:', error);
      return false;
    }
  }

  // Generate prefixed key
  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  // Check if storage size exceeds limit
  private checkStorageSize(): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      let totalSize = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length;
        }
      }

      if (totalSize > this.maxSize) {
        console.warn('Storage size limit approaching:', totalSize);
        return false;
      }
      return true;
    } catch (error) {
      console.error('Error checking storage size:', error);
      return false;
    }
  }

  // Generic get method
  public get<T>(key: string): T | null {
    if (!this.isStorageAvailable()) return null;

    try {
      const prefixedKey = this.getKey(key);
      const item = localStorage.getItem(prefixedKey);

      if (!item) return null;

      const parsed = JSON.parse(item);

      // Check for expiration (if item has expiry)
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        this.remove(key);
        return null;
      }

      return parsed.data || parsed;
    } catch (error) {
      console.error(`Error getting item from localStorage (${key}):`, error);
      return null;
    }
  }

  // Generic set method with optional expiration
  public set<T>(key: string, data: T, ttl?: number): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      if (!this.checkStorageSize()) {
        console.warn('Storage size limit reached, clearing old data');
        this.clearExpired();
      }

      const prefixedKey = this.getKey(key);
      const item = {
        data,
        timestamp: Date.now(),
        ...(ttl && { expiresAt: Date.now() + ttl }),
      };

      localStorage.setItem(prefixedKey, JSON.stringify(item));
      return true;
    } catch (error) {
      console.error(`Error setting item in localStorage (${key}):`, error);
      return false;
    }
  }

  // Remove item from storage
  public remove(key: string): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      const prefixedKey = this.getKey(key);
      localStorage.removeItem(prefixedKey);
      return true;
    } catch (error) {
      console.error(`Error removing item from localStorage (${key}):`, error);
      return false;
    }
  }

  // Clear all items with prefix
  public clear(): boolean {
    if (!this.isStorageAvailable()) return false;

    try {
      const keysToRemove: string[] = [];

      for (let key in localStorage) {
        if (key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      return true;
    } catch (error) {
      console.error('Error clearing localStorage:', error);
      return false;
    }
  }

  // Clear expired items
  public clearExpired(): void {
    if (!this.isStorageAvailable()) return;

    try {
      const now = Date.now();
      const keysToRemove: string[] = [];

      for (let key in localStorage) {
        if (key.startsWith(this.prefix)) {
          try {
            const item = JSON.parse(localStorage[key]);
            if (item.expiresAt && now > item.expiresAt) {
              keysToRemove.push(key);
            }
          } catch (error) {
            // Remove invalid items
            keysToRemove.push(key);
          }
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
      console.log(`Cleared ${keysToRemove.length} expired items from storage`);
    } catch (error) {
      console.error('Error clearing expired items:', error);
    }
  }

  // Get storage size information
  public getStorageInfo(): { used: number; available: number; percentage: number } {
    if (!this.isStorageAvailable()) {
      return { used: 0, available: this.maxSize, percentage: 0 };
    }

    try {
      let used = 0;
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage[key].length + key.length;
        }
      }

      const available = this.maxSize - used;
      const percentage = (used / this.maxSize) * 100;

      return { used, available, percentage };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { used: 0, available: this.maxSize, percentage: 0 };
    }
  }
}

// Create storage manager instance
const storage = new StorageManager();

// Saved jobs management
export const savedJobsStorage = {
  getSavedJobs: (): string[] => {
    return storage.get<string[]>(STORAGE_CONFIG.keys.savedJobs) || [];
  },

  saveJob: (jobId: string): boolean => {
    try {
      const savedJobs = savedJobsStorage.getSavedJobs();

      if (savedJobs.includes(jobId)) {
        console.warn('Job already saved:', jobId);
        return false;
      }

      savedJobs.push(jobId);
      const success = storage.set(STORAGE_CONFIG.keys.savedJobs, savedJobs);

      if (success && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jobSaved', { detail: { jobId } }));
      }

      return success;
    } catch (error) {
      console.error('Error saving job:', error);
      return false;
    }
  },

  unsaveJob: (jobId: string): boolean => {
    try {
      const savedJobs = savedJobsStorage.getSavedJobs();
      const updatedJobs = savedJobs.filter(id => id !== jobId);
      const success = storage.set(STORAGE_CONFIG.keys.savedJobs, updatedJobs);

      if (success && typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('jobUnsaved', { detail: { jobId } }));
      }

      return success;
    } catch (error) {
      console.error('Error unsaving job:', error);
      return false;
    }
  },

  isJobSaved: (jobId: string): boolean => {
    const savedJobs = savedJobsStorage.getSavedJobs();
    return savedJobs.includes(jobId);
  },

  clearSavedJobs: (): boolean => {
    return storage.remove(STORAGE_CONFIG.keys.savedJobs);
  },
};

// Recent searches management
export const recentSearchesStorage = {
  getRecentSearches: (): JobFilters[] => {
    return storage.get<JobFilters[]>(STORAGE_CONFIG.keys.recentSearches) || [];
  },

  addRecentSearch: (filters: JobFilters): boolean => {
    try {
      const recentSearches = recentSearchesStorage.getRecentSearches();

      // Remove existing search with same filters if present
      const filteredSearches = recentSearches.filter(search =>
        JSON.stringify(search) !== JSON.stringify(filters)
      );

      // Add new search to beginning
      const updatedSearches = [filters, ...filteredSearches]
        .slice(0, SEARCH_CONFIG.recentSearchesLimit);

      return storage.set(STORAGE_CONFIG.keys.recentSearches, updatedSearches);
    } catch (error) {
      console.error('Error adding recent search:', error);
      return false;
    }
  },

  clearRecentSearches: (): boolean => {
    return storage.remove(STORAGE_CONFIG.keys.recentSearches);
  },

  removeRecentSearch: (index: number): boolean => {
    try {
      const recentSearches = recentSearchesStorage.getRecentSearches();
      const updatedSearches = recentSearches.filter((_, i) => i !== index);
      return storage.set(STORAGE_CONFIG.keys.recentSearches, updatedSearches);
    } catch (error) {
      console.error('Error removing recent search:', error);
      return false;
    }
  },
};

// Saved searches management
export const savedSearchesStorage = {
  getSavedSearches: (): SavedSearch[] => {
    return storage.get<SavedSearch[]>(STORAGE_CONFIG.keys.savedSearches) || [];
  },

  saveSearch: (name: string, filters: JobFilters): boolean => {
    try {
      const savedSearches = savedSearchesStorage.getSavedSearches();
      const newSearch: SavedSearch = {
        name,
        filters,
        createdAt: new Date().toISOString(),
      };

      const updatedSearches = [...savedSearches, newSearch];
      return storage.set(STORAGE_CONFIG.keys.savedSearches, updatedSearches);
    } catch (error) {
      console.error('Error saving search:', error);
      return false;
    }
  },

  removeSavedSearch: (index: number): boolean => {
    try {
      const savedSearches = savedSearchesStorage.getSavedSearches();
      const updatedSearches = savedSearches.filter((_, i) => i !== index);
      return storage.set(STORAGE_CONFIG.keys.savedSearches, updatedSearches);
    } catch (error) {
      console.error('Error removing saved search:', error);
      return false;
    }
  },

  updateSavedSearch: (index: number, name: string, filters: JobFilters): boolean => {
    try {
      const savedSearches = savedSearchesStorage.getSavedSearches();

      if (index < 0 || index >= savedSearches.length) {
        return false;
      }

      savedSearches[index] = {
        name,
        filters,
        createdAt: savedSearches[index].createdAt, // Preserve original creation date
      };

      return storage.set(STORAGE_CONFIG.keys.savedSearches, savedSearches);
    } catch (error) {
      console.error('Error updating saved search:', error);
      return false;
    }
  },

  clearSavedSearches: (): boolean => {
    return storage.remove(STORAGE_CONFIG.keys.savedSearches);
  },
};

// Job alerts management
export const jobAlertsStorage = {
  getJobAlerts: (): JobAlert[] => {
    return storage.get<JobAlert[]>(STORAGE_CONFIG.keys.jobAlerts) || [];
  },

  createJobAlert: (name: string, filters: JobFilters, frequency: 'daily' | 'weekly' | 'instant'): JobAlert | null => {
    try {
      const jobAlerts = jobAlertsStorage.getJobAlerts();
      const newAlert: JobAlert = {
        id: Date.now().toString(),
        name,
        filters,
        frequency,
        enabled: true,
        createdAt: new Date().toISOString(),
      };

      const updatedAlerts = [...jobAlerts, newAlert];
      const success = storage.set(STORAGE_CONFIG.keys.jobAlerts, updatedAlerts);

      return success ? newAlert : null;
    } catch (error) {
      console.error('Error creating job alert:', error);
      return null;
    }
  },

  updateJobAlert: (alertId: string, updates: Partial<JobAlert>): boolean => {
    try {
      const jobAlerts = jobAlertsStorage.getJobAlerts();
      const alertIndex = jobAlerts.findIndex(alert => alert.id === alertId);

      if (alertIndex === -1) return false;

      jobAlerts[alertIndex] = { ...jobAlerts[alertIndex], ...updates };
      return storage.set(STORAGE_CONFIG.keys.jobAlerts, jobAlerts);
    } catch (error) {
      console.error('Error updating job alert:', error);
      return false;
    }
  },

  deleteJobAlert: (alertId: string): boolean => {
    try {
      const jobAlerts = jobAlertsStorage.getJobAlerts();
      const updatedAlerts = jobAlerts.filter(alert => alert.id !== alertId);
      return storage.set(STORAGE_CONFIG.keys.jobAlerts, updatedAlerts);
    } catch (error) {
      console.error('Error deleting job alert:', error);
      return false;
    }
  },

  toggleJobAlert: (alertId: string): boolean => {
    try {
      const jobAlerts = jobAlertsStorage.getJobAlerts();
      const alert = jobAlerts.find(alert => alert.id === alertId);

      if (!alert) return false;

      alert.enabled = !alert.enabled;
      return storage.set(STORAGE_CONFIG.keys.jobAlerts, jobAlerts);
    } catch (error) {
      console.error('Error toggling job alert:', error);
      return false;
    }
  },

  clearJobAlerts: (): boolean => {
    return storage.remove(STORAGE_CONFIG.keys.jobAlerts);
  },
};

// User profile management
export const userProfileStorage = {
  getUserProfile: (): UserProfile | null => {
    return storage.get<UserProfile>(STORAGE_CONFIG.keys.userProfile);
  },

  saveUserProfile: (profile: UserProfile): boolean => {
    try {
      return storage.set(STORAGE_CONFIG.keys.userProfile, profile);
    } catch (error) {
      console.error('Error saving user profile:', error);
      return false;
    }
  },

  updateUserProfile: (updates: Partial<UserProfile>): boolean => {
    try {
      const currentProfile = userProfileStorage.getUserProfile();
      const updatedProfile = { ...currentProfile, ...updates } as UserProfile;
      return storage.set(STORAGE_CONFIG.keys.userProfile, updatedProfile);
    } catch (error) {
      console.error('Error updating user profile:', error);
      return false;
    }
  },

  clearUserProfile: (): boolean => {
    return storage.remove(STORAGE_CONFIG.keys.userProfile);
  },
};

// User preferences management
export const userPreferencesStorage = {
  getUserPreferences: (): Partial<UserPreferences> | null => {
    return storage.get<Partial<UserPreferences>>(STORAGE_CONFIG.keys.preferences);
  },

  saveUserPreferences: (preferences: Partial<UserPreferences>): boolean => {
    try {
      return storage.set(STORAGE_CONFIG.keys.preferences, preferences);
    } catch (error) {
      console.error('Error saving user preferences:', error);
      return false;
    }
  },

  updateUserPreferences: (updates: Partial<UserPreferences>): boolean => {
    try {
      const currentPreferences = userPreferencesStorage.getUserPreferences();
      const updatedPreferences = { ...currentPreferences, ...updates };
      return storage.set(STORAGE_CONFIG.keys.preferences, updatedPreferences);
    } catch (error) {
      console.error('Error updating user preferences:', error);
      return false;
    }
  },

  clearUserPreferences: (): boolean => {
    return storage.remove(STORAGE_CONFIG.keys.preferences);
  },
};

// Utility functions for storage maintenance
export const storageUtils = {
  // Clear all expired items
  clearExpired: () => storage.clearExpired(),

  // Get storage information
  getStorageInfo: () => storage.getStorageInfo(),

  // Clear all app data
  clearAllData: () => storage.clear(),

  // Export all user data
  exportData: (): string => {
    try {
      const data = {
        savedJobs: savedJobsStorage.getSavedJobs(),
        recentSearches: recentSearchesStorage.getRecentSearches(),
        savedSearches: savedSearchesStorage.getSavedSearches(),
        jobAlerts: jobAlertsStorage.getJobAlerts(),
        userProfile: userProfileStorage.getUserProfile(),
        userPreferences: userPreferencesStorage.getUserPreferences(),
        exportDate: new Date().toISOString(),
      };

      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export user data');
    }
  },

  // Import user data
  importData: (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);

      // Validate data structure
      if (typeof data !== 'object' || data === null) {
        throw new Error('Invalid data format');
      }

      // Import each section if it exists
      if (Array.isArray(data.savedJobs)) {
        storage.set(STORAGE_CONFIG.keys.savedJobs, data.savedJobs);
      }

      if (Array.isArray(data.recentSearches)) {
        storage.set(STORAGE_CONFIG.keys.recentSearches, data.recentSearches);
      }

      if (Array.isArray(data.savedSearches)) {
        storage.set(STORAGE_CONFIG.keys.savedSearches, data.savedSearches);
      }

      if (Array.isArray(data.jobAlerts)) {
        storage.set(STORAGE_CONFIG.keys.jobAlerts, data.jobAlerts);
      }

      if (data.userProfile) {
        storage.set(STORAGE_CONFIG.keys.userProfile, data.userProfile);
      }

      if (data.userPreferences) {
        storage.set(STORAGE_CONFIG.keys.preferences, data.userPreferences);
      }

      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },
};

// Initialize storage by cleaning expired items
if (typeof window !== 'undefined') {
  storageUtils.clearExpired();
}

export { storage };