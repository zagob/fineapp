import { cn } from "@/lib/utils";
import { ICONS_CATEGORIES_EXPENSE } from "@/variants/iconsCategories";

interface ImageCategoryProps {
  icon: string;
  color: string;
  classNameBackground?: string;
  classNameIcon?: string;
}

export const ImageCategory = ({
  icon,
  color,
  classNameBackground,
  classNameIcon,
}: ImageCategoryProps) => {
  const IconComponent =
    ICONS_CATEGORIES_EXPENSE[icon as keyof typeof ICONS_CATEGORIES_EXPENSE];

  return (
    <div
      className={cn(
        "flex items-center justify-center size-7 rounded-full border border-neutral-600",
        classNameBackground
      )}
      style={{
        backgroundColor: color,
      }}
    >
      <IconComponent
        className={cn("text-zinc-50 size-4", classNameIcon)}
        strokeWidth={2}
      />
    </div>
  );
};
