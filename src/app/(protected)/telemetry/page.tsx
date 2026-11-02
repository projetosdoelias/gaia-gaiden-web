"use client";
import Image from "next/image";
import { submitTelemetry } from "./actions";
import { useState } from "react";
import { useHabitat } from "@/lib/context/HabitatContext";

export default function addTelemetry() {
  const {
    selectedHabitatId,
    setSelectedHabitatId,
    habitats,
    isLoading,
  } = useHabitat();

  const [status, setStatus] = useState<{
    success: boolean | null;
    msg: string;
  }>({
    success: null,
    msg: "",
  });

  const handleFormSubmit = async (formData: FormData) => {
    setStatus({ success: null, msg: "Submitting..." });

    // Override habitatId with the globally selected one
    if (selectedHabitatId !== null) {
      formData.set("habitatId", String(selectedHabitatId));
    }

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
          <label style={{ display: "block" }}>Habitat</label>
          {isLoading ? (
            <p style={{ color: "#999", fontSize: "0.9em" }}>
              Loading habitats...
            </p>
          ) : (
            <select
              name="habitatId"
              value={selectedHabitatId ?? ""}
              onChange={(e) => {
                setSelectedHabitatId(Number(e.target.value));
              }}
              required
              style={{ width: "100%", padding: "8px", fontSize: "1em" }}
            >
              {habitats.length === 0 && (
                <option value="" disabled>
                  No habitats available
                </option>
              )}
              {habitats.map((h) => (
                <option key={h.id} value={h.id}>
                  🌱 {h.title}
                </option>
              ))}
            </select>
          )}
        </div>

        <div>
          <label style={{ display: "block" }}>Temperature (°C)</label>
          <input
            type="number"
            step="0.1"
            name="temperature"
            placeholder="26.5"
            required
            style={{ width: "100%", padding: "8px", fontSize: "1em" }}
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
            style={{ width: "100%", padding: "8px", fontSize: "1em" }}
          />
        </div>
        <button
          type="submit"
          disabled={selectedHabitatId === null}
          style={{
            padding: "10px",
            cursor: selectedHabitatId === null ? "not-allowed" : "pointer",
            background: selectedHabitatId === null ? "#ccc" : "#0070f3",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            fontSize: "1em",
          }}
        >
          {selectedHabitatId === null
            ? "Select a habitat first"
            : "Submit Telemetry"}
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
