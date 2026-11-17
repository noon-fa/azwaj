import { z } from 'zod';

export const brotherRegistrationSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100),
  displayName: z.string().trim().min(2, 'Public display name is required').max(80),
  phone: z.string().trim().min(7, 'Valid phone number is required').max(24),
  dateOfBirth: z
    .string()
    .min(8, 'Date of birth is required')
    .max(20)
    .refine((val) => {
      const year = new Date(val).getFullYear();
      return !Number.isNaN(year) && year >= 1945 && year <= 2008;
    }, 'Must be at least 18 years old'),
  country: z.string().trim().min(2, 'Country is required').max(60),
  cityDistrict: z.string().trim().min(2, 'City or district is required').max(80),
  nationality: z.string().trim().min(2, 'Nationality is required').max(60),
  education: z.string().trim().min(2, 'Education background is required').max(140),
  occupation: z.string().trim().min(2, 'Occupation is required').max(120),
  maritalStatus: z.enum(['never_married', 'divorced', 'widowed']),
  religiousPractice: z
    .string()
    .trim()
    .min(10, 'Please share a brief note on your religious practice (min 10 chars)')
    .max(600),
  languages: z.array(z.string().min(1).max(40)).min(1, 'Select at least one language').max(10),
  marriagePreferences: z
    .string()
    .trim()
    .min(10, 'Please describe your marriage preferences (min 10 chars)')
    .max(800),
  about: z
    .string()
    .trim()
    .min(20, 'Please introduce yourself (min 20 chars)')
    .max(1200),
  showPhotoPublicly: z.boolean(),
  consentToPublish: z.literal(true, {
    message: 'Explicit consent is required before review and publication',
  }),
});

export type BrotherRegistrationInput = z.infer<typeof brotherRegistrationSchema>;

export const waliIntroductionSchema = z.object({
  waliName: z.string().trim().min(2, 'Wali full name is required').max(100),
  waliRelationship: z.string().trim().min(2, 'Relationship to the sister is required').max(60),
  waliEmail: z.string().trim().email('Enter a valid email address').max(180),
  waliPhone: z.string().trim().min(7, 'Valid phone number is required').max(24),
  waliCountry: z.string().trim().min(2, 'Country is required').max(60),
  waliCityDistrict: z.string().trim().min(2, 'City or district is required').max(80),
  sisterName: z.string().trim().min(2, 'Sister name or identifier is required').max(100),
  sisterAge: z.number().int().min(18, 'Minimum age is 18').max(80, 'Enter a valid age'),
  sisterCountry: z.string().trim().min(2, 'Country is required').max(60),
  sisterCityDistrict: z.string().trim().min(2, 'City or district is required').max(80),
  sisterEducation: z.string().trim().min(2, 'Education is required').max(140),
  sisterOccupation: z.string().trim().max(120).optional().or(z.literal('')),
  sisterLanguages: z.array(z.string().min(1).max(40)).min(1, 'Select at least one language').max(10),
  sisterMarriageInfo: z
    .string()
    .trim()
    .min(10, 'Provide relevant marriage background (min 10 chars)')
    .max(800),
  sisterNote: z
    .string()
    .trim()
    .min(10, 'Provide a respectful introduction note (min 10 chars)')
    .max(1000),
  additionalMessage: z.string().trim().max(800).optional().or(z.literal('')),
  confirmedWaliAuthority: z.literal(true, {
    message: 'You must confirm you are acting as the sister’s wali or authorized guardian',
  }),
  privacyConsent: z.literal(true, {
    message: 'Consent to the Azwaj Privacy Policy is required',
  }),
});

export type WaliIntroductionInput = z.infer<typeof waliIntroductionSchema>;

export const scholarFormSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required').max(100),
  email: z.string().trim().email('Valid email required').max(180).optional().or(z.literal('')),
  uid: z.string().trim().max(128).optional().or(z.literal('')),
  gender: z.enum(['male', 'female']),
  title: z.string().trim().min(2, 'Title is required').max(60),
  qualification: z.string().trim().min(2, 'Qualification is required').max(160),
  education: z.string().trim().min(5, 'Educational background is required').max(300),
  expertise: z.array(z.string().min(1).max(60)).min(1, 'Select at least one area').max(10),
  languages: z.array(z.string().min(1).max(40)).min(1, 'Select at least one language').max(10),
  biography: z.string().trim().min(20, 'Biography must be at least 20 characters').max(1500),
  experienceYears: z.number().int().min(0).max(70),
  counsellingFormats: z.array(z.enum(['online', 'in_person'])).min(1).max(2),
  counsellingTypes: z
    .array(z.enum(['pre_marital', 'married_couples', 'individual']))
    .min(1)
    .max(3),
  sessionDurationMinutes: z.number().int().min(15).max(180),
  sessionPriceLkr: z.number().int().min(0).max(100000),
  country: z.string().trim().min(2).max(60),
  cityLocation: z.string().trim().max(120).optional().or(z.literal('')),
  timezone: z.string().trim().min(3).max(60),
  photoUrl: z.string().trim().max(500).optional().or(z.literal('')),
  isActive: z.boolean(),
});

export type ScholarFormInput = z.infer<typeof scholarFormSchema>;

export const counsellingBookingSchema = z.object({
  counsellingType: z.enum(['pre_marital', 'married_couples', 'individual']),
  format: z.enum(['online', 'in_person']),
  clientName: z.string().trim().min(2, 'Your name is required').max(100),
  clientEmail: z.string().trim().email('Valid email address is required').max(180),
  clientPhone: z.string().trim().min(7, 'Valid phone number is required').max(24),
  issueSummary: z
    .string()
    .trim()
    .min(10, 'Please share a brief summary (min 10 characters)')
    .max(1000),
});

export type CounsellingBookingInput = z.infer<typeof counsellingBookingSchema>;

export const contactInquirySchema = z.object({
  name: z.string().trim().min(2, 'Your name is required').max(100),
  email: z.string().trim().email('Valid email address is required').max(180),
  topic: z.string().trim().min(2, 'Please select a topic').max(80),
  message: z.string().trim().min(10, 'Message must be at least 10 characters').max(1500),
});

export type ContactInquiryInput = z.infer<typeof contactInquirySchema>;
