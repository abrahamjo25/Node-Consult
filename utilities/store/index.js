import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export const useClientStore = create(
    persist(
        (set, get) => ({
            update: (id, clientId, clientName) => set(() => ({ id, clientId, clientName }))
        }),
        {
            name: 'client-data',
            storage: createJSONStorage(() => localStorage)
        }
    )
);
