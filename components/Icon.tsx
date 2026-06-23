// Icon set for the command center, backed by lucide-react. One component keyed by
// the design's original names so the ~49 call sites stay unchanged; each name maps
// to its closest lucide glyph. Stroke inherits `currentColor`.
import { CSSProperties } from "react";
import {
  Plus,
  CreditCard,
  Target,
  TrendingUp,
  ArrowUp,
  ArrowUpRight,
  Check,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Search,
  Pencil,
  Download,
  Bell,
  Trash2,
  RefreshCw,
  LineChart,
  ArrowRight,
  Sun,
  Moon,
  Monitor,
  Smartphone,
  Home,
  BarChart3,
  PiggyBank,
  TrendingDown,
  FileDown,
  File,
  AlertCircle,
  ArrowDownToLine,
  Circle,
  GripVertical,
  type LucideIcon,
} from "lucide-react";

// Maps the design's icon names onto lucide components. Names with no exact lucide
// match use the nearest equivalent (e.g. `debt` → falling trend, `send` → arrow).
const icons = {
  plus: Plus,
  card: CreditCard,
  target: Target,
  trendingUp: TrendingUp,
  arrowUp: ArrowUp,
  arrowUpRight: ArrowUpRight,
  check: Check,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronUp: ChevronUp,
  search: Search,
  edit: Pencil,
  download: Download,
  bell: Bell,
  trash: Trash2,
  refresh: RefreshCw,
  chart: LineChart,
  send: ArrowRight,
  sun: Sun,
  moon: Moon,
  monitor: Monitor,
  desktop: Monitor,
  mobile: Smartphone,
  home: Home,
  bars: BarChart3,
  piggy: PiggyBank,
  debt: TrendingDown,
  file: FileDown,
  fileSimple: File,
  alert: AlertCircle,
  install: ArrowDownToLine,
  dot: Circle,
  grip: GripVertical,
} satisfies Record<string, LucideIcon>;

type Props = {
  name: keyof typeof icons;
  size?: number;
  width?: number;
  strokeWidth?: number;
  fill?: string;
  style?: CSSProperties;
  className?: string;
};

export function Icon({ name, size = 18, width, strokeWidth = 1.9, fill = "none", style, className }: Props) {
  const LucideGlyph = icons[name];
  return (
    <LucideGlyph
      width={width ?? size}
      height={size}
      strokeWidth={strokeWidth}
      fill={fill}
      style={style}
      className={className}
    />
  );
}

// The four-point Northstar mark as a recolorable inline glyph. Matches the brand
// mark silhouette (see /public/brand) but takes a dynamic `fill`, so it's used for
// the advisor/brand accents that appear in many colors and sizes throughout the app.
// For the actual logo (fixed colors) prefer <Logo>/<Wordmark> in lib/Brand.tsx.
export function Sparkle({ size = 18, fill = "#fff", style }: { size?: number; fill?: string; style?: CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill={fill} style={style}>
      <path d="M50 4 C53 30 70 47 96 50 C70 53 53 70 50 96 C47 70 30 53 4 50 C30 47 47 30 50 4 Z" />
      <path d="M78 12 C79 19 84 24 91 25 C84 26 79 31 78 38 C77 31 72 26 65 25 C72 24 77 19 78 12 Z" opacity="0.7" />
    </svg>
  );
}
