import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { GlowButton } from "@/components/interactive/unlumen-ui/glow";
import { MagneticButton } from "@/components/interactive/unlumen-ui/magnetic-button";
import { GlowingBadge } from "@/components/interactive/unlumen-ui/glowing-badge";
import { Tilt } from "@/components/interactive/unlumen-ui/tilt";
import { ShimmeringText } from "@/components/interactive/unlumen-ui/shimmering-text";
import { ProgressiveBlur } from "@/components/interactive/unlumen-ui/progressive-blur";
import ScrambleText from "@/components/interactive/unlumen-ui/scramble-text";

export function HeroExploreButton() {
  return (
    <GlowButton
      mode="rotate"
      colors={["#4d9fff", "#82d8ed", "#2563eb", "#4d9fff"]}
      blur="medium"
      duration={6}
      glowScale={1.03}
      className="h-[50px] gap-8 rounded-md bg-[#4d9fff] px-5 text-[12px] font-bold text-[#061321] hover:bg-[#8bc5ff]"
      onClick={() => {
        if (document.documentElement.classList.contains("is-fullpage")) {
          window.dispatchEvent(
            new CustomEvent("fullpage:goto", { detail: { id: "work" } }),
          );
        } else {
          const el = document.getElementById("work");
          el?.scrollIntoView({ behavior: "smooth" });
        }
      }}
    >
      <span>Explore projects</span>
      <ArrowUpRight className="size-4" aria-hidden="true" />
    </GlowButton>
  );
}

export function AvailabilityBadge({ label }: { label: string }) {
  return (
    <div className="mb-6 w-fit self-start">
      <GlowingBadge
        variant="success"
        pulse
        dot
        className="w-fit border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-[var(--mono)] text-[10px] tracking-[0.16em] text-emerald-200"
      >
        {label}
      </GlowingBadge>
    </div>
  );
}

export function ContactActions({ email, cvUrl }: { email: string; cvUrl?: string }) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.location.href = `mailto:${email}`;
    }
  };

  return (
    <div className="mt-2 flex flex-wrap items-center gap-4">
      <MagneticButton
        strength={0.35}
        radius={120}
        className="h-12 rounded-md bg-[#4d9fff] px-6 text-[13px] font-bold text-[#061321] shadow-[0_8px_24px_rgba(77,159,255,0.25)] transition-colors hover:bg-[#8bc5ff]"
        onClick={() => {
          window.location.href = `mailto:${email}`;
        }}
      >
        <span>Start a conversation</span>
        <ArrowUpRight className="ml-3 size-4" aria-hidden="true" />
      </MagneticButton>
      <button
        type="button"
        onClick={handleCopy}
        aria-label={`Copy email ${email}`}
        className="inline-flex h-12 items-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-4 font-[var(--mono)] text-[11px] tracking-[0.06em] text-[#cde0f0] transition-colors hover:border-[#82d8ed]/50 hover:bg-white/10 hover:text-white"
      >
        <span role="status" aria-live="polite">
          {copied ? "Email copied" : "Copy email"}
        </span>
      </button>
      {cvUrl ? (
        <a
          href={cvUrl}
          download
          className="inline-flex h-12 items-center gap-2 rounded-md border border-white/15 bg-white/[0.04] px-4 font-[var(--mono)] text-[11px] tracking-[0.06em] text-[#cde0f0] transition-colors hover:border-[#82d8ed]/50 hover:bg-white/10 hover:text-white"
        >
          <span>Download CV</span>
        </a>
      ) : null}
    </div>
  );
}

export function ProjectTilt({ children }: { children: React.ReactNode }) {
  return (
    <Tilt rotationFactor={7} className="w-full">
      {children}
    </Tilt>
  );
}

export function ShimmerLine({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <ShimmeringText
      text={text}
      duration={3}
      repeatDelay={1.5}
      color="#60758c"
      shimmerColor="#b8dcff"
      className={className}
    />
  );
}

export function EdgeProgressiveBlur() {
  return (
    <ProgressiveBlur
      side="top"
      size="24px"
      strength={1.5}
      tint={false}
      className="pointer-events-none fixed inset-x-0 top-[var(--nav-h)] z-[5]"
    />
  );
}

export function ScrambleLabel({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  const [reducedMotion, setReducedMotion] = React.useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setReducedMotion(
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      );
    }
  }, []);

  if (reducedMotion) {
    return <span className={className}>{text}</span>;
  }

  return (
    <ScrambleText
      text={text}
      scrambleSpeed={35}
      scrambledLetterCount={3}
      autoStart={true}
      className={className}
    />
  );
}
