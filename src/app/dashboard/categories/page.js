'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PlusIcon, ArrowLeftIcon, XMarkIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';

export default function CategoriesPage() {
  const router = useRouter();
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

  useEffect(() => {
    loadCategories();
  }, []);

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
      <div className="max-w-4xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1" />
            Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Create Category</h1>
          <p className="mt-2 text-sm text-gray-600">
            Create a new category with subcategories and messages
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

        {/* Create Category Form */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Category Name */}
              <div className="bg-gray-50 p-6 rounded-lg">
                <label htmlFor="categoryName" className="block text-base font-medium text-gray-700 mb-2">
                  Category Name
                </label>
                <div className="mt-1">
                  <input
                    type="text"
                    id="categoryName"
                    value={formData.categoryName}
                    onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                    className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3 transition-colors duration-200"
                    placeholder="Enter category name"
                    required
                  />
                </div>
              </div>

              {/* Subcategories List */}
              {subcategories.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-base font-medium text-gray-700">Added Subcategories</h3>
                  <div className="space-y-3">
                    {subcategories.map((sub, index) => (
                      <div key={index} className="flex items-center justify-between bg-gray-50 p-4 rounded-lg">
                        <div>
                          <p className="text-base font-medium text-gray-900">{sub.name}</p>
                          {sub.message && (
                            <p className="text-base text-gray-500 mt-2">{sub.message}</p>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubcategory(index)}
                          className="text-gray-400 hover:text-red-500 transition-colors duration-200 p-2"
                        >
                          <XMarkIcon className="h-6 w-6" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add Subcategory Form */}
              <div className="bg-gray-50 p-6 rounded-lg space-y-6">
                <h3 className="text-base font-medium text-gray-700">Add Subcategory</h3>
                <div>
                  <label htmlFor="subcategoryName" className="block text-base font-medium text-gray-700 mb-2">
                    Subcategory Name
                  </label>
                  <div className="mt-1">
                    <input
                      type="text"
                      id="subcategoryName"
                      value={formData.subcategoryName}
                      onChange={(e) => setFormData({ ...formData, subcategoryName: e.target.value })}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3 transition-colors duration-200"
                      placeholder="Enter subcategory name"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="message" className="block text-base font-medium text-gray-700 mb-2">
                    Message (Optional)
                  </label>
                  <div className="mt-1">
                    <textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                      rows={4}
                      className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-base px-4 py-3 transition-colors duration-200"
                      placeholder="Enter message content"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleAddSubcategory}
                  className="w-full flex justify-center items-center px-6 py-3 border border-indigo-300 text-base font-medium rounded-lg text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
                >
                  <PlusIcon className="h-6 w-6 mr-2" />
                  Add Subcategory
                </button>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full flex justify-center items-center px-6 py-4 border border-transparent text-base font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <div className="flex items-center">
                      <div className="w-6 h-6 border-t-2 border-white rounded-full animate-spin mr-3"></div>
                      Creating...
                    </div>
                  ) : (
                    <>
                      <PlusIcon className="h-6 w-6 mr-2" />
                      Create Category
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}