import type { FC } from "react";
import type {
  EncValProps,
  MpcVizProps,
  LockIconProps,
  PanelHeaderProps,
  StatCellProps,
  ToastProps,
} from "@/types";

/* ── Icons ────────────────────────────────────────────────────────────────── */

export const LockIcon: FC<LockIconProps> = ({
  className = "text-mxe-dim",
  size = 10,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 12 14"
    fill="none"
    className={`flex-shrink-0 ${className}`}
  >
    <rect
      x="1.5"
      y="6"
      width="9"
      height="8"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path d="M4 6V4a2 2 0 014 0v2" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="6" cy="10" r="1" fill="currentColor" />
  </svg>
);

export const ShieldIcon: FC<{ size?: number }> = ({ size = 14 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 14 16"
    fill="none"
    className="flex-shrink-0"
  >
    <path
      d="M7 1L13 3.5V8C13 11.5 10 14.5 7 15.5C4 14.5 1 11.5 1 8V3.5L7 1Z"
      stroke="#00e5ff"
      strokeWidth="1.2"
      fill="none"
    />
    <path
      d="M4.5 8L6.5 10L9.5 6"
      stroke="#00e5ff"
      strokeWidth="1.3"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ArciumLogo: FC<{ size?: number }> = ({ size = 24 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect
      width="24"
      height="24"
      rx="4"
      fill="#090f1e"
      stroke="#f5a623"
      strokeWidth="1"
    />
    <path
      d="M12 3L21 7.5V16.5L12 21L3 16.5V7.5L12 3Z"
      stroke="#f5a623"
      strokeWidth="1.1"
      fill="none"
      opacity="0.45"
    />
    <circle cx="12" cy="12" r="3.5" fill="#f5a623" opacity="0.85" />
  </svg>
);

/* Tab icons for mobile nav */
export const ChartIcon: FC = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="1" y="9" width="3" height="5" rx="0.5" fill="currentColor" />
    <rect x="6" y="5" width="3" height="9" rx="0.5" fill="currentColor" />
    <rect x="11" y="2" width="3" height="12" rx="0.5" fill="currentColor" />
  </svg>
);

export const BookIcon: FC = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <line
      x1="1"
      y1="4"
      x2="14"
      y2="4"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="1"
      y1="7"
      x2="14"
      y2="7"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="1"
      y1="10"
      x2="9"
      y2="10"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
    <line
      x1="1"
      y1="13"
      x2="14"
      y2="13"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const WalletIcon: FC = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect
      x="1"
      y="3.5"
      width="13"
      height="9"
      rx="1.5"
      stroke="currentColor"
      strokeWidth="1.3"
    />
    <path d="M1 7h13" stroke="currentColor" strokeWidth="1.3" />
    <circle cx="10.5" cy="9.5" r="1" fill="currentColor" />
  </svg>
);

export const OrderIcon: FC = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M3 4h9M3 7.5h6M3 11h9"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
    />
  </svg>
);

export const MarketsIcon: FC = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect x="2" y="9" width="2.5" height="4" rx="0.5" fill="currentColor" />
    <rect
      x="6.25"
      y="5.5"
      width="2.5"
      height="7.5"
      rx="0.5"
      fill="currentColor"
    />
    <rect x="10.5" y="2" width="2.5" height="11" rx="0.5" fill="currentColor" />
  </svg>
);

export const HistoryIcon: FC = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path
      d="M7.5 2a5.5 5.5 0 1 0 5.5 5.5H11.5A4 4 0 1 1 7.5 3.5V2z"
      fill="currentColor"
    />
    <path
      d="M7.5 4.5v3.25l2 1.25"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path
      d="M11 1.5l1.5 1.5-1.5 1.5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const PortfolioIcon: FC = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <rect
      x="1.5"
      y="5"
      width="12"
      height="8.5"
      rx="1"
      stroke="currentColor"
      strokeWidth="1.2"
    />
    <path
      d="M5 5V3.5a2.5 2.5 0 0 1 5 0V5"
      stroke="currentColor"
      strokeWidth="1.2"
      strokeLinecap="round"
    />
    <path d="M1.5 8.5h12" stroke="currentColor" strokeWidth="1.2" />
  </svg>
);

