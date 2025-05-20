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
    checkAuth();
    loadCategories();
  }, []);

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
          })),
          status: user.role === 'admin' ? 'Approved' : 'Disapproved',
          createdBy: user._id
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
      setSuccess(user.role === 'admin'
        ? 'Category created successfully!'
        : 'Category created and pending approval!');
    } catch (error) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Loading...</h1>
        </div>
      </div>
    );
  }

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
                  {user.role === 'admin' && (
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
                        {user.role === 'admin' && (
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
                              <textarea
                                value={message.content}
                                onChange={(e) => handleEditMessage(category._id, subcategory._id, message._id, e.target.value)}
                                className="w-full p-2 border rounded"
                                rows="3"
                              />
                            ) : (
                              <div className="flex items-start justify-between">
                                <p className="text-gray-700 whitespace-pre-wrap">{message.content}</p>
                                {user.role === 'admin' && (
                                  <button
                                    onClick={() => setEditingMessage(message._id)}
                                    className="ml-2 text-gray-600 hover:text-gray-900"
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
        <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New Category</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div>
                <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <input
                  type="text"
                  id="categoryName"
                  value={formData.categoryName}
                  onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                  className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3"
                  placeholder="Enter category name"
                  required
                />
              </div>

              {/* Subcategories List */}
              {subcategories.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-gray-700">Added Subcategories</h3>
                  {subcategories.map((sub, index) => (
                    <div key={index} className="bg-gray-50 p-4 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{sub.name}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setSubcategories(subcategories.filter((_, i) => i !== index));
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          <XMarkIcon className="h-5 w-5" />
                        </button>
                      </div>
                      {sub.message && (
                        <p className="mt-2 text-sm text-gray-600">{sub.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Add Subcategory Form */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-4">Add Subcategory</h3>
                <div className="space-y-4">
                  <div>
                    <label htmlFor="subcategoryName" className="block text-sm font-medium text-gray-700 mb-2">
                      Subcategory Name
                    </label>
                    <input
                      type="text"
                      id="subcategoryName"
                      value={formData.subcategoryName}
                      onChange={(e) => setFormData({ ...formData, subcategoryName: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3"
                      placeholder="Enter subcategory name"
                    />
                  </div>
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3"
                      placeholder="Enter message content"
                      rows="3"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleAddSubcategory}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
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
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  {isLoading ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}