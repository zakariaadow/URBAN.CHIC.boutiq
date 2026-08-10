// src/components/common/LanguageSelector.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaGlobe, FaChevronDown, FaCheck } from 'react-icons/fa';

const LanguageSelector = () => {
  const { t, i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const languages = [
    { code: 'en', name: 'English', flag: '🇬🇧', nativeName: 'English' },
    { code: 'sw', name: 'Kiswahili', flag: '🇰🇪', nativeName: 'Kiswahili' },
    { code: 'so', name: 'Somali', flag: '🇸🇴', nativeName: 'Soomaali' },
    { code: 'fr', name: 'Français', flag: '🇫🇷', nativeName: 'Français' },
    { code: 'ar', name: 'العربية', flag: '🇸🇦', nativeName: 'العربية' },
  ];

  const changeLanguage = (langCode) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('language', langCode);
    // Reload the page to apply changes to all components
    window.location.reload();
  };

  const getCurrentLanguage = () => {
    const current = languages.find(l => l.code === i18n.language);
    return current || languages[0];
  };

  const currentLang = getCurrentLanguage();

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-sm border border-gray-200 dark:border-gray-600"
        aria-label={t('nav.language') || 'Select language'}
      >
        <FaGlobe className="w-4 h-4" />
        <span className="hidden md:block">{currentLang.flag} {currentLang.name}</span>
        <span className="md:hidden">{currentLang.flag}</span>
        <FaChevronDown className="w-3 h-3" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
          <div className="px-3 py-1 text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            {t('nav.language') || 'Select Language'}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => {
                changeLanguage(lang.code);
                setIsOpen(false);
              }}
              className={`flex items-center w-full px-4 py-2.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors ${
                i18n.language === lang.code 
                  ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400' 
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              <span className="text-xl mr-3">{lang.flag}</span>
              <div className="flex flex-col items-start">
                <span className="font-medium">{lang.name}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400">{lang.nativeName}</span>
              </div>
              {i18n.language === lang.code && (
                <FaCheck className="ml-auto text-purple-600 dark:text-purple-400" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;