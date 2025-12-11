'use client';

import { useEffect, useState } from 'react';
import { Globe, ChevronDown } from 'lucide-react';

declare global {
  interface Window {
    google: any;
    googleTranslateElementInit: any;
  }
}

export default function LanguageSwitcher() {
  const [mounted, setMounted] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');

  // 1. Initialize Google Translate Script
  useEffect(() => {
    setMounted(true);
    
    window.googleTranslateElementInit = () => {
      if (window.google && window.google.translate) {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'en',
            includedLanguages: 'en,zh-CN', // English & Chinese
            autoDisplay: false,
          },
          'google_translate_element'
        );
      }
    };

    if (!document.querySelector('#google-translate-script')) {
      const script = document.createElement('script');
      script.id = 'google-translate-script';
      script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // 2. Function to trigger Google's hidden dropdown
  const changeLanguage = (langCode: string) => {
    const googleSelect = document.querySelector('.goog-te-combo') as HTMLSelectElement;
    if (googleSelect) {
      googleSelect.value = langCode;
      googleSelect.dispatchEvent(new Event('change'));
      setCurrentLang(langCode);
    }
  };

  if (!mounted) return null;

  return (
    <div className="relative">
      {/* THE HIDDEN GOOGLE WIDGET */}
      <div 
        id="google_translate_element" 
        className="absolute opacity-0 w-0 h-0 overflow-hidden pointer-events-none" 
      />

      {/* OUR CUSTOM PROFESSIONAL UI */}
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-900 rounded-md border border-gray-800">
        <Globe className="w-4 h-4 text-gray-400" />
        <select 
          value={currentLang}
          onChange={(e) => changeLanguage(e.target.value)}
          className="bg-transparent text-sm text-gray-300 font-medium focus:outline-none w-full cursor-pointer appearance-none"
          style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}
        >
          <option value="en" className="bg-gray-900 text-gray-300">English (US)</option>
          <option value="zh-CN" className="bg-gray-900 text-gray-300">Chinese (中文)</option>
        </select>
        <ChevronDown className="w-3 h-3 text-gray-500 absolute right-3 pointer-events-none" />
      </div>
    </div>
  );
}