"use server";

import { revalidatePath } from "next/cache";
import { telemetryClient } from "@/lib/api/telemetryClient";

export async function submitTelemetry(formData: FormData) {
  // 1. Extract values from the form data
  const payload = {
    habitatId: Number(formData.get("habitatId")),
    temperature: parseFloat(formData.get("temperature") as string),
    humidity: parseFloat(formData.get("humidity") as string),
  };

  try {
    // 2. Forward data to NestJS via telemetryClient
    await telemetryClient.submit(payload);

    // 3. Clear cache for the page to show updated data if necessary
    revalidatePath("/telemetry");
    return { success: true, error: null as string | null };
  } catch (error) {
    return { success: false, error: "Internal Server Error." };
  }
}
