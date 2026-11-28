import { createContext, useContext, useMemo, useState } from 'react'

const translations = {
  en: {
    home: 'Home', about: 'About us', menu: 'Menu', tracking: 'Order tracking', contact: 'Contact', cart: 'Your order',
    explore: 'Explore the menu', footerKicker: 'Made warm. Served happy.',
  },
  hi: {
    home: 'होम', about: 'हमारे बारे में', menu: 'मेन्यू', tracking: 'ऑर्डर ट्रैकिंग', contact: 'संपर्क', cart: 'आपका ऑर्डर',
    explore: 'मेन्यू देखें', footerKicker: 'गरम बनाया. खुशी से परोसा.',
  },
  gu: {
    home: 'હોમ', about: 'અમારા વિશે', menu: 'મેનૂ', tracking: 'ઓર્ડર ટ્રેકિંગ', contact: 'સંપર્ક', cart: 'તમારો ઓર્ડર',
    explore: 'મેનૂ જુઓ', footerKicker: 'ગરમ બનાવેલ. ખુશીથી પરોસેલ.',
  },
}

const I18nContext = createContext(null)
export const useI18n = () => useContext(I18nContext)

export function I18nProvider({ children }) {
  const [lang, setLang] = useState(() => localStorage.getItem('cw-lang') || 'en')
  const value = useMemo(() => ({
    lang,
    setLang: (next) => { localStorage.setItem('cw-lang', next); setLang(next) },
    t: (key) => translations[lang]?.[key] || translations.en[key] || key,
  }), [lang])
  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
