'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeftIcon, CheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

export default function ApprovalsPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [pendingCategories, setPendingCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const checkAuth = useCallback(async () => {
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
  }, [router]);

  useEffect(() => {
    checkAuth();
    loadPendingCategories();
  }, [checkAuth]);

  const loadPendingCategories = async () => {
    try {
      const response = await fetch('/api/categories?status=Pending');
      const data = await response.json();
      if (data.categories) {
        setPendingCategories(data.categories);
      }
    } catch (error) {
      setError('Failed to load pending categories');
      console.error('Error loading pending categories:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (categoryId, status) => {
    try {
      const response = await fetch('/api/categories/approve', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ categoryId, status }),
      });

      if (!response.ok) {
        throw new Error('Failed to update category status');
      }

      setSuccess(`Category ${status.toLowerCase()} successfully`);
      await loadPendingCategories();
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
          <h1 className="text-2xl font-bold text-gray-900">Pending Categories</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and approve or disapprove new categories
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

        {/* Pending Categories List */}
        <div className="space-y-4">
          {pendingCategories.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No pending categories to review</p>
            </div>
          ) : (
            pendingCategories.map((category) => (
              <div key={category._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Created by: {category.createdBy?.name || 'Unknown'}
                    </p>
                    <div className="mt-2">
                      <h4 className="text-sm font-medium text-gray-700">Subcategories:</h4>
                      <ul className="mt-1 space-y-1">
                        {category.subcategories.map((sub) => (
                          <li key={sub._id} className="text-sm text-gray-600">
                            {sub.name} ({sub.messages.length} messages)
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleStatusUpdate(category._id, 'Approved')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleStatusUpdate(category._id, 'Disapproved')}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
                    >
                      <XMarkIcon className="h-4 w-4 mr-1" />
                      Disapprove
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}