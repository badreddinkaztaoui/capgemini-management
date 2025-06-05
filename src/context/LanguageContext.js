'use client';

import { createContext, useContext, useState, useEffect } from 'react';

// Define translations
const translations = {
  en: {
    welcome: 'Welcome back,',
    dashboard: 'Dashboard',
    createCategory: 'Create Category',
    logout: 'Logout',
    searchSubcategories: 'Search subcategories...',
    categories: 'Categories',
    subcategories: 'Subcategories',
    messages: 'Messages',
    loading: 'Loading...',
    noMessages: 'No messages available',
    copied: 'Copied!',
    copy: 'Copy',
    loadingDashboard: 'Loading your dashboard...',
    capgeminiManagement: 'Capgemini Management',
    // Categories page translations
    backToDashboard: 'Back to Dashboard',
    categoriesManagement: 'Categories Management',
    manageCategories: 'Manage your categories, subcategories, and messages',
    permissionWarning: 'You can create new categories but cannot edit or delete existing ones.',
    approved: 'Approved',
    disapproved: 'Disapproved',
    approve: 'Approve',
    disapprove: 'Disapprove',
    addedSubcategories: 'Added Subcategories',
    addSubcategory: 'Add Subcategory',
    subcategoryName: 'Subcategory Name',
    enterSubcategoryName: 'Enter subcategory name',
    message: 'Message',
    enterMessageContent: 'Enter message content',
    categoryName: 'Category Name',
    enterCategoryName: 'Enter category name',
    creating: 'Creating...',
    cancel: 'Cancel',
    save: 'Save',
    createNewCategory: 'Create New Category',
    addSubcategoryTo: 'Add Subcategory To'
  },
  fr: {
    welcome: 'Bienvenue,',
    dashboard: 'Tableau de bord',
    createCategory: 'Créer une catégorie',
    logout: 'Déconnexion',
    searchSubcategories: 'Rechercher des sous-catégories...',
    categories: 'Catégories',
    subcategories: 'Sous-catégories',
    messages: 'Messages',
    loading: 'Chargement...',
    noMessages: 'Aucun message disponible',
    copied: 'Copié!',
    copy: 'Copier',
    loadingDashboard: 'Chargement de votre tableau de bord...',
    capgeminiManagement: 'Gestion Capgemini',
    // Categories page translations
    backToDashboard: 'Retour au tableau de bord',
    categoriesManagement: 'Gestion des catégories',
    manageCategories: 'Gérez vos catégories, sous-catégories et messages',
    permissionWarning: 'Vous pouvez créer de nouvelles catégories mais vous ne pouvez pas modifier ou supprimer celles qui existent.',
    approved: 'Approuvé',
    disapproved: 'Désapprouvé',
    approve: 'Approuver',
    disapprove: 'Désapprouver',
    addedSubcategories: 'Sous-catégories ajoutées',
    addSubcategory: 'Ajouter une sous-catégorie',
    subcategoryName: 'Nom de la sous-catégorie',
    enterSubcategoryName: 'Entrez le nom de la sous-catégorie',
    message: 'Message',
    enterMessageContent: 'Entrez le contenu du message',
    categoryName: 'Nom de la catégorie',
    enterCategoryName: 'Entrez le nom de la catégorie',
    creating: 'Création en cours...',
    cancel: 'Annuler',
    save: 'Enregistrer',
    createNewCategory: 'Créer une nouvelle catégorie',
    addSubcategoryTo: 'Ajouter une sous-catégorie à'
  }
};

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setLanguage(savedLanguage);
  }, []);

  const changeLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key) => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
