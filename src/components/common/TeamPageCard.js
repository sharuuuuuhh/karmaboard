import React from "react";
import { CREST_REGISTRY } from "../../crests";

/**
 * TeamPageCard
 * Reusable chamfered solid card with 3-layer overlay for Team Detail Page (/groups/:id).
 * Follows the solid team cards design system:
 * - 6px border radius with one chamfered top-right corner (14px standard, 18px hero)
 * - 1px inner border (cardLine)
 * - Diverse non-repetitive vector watermarks (gears, circuits, radar, star, pulse, delta, rank)
 * - Layer B: facet lines (5%), Layer C: film-grain noise (4%)
 */

// Gear Watermark (Setting gears & interlocking cogs for Target Pace & System Engineering)
function GearWatermark({ color, size }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        position: "absolute",
        right: -25,
        bottom: -25,
        width: size,
        height: size,
        pointerEvents: "none",
        opacity: 0.08,
        color,
        userSelect: "none",
        zIndex: 0,
      }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Primary Large Gear (Center 115, 115, Radius ~60) */}
      <g>
        {/* Outer Teeth (16 teeth generated radially) */}
        <path
          d="
            M115 45 L121 45 L124 55 L132 57 L140 50 L145 54 L143 64 L150 68 L159 64 L162 70 L156 78 L160 86 L170 86 L171 93 L163 98 L164 107 L174 110 L173 117 L163 119 L161 128 L169 135 L165 140 L156 138 L150 145 L154 154 L148 158 L141 152 L133 156 L132 166 L125 167 L122 157 L113 157 L109 167 L102 165 L103 155 L95 152 L88 159 L83 154 L87 145 L81 139 L72 142 L69 136 L76 129 L73 120 L63 118 L64 111 L74 108 L74 99 L65 94 L68 88 L77 90 L83 82 L80 73 L86 69 L93 75 L101 70 L102 60 L109 59 L112 45 Z
          "
          strokeWidth="3.5"
          fill="currentColor"
          fillOpacity="0.04"
        />
        {/* Outer Rim & Pitch Circles */}
        <circle cx="115" cy="115" r="54" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="115" cy="115" r="42" strokeWidth="2.5" />
        {/* Inner Hub & Axle */}
        <circle cx="115" cy="115" r="22" strokeWidth="3" fill="currentColor" fillOpacity="0.06" />
        <circle cx="115" cy="115" r="9" strokeWidth="2.5" />
        <rect x="113" y="103" width="4" height="6" fill="currentColor" />
        {/* 6 Radial Spokes */}
        <line x1="115" y1="73" x2="115" y2="93" strokeWidth="4" />
        <line x1="115" y1="137" x2="115" y2="157" strokeWidth="4" />
        <line x1="79" y1="94" x2="96" y2="104" strokeWidth="4" />
        <line x1="134" y1="126" x2="151" y2="136" strokeWidth="4" />
        <line x1="79" y1="136" x2="96" y2="126" strokeWidth="4" />
        <line x1="134" y1="104" x2="151" y2="94" strokeWidth="4" />
      </g>

      {/* Secondary Interlocking Gear (Center 44, 46, Radius ~34) */}
      <g>
        <path
          d="
            M44 14 L48 14 L50 20 L56 22 L61 17 L65 20 L63 27 L68 30 L74 27 L77 32 L72 38 L75 44 L81 45 L81 50 L75 53 L75 59 L81 62 L79 67 L73 67 L70 73 L74 79 L69 82 L65 77 L59 80 L58 86 L53 87 L51 81 L45 81 L42 87 L37 85 L38 79 L32 76 L27 80 L24 76 L27 70 L23 65 L17 66 L15 61 L20 57 L19 50 L13 47 L15 42 L21 43 L25 38 L23 31 L27 28 L32 32 L38 29 L39 23 L44 23 Z
          "
          strokeWidth="2.5"
          fill="currentColor"
          fillOpacity="0.04"
        />
        <circle cx="44" cy="46" r="22" strokeWidth="2" />
        <circle cx="44" cy="46" r="10" strokeWidth="2.5" fill="currentColor" fillOpacity="0.08" />
        <circle cx="44" cy="46" r="4" strokeWidth="1.5" />
      </g>

      {/* Mechanical Calibration Ring */}
      <circle cx="115" cy="115" r="76" strokeWidth="1.5" strokeDasharray="1 8" />
    </svg>
  );
}

