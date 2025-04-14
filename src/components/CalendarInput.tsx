import { Control, Controller, FieldValues, Path } from "react-hook-form";
import { Calendar } from "./ui/calendar";

interface CalendarInputProps<T extends FieldValues> {
  control: Control<T>;
  name: Path<T>;
}

export const CalendarInput = <T extends FieldValues>({
  name,
  control,
}: CalendarInputProps<T>) => {
  return (
    <Controller
      control={control}
      name={name}
      render={({ field }) => (
        <Calendar
          mode="single"
          disableNavigation
          selected={field.value}
          onSelect={field.onChange}
          disabled={(date) => date > new Date()}
          className="rounded-md mx-auto border border-neutral-700 text-center"
          classNames={{
            day_selected: "bg-neutral-600 border border-neutral-400",
            day_today: "bg-neutral-600 text-neutral-200",
          }}
          {...field}
        />
      )}
    />
  );
};
