type PlantImagePlaceholderProps = {
  name: string;
  size?: "card" | "large";
};

/**
 * Reserved image slot with a fixed 4:3 aspect ratio.
 * When plant images arrive, swap the inner content for `next/image`
 * (with `fill`) inside this same box — no layout shift.
 */
export default function PlantImagePlaceholder({
  name,
  size = "card",
}: PlantImagePlaceholderProps) {
  const initial = name.trim().charAt(0).toUpperCase();

  return (
    <div
      aria-hidden="true"
      className="relative aspect-[4/3] w-full overflow-hidden bg-linear-to-br from-gaia-greenSignal via-gaia-bg to-gaia-greenMint flex items-center justify-center"
    >
      <span
        className={`font-bold text-gaia-greenDeep/70 select-none ${
          size === "large" ? "text-6xl" : "text-4xl"
        }`}
      >
        {initial || "🌱"}
      </span>
      <span className="absolute bottom-2 right-3 text-lg">🌱</span>
    </div>
  );
}
