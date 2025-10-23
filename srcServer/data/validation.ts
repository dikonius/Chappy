import * as z from 'zod'

// Reusable field schemas
const usernameField = z.string().min(1, "Username is required").transform(s => s.trim());
const passwordField = z.string().min(8, "Password must be at least 8 characters");

// Composed schemas using the reusable fields
export const loginSchema = z.object({
  name: usernameField,
  password: passwordField,
});

export const registerSchema = z.object({
  name: usernameField,
  password: passwordField,
});

export const updateUserSchema = z.object({
  name: usernameField,
  password: passwordField,
});