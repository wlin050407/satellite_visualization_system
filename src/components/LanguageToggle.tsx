import React from 'react'
import { useTranslation } from '../i18n/useTranslation'

const LanguageToggle: React.FC = () => {
  const { language, setLanguage } = useTranslation()

  const toggleLanguage = () => {
    setLanguage(language === 'zh' ? 'en' : 'zh')
  }

  return (
    <button
      onClick={toggleLanguage}
      style={{
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        width: '52px',
        height: '52px',
        borderRadius: '50%',
        background: 'rgba(59, 130, 246, 0.15)',
        backdropFilter: 'blur(12px)',
        border: '2px solid rgba(59, 130, 246, 0.4)',
        color: '#3b82f6',
        fontSize: '16px',
        fontWeight: '600',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        boxShadow: '0 8px 32px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(59, 130, 246, 0.15)',
        userSelect: 'none',
        WebkitUserSelect: 'none',
        outline: 'none'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)'
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.6)'
        e.currentTarget.style.color = '#ffffff'
        e.currentTarget.style.boxShadow = '0 12px 40px rgba(59, 130, 246, 0.35), 0 4px 12px rgba(59, 130, 246, 0.25)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1) translateY(0)'
        e.currentTarget.style.background = 'rgba(59, 130, 246, 0.15)'
        e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)'
        e.currentTarget.style.color = '#3b82f6'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(59, 130, 246, 0.25), 0 2px 8px rgba(59, 130, 246, 0.15)'
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.transform = 'scale(0.95) translateY(0)'
      }}
      onMouseUp={(e) => {
        e.currentTarget.style.transform = 'scale(1.05) translateY(-2px)'
      }}
      title={language === 'zh' ? '切换到英文' : 'Switch to Chinese'}
    >
      {language === 'zh' ? 'EN' : '中'}
    </button>
  )
}

export default LanguageToggle 