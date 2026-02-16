import {
  Cross,
  Users,
  User,
  GraduationCap,
  BookOpen,
  Sparkles,
  UserMinus,
  Footprints,
} from "lucide-react";
import { CARISMA_BADGE_COLORS } from "@/config/carisma";

/**
 * Maps each carisma label to a distinctive Lucide icon.
 *
 * - Presbítero  → Cross (clerical cross)
 * - Casado      → Users (couple)
 * - Soltero     → User (individual)
 * - Seminarista → GraduationCap (studying)
 * - Diácono     → BookOpen (liturgy/word)
 * - Monja       → Sparkles (vida consagrada)
 * - Viudo       → UserMinus (pérdida de cónyuge)
 * - Itinerante  → Footprints (journeying)
 */
const CARISMA_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "Presbítero": Cross,
  "Casado": Users,
  "Soltero": User,
  "Seminarista": GraduationCap,
  "Diácono": BookOpen,
  "Monja": Sparkles,
  "Viudo": UserMinus,
  "Itinerante": Footprints,
};

interface CarismaBadgeProps {
  carisma: string;
  /** "sm" for inline table use, "md" for headers/groups */
  size?: "sm" | "md";
  /** Show label text next to icon. Default true */
  showLabel?: boolean;
  className?: string;
}

export function CarismaBadge({
  carisma,
  size = "sm",
  showLabel = true,
  className = "",
}: CarismaBadgeProps) {
  if (!carisma) return null;

  const colors = CARISMA_BADGE_COLORS[carisma] || {
    bg: "bg-gray-100",
    text: "text-gray-800",
  };
  const Icon = CARISMA_ICONS[carisma];

  const sizeClasses =
    size === "md"
      ? "text-sm px-2.5 py-1 gap-1.5"
      : "text-xs px-2 py-0.5 gap-1";

  const iconSize = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <span
      className={`inline-flex items-center font-semibold rounded ${sizeClasses} ${colors.bg} ${colors.text} ${className}`}
    >
      {Icon && <Icon className={`${iconSize} flex-shrink-0`} />}
      {showLabel && <span>{carisma}</span>}
    </span>
  );
}
