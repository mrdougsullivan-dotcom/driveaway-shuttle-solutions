// contracts.ts
// Shared API contracts (schemas and types) used by both the server and the app.
// Import in the app as: `import { type GetSampleResponse } from "@shared/contracts"`
// Import in the server as: `import { postSampleRequestSchema } from "@shared/contracts"`

import { z } from "zod";

// GET /api/sample
export const getSampleResponseSchema = z.object({
  message: z.string(),
});
export type GetSampleResponse = z.infer<typeof getSampleResponseSchema>;

// POST /api/sample
export const postSampleRequestSchema = z.object({
  value: z.string(),
});
export type PostSampleRequest = z.infer<typeof postSampleRequestSchema>;
export const postSampleResponseSchema = z.object({
  message: z.string(),
});
export type PostSampleResponse = z.infer<typeof postSampleResponseSchema>;

// POST /api/upload/image
export const uploadImageRequestSchema = z.object({
  image: z.instanceof(File),
});
export type UploadImageRequest = z.infer<typeof uploadImageRequestSchema>;
export const uploadImageResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  url: z.string(),
  filename: z.string(),
});
export type UploadImageResponse = z.infer<typeof uploadImageResponseSchema>;

// Driver schemas
export const driverSchema = z.object({
  id: z.string(),
  name: z.string(),
  phoneNumber: z.string().nullable(),
  email: z.string().nullable(),
  state: z.string(),
  city: z.string(),
  status: z.enum(["available", "on_trip", "offline"]),
  vehicleType: z.string().nullable(),
  serviceLocations: z.string().nullable(),
  notes: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type Driver = z.infer<typeof driverSchema>;

// GET /api/drivers
export const getDriversResponseSchema = z.object({
  drivers: z.array(driverSchema),
});
export type GetDriversResponse = z.infer<typeof getDriversResponseSchema>;

// GET /api/drivers/states
export const getStatesResponseSchema = z.object({
  states: z.array(z.object({
    code: z.string(),
    name: z.string(),
    driverCount: z.number(),
  })),
});
export type GetStatesResponse = z.infer<typeof getStatesResponseSchema>;

// GET /api/drivers/cities/:state
export const getCitiesResponseSchema = z.object({
  cities: z.array(z.object({
    name: z.string(),
    driverCount: z.number(),
  })),
});
export type GetCitiesResponse = z.infer<typeof getCitiesResponseSchema>;

// GET /api/drivers/:id
export const getDriverResponseSchema = z.object({
  driver: driverSchema,
});
export type GetDriverResponse = z.infer<typeof getDriverResponseSchema>;

// POST /api/drivers
export const createDriverRequestSchema = z.object({
  name: z.string(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  state: z.string(),
  city: z.string(),
  status: z.enum(["available", "on_trip", "offline"]),
  vehicleType: z.string().optional(),
  serviceLocations: z.string().optional(),
  notes: z.string().optional(),
});
export type CreateDriverRequest = z.infer<typeof createDriverRequestSchema>;
export const createDriverResponseSchema = z.object({
  driver: driverSchema,
});
export type CreateDriverResponse = z.infer<typeof createDriverResponseSchema>;

// PATCH /api/drivers/:id
export const updateDriverRequestSchema = createDriverRequestSchema;
export type UpdateDriverRequest = z.infer<typeof updateDriverRequestSchema>;
export const updateDriverResponseSchema = createDriverResponseSchema;
export type UpdateDriverResponse = z.infer<typeof updateDriverResponseSchema>;

// POST /api/upload/extract-contact
export const extractContactResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  error: z.string().optional(),
  name: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  serviceLocations: z.array(z.string()).optional(),
});
export type ExtractContactResponse = z.infer<typeof extractContactResponseSchema>;

// GET /api/drivers/stats
export const getDriverStatsResponseSchema = z.object({
  totalCompanies: z.number(),
  totalStates: z.number(),
});
export type GetDriverStatsResponse = z.infer<typeof getDriverStatsResponseSchema>;