export const EncVal: FC<EncValProps> = ({
  children: _children,
  variant = "mxe",
}) => {
  const color = variant === "amber" ? "text-amber-dim" : "text-mxe-dim";
  return (
    <span className={`enc-val ${color}`}>
      <LockIcon className={color} size={9} />
      {_children}
    </span>
  );
};

export const MpcViz: FC<MpcVizProps> = ({ size = 120 }) => {
  const orbit = "M60,60 m-52,0 a52,52 0 1,0 104,0 a52,52 0 1,0 -104,0";
  const nodes = [
    { color: "#00e5ff", begin: "0s" },
    { color: "#f5a623", begin: "-2s" },
    { color: "#00e5ff", begin: "-4s" },
  ];
  return (
    <svg viewBox="0 0 120 120" width={size} height={size}>
      <defs>
        <radialGradient id="cg" cx="50%" cy="50%">
          <stop offset="0%" stopColor="#00e5ff" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#00e5ff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle
        cx="60"
        cy="60"
        r="52"
        fill="none"
        stroke="#112038"
        strokeWidth="1"
        strokeDasharray="3 6"
      />
      <circle cx="60" cy="60" r="22" fill="url(#cg)" />
      <circle
        cx="60"
        cy="60"
        r="13"
        fill="none"
        stroke="#00e5ff"
        strokeWidth="1.2"
        opacity="0.45"
      />
      {[0, 120, 240].map((deg) => {
        const rad = (Math.PI * deg) / 180;
        return (
          <line
            key={deg}
            x1="60"
            y1="60"
            x2={60 + 52 * Math.cos(rad)}
            y2={60 + 52 * Math.sin(rad)}
            stroke="#00e5ff"
            strokeWidth="0.5"
            opacity="0.18"
          />
        );
      })}
      {nodes.map(({ color, begin }, i) => (
        <circle key={i} r="5.5" fill="#090f1e" stroke={color} strokeWidth="1.6">
          <animateMotion
            dur="6s"
            begin={begin}
            repeatCount="indefinite"
            path={orbit}
          />
        </circle>
      ))}
      <text
        x="60"
        y="56"
        textAnchor="middle"
        fill="#00e5ff"
        fontSize="7.5"
        fontFamily="IBM Plex Mono"
        letterSpacing="1.5"
      >
        MXE
      </text>
      <text
        x="60"
        y="66"
        textAnchor="middle"
        fill="#003d52"
        fontSize="6"
        fontFamily="IBM Plex Mono"
        letterSpacing="1"
      >
        ARCIUM
      </text>
    </svg>
  );
};

export const Toast: FC<ToastProps> = ({ msg }) => (
  <div
    role="status"
    className="fixed top-[60px] right-3 z-[800] bg-surface-2 border border-enc-border
    px-4 py-2.5 rounded text-md text-mxe max-w-[300px] animate-slide-down font-mono tracking-badge
    leading-relaxed shadow-modal"
  >
    {msg}
  </div>
);

export const PanelHeader: FC<PanelHeaderProps> = ({ title, badge }) => (
  <div className="panel-header">
    <span>{title}</span>
    {badge && <span className="badge-enc">{badge}</span>}
  </div>
);

export const StatCell: FC<StatCellProps> = ({ label, value, color }) => (
  <div className="stat-cell">
    <label>{label}</label>
    <span className={color ?? "text-mid"}>{value}</span>
  </div>
);

export const MxeDot: FC<{ pulse?: boolean }> = ({ pulse = true }) => (
  <span
    className={`inline-block w-1.5 h-1.5 rounded-full bg-mxe flex-shrink-0 ${pulse ? "animate-mpc-pulse" : ""}`}
  />
);

export const ArciumPrivacySeal: FC = () => (
  <div className="flex items-start gap-2.5 p-2.5 bg-enc border border-enc-border rounded">
    <ShieldIcon size={15} />
    <div>
      <p className="text-xs text-mxe tracking-label uppercase mb-1">
        Arcium MXE Protected
      </p>
      <p className="text-xs text-mxe-dim leading-relaxed">
        Position, size &amp; liquidation price encrypted inside Arcium's MXE.
        Only final PnL is revealed on settlement.
      </p>
    </div>
  </div>
);

export const SectionDivider: FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-2 px-3 py-1.5">
    <span className="text-2xs text-muted tracking-widest uppercase">
      {label}
    </span>
    <div className="flex-1 h-px bg-dim" />
  </div>
);
