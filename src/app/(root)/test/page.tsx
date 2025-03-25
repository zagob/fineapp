"use client"

import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export default function Page() {
    const [date, setDate] = useState<Date>();

    return (
        <div>
            <Calendar 
             mode="single"
             disableNavigation
             selected={date}
             onSelect={setDate}
             className="rounded-md mx-auto w-fit border border-neutral-700"
             showOutsideDays
             classNames={{
                day_selected: 'border border-neutral-700 bg-neutral-900',
             }}
            />
        </div>
    )
}