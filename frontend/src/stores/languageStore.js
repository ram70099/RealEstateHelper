import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import i18n from '../i18n';

export const useLanguageStore = create(
  persist(
    (set) => ({
      language: 'en',
      setLanguage: (newLanguage) => {
        i18n.changeLanguage(newLanguage);
        set({ language: newLanguage });
      },
    }),
    {
      name: 'language-storage',
    }
  )
);