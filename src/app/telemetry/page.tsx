"use client";
import Image from "next/image";
import { submitTelemetry } from "./actions";
import { useState } from "react";

export default function addTelemetry() {
  const [status, setStatus] = useState<{
    success: boolean | null;
    msg: string;
  }>({
    success: null,
    msg: "",
  });

  const handleFormSubmit = async (formData: FormData) => {
    setStatus({ success: null, msg: "Submitting..." });

    // Call the server action directly like a regular function
    const result = await submitTelemetry(formData);

    if (result.success) {
      setStatus({ success: true, msg: "Telemetry data sent successfully!" });
    } else {
      setStatus({
        success: false,
        msg: result.error || "Something went wrong.",
      });
    }
  };

  return (
    <main
      style={{
        maxWidth: "400px",
        margin: "40px auto",
        fontFamily: "sans-serif",
      }}
    >
      <h1>Insert Telemetry Data</h1>

      {/* HTML forms natively support the 'action' attribute passing FormData to Server Actions */}
      <form
        action={handleFormSubmit}
        style={{ display: "flex", flexDirection: "column", gap: "12px" }}
      >
        <div>
          <label style={{ display: "block" }}>Habitat ID</label>
          <input
            type="number"
            name="habitatId"
            defaultValue="1"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label style={{ display: "block" }}>Temperature (°C)</label>
          <input
            type="number"
            step="0.1"
            name="temperature"
            placeholder="26.5"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div>
          <label style={{ display: "block" }}>Humidity (%)</label>
          <input
            type="number"
            step="0.1"
            name="humidity"
            placeholder="65.5"
            required
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <button
          type="submit"
          style={{
            padding: "10px",
            cursor: "pointer",
            background: "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Submit Telemetry
        </button>
      </form>

      {status.msg && (
        <p
          style={{
            marginTop: "15px",
            color: status.success
              ? "green"
              : status.success === false
                ? "red"
                : "black",
          }}
        >
          {status.msg}
        </p>
      )}
    </main>
  );
}
