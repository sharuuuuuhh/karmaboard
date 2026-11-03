import React from "react";
import crestCreative128 from "./assets/crests/crest-creative-128.webp";
import crestCreative384 from "./assets/crests/crest-creative-384.webp";
import crestOperation128 from "./assets/crests/crest-operation-128.webp";
import crestOperation384 from "./assets/crests/crest-operation-384.webp";
import crestMarketing128 from "./assets/crests/crest-marketing-128.webp";
import crestMarketing384 from "./assets/crests/crest-marketing-384.webp";
import crestMedia128 from "./assets/crests/crest-media-128.webp";
import crestMedia384 from "./assets/crests/crest-media-384.webp";
import crestContent128 from "./assets/crests/crest-content-128.webp";
import crestContent384 from "./assets/crests/crest-content-384.webp";
import crestLeads128 from "./assets/crests/crest-leads-128.webp";
import crestLeads384 from "./assets/crests/crest-leads-384.webp";
import crestTech128 from "./assets/crests/crest-tech-128.webp";
import crestTech384 from "./assets/crests/crest-tech-384.webp";
import crestTechashi128 from "./assets/crests/crest-techashi-128.webp";
import crestTechashi384 from "./assets/crests/crest-techashi-384.webp";
import crestOffgrid128 from "./assets/crests/crest-offgrid-128.webp";
import crestOffgrid384 from "./assets/crests/crest-offgrid-384.webp";
import crestMuverse128 from "./assets/crests/crest-muverse-128.webp";
import crestMuverse384 from "./assets/crests/crest-muverse-384.webp";
import { getGroupToken } from "./utils/groupTokens";

/**
 * Global config flag:
 * When true, the group name text is shown next to or below the crest.
 * Keep off by default; enable when text captions are desired.
 */
export const showCrestNames = false;

export const CREST_REGISTRY = {
  leads: { "128": crestLeads128, "384": crestLeads384 },
  creative: { "128": crestCreative128, "384": crestCreative384 },
  operation: { "128": crestOperation128, "384": crestOperation384 },
  marketing: { "128": crestMarketing128, "384": crestMarketing384 },
  media: { "128": crestMedia128, "384": crestMedia384 },
  content: { "128": crestContent128, "384": crestContent384 },
  tech: { "128": crestTech128, "384": crestTech384 },
  techashi: { "128": crestTechashi128, "384": crestTechashi384 },
  offgrid: { "128": crestOffgrid128, "384": crestOffgrid384 },
  muverse: { "128": crestMuverse128, "384": crestMuverse384 },
};

/**
 * Normalizes any group identifier, slug, or object into canonical slug:
 * 'leads' | 'creative' | 'operation' | 'marketing' | 'media' | 'content' | 'tech' | 'techashi' | 'offgrid' | 'muverse'
 */
export function normalizeGroupSlug(groupOrName) {
  if (!groupOrName) return "tech";
  const str =
    typeof groupOrName === "object"
      ? groupOrName.slug || groupOrName.id || groupOrName.name || ""
      : String(groupOrName);
  const clean = str.toLowerCase().replace(/^grp-/, "").trim().replace(/\s+/g, "-");
  if (clean === "operations" || clean === "operation") return "operation";
  if (clean === "creative") return "creative";
  if (clean === "marketing") return "marketing";
  if (clean === "media") return "media";
  if (clean === "content") return "content";
  if (clean === "leads") return "leads";
  if (clean === "tech") return "tech";
  if (clean === "techashi" || clean === "techaschi") return "techashi";
  if (clean === "offgrid" || clean === "off-grid") return "offgrid";
  if (clean === "muverse" || clean === "uverse") return "muverse";
  return clean || "tech";
}

/**
 * Returns canonical display name for the group.
 */
export function getGroupDisplayName(groupOrName) {
  const slug = normalizeGroupSlug(groupOrName);
  const map = {
    leads: "LEADS",
    creative: "CREATIVE",
    operation: "OPERATION",
    marketing: "MARKETING",
    media: "MEDIA",
    content: "CONTENT",
    tech: "TECH",
    techashi: "TECHASHI",
    offgrid: "OFFGRID",
    muverse: "MuVerse",
    sfc: "SFC",
    infinitea: "INFINITEA",
    nexus: "NEXUS",
    kaizen: "KAIZEN",
    muniverse: "MUniverse",
    "la-decima": "La Decima",
  };
  return map[slug] || (typeof groupOrName === "string" ? groupOrName.replace(/^grp-/i, "").trim() : "Team");
}

const SIZE_MAP = {
  xs: 28,
  sm: 36,
  md: 48,
  lg: 72,
  xl: 120,
};

/**
 * <Crest /> component
 */
