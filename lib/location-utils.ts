/**
 * Location-based utilities for detecting timezone, language, and currency
 * based on user's geolocation and browser settings.
 */

// Country to currency mapping
const COUNTRY_CURRENCY_MAP: Record<string, string> = {
  // Africa
  ZA: "ZAR", // South Africa
  NG: "NGN", // Nigeria
  KE: "KES", // Kenya
  EG: "EGP", // Egypt
  
  // Americas
  US: "USD",
  CA: "CAD",
  MX: "MXN",
  BR: "BRL",
  AR: "ARS",
  
  // Europe
  GB: "GBP",
  IE: "EUR",
  DE: "EUR",
  FR: "EUR",
  ES: "EUR",
  IT: "EUR",
  NL: "EUR",
  BE: "EUR",
  AT: "EUR",
  PT: "EUR",
  GR: "EUR",
  FI: "EUR",
  CH: "CHF",
  SE: "SEK",
  NO: "NOK",
  DK: "DKK",
  PL: "PLN",
  CZ: "CZK",
  HU: "HUF",
  RO: "RON",
  RU: "RUB",
  UA: "UAH",
  
  // Middle East
  IL: "ILS",
  AE: "AED",
  SA: "SAR",
  QA: "QAR",
  KW: "KWD",
  BH: "BHD",
  OM: "OMR",
  JO: "JOD",
  LB: "LBP",
  TR: "TRY",
  
  // Asia
  IN: "INR",
  PK: "PKR",
  BD: "BDT",
  CN: "CNY",
  JP: "JPY",
  KR: "KRW",
  TW: "TWD",
  HK: "HKD",
  SG: "SGD",
  MY: "MYR",
  TH: "THB",
  VN: "VND",
  ID: "IDR",
  PH: "PHP",
  
  // Oceania
  AU: "AUD",
  NZ: "NZD",
};

// Supported currencies in the app (subset)
const SUPPORTED_CURRENCIES = ["ZAR", "USD", "EUR", "GBP", "ILS"] as const;
type SupportedCurrency = typeof SUPPORTED_CURRENCIES[number];

// Language code to supported language mapping
const LANGUAGE_MAP: Record<string, string> = {
  en: "en",
  he: "he",
  iw: "he", // Hebrew (older code)
  ru: "ru",
  ar: "ar",
};

const SUPPORTED_LANGUAGES = ["en", "he", "ru", "ar"] as const;
type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export interface LocationPreferences {
  timezone: string;
  language: SupportedLanguage;
  currency: SupportedCurrency;
  countryCode?: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
}

export interface GeolocationResult {
  latitude: number;
  longitude: number;
  accuracy: number;
}

/**
 * Request geolocation permission and get coordinates
 */
export function requestGeolocation(): Promise<GeolocationResult> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
        });
      },
      (error) => {
        reject(error);
      },
      {
        enableHighAccuracy: false, // Low accuracy is faster and sufficient for country/timezone
        timeout: 10000,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
}

/**
 * Get timezone from coordinates using a free API
 * Falls back to browser timezone if API fails
 */
export async function getTimezoneFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string> {
  try {
    // Use timeapi.io (free, no API key required)
    const response = await fetch(
      `https://timeapi.io/api/TimeZone/coordinate?latitude=${latitude}&longitude=${longitude}`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.timeZone) {
        return data.timeZone;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch timezone from API:", error);
  }

  // Fallback to browser timezone
  return getBrowserTimezone();
}

/**
 * Get country code from coordinates using reverse geocoding
 */
export async function getCountryFromCoordinates(
  latitude: number,
  longitude: number
): Promise<string | null> {
  try {
    // Use BigDataCloud (free, no API key required for basic usage)
    const response = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
    );
    
    if (response.ok) {
      const data = await response.json();
      if (data.countryCode) {
        return data.countryCode;
      }
    }
  } catch (error) {
    console.warn("Failed to fetch country from API:", error);
  }

  return null;
}

/**
 * Get browser's timezone
 */
export function getBrowserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch {
    return "UTC";
  }
}

/**
 * Get browser's preferred language
 */
export function getBrowserLanguage(): SupportedLanguage {
  try {
    // Get primary language from navigator
    const browserLang = navigator.language || (navigator as any).userLanguage || "en";
    const primaryLang = browserLang.split("-")[0].toLowerCase();
    
    // Map to supported language
    const mapped = LANGUAGE_MAP[primaryLang];
    if (mapped && SUPPORTED_LANGUAGES.includes(mapped as SupportedLanguage)) {
      return mapped as SupportedLanguage;
    }
  } catch (error) {
    console.warn("Failed to detect browser language:", error);
  }

  return "en";
}

/**
 * Get currency from country code
 */
export function getCurrencyFromCountry(countryCode: string | null): SupportedCurrency {
  if (!countryCode) return "USD";
  
  const currency = COUNTRY_CURRENCY_MAP[countryCode.toUpperCase()];
  
  // Return the currency if it's supported, otherwise default to USD
  if (currency && SUPPORTED_CURRENCIES.includes(currency as SupportedCurrency)) {
    return currency as SupportedCurrency;
  }
  
  // For unsupported currencies, default based on region
  // European countries default to EUR, others to USD
  const europeanCountries = ["AL", "AD", "BA", "BG", "HR", "CY", "EE", "LT", "LV", "LI", "LU", "MT", "MC", "ME", "MK", "RS", "SI", "SK", "SM", "VA"];
  if (europeanCountries.includes(countryCode.toUpperCase())) {
    return "EUR";
  }
  
  return "USD";
}

/**
 * Detect all location-based preferences
 * @param useGeolocation - Whether to request geolocation (false for fallback-only)
 */
export async function detectLocationPreferences(
  useGeolocation: boolean = true
): Promise<LocationPreferences> {
  // Start with browser defaults
  const preferences: LocationPreferences = {
    timezone: getBrowserTimezone(),
    language: getBrowserLanguage(),
    currency: "USD", // Will be updated if we get location
  };

  if (!useGeolocation) {
    return preferences;
  }

  try {
    // Try to get geolocation
    const coords = await requestGeolocation();
    preferences.coordinates = {
      latitude: coords.latitude,
      longitude: coords.longitude,
    };

    // Fetch timezone and country in parallel
    const [timezone, countryCode] = await Promise.all([
      getTimezoneFromCoordinates(coords.latitude, coords.longitude),
      getCountryFromCoordinates(coords.latitude, coords.longitude),
    ]);

    preferences.timezone = timezone;
    preferences.countryCode = countryCode || undefined;
    preferences.currency = getCurrencyFromCountry(countryCode);
  } catch (error) {
    console.warn("Geolocation failed, using browser defaults:", error);
    // Keep browser defaults
  }

  return preferences;
}

/**
 * Get default preferences without geolocation
 */
export function getDefaultPreferences(): LocationPreferences {
  return {
    timezone: getBrowserTimezone(),
    language: getBrowserLanguage(),
    currency: "USD",
  };
}

/**
 * Check if geolocation is available
 */
export function isGeolocationAvailable(): boolean {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

/**
 * Check current geolocation permission status
 */
export async function getGeolocationPermissionStatus(): Promise<PermissionState | "unavailable"> {
  if (!isGeolocationAvailable()) {
    return "unavailable";
  }

  try {
    if (navigator.permissions) {
      const result = await navigator.permissions.query({ name: "geolocation" });
      return result.state;
    }
  } catch {
    // Permissions API not supported
  }

  return "prompt"; // Assume prompt if we can't determine
}
