'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, ClipboardDocumentIcon, CheckIcon, ArrowDownTrayIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon, LanguageIcon } from '@heroicons/react/24/outline';
import NotificationBell from '@/components/NotificationBell';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import { useLanguage } from '@/context/LanguageContext';

export default function Dashboard() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [allSubCategories, setAllSubCategories] = useState([]);
  const dropdownRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch('/api/auth/me');
        if (!res.ok) {
          throw new Error('Not authenticated');
        }
        const data = await res.json();
        setUser(data.user);
      } catch (error) {
        router.push('/auth/login');
      }
    };

    checkAuth();
  }, [router]);

  useEffect(() => {
    loadCategories();
  }, [language]);

  // Collect all subcategories from all categories
  useEffect(() => {
    if (categories.length > 0) {
      const allSubs = [];
      categories.forEach(category => {
        category.subcategories.forEach(sub => {
          allSubs.push({
            name: sub.name,
            categoryName: category.name,
            categoryId: category._id
          });
        });
      });
      setAllSubCategories(allSubs);
    }
  }, [categories]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const loadCategories = async () => {
    try {
      const url = language === 'en' ? '/api/english-categories' : '/api/categories';
      const response = await fetch(url);
      const data = await response.json();

      if (data.categories) {
        const filteredCategories = data.categories.filter(cat => cat.status === 'Approved');
        setCategories(filteredCategories);
      }
    } catch (error) {
      setError('Failed to load categories');
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCategoryClick = (category) => {
    setSelectedCategory(category);
    const categoryData = categories.find(cat => cat.name === category);
    if (categoryData) {
      setSubCategories(categoryData.subcategories.map(sub => sub.name));
    }
    setSelectedSubCategory(null);
    setMessages([]);
  };

  const handleSubCategoryClick = (subCategory) => {
    setSelectedSubCategory(subCategory);
    const categoryData = categories.find(cat => cat.name === selectedCategory);
    if (categoryData) {
      const subCategoryData = categoryData.subcategories.find(sub => sub.name === subCategory);
      if (subCategoryData) {
        setMessages(subCategoryData.messages.map(msg => msg.content));
      }
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      router.push('/auth/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleCopyMessage = async (message, index) => {
    try {
      await navigator.clipboard.writeText(message);
      setCopiedMessageId(index);
      setTimeout(() => setCopiedMessageId(null), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  // Filter all subcategories based on search term
  const filteredAllSubCategories = searchTerm
    ? allSubCategories.filter(subCategory =>
        String(subCategory.name).toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

  // Filter subcategories for the selected category
  const filteredSubCategories = subCategories.filter(subCategory =>
    String(subCategory).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Function to highlight the matching text in search results
  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? <span key={index} className="bg-yellow-200">{part}</span> : part
    );
  };

  // Handle subcategory selection from dropdown
  const handleSubCategorySelect = (subCategory) => {
    const category = categories.find(cat => cat.name === subCategory.categoryName);
    if (category) {
      setSelectedCategory(category.name);
      setSubCategories(category.subcategories.map(sub => sub.name));
      setSelectedSubCategory(subCategory.name);

      // Find and set messages for the selected subcategory
      const subCategoryData = category.subcategories.find(sub => sub.name === subCategory.name);
      if (subCategoryData) {
        setMessages(subCategoryData.messages.map(msg => msg.content));
      }
    }
    setSearchTerm('');
    setShowDropdown(false);
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="flex flex-col items-center justify-center p-8">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-4 border-blue-200 border-t-blue-600 animate-spin mb-4"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <nav className="bg-white/80 backdrop-blur-lg shadow-sm fixed top-0 left-0 right-0 z-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">{t('dashboard')}</h1>
              <div className="h-6 w-px bg-gray-200"></div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">{t('welcome')}</span>
                <span className="text-sm font-medium text-gray-900">{user.name}</span>
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${
                  user.role === 'admin'
                    ? 'bg-gradient-to-r from-purple-100 to-purple-50 text-purple-800 border border-purple-200'
                    : 'bg-gradient-to-r from-blue-100 to-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {user.role}
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {user.role === 'admin' &&  <NotificationBell />}
              <LanguageSwitcher />
              <button
                onClick={() => router.push('/dashboard/categories')}
                className="bg-gradient-to-r from-teal-500 to-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 shadow-sm hover:shadow-md flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
                <span>{t('createCategory')}</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-white text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 flex items-center space-x-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm11 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm-3 1a1 1 0 10-2 0v3a1 1 0 102 0V8zM8 9a1 1 0 00-2 0v3a1 1 0 102 0V9z" clipRule="evenodd" />
                </svg>
                <span>{t('logout')}</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-20 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-lg shadow-sm">
              <div className="flex items-center">
                <svg className="h-5 w-5 text-red-500 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          <div className="h-full bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="h-full p-6 overflow-y-auto">
              <div className="mb-6">
                <div className="relative max-w-md" ref={dropdownRef}>
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm transition-all duration-200"
                    placeholder={t('searchSubcategories')}
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(e.target.value.length > 0);
                    }}
                    onFocus={() => {
                      if (searchTerm.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                  />

                  {/* Dropdown for search results */}
                  {showDropdown && filteredAllSubCategories.length > 0 && (
                    <div className="absolute z-10 mt-1 w-full bg-white rounded-md shadow-lg max-h-60 overflow-auto border border-gray-200">
                      <ul className="py-1">
                        {filteredAllSubCategories.map((subCategory, index) => (
                          <li
                            key={index}
                            className="px-4 py-2 hover:bg-indigo-50 cursor-pointer flex flex-col"
                            onClick={() => handleSubCategorySelect(subCategory)}
                          >
                            <div className="font-medium text-sm text-gray-800">
                              {highlightMatch(subCategory.name, searchTerm)}
                            </div>
                            <div className="text-xs text-gray-500">
                              {t('inCategory')}: {subCategory.categoryName}
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-200 border-t-indigo-600"></div>
                  <p className="mt-4 text-gray-600">{t('loading')}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Categories List */}
                  <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-sm border border-gray-100">
                    <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M7 3a1 1 0 000 2h6a1 1 0 100-2H7zM4 7a1 1 0 011-1h10a1 1 0 110 2H5a1 1 0 01-1-1zM2 11a2 2 0 012-2h12a2 2 0 012 2v4a2 2 0 01-2 2H4a2 2 0 01-2-2v-4z" />
                      </svg>
                      {t('categories')}
                    </h2>
                    <div className="space-y-2">
                      {categories.map((category) => (
                        <div
                          key={category._id}
                          className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                        >
                          <button
                            onClick={() => handleCategoryClick(category.name)}
                            className={`w-full text-left text-sm flex items-center ${
                              selectedCategory === category.name
                                ? 'text-indigo-700 font-medium'
                                : 'text-gray-600 hover:text-gray-900'
                            }`}
                          >
                            <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                            {category.name || "Default Category"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SubCategories List */}
                  {selectedCategory && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                        </svg>
                        {t('subcategories')}
                      </h2>
                      {subCategories.length === 0 ? (
                        <div className="text-center py-8">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <p className="text-gray-400 text-sm">{t('noMessages')}</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {subCategories.map((subCategory, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100"
                            >
                              <button
                                onClick={() => handleSubCategoryClick(subCategory)}
                                className={`w-full text-left text-sm flex items-center ${
                                  selectedSubCategory === subCategory
                                    ? 'text-indigo-700 font-medium'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
                                <span className="w-2 h-2 rounded-full bg-indigo-500 mr-2"></span>
                                {subCategory}
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Messages List */}
                  {selectedSubCategory && (
                    <div className="bg-gradient-to-br from-gray-50 to-white rounded-xl p-4 shadow-sm border border-gray-100">
                      <h2 className="text-sm font-semibold text-gray-700 mb-4 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2 text-indigo-500" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                        </svg>
                        Messages
                      </h2>
                      <div className="space-y-3">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className="bg-white rounded-lg p-4 relative group hover:shadow-md transition-all duration-200 border border-gray-100"
                          >
                            <p className="text-sm text-gray-600 pr-12 whitespace-pre-wrap">{message}</p>
                            <p className="text-xs text-gray-400 mt-2 italic">- {user.name}</p>
                            <div className="absolute top-3 right-3 flex space-x-2">
                              <button
                                onClick={() => handleCopyMessage(message, index)}
                                className="p-1.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-all duration-200 cursor-pointer"
                                title="Copy message"
                              >
                                {copiedMessageId === index ? (
                                  <CheckIcon className="h-4 w-4 text-green-500" />
                                ) : (
                                  <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                                )}
                                {copiedMessageId === index ? (
                                  <span className="text-xs text-green-600">{t('copied')}</span>
                                ) : (
                                  <span className="text-xs text-gray-600">{t('copy')}</span>
                                )}
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}