// Circuit Watermark (Microcontroller IC die, pin pads & trace paths)
function CircuitWatermark({ color, size }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        position: "absolute",
        right: -25,
        bottom: -25,
        width: size,
        height: size,
        pointerEvents: "none",
        opacity: 0.08,
        color,
        userSelect: "none",
        zIndex: 0,
      }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Central IC Package (QFP) */}
      <rect x="74" y="74" width="56" height="56" rx="4" strokeWidth="3" fill="currentColor" fillOpacity="0.05" />
      {/* Silicon Die Core */}
      <rect x="86" y="86" width="32" height="32" rx="2" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Pin 1 Orientation Dot */}
      <circle cx="82" cy="82" r="3" fill="currentColor" stroke="none" />

      {/* Top Pins & Traces */}
      <line x1="84" y1="74" x2="84" y2="52" strokeWidth="2.5" />
      <path d="M84 52 L70 38 L30 38" strokeWidth="2" />
      <circle cx="30" cy="38" r="3" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />

      <line x1="95" y1="74" x2="95" y2="44" strokeWidth="2.5" />
      <path d="M95 44 L95 24 L115 24 L130 9" strokeWidth="2" />
      <circle cx="130" cy="9" r="3" strokeWidth="2" />

      <line x1="106" y1="74" x2="106" y2="52" strokeWidth="2.5" />
      <path d="M106 52 L120 38 L160 38" strokeWidth="2" />
      <circle cx="160" cy="38" r="3" strokeWidth="2" />

      <line x1="117" y1="74" x2="117" y2="60" strokeWidth="2.5" />
      <path d="M117 60 L140 60 L165 35" strokeWidth="2" />

      {/* Bottom Pins & Traces */}
      <line x1="84" y1="130" x2="84" y2="152" strokeWidth="2.5" />
      <path d="M84 152 L70 166 L40 166" strokeWidth="2" />
      <circle cx="40" cy="166" r="3" strokeWidth="2" />

      <line x1="95" y1="130" x2="95" y2="162" strokeWidth="2.5" />
      <circle cx="95" cy="162" r="3.5" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />

      <line x1="106" y1="130" x2="106" y2="150" strokeWidth="2.5" />
      <path d="M106 150 L124 168 L170 168" strokeWidth="2" />
      <circle cx="170" cy="168" r="3" strokeWidth="2" />

      <line x1="117" y1="130" x2="117" y2="144" strokeWidth="2.5" />
      <path d="M117 144 L142 144 L162 164" strokeWidth="2" />

      {/* Left Pins & Traces */}
      <line x1="74" y1="84" x2="52" y2="84" strokeWidth="2.5" />
      <path d="M52 84 L38 70 L14 70" strokeWidth="2" />
      <circle cx="14" cy="70" r="3" strokeWidth="2" />

      <line x1="74" y1="95" x2="42" y2="95" strokeWidth="2.5" />
      <path d="M42 95 L26 111 L26 140" strokeWidth="2" />
      <circle cx="26" cy="140" r="3" strokeWidth="2" />

      <line x1="74" y1="106" x2="54" y2="106" strokeWidth="2.5" />
      <circle cx="54" cy="106" r="3.5" strokeWidth="2" />

      <line x1="74" y1="117" x2="52" y2="117" strokeWidth="2.5" />
      <path d="M52 117 L36 133 L10 133" strokeWidth="2" />

      {/* Right Pins & Traces */}
      <line x1="130" y1="84" x2="152" y2="84" strokeWidth="2.5" />
      <path d="M152 84 L168 68 L190 68" strokeWidth="2" />
      <circle cx="190" cy="68" r="3" strokeWidth="2" />

      <line x1="130" y1="95" x2="164" y2="95" strokeWidth="2.5" />
      <circle cx="164" cy="95" r="3.5" strokeWidth="2" fill="currentColor" fillOpacity="0.2" />

      <line x1="130" y1="106" x2="148" y2="106" strokeWidth="2.5" />
      <path d="M148 106 L164 122 L192 122" strokeWidth="2" />
      <circle cx="192" cy="122" r="3" strokeWidth="2" />

      <line x1="130" y1="117" x2="154" y2="117" strokeWidth="2.5" />
      <path d="M154 117 L174 97 L190 97" strokeWidth="2" />

      {/* Board Ground Via Matrix */}
      <circle cx="48" cy="48" r="2.5" strokeWidth="1.5" />
      <circle cx="156" cy="156" r="2.5" strokeWidth="1.5" />
      <circle cx="48" cy="156" r="2.5" strokeWidth="1.5" />
      <circle cx="156" cy="48" r="2.5" strokeWidth="1.5" />
    </svg>
  );
}

