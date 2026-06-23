// Brand assets — the Northstar logo mark and wordmark, sourced from /public/brand so
// there is a single source of truth for the identity. Prefer these over hand-coded
// SVG/text marks anywhere the actual logo should appear (nav, splash, install prompt).
import { CSSProperties } from "react";
import Image from "next/image";

const WORDMARK_RATIO = 969 / 256; // intrinsic aspect ratio of the wordmark PNGs

type Tone = "color" | "white" | "mono";

const WORDMARK_SRC: Record<Tone, string> = {
  color: "/brand/northstar-wordmark-color.png",
  white: "/brand/northstar-wordmark-white.png",
  mono: "/brand/northstar-wordmark-mono.png",
};

const MARK_SRC: Record<"gradient" | "white" | "mono", string> = {
  gradient: "/brand/northstar-mark-gradient.svg",
  white: "/brand/northstar-mark-white.svg",
  mono: "/brand/northstar-mark-mono.svg",
};

// The Northstar wordmark. Sized by height; width is derived from the asset ratio.
export function Wordmark({
  height = 22,
  tone = "color",
  style,
  priority,
}: {
  height?: number;
  tone?: Tone;
  style?: CSSProperties;
  priority?: boolean;
}) {
  return (
    <Image
      src={WORDMARK_SRC[tone]}
      alt="Northstar"
      height={height}
      width={Math.round(height * WORDMARK_RATIO)}
      priority={priority}
      style={{ height, width: "auto", display: "block", ...style }}
    />
  );
}

// The Northstar star mark. `gradient` is the primary on-light variant; `white` for
// dark/colored surfaces; `mono` for single-color contexts.
export function Logo({
  size = 28,
  variant = "gradient",
  style,
  priority,
}: {
  size?: number;
  variant?: "gradient" | "white" | "mono";
  style?: CSSProperties;
  priority?: boolean;
}) {
  return (
    <Image
      src={MARK_SRC[variant]}
      alt="Northstar"
      width={size}
      height={size}
      priority={priority}
      style={{ display: "block", ...style }}
    />
  );
}
