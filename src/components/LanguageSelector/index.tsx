import React from 'react';
import { useTranslation } from 'react-i18next';

const LanguageSelector: React.FC = () => {
  const { i18n } = useTranslation();

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  return (
    <div className="flex gap-2">
      <button
        className={`px-3 py-1 rounded ${
          i18n.language === 'zh' 
            ? 'bg-[#4080FF] text-white' 
            : 'bg-gray-100 text-gray-600'
        }`}
        onClick={() => changeLanguage('zh')}
      >
        中文
      </button>
      <button
        className={`px-3 py-1 rounded ${
          i18n.language === 'en' 
            ? 'bg-[#4080FF] text-white' 
            : 'bg-gray-100 text-gray-600'
        }`}
        onClick={() => changeLanguage('en')}
      >
        English
      </button>
    </div>
  );
};

export default LanguageSelector; 