// Motherboard Watermark (Expansive PCB schematic routing for Team Roster)
function MotherboardWatermark({ color, size }) {
  return (
    <svg
      viewBox="0 0 280 200"
      style={{
        position: "absolute",
        right: -30,
        bottom: -25,
        width: size * 1.3,
        height: size,
        pointerEvents: "none",
        opacity: 0.08,
        color,
        userSelect: "none",
        zIndex: 0,
      }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Multi-lane High Speed Bus Tracks */}
      <path d="M10 30 L90 30 L130 70 L210 70 L240 100 L270 100" strokeWidth="2" />
      <path d="M10 40 L86 40 L126 80 L206 80 L236 110 L270 110" strokeWidth="2" />
      <path d="M10 50 L82 50 L122 90 L202 90 L232 120 L270 120" strokeWidth="2" />

      {/* Secondary Angled Highway */}
      <path d="M70 180 L110 140 L160 140 L190 170 L250 170" strokeWidth="2.5" />
      <path d="M80 190 L116 154 L154 154 L184 184 L250 184" strokeWidth="2.5" />

      {/* BGA Chip Package Footprint */}
      <rect x="150" y="20" width="46" height="46" rx="3" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="158" cy="28" r="2" fill="currentColor" />
      <circle cx="166" cy="28" r="2" fill="currentColor" />
      <circle cx="174" cy="28" r="2" fill="currentColor" />
      <circle cx="182" cy="28" r="2" fill="currentColor" />
      <circle cx="158" cy="36" r="2" fill="currentColor" />
      <circle cx="166" cy="36" r="2" fill="currentColor" />
      <circle cx="174" cy="36" r="2" fill="currentColor" />
      <circle cx="182" cy="36" r="2" fill="currentColor" />
      <circle cx="158" cy="44" r="2" fill="currentColor" />
      <circle cx="166" cy="44" r="2" fill="currentColor" />
      <circle cx="174" cy="44" r="2" fill="currentColor" />
      <circle cx="182" cy="44" r="2" fill="currentColor" />
      <circle cx="158" cy="52" r="2" fill="currentColor" />
      <circle cx="166" cy="52" r="2" fill="currentColor" />
      <circle cx="174" cy="52" r="2" fill="currentColor" />
      <circle cx="182" cy="52" r="2" fill="currentColor" />

      {/* SMT Capacitor Array */}
      <rect x="50" y="80" width="16" height="8" rx="1.5" strokeWidth="1.5" />
      <rect x="50" y="94" width="16" height="8" rx="1.5" strokeWidth="1.5" />
      <rect x="50" y="108" width="16" height="8" rx="1.5" strokeWidth="1.5" />

      {/* Solder Vias and Test Points */}
      <circle cx="90" cy="30" r="3.5" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="130" cy="70" r="3.5" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="210" cy="70" r="3.5" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="240" cy="100" r="3.5" strokeWidth="2" fill="currentColor" fillOpacity="0.1" />
      <circle cx="110" cy="140" r="3.5" strokeWidth="2" />
      <circle cx="160" cy="140" r="3.5" strokeWidth="2" />
      <circle cx="190" cy="170" r="3.5" strokeWidth="2" />
    </svg>
  );
}

