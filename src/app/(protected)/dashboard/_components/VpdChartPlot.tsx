"use client";

import { useMemo, useState, type KeyboardEvent, type PointerEvent } from "react";
import type { TelemetrySeriesResponse } from "@/lib/api/telemetryClient";
import type { VpdTone } from "@/lib/telemetry/vpdBands";
import { useElementWidth } from "./useElementWidth";
import { MARGIN, buildChartModel, nearestIndex } from "./vpdChartModel";
import { TOOLTIP_WIDTH, VpdChartTooltip } from "./VpdChartTooltip";

export const CHART_HEIGHT = 256;

/** Static class names so Tailwind can see them. */
const BAND_FILL: Record<VpdTone, string> = {
  critical: "fill-gaia-alert-critical/10",
  warning: "fill-gaia-alert-warning/10",
  ideal: "fill-gaia-alert-success/15",
};

type Props = { series: TelemetrySeriesResponse; label: string };

/** The SVG chart: bands, axes, line, points, crosshair and tooltip. */
export function VpdChartPlot({ series, label }: Props) {
  const [ref, width] = useElementWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const model = useMemo(() => buildChartModel(series, width, CHART_HEIGHT), [series, width]);

  const point = model && active !== null ? model.points[active] : undefined;

  function onPointerMove(event: PointerEvent<SVGRectElement>) {
    if (!model) return;
    const px = event.clientX - event.currentTarget.getBoundingClientRect().left;
    setActive(nearestIndex(model.points, model.timeAt(px)));
  }

  function onKeyDown(event: KeyboardEvent<SVGSVGElement>) {
    if (!model || (event.key !== "ArrowLeft" && event.key !== "ArrowRight")) return;
    event.preventDefault();
    const last = model.points.length - 1;
    const step = event.key === "ArrowLeft" ? -1 : 1;
    setActive((i) => (i === null ? last : Math.min(last, Math.max(0, i + step))));
  }

  return (
    <div ref={ref} className="relative w-full" style={{ height: CHART_HEIGHT }}>
      {model && (
        <svg
          width={width}
          height={CHART_HEIGHT}
          role="img"
          aria-label={label}
          tabIndex={0}
          onKeyDown={onKeyDown}
          onBlur={() => setActive(null)}
          className="rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-gaia-greenMint"
        >
          <g transform={`translate(${MARGIN.left},${MARGIN.top})`}>
            {model.bands.map((band) => (
              <g key={band.label}>
                <rect y={band.y} width={model.innerWidth} height={band.height} className={BAND_FILL[band.tone]} />
                <text x={model.innerWidth + 6} y={band.y + band.height / 2} dy="0.32em" className="fill-gaia-darkText/60 text-[10px]">
                  {band.label}
                </text>
              </g>
            ))}

            {model.yTicks.map((tick) => (
              <text key={tick.label} x={-6} y={tick.y} dy="0.32em" textAnchor="end" className="fill-gray-400 font-mono text-[10px]">
                {tick.label}
              </text>
            ))}
            {model.xTicks.map((tick) => (
              <text key={tick.x} x={tick.x} y={model.innerHeight + 18} textAnchor="middle" className="fill-gray-400 text-[10px]">
                {tick.label}
              </text>
            ))}
            <line x1={0} x2={model.innerWidth} y1={model.innerHeight} y2={model.innerHeight} className="stroke-gray-200" />

            {point && (
              <line x1={point.x} x2={point.x} y1={0} y2={model.innerHeight} className="stroke-gaia-greenDeep/30" strokeDasharray="3 3" />
            )}
            {model.segments.map((d, i) => (
              <path key={i} d={d} className="fill-none stroke-gaia-greenDeep" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            ))}
            {model.points.map((p, i) => (
              <circle
                key={p.bucketStart}
                cx={p.x}
                cy={p.y}
                r={i === active ? 6 : 4}
                className="fill-gaia-greenDeep stroke-white"
                strokeWidth={2}
              />
            ))}

            {/* Hit area for mouse, touch and pen; vertical scrolling still works. */}
            <rect
              width={model.innerWidth}
              height={model.innerHeight}
              fill="transparent"
              style={{ touchAction: "pan-y" }}
              onPointerMove={onPointerMove}
              onPointerDown={onPointerMove}
              // On touch, keep the tooltip after the finger lifts; it clears on blur.
              onPointerLeave={(event) => event.pointerType !== "touch" && setActive(null)}
            />
          </g>
        </svg>
      )}

      {model && point && (
        <VpdChartTooltip
          point={point}
          bucket={series.bucket}
          timeZone={series.tz}
          left={Math.min(Math.max(0, MARGIN.left + point.x - TOOLTIP_WIDTH / 2), width - TOOLTIP_WIDTH)}
        />
      )}
    </div>
  );
}
