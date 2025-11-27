// US States - Lower 48 + Alaska & Hawaii
// This file provides utilities for state validation and normalization

export const US_STATES: Record<string, string> = {
  AL: "Alabama",
  AK: "Alaska",
  AZ: "Arizona",
  AR: "Arkansas",
  CA: "California",
  CO: "Colorado",
  CT: "Connecticut",
  DE: "Delaware",
  FL: "Florida",
  GA: "Georgia",
  HI: "Hawaii",
  ID: "Idaho",
  IL: "Illinois",
  IN: "Indiana",
  IA: "Iowa",
  KS: "Kansas",
  KY: "Kentucky",
  LA: "Louisiana",
  ME: "Maine",
  MD: "Maryland",
  MA: "Massachusetts",
  MI: "Michigan",
  MN: "Minnesota",
  MS: "Mississippi",
  MO: "Missouri",
  MT: "Montana",
  NE: "Nebraska",
  NV: "Nevada",
  NH: "New Hampshire",
  NJ: "New Jersey",
  NM: "New Mexico",
  NY: "New York",
  NC: "North Carolina",
  ND: "North Dakota",
  OH: "Ohio",
  OK: "Oklahoma",
  OR: "Oregon",
  PA: "Pennsylvania",
  RI: "Rhode Island",
  SC: "South Carolina",
  SD: "South Dakota",
  TN: "Tennessee",
  TX: "Texas",
  UT: "Utah",
  VT: "Vermont",
  VA: "Virginia",
  WA: "Washington",
  WV: "West Virginia",
  WI: "Wisconsin",
  WY: "Wyoming",
};

// Create reverse mapping: full name -> abbreviation (case-insensitive)
const STATE_NAME_TO_CODE = Object.entries(US_STATES).reduce((acc, [code, name]) => {
  acc[name.toLowerCase()] = code;
  return acc;
}, {} as Record<string, string>);

/**
 * Normalize state input to standard abbreviation format
 * Accepts: "VA", "va", "Virginia", "virginia", etc.
 * Returns: "VA" (uppercase abbreviation) or null if invalid
 */
export function normalizeState(input: string): string | null {
  const trimmed = input.trim();

  // Check if it's already a valid abbreviation
  const upperInput = trimmed.toUpperCase();
  if (US_STATES[upperInput]) {
    return upperInput;
  }

  // Check if it's a full state name (case-insensitive)
  const lowerInput = trimmed.toLowerCase();
  if (STATE_NAME_TO_CODE[lowerInput]) {
    return STATE_NAME_TO_CODE[lowerInput];
  }

  return null;
}

/**
 * Check if a state input is valid
 */
export function isValidState(input: string): boolean {
  return normalizeState(input) !== null;
}

/**
 * Get full state name from abbreviation or name
 * Returns: "Virginia" or null if invalid
 */
export function getStateName(input: string): string | null {
  const code = normalizeState(input);
  return code ? US_STATES[code] : null;
}

/**
 * Get all states as array of { code, name }
 */
export function getAllStates(): Array<{ code: string; name: string }> {
  return Object.entries(US_STATES).map(([code, name]) => ({ code, name }));
}