// Radar Sweep Watermark (Concentric range rings & crosshair scan for Chasing You)
function RadarWatermark({ color, size }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        position: "absolute",
        right: -25,
        bottom: -25,
        width: size,
        height: size,
        pointerEvents: "none",
        opacity: 0.08,
        color,
        userSelect: "none",
        zIndex: 0,
      }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Concentric Range Rings */}
      <circle cx="100" cy="100" r="88" strokeWidth="2" />
      <circle cx="100" cy="100" r="66" strokeWidth="1.5" strokeDasharray="3 4" />
      <circle cx="100" cy="100" r="44" strokeWidth="2" />
      <circle cx="100" cy="100" r="22" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="5" strokeWidth="2" fill="currentColor" />

      {/* Crosshairs with Distance Ticks */}
      <line x1="6" y1="100" x2="194" y2="100" strokeWidth="1.5" />
      <line x1="100" y1="6" x2="100" y2="194" strokeWidth="1.5" />
      {/* Diagonal 45° Axis */}
      <line x1="34" y1="34" x2="166" y2="166" strokeWidth="1" strokeDasharray="4 4" />
      <line x1="34" y1="166" x2="166" y2="34" strokeWidth="1" strokeDasharray="4 4" />

      {/* 45° Radar Sweep Sector */}
      <path
        d="M100 100 L162 38 A88 88 0 0 0 100 12 Z"
        fill="currentColor"
        fillOpacity="0.06"
        strokeWidth="1.5"
      />
      <line x1="100" y1="100" x2="162" y2="38" strokeWidth="2.5" />

      {/* Target Blips */}
      <circle cx="140" cy="62" r="4" strokeWidth="2" fill="currentColor" fillOpacity="0.4" />
      <circle cx="140" cy="62" r="8" strokeWidth="1" strokeDasharray="2 2" />
      <rect x="58" y="132" width="6" height="6" strokeWidth="1.5" fill="currentColor" fillOpacity="0.3" />
    </svg>
  );
}

// Star / Reactor Core Watermark (Faceted geometric star for MVP)
function StarWatermark({ color, size }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        position: "absolute",
        right: -25,
        bottom: -25,
        width: size,
        height: size,
        pointerEvents: "none",
        opacity: 0.08,
        color,
        userSelect: "none",
        zIndex: 0,
      }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* 8-Point Faceted Star Core */}
      <polygon
        points="
          100,12 114,64 166,42 138,90 188,100 138,110 166,158 114,136 
          100,188 86,136 34,158 62,110 12,100 62,90 34,42 86,64
        "
        strokeWidth="2.5"
        fill="currentColor"
        fillOpacity="0.05"
      />
      {/* Inner Concentric Rings */}
      <circle cx="100" cy="100" r="48" strokeWidth="2" strokeDasharray="3 3" />
      <circle cx="100" cy="100" r="32" strokeWidth="2" />
      <circle cx="100" cy="100" r="14" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />

      {/* Radiating Light Beams */}
      <line x1="100" y1="2" x2="100" y2="28" strokeWidth="2" />
      <line x1="100" y1="172" x2="100" y2="198" strokeWidth="2" />
      <line x1="2" y1="100" x2="28" y2="100" strokeWidth="2" />
      <line x1="172" y1="100" x2="198" y2="100" strokeWidth="2" />

      {/* Orbital Satellite Points */}
      <circle cx="148" cy="52" r="3" fill="currentColor" stroke="none" />
      <circle cx="52" cy="148" r="3" fill="currentColor" stroke="none" />
      <circle cx="148" cy="148" r="2.5" fill="currentColor" stroke="none" />
      <circle cx="52" cy="52" r="2.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

