/**
 * VAT rates by country code
 * Each rate is stored as a decimal (e.g., 0.17 for 17%)
 */
export const VAT_RATES: Record<string, number> = {
  IL: 0.17, // Israel - 17%
  GB: 0.20, // United Kingdom - 20%
  DE: 0.19, // Germany - 19%
  FR: 0.20, // France - 20%
  US: 0.00, // United States - 0% (no federal VAT/GST)
  ZA: 0.15, // South Africa - 15%
};

/**
 * Country names for display in UI
 */
export const COUNTRY_NAMES: Record<string, string> = {
  IL: "Israel",
  GB: "United Kingdom",
  DE: "Germany",
  FR: "France",
  US: "United States",
  ZA: "South Africa",
};

/**
 * Get VAT rate for a country code
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns VAT rate as decimal, defaults to IL (0.17) if country not found
 */
export function getVatRate(countryCode?: string): number {
  if (!countryCode) return VAT_RATES.IL; // Default to Israel
  return VAT_RATES[countryCode] ?? VAT_RATES.IL;
}

/**
 * Get formatted VAT label for display
 * @param countryCode - ISO 3166-1 alpha-2 country code
 * @returns Formatted label like "VAT (UK 20%)" or "VAT (17%)" for default
 */
export function getVatLabel(countryCode?: string): string {
  const code = countryCode || "IL";
  const rate = getVatRate(code);
  const percentage = Math.round(rate * 100);
  
  if (!countryCode || countryCode === "IL") {
    return `VAT (${percentage}%)`;
  }
  
  return `VAT (${code} ${percentage}%)`;
}

/**
 * Get available countries for settings dropdown
 * @returns Array of {code, name, rate} objects
 */
export function getAvailableCountries() {
  return Object.keys(VAT_RATES).map((code) => ({
    code,
    name: COUNTRY_NAMES[code] || code,
    rate: VAT_RATES[code],
  }));
}
