import { ICONS_CATEGORIES_EXPENSE } from "@/variants/iconsCategories";
import { EditedCategory } from "./EditedCategory";
import { $Enums } from "@prisma/client";

interface CategoryProps {
  category: {
    name: string;
    id: string;
    userId: string;
    type: $Enums.Type;
    color: string;
    icon: string | null;
  };
}

export const Category = ({ category }: CategoryProps) => {
  const IconComponent =
    ICONS_CATEGORIES_EXPENSE[
      category.icon as keyof typeof ICONS_CATEGORIES_EXPENSE
    ];

  return (
    <div
      className="flex items-center justify-between py-1 border-b border-b-neutral-800"
      key={category.id}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex items-center justify-center size-7 rounded-full border border-neutral-600"
          style={{
            backgroundColor: category.color,
          }}
        >
          <IconComponent className="text-zinc-50 size-4" strokeWidth={2} />
        </div>
        <span className="text-zinc-400">{category.name}</span>
      </div>

      <EditedCategory
        type={category.type}
        defaultValues={{
          color: category.color,
          icon: category.icon as string,
          name: category.name,
          id: category.id,
        }}
      />
    </div>
  );
};
