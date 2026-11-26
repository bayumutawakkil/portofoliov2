import * as React from "react";
import {
  Home,
  Compass,
  FolderKanban,
  Layers,
  Briefcase,
  Sparkles,
  Mail,
  ArrowUpRight,
} from "lucide-react";
import { Dock, type DockItem } from "@/components/unlumen-ui/dock";
import { GlowButton } from "@/components/unlumen-ui/glow";
import { MagneticButton } from "@/components/unlumen-ui/magnetic-button";
import { GlowingBadge } from "@/components/unlumen-ui/glowing-badge";
import { Tilt } from "@/components/unlumen-ui/tilt";
import { ScrambleText } from "@/components/unlumen-ui/scramble-text";
import { ShimmeringText } from "@/components/unlumen-ui/shimmering-text";
import { ProgressiveBlur } from "@/components/unlumen-ui/progressive-blur";

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

export function PortfolioDock() {
  const items: DockItem[] = React.useMemo(
    () => [
      { icon: <Home className="size-4" />, label: "Home", href: "#hero" },
      { icon: <Compass className="size-4" />, label: "Approach", href: "#about" },
      { icon: <FolderKanban className="size-4" />, label: "Works", href: "#work" },
      { icon: <Layers className="size-4" />, label: "Capabilities", href: "#expertise" },
      { icon: <Briefcase className="size-4" />, label: "Experience", href: "#experience" },
      { icon: <Sparkles className="size-4" />, label: "Principles", href: "#principles" },
      { icon: <Mail className="size-4" />, label: "Contact", href: "#contact" },
    ],
    [],
  );

  return (
    <div className="pointer-events-auto fixed bottom-4 left-1/2 z-40 hidden -translate-x-1/2 lg:block">
      <Dock
        items={items}
        magnification={1.45}
        distance={100}
        iconSize={36}
        className="border border-white/10 bg-[#040b1a]/80 backdrop-blur-xl shadow-[0_12px_40px_rgba(0,0,0,0.45)]"
      />
    </div>
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

export function ScrambleLabel({
  text,
  className,
}: {
  text: string;
  className?: string;
}) {
  return (
    <ScrambleText
      text={text}
      scrambleSpeed={32}
      scrambledLetterCount={3}
      className={className ?? "font-[var(--mono)] text-[10px] tracking-[0.12em] text-[#c7d8e8]"}
      scrambledClassName="font-[var(--mono)] text-[10px] tracking-[0.12em] text-[#c7d8e8]/60"
    />
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
