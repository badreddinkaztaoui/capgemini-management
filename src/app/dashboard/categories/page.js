'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, ArrowLeftIcon, XMarkIcon, PencilIcon, TrashIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [formData, setFormData] = useState({
    categoryName: '',
    subcategoryName: '',
    message: ''
  });
  const [subcategories, setSubcategories] = useState([]);
  const [editingMessage, setEditingMessage] = useState(null);
  const [editingSubcategory, setEditingSubcategory] = useState(null);
  const [expandedCategories, setExpandedCategories] = useState(new Set());

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
    loadCategories();
  }, [router]);

  const isAdmin = user?.role === 'admin';
  const isMember = user?.role === 'member';

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      if (data.categories) {
        setCategories(data.categories);
      }
    } catch (error) {
      setError('Failed to load categories');
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCategory = (categoryId) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const handleDeleteCategory = async (categoryId) => {
    if (!isAdmin) {
      setError('Only administrators can delete categories');
      return;
    }

    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete category');
      }

      setSuccess('Category deleted successfully');
      await loadCategories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDeleteSubcategory = async (categoryId, subcategoryId) => {
    if (!isAdmin) {
      setError('Only administrators can delete subcategories');
      return;
    }

    if (!confirm('Are you sure you want to delete this subcategory?')) return;

    try {
      const response = await fetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete subcategory');
      }

      setSuccess('Subcategory deleted successfully');
      await loadCategories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditMessage = async (categoryId, subcategoryId, messageId, newContent) => {
    if (!isAdmin) {
      setError('Only administrators can edit messages');
      return;
    }

    try {
      const category = categories.find(cat => cat._id === categoryId);
      const subcategory = category.subcategories.find(sub => sub._id === subcategoryId);
      const message = subcategory.messages.find(msg => msg._id === messageId);

      message.content = newContent;

      const response = await fetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: subcategory.messages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update message');
      }

      setSuccess('Message updated successfully');
      setEditingMessage(null);
      await loadCategories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleAddSubcategory = () => {
    if (!formData.subcategoryName) {
      setError('Subcategory name is required');
      return;
    }

    setSubcategories([
      ...subcategories,
      {
        name: formData.subcategoryName,
        message: formData.message
      }
    ]);

    // Reset subcategory form fields
    setFormData({
      ...formData,
      subcategoryName: '',
      message: ''
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!formData.categoryName) {
      setError('Category name is required');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.categoryName,
          subcategories: subcategories.map(sub => ({
            name: sub.name,
            messages: sub.message ? [{ content: sub.message }] : []
          }))
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create category');
      }

      // Reset form and show success message
      setFormData({
        categoryName: '',
        subcategoryName: '',
        message: ''
      });
      setSubcategories([]);
      setSuccess('Category created successfully!');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Categories Management</h1>
          <p className="mt-2 text-sm text-gray-600">
            Manage your categories, subcategories, and messages
          </p>
          {!isAdmin && (
            <p className="mt-2 text-sm text-yellow-600">
              You can create new categories but cannot edit or delete existing ones.
            </p>
          )}
        </div>

        {/* Error and Success Messages */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-6 bg-green-50 border-l-4 border-green-500 p-4 rounded-r-lg">
            <p className="text-sm text-green-700">{success}</p>
          </div>
        )}

        {/* Categories List */}
        <div className="space-y-4">
          {categories.map((category) => (
            <div key={category._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Category Header */}
              <div
                className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
                onClick={() => toggleCategory(category._id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    {expandedCategories.has(category._id) ? (
                      <ChevronUpIcon className="h-5 w-5 text-gray-500" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-gray-500" />
                    )}
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      category.status === 'Approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {category.status}
                    </span>
                  </div>
                  {isAdmin && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteCategory(category._id);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      <TrashIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Subcategories */}
              {expandedCategories.has(category._id) && (
                <div className="border-t border-gray-100">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory._id} className="p-6 bg-gray-50 border-b border-gray-100 last:border-b-0">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="text-md font-medium text-gray-900">{subcategory.name}</h4>
                        {isAdmin && (
                          <button
                            onClick={() => handleDeleteSubcategory(category._id, subcategory._id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-4 w-4" />
                          </button>
                        )}
                      </div>

                      {/* Messages */}
                      <div className="space-y-3">
                        {subcategory.messages.map((message) => (
                          <div key={message._id} className="bg-white p-4 rounded-lg border border-gray-200">
                            {editingMessage === message._id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={message.content}
                                  onChange={(e) => handleEditMessage(category._id, subcategory._id, message._id, e.target.value)}
                                  className="w-full p-3 rounded-lg border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm resize-none transition-all duration-200"
                                  rows="3"
                                  placeholder="Enter message content..."
                                />
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setEditingMessage(null)}
                                    className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleEditMessage(category._id, subcategory._id, message._id, message.content)}
                                    className="px-3 py-1.5 text-sm text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
                                  >
                                    Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-start justify-between group">
                                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                                {isAdmin && (
                                  <button
                                    onClick={() => setEditingMessage(message._id)}
                                    className="ml-2 text-gray-400 hover:text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                  >
                                    <PencilIcon className="h-4 w-4" />
                                  </button>
                                )}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Create Category Form */}
        {(isAdmin || isMember) && (
          <div className="mt-8 bg-gradient-to-br from-white to-indigo-50 rounded-2xl shadow-lg border border-indigo-100 overflow-hidden">
            <div className="p-8">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <PlusIcon className="h-6 w-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">Create New Category</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Category Name */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                    Category Name
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      id="categoryName"
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                      className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3 pl-10"
                      placeholder="Enter category name"
                      required
                    />
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Subcategories List */}
                {subcategories.length > 0 && (
                  <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-4">Added Subcategories</h3>
                    <div className="space-y-3">
                      {subcategories.map((sub, index) => (
                        <div key={index} className="bg-indigo-50 p-4 rounded-lg border border-indigo-100 group hover:bg-indigo-100 transition-colors duration-200">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="p-1.5 bg-indigo-100 rounded-md">
                                <svg className="h-4 w-4 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                              </div>
                              <span className="font-medium text-gray-900">{sub.name}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setSubcategories(subcategories.filter((_, i) => i !== index));
                              }}
                              className="text-gray-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                            >
                              <XMarkIcon className="h-5 w-5" />
                            </button>
                          </div>
                          {sub.message && (
                            <p className="mt-2 text-sm text-gray-600 pl-8">{sub.message}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Add Subcategory Form */}
                <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      <svg className="h-5 w-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-gray-700">Add Subcategory</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label htmlFor="subcategoryName" className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategory Name
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="subcategoryName"
                          value={formData.subcategoryName}
                          onChange={(e) => setFormData({ ...formData, subcategoryName: e.target.value })}
                          className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3 pl-10"
                          placeholder="Enter subcategory name"
                        />
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                        Message
                      </label>
                      <div className="relative">
                        <textarea
                          id="message"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          className="block w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3 pl-10"
                          placeholder="Enter message content"
                          rows="3"
                        />
                        <div className="absolute top-3 left-0 pl-3 flex items-start pointer-events-none">
                          <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddSubcategory}
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                    >
                      <PlusIcon className="h-4 w-4 mr-2" />
                      Add Subcategory
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-70"
                  >
                    {isLoading ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Creating...
                      </>
                    ) : (
                      <>
                        <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                        </svg>
                        Create Category
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}