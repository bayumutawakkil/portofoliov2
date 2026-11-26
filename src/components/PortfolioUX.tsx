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
import { CopyButton } from "@/components/unlumen-ui/copy";
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
      className="h-[50px] gap-8 rounded-none bg-[#4d9fff] px-[17px] text-[11px] font-bold text-[#061321] hover:bg-[#8bc5ff]"
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
      { icon: <FolderKanban className="size-4" />, label: "Projects", href: "#work" },
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
        className="w-fit border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 font-[var(--mono)] text-[9px] tracking-[0.16em] text-emerald-200"
      >
        {label}
      </GlowingBadge>
    </div>
  );
}

export function ContactActions({ email }: { email: string }) {
  return (
    <div className="mt-2 flex flex-wrap items-center gap-4">
      <MagneticButton
        strength={0.35}
        radius={120}
        className="h-12 rounded-none border-b border-[#4d9fff] bg-transparent px-0 text-[16px] font-medium text-[#e9f2fc] shadow-none hover:bg-transparent hover:text-[#82d8ed]"
        onClick={() => {
          window.location.href = `mailto:${email}`;
        }}
      >
        <span>Start a conversation</span>
        <span className="ml-6 text-[22px] text-[#68adf5]">↗</span>
      </MagneticButton>
      <CopyButton
        content={email}
        variant="outline"
        size="sm"
        aria-label={`Copy email ${email}`}
        title={`Copy ${email}`}
        className="border-white/15 bg-white/[0.04] text-[#b5c8dc] hover:bg-white/10 hover:text-white"
      />
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
      className={className ?? "font-[var(--mono)] text-[9px] tracking-[0.12em] text-[#b5c8dc]"}
      scrambledClassName="font-[var(--mono)] text-[9px] tracking-[0.12em] text-[#b5c8dc]/50"
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
