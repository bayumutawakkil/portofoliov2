import * as React from "react";
import { ArrowUpRight } from "lucide-react";
import { GlowButton } from "@/components/interactive/unlumen-ui/glow";
import { MagneticButton } from "@/components/interactive/unlumen-ui/magnetic-button";
import { Tilt } from "@/components/interactive/unlumen-ui/tilt";
import { ShimmeringText } from "@/components/interactive/unlumen-ui/shimmering-text";
import { ProgressiveBlur } from "@/components/interactive/unlumen-ui/progressive-blur";
import ScrambleText from "@/components/interactive/unlumen-ui/scramble-text";

export function HeroExploreButton() {
  return (
    <GlowButton
      mode="rotate"
      colors={["var(--blue)", "var(--cyan)", "var(--blue)", "var(--blue)"]}
      blur="medium"
      duration={6}
      glowScale={1.03}
      className="h-[50px] gap-8 rounded-md bg-[var(--blue)] px-5 text-[12px] font-bold text-[var(--bg)] hover:bg-[var(--blue)]"
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
      <span className="relative inline-flex w-fit items-center gap-2 rounded-full border border-[color-mix(in_srgb,_var(--cyan)_32%,_transparent)] bg-[color-mix(in_srgb,_var(--cyan)_10%,_transparent)] px-3 py-1 font-[var(--mono)] text-[10px] tracking-[0.16em] text-[var(--cyan)]">
        <span
          aria-hidden="true"
          className="absolute inset-0 rounded-full bg-[var(--blue)] opacity-25 blur-md"
        />
        <span className="relative inline-flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--cyan)] opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[var(--cyan)]" />
        </span>
        <span className="relative">{label}</span>
      </span>
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
        className="h-12 rounded-md bg-[var(--blue)] px-6 text-[13px] font-bold text-[var(--bg)] shadow-[0_8px_24px_color-mix(in_srgb,_var(--blue)_25%,_transparent)] transition-colors hover:bg-[var(--blue)]"
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
        className="inline-flex h-12 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 font-[var(--mono)] text-[11px] tracking-[0.06em] text-[var(--ice-text)] transition-colors hover:border-[var(--cyan)]/50 hover:text-[var(--cyan)]"
      >
        <span role="status" aria-live="polite">
          {copied ? "Email copied" : "Copy email"}
        </span>
      </button>
      {cvUrl ? (
        <a
          href={cvUrl}
          download
          className="inline-flex h-12 items-center gap-2 rounded-md border border-[var(--line)] bg-[var(--surface)] px-4 font-[var(--mono)] text-[11px] tracking-[0.06em] text-[var(--ice-text)] transition-colors hover:border-[var(--cyan)]/50 hover:text-[var(--cyan)]"
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
      color="var(--ice-muted)"
      shimmerColor="var(--ice-text)"
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
