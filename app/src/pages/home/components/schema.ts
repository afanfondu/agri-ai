import { object, number, InferType, string } from "yup";

export const cropFormSchema = object({
  nitrogen: number()
    .required("Nitrogen is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Nitrogen must be at least 0")
    .max(140, "Nitrogen must be at most 140"),
  phosphorus: number()
    .required("Phosphorus is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(5, "Phosphorus must be at least 5")
    .max(145, "Phosphorus must be at most 145"),
  potassium: number()
    .required("Potassium is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(5, "Potassium must be at least 5")
    .max(205, "Potassium must be at most 205"),
  temperature: number()
    .required("Temperature is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(8, "Temperature must be at least 8°C")
    .max(44, "Temperature must be at most 44°C"),
  humidity: number()
    .required("Humidity is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(14, "Humidity must be at least 14%")
    .max(100, "Humidity must be at most 100%"),
  ph: number()
    .required("pH is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(3.5, "pH must be at least 3.5")
    .max(10, "pH must be at most 10"),
  rainfall: number()
    .required("Rainfall is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(20, "Rainfall must be at least 20mm")
    .max(300, "Rainfall must be at most 300mm"),
});

export type CropFormValues = InferType<typeof cropFormSchema>;

export const fertilizerFormSchema = object({
  temperature: number()
    .required("Temperature is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(8, "Temperature must be at least 8°C")
    .max(44, "Temperature must be at most 44°C"),
  humidity: number()
    .required("Humidity is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(14, "Humidity must be at least 14%")
    .max(100, "Humidity must be at most 100%"),
  moisture: number()
    .required("Moisture is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Moisture must be at least 0%")
    .max(100, "Moisture must be at most 100%"),
  nitrogen: number()
    .required("Nitrogen is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Nitrogen must be at least 0")
    .max(140, "Nitrogen must be at most 140"),
  potassium: number()
    .required("Potassium is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Potassium must be at least 0")
    .max(205, "Potassium must be at most 205"),
  phosphorous: number()
    .required("Phosphorous is required")
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, "Phosphorous must be at least 0")
    .max(145, "Phosphorous must be at most 145"),
  soilType: string().required("Please select a soil type"),
  cropType: string().required("Please select a crop type"),
});

export type FertilizerFormValues = InferType<typeof fertilizerFormSchema>;
