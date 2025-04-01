import { create } from 'zustand'

interface DateStoreProps {
    date: Date
    setDate: (date: Date) => void
}

export const useDateStore = create<DateStoreProps>((set) => ({
    date: new Date(),
    setDate: (date: Date) => set({ date }),
}))