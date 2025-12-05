// src/store/useNotifyStore.js
import { create } from "zustand";

export const useNotifyStore = create((set) => ({
    unreadCount: 0,
    setUnreadCount: (val) =>
        set(() => ({
            unreadCount: val,
        })),
}));
