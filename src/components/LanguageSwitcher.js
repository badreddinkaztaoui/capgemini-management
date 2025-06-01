'use client';

import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '@/context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, changeLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const selectLanguage = (lang) => {
    changeLanguage(lang);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 bg-white text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200"
      >
        <span className="uppercase">{language}</span>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          viewBox="0 0 20 20" 
          fill="currentColor"
        >
          <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-36 bg-white rounded-lg shadow-lg py-1 z-20 border border-gray-100 animate-fadeIn">
          <button
            onClick={() => selectLanguage('en')}
            className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${language === 'en' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
          >
            <span className="flex items-center">
              <span className="w-5 h-5 mr-2 rounded-full overflow-hidden flex-shrink-0">
                🇬🇧
              </span>
              English
            </span>
          </button>
          <button
            onClick={() => selectLanguage('fr')}
            className={`flex items-center w-full px-4 py-2 text-sm text-left hover:bg-gray-50 ${language === 'fr' ? 'bg-blue-50 text-blue-700 font-medium' : 'text-gray-700'}`}
          >
            <span className="flex items-center">
              <span className="w-5 h-5 mr-2 rounded-full overflow-hidden flex-shrink-0">
                🇫🇷
              </span>
              Français
            </span>
          </button>
        </div>
      )}
    </div>
  );
}
