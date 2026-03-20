"use client";

import { useState, useEffect, useCallback } from "react";
import {
  LocationPreferences,
  detectLocationPreferences,
  getDefaultPreferences,
  isGeolocationAvailable,
  getGeolocationPermissionStatus,
} from "../location-utils";

const STORAGE_KEY = "rosco-location-prefs";
const PERMISSION_DECISION_KEY = "rosco-location-decision";

export type LocationPermissionState = "pending" | "granted" | "denied" | "unavailable";

interface UseLocationPreferencesResult {
  /** Current location-based preferences */
  preferences: LocationPreferences | null;
  /** Whether preferences are being loaded/detected */
  loading: boolean;
  /** Current permission state */
  permissionState: LocationPermissionState;
  /** Whether user has made a decision about location permission */
  hasDecided: boolean;
  /** Request location permission and detect preferences */
  requestLocationPermission: () => Promise<boolean>;
  /** Skip location detection and use defaults */
  skipLocationDetection: () => void;
  /** Force refresh preferences (useful after permission changes) */
  refreshPreferences: () => Promise<void>;
}

/**
 * Hook for managing location-based user preferences
 */
export function useLocationPreferences(): UseLocationPreferencesResult {
  const [preferences, setPreferences] = useState<LocationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [permissionState, setPermissionState] = useState<LocationPermissionState>("pending");
  const [hasDecided, setHasDecided] = useState(false);

  // Load saved preferences and check permission status on mount
  useEffect(() => {
    async function initialize() {
      // Check if user has already made a decision
      const savedDecision = localStorage.getItem(PERMISSION_DECISION_KEY);
      if (savedDecision) {
        setHasDecided(true);
      }

      // Try to load cached preferences
      const savedPrefs = localStorage.getItem(STORAGE_KEY);
      if (savedPrefs) {
        try {
          const parsed = JSON.parse(savedPrefs) as LocationPreferences;
          setPreferences(parsed);
        } catch {
          // Invalid cached data
        }
      }

      // Check geolocation availability and permission
      if (!isGeolocationAvailable()) {
        setPermissionState("unavailable");
        if (!preferences) {
          setPreferences(getDefaultPreferences());
        }
      } else {
        const status = await getGeolocationPermissionStatus();
        if (status === "granted") {
          setPermissionState("granted");
        } else if (status === "denied") {
          setPermissionState("denied");
          if (!preferences) {
            setPreferences(getDefaultPreferences());
          }
        } else {
          setPermissionState("pending");
        }
      }

      setLoading(false);
    }

    initialize();
  }, []);

  // Request location permission and detect preferences
  const requestLocationPermission = useCallback(async (): Promise<boolean> => {
    setLoading(true);

    try {
      const detectedPrefs = await detectLocationPreferences(true);
      setPreferences(detectedPrefs);
      setPermissionState("granted");
      setHasDecided(true);

      // Cache preferences and decision
      localStorage.setItem(STORAGE_KEY, JSON.stringify(detectedPrefs));
      localStorage.setItem(PERMISSION_DECISION_KEY, "granted");

      return true;
    } catch (error) {
      console.warn("Location detection failed:", error);
      
      // Use defaults on failure
      const defaultPrefs = getDefaultPreferences();
      setPreferences(defaultPrefs);
      setPermissionState("denied");
      setHasDecided(true);

      localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrefs));
      localStorage.setItem(PERMISSION_DECISION_KEY, "denied");

      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  // Skip location detection and use defaults
  const skipLocationDetection = useCallback(() => {
    const defaultPrefs = getDefaultPreferences();
    setPreferences(defaultPrefs);
    setPermissionState("denied");
    setHasDecided(true);

    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultPrefs));
    localStorage.setItem(PERMISSION_DECISION_KEY, "skipped");
  }, []);

  // Force refresh preferences
  const refreshPreferences = useCallback(async () => {
    if (permissionState === "granted") {
      setLoading(true);
      try {
        const detectedPrefs = await detectLocationPreferences(true);
        setPreferences(detectedPrefs);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(detectedPrefs));
      } catch {
        // Keep existing preferences on error
      } finally {
        setLoading(false);
      }
    }
  }, [permissionState]);

  return {
    preferences,
    loading,
    permissionState,
    hasDecided,
    requestLocationPermission,
    skipLocationDetection,
    refreshPreferences,
  };
}
