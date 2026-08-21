"use server";

import { revalidatePath } from "next/cache";

export async function submitTelemetry(formData: FormData) {
  // 1. Extract values from the form data
  const payload = {
    habitatId: Number(formData.get("habitatId")),
    temperature: parseFloat(formData.get("temperature") as string),
    humidity: parseFloat(formData.get("humidity") as string),
  };

  try {
    // 2. Safely forward data to your third-party API from the server
    const response = await fetch(
      `${process.env.GAIA_GARDEN_API_URL}/telemetry`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.TELEMETRY_API_KEY || "", // Kept safe on the server
        },
        body: JSON.stringify(payload),
      },
    );

    console.log(response);

    if (!response.ok) {
      return { success: false, error: "Failed to save telemetry data to API." };
    }

    // 3. Clear cache for the page to show updated data if necessary
    revalidatePath("/telemetry");
    return { success: true, error: null };
  } catch (error) {
    return { success: false, error: "Internal Server Error." };
  }
}