// Pulse / Telemetry Watermark (Heartbeat pulse oscilloscope wave for Sleeping Giants)
function PulseWatermark({ color, size }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        position: "absolute",
        right: -25,
        bottom: -25,
        width: size,
        height: size,
        pointerEvents: "none",
        opacity: 0.08,
        color,
        userSelect: "none",
        zIndex: 0,
      }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Oscilloscope Grid Lines */}
      <line x1="10" y1="40" x2="190" y2="40" strokeWidth="1" strokeDasharray="2 6" />
      <line x1="10" y1="70" x2="190" y2="70" strokeWidth="1" strokeDasharray="2 6" />
      <line x1="10" y1="100" x2="190" y2="100" strokeWidth="1" />
      <line x1="10" y1="130" x2="190" y2="130" strokeWidth="1" strokeDasharray="2 6" />
      <line x1="10" y1="160" x2="190" y2="160" strokeWidth="1" strokeDasharray="2 6" />
      <line x1="50" y1="20" x2="50" y2="180" strokeWidth="1" strokeDasharray="2 6" />
      <line x1="100" y1="20" x2="100" y2="180" strokeWidth="1" strokeDasharray="2 6" />
      <line x1="150" y1="20" x2="150" y2="180" strokeWidth="1" strokeDasharray="2 6" />

      {/* Vital Pulse EKG Waveform */}
      <path
        d="M10 100 L45 100 L55 92 L62 108 L70 100 L82 100 L90 74 L98 142 L108 38 L118 116 L126 90 L134 100 L150 100 L158 92 L166 100 L190 100"
        strokeWidth="3.5"
      />

      {/* Apex Voltage Indicator Dot */}
      <circle cx="108" cy="38" r="4.5" strokeWidth="2" fill="currentColor" fillOpacity="0.3" />
      <circle cx="108" cy="38" r="9" strokeWidth="1.5" strokeDasharray="2 3" />

      {/* Awaken Concentric Radar Waves */}
      <path d="M140 60 A50 50 0 0 1 180 100" strokeWidth="2" strokeDasharray="3 3" />
      <path d="M152 48 A70 70 0 0 1 192 100" strokeWidth="2" />
    </svg>
  );
}

// Delta / Velocity Watermark (High-speed aerospace chevrons & speed gauge for Lead Margin)
function DeltaWatermark({ color, size }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        position: "absolute",
        right: -25,
        bottom: -25,
        width: size,
        height: size,
        pointerEvents: "none",
        opacity: 0.08,
        color,
        userSelect: "none",
        zIndex: 0,
      }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Triple High-Velocity Chevrons */}
      <path d="M30 45 L90 100 L30 155" strokeWidth="5" />
      <path d="M72 45 L132 100 L72 155" strokeWidth="5" />
      <path d="M114 45 L174 100 L114 155" strokeWidth="5.5" />

      {/* Delta Mathematical Symbol & Calibration */}
      <polygon points="100,18 118,48 82,48" strokeWidth="2.5" fill="currentColor" fillOpacity="0.08" />
      <line x1="40" y1="172" x2="168" y2="172" strokeWidth="2" />
      <line x1="40" y1="168" x2="40" y2="176" strokeWidth="2" />
      <line x1="72" y1="168" x2="72" y2="176" strokeWidth="2" />
      <line x1="104" y1="166" x2="104" y2="178" strokeWidth="2.5" />
      <line x1="136" y1="168" x2="136" y2="176" strokeWidth="2" />
      <line x1="168" y1="168" x2="168" y2="176" strokeWidth="2" />

      {/* Horizontal Trajectory Axis */}
      <line x1="16" y1="100" x2="194" y2="100" strokeWidth="1.5" strokeDasharray="3 6" />
    </svg>
  );
}

