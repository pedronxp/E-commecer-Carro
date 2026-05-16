import { z } from "zod";

export const brandSchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const categorySchema = z.object({
  name: z.string().trim().min(2).max(80),
});

export const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().email(),
  password: z.string().min(6).max(100),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const carSchema = z.object({
  title: z.string().trim().min(2).max(180),
  description: z.string().trim().min(5),
  price: z.coerce.number().positive(),
  year: z.coerce.number().int().min(1900).max(2100),
  mileage: z.coerce.number().int().nonnegative().nullable().optional(),
  fuelType: z.string().trim().max(60).nullable().optional(),
  transmission: z.string().trim().max(60).nullable().optional(),
  color: z.string().trim().max(60).nullable().optional(),
  doors: z.coerce.number().int().min(1).max(10).nullable().optional(),
  capacity: z.coerce.number().int().min(1).max(20).nullable().optional(),
  location: z.string().trim().max(120).nullable().optional(),
  features: z.array(z.string().trim().min(1).max(80)).optional(),
  isSold: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  brandId: z.string().min(1),
  categoryId: z.string().min(1),
  images: z.array(z.string().url()).optional(),
});

export const carToggleSchema = z.object({
  carId: z.string().min(1),
});
