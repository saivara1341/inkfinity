import { z } from "zod";

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
  email: z.string().trim().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(128),
});

export const shopRegistrationSchema = z.object({
  name: z.string().trim().min(2, "Shop name is required").max(200),
  description: z.string().max(1000).optional(),
  phone: z.string().regex(/^[+]?[\d\s-]{10,15}$/, "Invalid phone number"),
  email: z.string().trim().email("Invalid email"),
  address: z.string().trim().min(5, "Address is required").max(500),
  city: z.string().trim().min(2, "City is required").max(100),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  services: z.array(z.string()).min(1, "Select at least one service"),
});

export const checkoutSchema = z.object({
  fullName: z.string().trim().min(2, "Name is required").max(100),
  phone: z.string().regex(/^[+]?[\d\s-]{10,15}$/, "Invalid phone number"),
  address: z.string().trim().min(10, "Full address is required").max(500),
  city: z.string().trim().min(2, "City is required"),
  state: z.string().trim().min(2, "State is required"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
});

export const productSchema = z.object({
  name: z.string().trim().min(2, "Product name is required").max(200),
  description: z.string().max(1000).optional(),
  category: z.string().min(1, "Category is required"),
  base_price: z.number().min(0, "Price must be positive"),
  min_quantity: z.number().int().min(1, "Min quantity must be at least 1"),
  max_quantity: z.number().int().optional(),
});

export type SignupInput = z.infer<typeof signupSchema>;
export type ShopRegistrationInput = z.infer<typeof shopRegistrationSchema>;
export type CheckoutInput = z.infer<typeof checkoutSchema>;
export type ProductInput = z.infer<typeof productSchema>;
