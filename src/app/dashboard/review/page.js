'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, XMarkIcon, PencilIcon } from '@heroicons/react/24/outline';

export default function ReviewPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);

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

      if (data.user.role !== 'admin') {
        router.push('/dashboard');
      }
    } catch (error) {
      router.push('/auth/login');
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories/review');
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

  const handleApprove = async (categoryId) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/approve`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to approve category');
      }

      setSuccess('Category approved successfully');
      await loadCategories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleReject = async (categoryId) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/reject`, {
        method: 'PUT',
      });

      if (!response.ok) {
        throw new Error('Failed to reject category');
      }

      setSuccess('Category rejected successfully');
      await loadCategories();
    } catch (error) {
      setError(error.message);
    }
  };

  const handleEditMessage = async (categoryId, subcategoryId, messageId, content) => {
    try {
      const response = await fetch(`/api/categories/${categoryId}/subcategories/${subcategoryId}/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content }),
      });

      if (!response.ok) {
        throw new Error('Failed to edit message');
      }

      setSuccess('Message edited successfully');
      await loadCategories();
    } catch (error) {
      setError(error.message);
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
          >
            Return to Dashboard
          </button>
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
          <h1 className="text-2xl font-bold text-gray-900">Review Categories</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and approve or reject pending categories
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
          {categories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No categories pending review</p>
            </div>
          ) : (
            categories.map((category) => (
              <div key={category._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created by: {category.createdBy?.name || 'Unknown'}
                    </p>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleApprove(category._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(category._id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Reject
                    </button>
                  </div>
                </div>

                {/* Subcategories */}
                <div className="mt-4 space-y-3">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory._id} className="bg-gray-50 rounded-lg p-4">
                      <h4 className="text-md font-medium text-gray-900">{subcategory.name}</h4>
                      {/* Messages */}
                      <div className="space-y-3">
                        {subcategory.messages.map((message) => (
                          <div key={message._id} className="bg-white p-4 rounded-lg border border-gray-200">
                            {editingMessage === message._id ? (
                              <div className="flex flex-col space-y-3">
                                <textarea
                                  value={message.content}
                                  onChange={(e) => handleEditMessage(category._id, subcategory._id, message._id, e.target.value)}
                                  className="w-full rounded-lg border-gray-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm px-4 py-3 bg-white resize-none transition-all duration-200"
                                  rows={3}
                                  placeholder="Enter your message..."
                                />
                                <div className="flex justify-end space-x-2">
                                  <button
                                    onClick={() => setEditingMessage(null)}
                                    className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => setEditingMessage(null)}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
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
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}