import React from "react";

/**
 * CrestMotif renders atmospheric vector motifs derived directly
 * from the official Karmayodha team crests.
 * Used as background watermarks, badge icons, and decorative headers.
 */
export default function CrestMotif({
  motif = "shield",
  color = "currentColor",
  size = 140,
  opacity = 0.08,
  style = {},
}) {
  const containerStyle = {
    width: size,
    height: size,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    pointerEvents: "none",
    userSelect: "none",
    opacity,
    color,
    ...style,
  };

  switch (motif) {
    case "crown": // LEADS
      return (
        <svg
          style={containerStyle}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Star above crown */}
          <polygon
            points="50,6 52.5,13 60,13.5 54,18 56,25 50,20.5 44,25 46,18 40,13.5 47.5,13"
            fill="currentColor"
            stroke="none"
          />
          {/* Imperial Crown */}
          <path
            d="M20 70 L14 36 L34 50 L50 28 L66 50 L86 36 L80 70 Z"
            fill="currentColor"
            fillOpacity="0.25"
          />
          {/* Crown Base Band */}
          <rect x="18" y="70" width="64" height="10" rx="3" fill="currentColor" />
          {/* Heraldic Stripes */}
          <line x1="32" y1="70" x2="32" y2="92" strokeWidth="4" />
          <line x1="44" y1="70" x2="44" y2="95" strokeWidth="4" />
          <line x1="56" y1="70" x2="56" y2="95" strokeWidth="4" />
          <line x1="68" y1="70" x2="68" y2="92" strokeWidth="4" />
          {/* Laurel branch flourishes */}
          <path d="M12 45 C 8 58 10 74 20 86" strokeWidth="2.5" />
          <path d="M88 45 C 92 58 90 74 80 86" strokeWidth="2.5" />
        </svg>
      );

    case "code": // TECH
      return (
        <svg
          style={containerStyle}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Shield Outline */}
          <path
            d="M50 8 L84 20 L84 56 C84 76 68 90 50 96 C32 90 16 76 16 56 L16 20 Z"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* Code Syntax Brackets */}
          <path d="M38 38 L26 50 L38 62" strokeWidth="5" />
          <path d="M62 38 L74 50 L62 62" strokeWidth="5" />
          <line x1="55" y1="34" x2="45" y2="66" strokeWidth="4.5" />
          {/* Circuit Board Trace Lines */}
          <line x1="50" y1="68" x2="50" y2="82" strokeWidth="3" />
          <circle cx="50" cy="84" r="3" fill="currentColor" stroke="none" />
          <line x1="32" y1="68" x2="26" y2="76" strokeWidth="3" />
          <circle cx="25" cy="78" r="2.5" fill="currentColor" stroke="none" />
          <line x1="68" y1="68" x2="74" y2="76" strokeWidth="3" />
          <circle cx="75" cy="78" r="2.5" fill="currentColor" stroke="none" />
        </svg>
      );

    case "brush": // CREATIVE
      return (
        <svg
          style={containerStyle}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Classical Head Silhouette */}
          <circle cx="50" cy="40" r="24" fill="currentColor" fillOpacity="0.18" />
          <path d="M36 28 C 42 22, 58 22, 64 28 C 66 34, 66 46, 62 56 L 50 64 L 38 56 Z" />
          {/* Laurel Crown */}
          <path d="M30 38 C 26 30 36 22 48 20" strokeWidth="2.5" />
          <path d="M70 38 C 74 30 64 22 52 20" strokeWidth="2.5" />
          {/* Paintbrush crossing below */}
          <path d="M30 84 L 56 60 L 64 68 L 38 92 Z" fill="currentColor" fillOpacity="0.4" />
          <path d="M26 88 C 22 92 24 96 28 94 C 32 92 34 88 34 88 Z" fill="currentColor" />
          {/* Celestial Glitch Sparkles */}
          <polygon points="76,24 78,30 84,32 78,34 76,40 74,34 68,32 74,30" fill="currentColor" stroke="none" />
          <polygon points="22,50 23,54 27,55 23,56 22,60 21,56 17,55 21,54" fill="currentColor" stroke="none" />
        </svg>
      );

    case "gear": // OPERATION
      return (
        <svg
          style={containerStyle}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Outer Shield Grid */}
          <path
            d="M50 6 L86 20 L86 58 C86 78 68 92 50 98 C32 92 14 78 14 58 L14 20 Z"
            fill="currentColor"
            fillOpacity="0.12"
          />
          {/* Mechanical Cogwheel */}
          <circle cx="50" cy="45" r="14" fill="currentColor" fillOpacity="0.3" strokeWidth="4" />
          <circle cx="50" cy="45" r="6" fill="#FFFFFF" />
          {/* Cog teeth */}
          <rect x="47" y="24" width="6" height="7" rx="1.5" fill="currentColor" />
          <rect x="47" y="59" width="6" height="7" rx="1.5" fill="currentColor" />
          <rect x="29" y="42" width="7" height="6" rx="1.5" fill="currentColor" />
          <rect x="64" y="42" width="7" height="6" rx="1.5" fill="currentColor" />
          {/* Diagonal cogs */}
          <rect x="36" y="31" width="6" height="6" rx="1.5" transform="rotate(45 39 34)" fill="currentColor" />
          <rect x="58" y="53" width="6" height="6" rx="1.5" transform="rotate(45 61 56)" fill="currentColor" />
          {/* Tech Circuit Matrix Lines */}
          <line x1="50" y1="67" x2="50" y2="85" strokeWidth="3" />
          <line x1="38" y1="72" x2="38" y2="82" strokeWidth="2.5" />
          <line x1="62" y1="72" x2="62" y2="82" strokeWidth="2.5" />
        </svg>
      );

    case "megaphone": // MARKETING
      return (
        <svg
          style={containerStyle}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Megaphone Cone */}
          <path
            d="M26 42 L56 26 L56 66 L26 50 Z"
            fill="currentColor"
            fillOpacity="0.3"
            strokeWidth="3.5"
          />
          {/* Megaphone Bell Rim */}
          <ellipse cx="56" cy="46" rx="4" ry="20" fill="currentColor" fillOpacity="0.5" />
          {/* Handle */}
          <path d="M30 48 L30 68 L36 68 L36 50" strokeWidth="3" fill="currentColor" fillOpacity="0.3" />
          {/* Acoustic Soundwaves */}
          <path d="M68 34 C 74 38, 74 54, 68 58" strokeWidth="3.5" />
          <path d="M78 26 C 88 34, 88 58, 78 66" strokeWidth="3.5" />
          {/* Star accent */}
          <polygon points="50,84 52,89 57,89.5 53,93 54,98 50,95 46,98 47,93 43,89.5 48,89" fill="currentColor" stroke="none" />
        </svg>
      );

    case "film": // MEDIA
      return (
        <svg
          style={containerStyle}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Clapperboard Top */}
          <path d="M22 26 L78 26 L78 44 L22 44 Z" fill="currentColor" fillOpacity="0.3" strokeWidth="3.5" />
          <line x1="32" y1="26" x2="42" y2="44" strokeWidth="3" />
          <line x1="50" y1="26" x2="60" y2="44" strokeWidth="3" />
          <line x1="68" y1="26" x2="78" y2="44" strokeWidth="3" />
          {/* Play Icon Inside */}
          <polygon points="46,31 46,39 54,35" fill="currentColor" stroke="none" />
          {/* Cinema Film Reel */}
          <circle cx="50" cy="68" r="20" fill="currentColor" fillOpacity="0.25" strokeWidth="3.5" />
          <circle cx="50" cy="68" r="6" fill="#FFFFFF" strokeWidth="2.5" />
          {/* Film Reel Sprocket Holes */}
          <circle cx="50" cy="54" r="3" fill="currentColor" stroke="none" />
          <circle cx="50" cy="82" r="3" fill="currentColor" stroke="none" />
          <circle cx="36" cy="68" r="3" fill="currentColor" stroke="none" />
          <circle cx="64" cy="68" r="3" fill="currentColor" stroke="none" />
        </svg>
      );

    case "quill": // CONTENT
      return (
        <svg
          style={containerStyle}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Planetary Orbital Ring */}
          <ellipse
            cx="50"
            cy="55"
            rx="38"
            ry="14"
            transform="rotate(-20 50 55)"
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          {/* Calligraphy Fountain Pen Nib */}
          <path
            d="M50 16 L64 42 L58 66 L50 78 L42 66 L36 42 Z"
            fill="currentColor"
            fillOpacity="0.3"
            strokeWidth="3.5"
          />
          {/* Pen Nib Slit & Breather Hole */}
          <line x1="50" y1="16" x2="50" y2="52" strokeWidth="2.5" />
          <circle cx="50" cy="52" r="2.5" fill="currentColor" />
          {/* Star Accent */}
          <polygon points="50,86 52,90 56,90.5 53,93 54,97 50,94.5 46,97 47,93 44,90.5 48,90" fill="currentColor" stroke="none" />
        </svg>
      );

    default: // Generic Shield
      return (
        <svg
          style={containerStyle}
          viewBox="0 0 100 100"
          fill="none"
          stroke="currentColor"
          strokeWidth="3.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M50 8 L84 22 L84 56 C84 76 68 90 50 96 C32 90 16 76 16 56 L16 22 Z"
            fill="currentColor"
            fillOpacity="0.15"
          />
          <polygon points="50,30 54,42 66,43 56,51 60,63 50,55 40,63 44,51 34,43 46,42" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

