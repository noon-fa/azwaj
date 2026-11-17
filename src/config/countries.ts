export interface CountryConfig {
  code: string;
  name: string;
  currency: string;
  timezone: string;
  phonePrefix: string;
  districts: string[];
  languages: string[];
  enabled: boolean;
}

export const COUNTRIES: Record<string, CountryConfig> = {
  LK: {
    code: 'LK',
    name: 'Sri Lanka',
    currency: 'LKR',
    timezone: 'Asia/Colombo',
    phonePrefix: '+94',
    districts: [
      'Colombo',
      'Kandy',
      'Gampaha',
      'Kalutara',
      'Galle',
      'Matara',
      'Puttalam',
      'Kurunegala',
      'Matale',
      'Batticaloa',
      'Ampara',
      'Trincomalee',
      'Anuradhapura',
      'Badulla',
      'Ratnapura',
      'Kegalle',
      'Hambantota',
      'Nuwara Eliya',
      'Jaffna',
      'Mannar',
      'Vavuniya',
      'Polonnaruwa',
      'Matale',
      'Monaragala',
      'Kilinochchi',
    ].filter((v, i, a) => a.indexOf(v) === i),
    languages: ['English', 'Tamil', 'Sinhala', 'Arabic', 'Urdu'],
    enabled: true,
  },
  MY: {
    code: 'MY',
    name: 'Malaysia',
    currency: 'MYR',
    timezone: 'Asia/Kuala_Lumpur',
    phonePrefix: '+60',
    districts: ['Kuala Lumpur', 'Selangor', 'Penang', 'Johor Bahru'],
    languages: ['English', 'Malay', 'Arabic', 'Tamil'],
    enabled: false,
  },
  SG: {
    code: 'SG',
    name: 'Singapore',
    currency: 'SGD',
    timezone: 'Asia/Singapore',
    phonePrefix: '+65',
    districts: ['Central', 'East', 'North', 'West'],
    languages: ['English', 'Malay', 'Tamil', 'Arabic'],
    enabled: false,
  },
};

export const ACTIVE_COUNTRY_CODE = (import.meta.env.VITE_COUNTRY_CODE as string) || 'LK';
export const DEFAULT_COUNTRY = COUNTRIES[ACTIVE_COUNTRY_CODE] || COUNTRIES.LK;

export const SUPPORTED_COUNTRIES_LIST = Object.values(COUNTRIES)
  .filter((c) => c.enabled)
  .map((c) => c.name);

export const SRI_LANKA_DISTRICTS = COUNTRIES.LK.districts;
export const COMMON_LANGUAGES = ['English', 'Tamil', 'Sinhala', 'Arabic', 'Urdu', 'Malay'];