export function Crest({
  group,
  size = "md",
  interactive = false,
  showName,
  alt,
  title,
  loading = "lazy",
  className = "",
  style = {},
  ...props
}) {
  const slug = normalizeGroupSlug(group);
  const displayName = getGroupDisplayName(slug);
  const token = getGroupToken(slug);

  const pixelSize = typeof size === "number" ? size : SIZE_MAP[size] || 48;
  const isTooSmall = pixelSize < 28;
  const shouldShowName = showName !== undefined ? showName : showCrestNames;
  const computedTitle = title !== undefined ? title : displayName;
  const computedAlt = alt !== undefined ? alt : `${displayName} crest`;

  // Rule: Minimum size 28px. Anywhere smaller, render a small colored dot with the name as a tooltip
  if (isTooSmall) {
    const dotSize = Math.max(8, pixelSize);
    return (
      <span
        className={`crest-dot ${className}`}
        title={computedTitle}
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          verticalAlign: "middle",
          ...style,
        }}
        {...props}
      >
        <span
          style={{
            display: "inline-block",
            width: dotSize,
            height: dotSize,
            borderRadius: "50%",
            backgroundColor: token.ink,
            flexShrink: 0,
          }}
        />
        <span className="sr-only">{displayName}</span>
        {shouldShowName && (
          <span style={{ fontSize: 12, fontWeight: 700, color: token.ink }}>
            {displayName}
          </span>
        )}
      </span>
    );
  }

  const crestFiles = CREST_REGISTRY[slug];

  // Placeholder when crest image is not registered: heraldic SVG shield in group ink/accent color
  const renderContent = () => {
    if (!crestFiles) {
      const shieldColor = token.cardAccent || token.ink || "#5E5CE6";
      const shortName = displayName.length > 7 ? displayName.slice(0, 6) : displayName;

      return (
        <svg
          width={pixelSize}
          height={pixelSize}
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden={computedAlt === "" ? "true" : undefined}
          role={computedAlt === "" ? "presentation" : "img"}
          aria-label={computedAlt || undefined}
          style={{
            display: "block",
            width: pixelSize,
            height: pixelSize,
            flexShrink: 0,
          }}
        >
          {/* Shield outer outline */}
          <path
            d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
            stroke={shieldColor}
            strokeWidth="4"
            strokeLinejoin="round"
            fill="rgba(255, 255, 255, 0.08)"
          />
          {/* Shield inner accent ring */}
          <path
            d="M50 15 L78 26 C78 58 50 82 50 82 C50 82 22 58 22 26 Z"
            stroke={shieldColor}
            strokeWidth="1.5"
            strokeOpacity="0.4"
            strokeLinejoin="round"
            fill="none"
          />
          {/* Heraldic 4-point star crest emblem */}
          <path
            d="M50 28 L53 40 L65 43 L53 46 L50 58 L47 46 L35 43 L47 40 Z"
            fill={shieldColor}
            opacity="0.9"
          />
          {/* Group text below emblem */}
          <text
            x="50"
            y="74"
            textAnchor="middle"
            fill={shieldColor}
            fontSize={shortName.length > 5 ? "11" : "12.5"}
            fontWeight="800"
            fontFamily="var(--font-display, system-ui, -apple-system, sans-serif)"
            letterSpacing="0.06em"
          >
            {shortName}
          </text>
        </svg>
      );
    }

    return (
      <img
        src={crestFiles["128"]}
        srcSet={`${crestFiles["128"]} 128w, ${crestFiles["384"]} 384w`}
        sizes={`${pixelSize}px`}
        width={pixelSize}
        height={pixelSize}
        alt={computedAlt}
        decoding="async"
        loading={loading}
        style={{
          width: pixelSize,
          height: pixelSize,
          objectFit: "contain",
          display: "block",
          flexShrink: 0,
        }}
      />
    );
  };

  return (
    <span
      className={`crest-wrap ${interactive ? "crest-interactive" : ""} ${className}`}
      title={computedTitle}
      tabIndex={interactive ? 0 : undefined}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 8,
        verticalAlign: "middle",
        cursor: interactive ? "pointer" : "inherit",
        transition: interactive ? "transform 0.15s ease" : undefined,
        ...style,
      }}
      {...props}
    >
      {renderContent()}
      {/* Visually hidden text for screen readers, search, and sorting */}
      <span
        className="sr-only"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      >
        {displayName}
      </span>
      {shouldShowName && (
        <span
          style={{
            fontSize: pixelSize >= 48 ? 14 : 12,
            fontWeight: 700,
            color: token.ink,
          }}
        >
          {displayName}
        </span>
      )}
    </span>
  );
}

export default Crest;
