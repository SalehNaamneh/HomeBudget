import React, { createContext, useContext, useEffect, useState } from 'react';
import { getSetting, setSetting } from '../db/storage';
import { translations, Lang, Strings } from '../i18n/translations';

const CYCLE: Lang[] = ['en', 'ar', 'he'];

interface LanguageContextType {
  lang: Lang;
  s: Strings;
  isRTL: boolean;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en', s: translations.en, isRTL: false, toggleLanguage: () => {},
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>(() => getSetting('language', 'en') as Lang);

  useEffect(() => {
    const isRTL = lang === 'ar' || lang === 'he';
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    document.documentElement.lang = lang;
  }, [lang]);

  const toggleLanguage = () => {
    const next = CYCLE[(CYCLE.indexOf(lang) + 1) % CYCLE.length];
    setSetting('language', next);
    setLang(next);
  };

  return (
    <LanguageContext.Provider value={{
      lang,
      s: translations[lang] as unknown as Strings,
      isRTL: lang === 'ar' || lang === 'he',
      toggleLanguage,
    }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
