import { z } from "zod";

// Strong password validation with Italian messages
export const strongPasswordSchema = z.string()
  .min(8, "La password deve essere di almeno 8 caratteri")
  .regex(/[A-Z]/, "La password deve contenere almeno una lettera maiuscola")
  .regex(/[a-z]/, "La password deve contenere almeno una lettera minuscola")
  .regex(/[0-9]/, "La password deve contenere almeno un numero")
  .regex(/[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/`~]/, "La password deve contenere almeno un carattere speciale (!@#$%^&*...)");

// Italian Tax Code (Codice Fiscale) validation
export const italianTaxCodeSchema = z.string()
  .transform(val => val.toUpperCase().trim())
  .refine(
    (val) => {
      if (!val) return true; // Allow empty for optional fields
      // Italian tax code format: 6 letters + 2 digits + 1 letter + 2 digits + 1 letter + 3 digits + 1 letter
      const regex = /^[A-Z]{6}\d{2}[A-EHLMPRST]\d{2}[A-Z]\d{3}[A-Z]$/i;
      return regex.test(val);
    },
    { message: "Codice fiscale non valido. Formato: RSSMRA85M01H501U" }
  );

// Italian Tax Code - required version
export const italianTaxCodeRequiredSchema = z.string()
  .min(1, "Il codice fiscale è obbligatorio")
  .transform(val => val.toUpperCase().trim())
  .refine(
    (val) => {
      const regex = /^[A-Z]{6}\d{2}[A-EHLMPRST]\d{2}[A-Z]\d{3}[A-Z]$/i;
      return regex.test(val);
    },
    { message: "Codice fiscale non valido. Formato: RSSMRA85M01H501U" }
  );

// Italian IBAN validation
export const italianIbanSchema = z.string()
  .transform(val => val.replace(/\s/g, '').toUpperCase().trim())
  .refine(
    (val) => {
      if (!val) return true; // Allow empty for optional fields
      // Italian IBAN: IT + 2 check digits + 1 letter + 5 digits + 5 digits + 12 alphanumeric = 27 chars
      if (val.length !== 27) return false;
      const regex = /^IT\d{2}[A-Z]\d{5}\d{5}[A-Z0-9]{12}$/;
      return regex.test(val);
    },
    { message: "IBAN italiano non valido. Formato: IT60X0542811101000000123456" }
  );

// Italian IBAN - required version
export const italianIbanRequiredSchema = z.string()
  .min(1, "L'IBAN è obbligatorio")
  .transform(val => val.replace(/\s/g, '').toUpperCase().trim())
  .refine(
    (val) => {
      if (val.length !== 27) return false;
      const regex = /^IT\d{2}[A-Z]\d{5}\d{5}[A-Z0-9]{12}$/;
      return regex.test(val);
    },
    { message: "IBAN italiano non valido. Formato: IT60X0542811101000000123456" }
  );

// Italian phone number validation
export const italianPhoneSchema = z.string()
  .optional()
  .transform(val => val ? val.replace(/\s/g, '').trim() : undefined)
  .refine(
    (val) => {
      if (!val) return true; // Allow empty
      // Italian phone: optional +39, then 6-12 digits
      const regex = /^(\+39)?[0-9]{6,12}$/;
      return regex.test(val);
    },
    { message: "Numero di telefono non valido. Formato: +39 3331234567 o 0612345678" }
  );

// Email validation with Italian messages
export const emailSchema = z.string()
  .min(1, "L'email è obbligatoria")
  .email("Inserisci un'email valida")
  .max(255, "L'email è troppo lunga");

// Optional email
export const optionalEmailSchema = z.string()
  .email("Inserisci un'email valida")
  .max(255, "L'email è troppo lunga")
  .optional()
  .or(z.literal(""));

// Full name validation
export const fullNameSchema = z.string()
  .min(2, "Il nome deve essere di almeno 2 caratteri")
  .max(100, "Il nome è troppo lungo")
  .regex(/^[a-zA-ZàèéìòùÀÈÉÌÒÙ\s'-]+$/, "Il nome può contenere solo lettere, spazi e apostrofi");

// Company name validation
export const companyNameSchema = z.string()
  .min(2, "Il nome azienda deve essere di almeno 2 caratteri")
  .max(200, "Il nome azienda è troppo lungo");

// Italian VAT number (Partita IVA)
export const italianVatSchema = z.string()
  .optional()
  .transform(val => val ? val.replace(/\s/g, '').trim() : undefined)
  .refine(
    (val) => {
      if (!val) return true;
      // Italian VAT: 11 digits, optionally prefixed with IT
      const cleaned = val.replace(/^IT/i, '');
      return /^\d{11}$/.test(cleaned);
    },
    { message: "Partita IVA non valida. Deve essere di 11 cifre" }
  );

// Login form schema
export const loginFormSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "La password è obbligatoria"),
});

// Registration form schema with strong password
export const registerFormSchema = z.object({
  fullName: fullNameSchema,
  companyName: companyNameSchema,
  email: emailSchema,
  password: strongPasswordSchema,
  confirmPassword: z.string(),
}).refine(
  (data) => data.password === data.confirmPassword,
  {
    message: "Le password non coincidono",
    path: ["confirmPassword"],
  }
);

// Create company schema with strong password
export const createCompanySchema = z.object({
  adminEmail: emailSchema,
  adminPassword: strongPasswordSchema,
  adminFullName: fullNameSchema,
  companyName: companyNameSchema,
  companyEmail: emailSchema,
});

// Edit company schema
export const editCompanySchema = z.object({
  companyName: companyNameSchema,
  companyEmail: emailSchema,
});

// Create user schema with strong password
export const createUserSchema = z.object({
  email: emailSchema,
  password: strongPasswordSchema,
  fullName: fullNameSchema,
  role: z.enum(["admin", "hr_manager", "employee"]),
});

// Update user password schema
export const updateUserPasswordSchema = z.object({
  password: strongPasswordSchema.optional().or(z.literal("")),
});

// Employee basic info schema
export const employeeBasicInfoSchema = z.object({
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  tax_code: italianTaxCodeSchema.optional(),
  email: optionalEmailSchema,
  phone: italianPhoneSchema,
  birth_date: z.string().optional(),
  city: z.string().max(100).optional(),
  postal_code: z.string().max(10).optional(),
  province: z.string().max(2).optional(),
  country: z.string().max(100).optional(),
  iban: italianIbanRequiredSchema,
});

// Validation helper function
export function getValidationErrors(error: z.ZodError): string[] {
  return error.errors.map(err => err.message);
}

// Validation helper to get first error
export function getFirstValidationError(error: z.ZodError): string {
  return error.errors[0]?.message || "Errore di validazione";
}
