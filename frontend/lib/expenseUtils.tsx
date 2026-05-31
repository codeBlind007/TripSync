const CATEGORY_ALIASES: Record<
  string,
  {
    label: string;
    icon: string;
    variant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  food: { label: "Food", icon: "🍔", variant: "destructive" },
  dining: { label: "Food", icon: "🍔", variant: "destructive" },
  restaurant: { label: "Food", icon: "🍔", variant: "destructive" },
  transport: { label: "Transport", icon: "🚕", variant: "secondary" },
  travel: { label: "Transport", icon: "🚕", variant: "secondary" },
  stay: { label: "Stay", icon: "🏨", variant: "outline" },
  hotel: { label: "Stay", icon: "🏨", variant: "outline" },
  accommodation: { label: "Stay", icon: "🏨", variant: "outline" },
  activities: { label: "Activities", icon: "🎯", variant: "default" },
  activity: { label: "Activities", icon: "🎯", variant: "default" },
  shopping: { label: "Shopping", icon: "🛍️", variant: "default" },
  miscellaneous: { label: "Misc", icon: "📦", variant: "default" },
  misc: { label: "Misc", icon: "📦", variant: "default" },
};

const getCategoryMeta = (category: string) => {
  const lowerCategory = category.toLowerCase();
  return (
    CATEGORY_ALIASES[lowerCategory] ?? {
      label: category.charAt(0).toUpperCase() + category.slice(1),
      icon: "📦",
      variant: "default" as const,
    }
  );
};

export const getCategoryBadgeVariant = (
  category: string,
): "default" | "secondary" | "destructive" | "outline" => {
  return getCategoryMeta(category).variant;
};

export const getCategoryIcon = (category: string): string => {
  return getCategoryMeta(category).icon;
};

export const getCategoryLabel = (category: string): string => {
  return getCategoryMeta(category).label;
};