// Rank / Shield Watermark (Faceted shield & podium steps for Campus Standing)
function RankWatermark({ color, size }) {
  return (
    <svg
      viewBox="0 0 200 200"
      style={{
        position: "absolute",
        right: -25,
        bottom: -25,
        width: size,
        height: size,
        pointerEvents: "none",
        opacity: 0.08,
        color,
        userSelect: "none",
        zIndex: 0,
      }}
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {/* Geometric Champion Shield */}
      <path
        d="M100 18 L160 40 L160 112 C160 148 100 178 100 178 C100 178 40 148 40 112 L40 40 Z"
        strokeWidth="3.5"
        fill="currentColor"
        fillOpacity="0.05"
      />
      {/* Inner Shield Bevel */}
      <path
        d="M100 32 L146 48 L146 106 C146 136 100 162 100 162 C100 162 54 136 54 106 L54 48 Z"
        strokeWidth="2"
      />
      {/* Center Dividing Spine */}
      <line x1="100" y1="18" x2="100" y2="178" strokeWidth="2" />

      {/* 3-Tier Champion Podium Stairs */}
      <rect x="80" y="86" width="40" height="42" rx="2" strokeWidth="2.5" fill="currentColor" fillOpacity="0.1" />
      <rect x="52" y="104" width="28" height="24" rx="2" strokeWidth="2" />
      <rect x="120" y="112" width="28" height="16" rx="2" strokeWidth="2" />

      {/* Number 1 Crown / Star on Podium */}
      <polygon points="100,64 104,74 114,75 106,82 109,92 100,86 91,92 94,82 86,75 96,74" strokeWidth="1.5" fill="currentColor" />
    </svg>
  );
}

