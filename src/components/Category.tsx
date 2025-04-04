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
      className="flex items-center justify-between border px-2 py-3 rounded border-zinc-500"
      key={category.id}
    >
      <div className="flex items-center gap-2">
        <div
          className="flex items-center gap-2 justify-center size-6 rounded-full"
          style={{
            backgroundColor: category.color,
          }}
        >
          <IconComponent className="text-zinc-50" strokeWidth={1} />
        </div>
        <span className="text-zinc-50">{category.name}</span>
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
