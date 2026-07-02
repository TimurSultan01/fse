import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type FavoritesState = {
  ids: number[];
  toggle: (id: number) => void;
  isFavorite: (id: number) => boolean;
};

/** Merkt sich favorisierte Flugtreffen lokal im Browser (localStorage). */
export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle(id) {
        set((state) => ({
          ids: state.ids.includes(id)
            ? state.ids.filter((existing) => existing !== id)
            : [...state.ids, id],
        }));
      },
      isFavorite(id) {
        return get().ids.includes(id);
      },
    }),
    { name: 'flightmeet-favorites' },
  ),
);
