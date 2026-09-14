import { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import translations, { Lang, Translation } from '@/i18n/translations';

interface LanguageContextType {
  lang: Lang;
  t: Translation;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  locale: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('ES');

  const toggleLang = useCallback(() => {
    setLang((prev) => (prev === 'ES' ? 'EN' : 'ES'));
  }, []);

  const value: LanguageContextType = {
    lang,
    t: translations[lang],
    setLang,
    toggleLang,
    locale: lang === 'ES' ? 'es-ES' : 'en-US',
  };

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLang() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLang must be used within LanguageProvider');
  }
  return context;
}
