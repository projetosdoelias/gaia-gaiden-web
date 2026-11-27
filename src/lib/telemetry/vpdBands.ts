/**
 * VPD display bands (kPa), shared by the dashboard VPD card and the chart so
 * the labels and thresholds can't drift apart.
 *
 * Each band covers values up to and including `max` (the first band that
 * matches wins): <0.4 Too Low, <0.8 Low, 0.8–1.2 Ideal, ≤1.6 High, >1.6 Critical.
 */
export type VpdTone = "critical" | "warning" | "ideal";

export type VpdBand = {
  label: "Too Low" | "Low" | "Ideal" | "High" | "Critical";
  /** Lower bound (kPa). */
  min: number;
  /** Upper bound (kPa); `Infinity` for the last band. */
  max: number;
  /** Whether `max` itself belongs to the band. */
  maxInclusive: boolean;
  tone: VpdTone;
};

export const VPD_BANDS: readonly VpdBand[] = [
  { label: "Too Low", min: 0, max: 0.4, maxInclusive: false, tone: "critical" },
  { label: "Low", min: 0.4, max: 0.8, maxInclusive: false, tone: "warning" },
  { label: "Ideal", min: 0.8, max: 1.2, maxInclusive: true, tone: "ideal" },
  { label: "High", min: 1.2, max: 1.6, maxInclusive: true, tone: "warning" },
  { label: "Critical", min: 1.6, max: Infinity, maxInclusive: false, tone: "critical" },
];

/** The band a VPD value falls in. */
export function getVpdBand(vpd: number): VpdBand {
  return (
    VPD_BANDS.find((band) =>
      band.maxInclusive ? vpd <= band.max : vpd < band.max,
    ) ?? VPD_BANDS[VPD_BANDS.length - 1]
  );
}
