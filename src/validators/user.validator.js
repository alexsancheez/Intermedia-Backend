import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(8),
});

export const validationSchema = z.object({
  code: z.string().length(6),
});

export const loginSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(1),
});

export const personalDataSchema = z.object({
  name: z
    .string()
    .min(1)
    .transform((val) => val.trim()),
  lastName: z
    .string()
    .min(1)
    .transform((val) => val.trim()),
  nif: z
    .string()
    .min(1)
    .transform((val) => val.trim()),
});

export const companySchema = z.discriminatedUnion("isFreelance", [
  z.object({
    isFreelance: z.literal(true),
  }),
  z.object({
    isFreelance: z.literal(false),
    name: z
      .string()
      .min(1)
      .transform((val) => val.trim()),
    cif: z
      .string()
      .min(1)
      .transform((val) => val.trim()),
    address: z.object({
      street: z.string().min(1),
      number: z.string().min(1),
      postal: z.string().min(1),
      city: z.string().min(1),
      province: z.string().min(1),
    }),
  }),
]);

export const inviteSchema = z.object({
  email: z
    .string()
    .email()
    .transform((val) => val.toLowerCase().trim()),
  password: z.string().min(8),
  name: z
    .string()
    .min(1)
    .transform((val) => val.trim()),
  lastName: z
    .string()
    .min(1)
    .transform((val) => val.trim()),
  nif: z
    .string()
    .min(1)
    .transform((val) => val.trim()),
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(8),
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });
