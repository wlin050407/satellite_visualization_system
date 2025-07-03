import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { translations, Translations } from './translations'

type Language = 'zh' | 'en'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: Translations
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

interface LanguageProviderProps {
  children: ReactNode
}

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // 从localStorage读取保存的语言设置，默认为英文
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('satellite-app-language')
      return (saved as Language) || 'en'
    } catch {
      return 'en'
    }
  })

  // 设置语言并保存到localStorage
  const setLanguage = (lang: Language) => {
    setLanguageState(lang)
    try {
      localStorage.setItem('satellite-app-language', lang)
    } catch (error) {
      console.warn('Failed to save language preference:', error)
    }
  }

  // 获取当前语言的翻译对象
  const t = translations[language]

  const value: LanguageContextType = {
    language,
    setLanguage,
    t
  }

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

// 自定义Hook用于使用翻译功能
export const useTranslation = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider')
  }
  return context
} 