export default function TeamPageCard({
  token,
  slug,
  chamfer = 14,
  bg,
  showWatermark = true,
  overlayPattern,
  children,
  style = {},
  className = "",
  uniqueId = "card",
}) {
  const crestFiles = CREST_REGISTRY[slug];
  const cardBackground = bg || token?.cardDeep || "#1B1F27";
  const cardLine = token?.cardLine || "rgba(255, 255, 255, 0.12)";
  const cardText = token?.cardText || "#FFFFFF";
  const cardAccent = token?.cardAccent || cardText;
  const isLight = cardText === "#1F2A4D";

  // Diagonal line length: hypotenuse = chamfer * sqrt(2)
  const diagLength = chamfer * 1.4142;
  const watermarkSize = chamfer > 14 ? 260 : 190;

  // Resolve overlay pattern from prop or fallback to uniqueId
  const pattern =
    overlayPattern ||
    {
      hero: "crest",
      "stat-standing": "rank",
      standing: "rank",
      "stat-margin": "delta",
      margin: "delta",
      "stat-pace": "gear",
      pace: "gear",
      gear: "gear",
      "stat-engagement": "circuit",
      engagement: "circuit",
      roster: "motherboard",
      "team-roster": "motherboard",
      mvp: "star",
      "team-mvp": "star",
      chasing: "radar",
      "chasing-you": "radar",
      giants: "pulse",
      "sleeping-giants": "pulse",
    }[uniqueId] ||
    "crest";

  const renderPatternOverlay = () => {
    if (!showWatermark) return null;

    switch (pattern) {
      case "gear":
        return <GearWatermark color={cardAccent} size={watermarkSize} />;
      case "circuit":
        return <CircuitWatermark color={cardAccent} size={watermarkSize} />;
      case "motherboard":
        return <MotherboardWatermark color={cardAccent} size={watermarkSize} />;
      case "radar":
        return <RadarWatermark color={cardAccent} size={watermarkSize} />;
      case "star":
        return <StarWatermark color={cardAccent} size={watermarkSize} />;
      case "pulse":
        return <PulseWatermark color={cardAccent} size={watermarkSize} />;
      case "delta":
        return <DeltaWatermark color={cardAccent} size={watermarkSize} />;
      case "rank":
        return <RankWatermark color={cardAccent} size={watermarkSize} />;
      case "crest":
      default:
        return crestFiles ? (
          <img
            src={crestFiles["384"] || crestFiles["128"]}
            alt=""
            aria-hidden="true"
            style={{
              position: "absolute",
              right: -25,
              bottom: -25,
              width: watermarkSize,
              height: watermarkSize,
              objectFit: "contain",
              pointerEvents: "none",
              opacity: 0.07,
              filter: token?.watermarkFilter || "brightness(0) invert(1)",
              userSelect: "none",
              zIndex: 0,
            }}
          />
        ) : (
          <svg
            viewBox="0 0 100 100"
            style={{
              position: "absolute",
              right: -25,
              bottom: -25,
              width: watermarkSize,
              height: watermarkSize,
              pointerEvents: "none",
              opacity: 0.07,
              filter: token?.watermarkFilter || "brightness(0) invert(1)",
              userSelect: "none",
              zIndex: 0,
            }}
            fill="none"
          >
            <path
              d="M50 8 L85 22 C85 62 50 90 50 90 C50 90 15 62 15 22 Z"
              stroke="#FFFFFF"
              strokeWidth="5"
              fill="white"
            />
          </svg>
        );
    }
  };

  return (
    <div
      className={`team-page-card ${isLight ? "light-card" : ""} ${className}`}
      style={{
        position: "relative",
        background: cardBackground,
        color: cardText,
        borderRadius: 6,
        clipPath: `polygon(0 0, calc(100% - ${chamfer}px) 0, 100% ${chamfer}px, 100% 100%, 0 100%)`,
        boxShadow: "0 1px 2px rgba(0, 0, 0, 0.08)",
        overflow: "hidden",
        ...style,
      }}
    >
      {/* 1px Inner Border */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          boxShadow: `inset 0 0 0 1px ${cardLine}`,
          clipPath: `polygon(0 0, calc(100% - ${chamfer}px) 0, 100% ${chamfer}px, 100% 100%, 0 100%)`,
          pointerEvents: "none",
          zIndex: 3,
        }}
      />

      {/* Diagonal Chamfer 1px Line */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: chamfer,
          width: diagLength,
          height: 1,
          transformOrigin: "top left",
          transform: "rotate(45deg)",
          background: cardLine,
          pointerEvents: "none",
          zIndex: 4,
        }}
      />

      {/* Layer A: Distinct Watermark Pattern (Crest on Hero, Gear on Pace, Circuit on Roster, Radar on Chasing, etc.) */}
      {renderPatternOverlay()}

      {/* Layer B: Faint Angular Facet Pattern (5% opacity) */}
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: 0.05,
          zIndex: 0,
        }}
        viewBox="0 0 400 300"
        preserveAspectRatio="none"
        fill="none"
        aria-hidden="true"
      >
        <polygon
          points="0,0 140,0 220,180 70,300 0,300"
          fill={token?.facetColor || "#FFFFFF"}
        />
        <line
          x1="0"
          y1="70"
          x2="400"
          y2="230"
          stroke={token?.facetColor || "#FFFFFF"}
          strokeWidth="1.5"
        />
        <line
          x1="200"
          y1="0"
          x2="100"
          y2="300"
          stroke={token?.facetColor || "#FFFFFF"}
          strokeWidth="1.5"
        />
      </svg>

      {/* Layer C: Subtle Film-Grain Noise (4% opacity) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0.04,
          pointerEvents: "none",
          backgroundImage: `radial-gradient(circle at 50% 50%, rgba(255, 255, 255, 0.4) 0.5px, transparent 0.5px)`,
          backgroundSize: "6px 6px",
          zIndex: 1,
        }}
      />

      {/* Card Content (z-index 2 ensures text and controls sit above decorative watermark) */}
      <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
    </div>
  );
}
