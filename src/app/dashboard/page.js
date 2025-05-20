'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, ClipboardDocumentIcon, CheckIcon, PencilIcon, TrashIcon, ArrowUpTrayIcon, BellIcon } from '@heroicons/react/24/outline';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubCategory, setSelectedSubCategory] = useState(null);
  const [subCategories, setSubCategories] = useState([]);
  const [messages, setMessages] = useState([]);
  const [copiedMessageId, setCopiedMessageId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingMessage, setEditingMessage] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);

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
  }, []);

  useEffect(() => {
    if (user?.role === 'admin') {
      loadPendingCount();
    }
  }, [user]);

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

  const loadPendingCount = async () => {
    try {
      const response = await fetch('/api/categories/review/count');
      const data = await response.json();
      setPendingCount(data.count);
    } catch (error) {
      console.error('Error loading pending count:', error);
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

  const handleImportExcel = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsImporting(true);
    setError('');
    setSuccess('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/categories/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to import categories');
      }

      setSuccess('Categories imported successfully');
      await loadCategories();
    } catch (error) {
      setError(error.message);
    } finally {
      setIsImporting(false);
      event.target.value = ''; // Reset file input
    }
  };

  const handleDeleteAllCategories = async () => {
    if (!window.confirm('Are you sure you want to delete all categories? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/categories', {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete categories');
      }

      setSuccess('All categories deleted successfully');
      setCategories([]);
      setSelectedCategory(null);
      setSelectedSubCategory(null);
      setSubCategories([]);
      setMessages([]);
    } catch (error) {
      setError(error.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredSubCategories = subCategories.filter(subCategory =>
    String(subCategory).toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-14">
            <div className="flex items-center">
              <h1 className="text-lg font-semibold text-gray-900">Dashboard</h1>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center">
                <span className="mr-2 text-sm text-gray-600">Welcome, {user.name}</span>
                <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                  user.role === 'admin'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-blue-100 text-blue-800'
                }`}>
                  {user.role}
                </span>
              </div>
              {user.role === 'admin' && pendingCount > 0 && (
                <button
                  onClick={() => router.push('/dashboard/review')}
                  className="relative inline-flex items-center p-2 text-gray-600 hover:text-gray-900"
                >
                  <BellIcon className="h-6 w-6" />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {pendingCount}
                  </span>
                </button>
              )}
              <div className="flex items-center space-x-2">
                {user.role === 'admin' && (
                  <>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".xlsb,.xlsx"
                        onChange={handleImportExcel}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isImporting}
                      />
                      <button
                        className={`flex items-center space-x-1 bg-indigo-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors duration-200 ${
                          isImporting ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                        disabled={isImporting}
                      >
                        <ArrowUpTrayIcon className="h-4 w-4" />
                        <span>{isImporting ? 'Importing...' : 'Import Excel'}</span>
                      </button>
                    </div>
                    <button
                      onClick={handleDeleteAllCategories}
                      disabled={isDeleting}
                      className={`flex items-center space-x-1 bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200 cursor-pointer ${
                        isDeleting ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <TrashIcon className="h-4 w-4" />
                      <span>{isDeleting ? 'Deleting...' : 'Delete All'}</span>
                    </button>
                  </>
                )}
              </div>
              <button
                onClick={() => router.push('/dashboard/categories')}
                className="bg-teal-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-teal-700 transition-colors duration-200 cursor-pointer"
              >
                Create Category
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-3 py-1.5 rounded-md text-sm font-medium hover:bg-red-700 transition-colors duration-200 cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-14 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Error and Success Messages */}
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 rounded-r-lg">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 bg-green-50 border-l-4 border-green-500 p-3 rounded-r-lg">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          <div className="h-full bg-white rounded-lg shadow-sm border border-gray-100">
            <div className="h-full p-4 overflow-y-auto">
              <div className="mb-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    className="block w-full pl-9 pr-3 py-1.5 border border-gray-200 rounded-md leading-5 bg-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                    placeholder="Search subcategories..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center items-center h-48">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Categories List */}
                  <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                    <h2 className="text-sm font-semibold text-gray-700 mb-3">Categories</h2>
                    <div className="space-y-1.5">
                      {categories.length === 0 ? (
                        <p className="text-gray-400 text-xs">No approved categories found</p>
                      ) : (
                        categories.map((category) => (
                          <div
                            key={category._id}
                            className="bg-white rounded-md p-2 shadow-sm hover:shadow transition-shadow duration-200"
                          >
                            <button
                              onClick={() => handleCategoryClick(category.name)}
                              className={`w-full text-left text-sm ${
                                selectedCategory === category.name
                                  ? 'text-indigo-700 font-medium'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              {category.name}
                            </button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>

                  {/* SubCategories List */}
                  {selectedCategory && (
                    <div className="border border-gray-100 rounded-lg p-3 bg-gray-50">
                      <h2 className="text-sm font-semibold text-gray-700 mb-3">SubCategories</h2>
                      {filteredSubCategories.length === 0 ? (
                        <p className="text-gray-400 text-xs">No subcategories found</p>
                      ) : (
                        <div className="space-y-1.5">
                          {filteredSubCategories.map((subCategory, index) => (
                            <div
                              key={index}
                              className="bg-white rounded-md p-2 shadow-sm hover:shadow transition-shadow duration-200"
                            >
                              <button
                                onClick={() => handleSubCategoryClick(subCategory)}
                                className={`w-full text-left text-sm ${
                                  selectedSubCategory === subCategory
                                    ? 'text-indigo-700 font-medium'
                                    : 'text-gray-600 hover:text-gray-900'
                                }`}
                              >
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
                    <div className="border border-gray-100 rounded-lg p-3">
                      <h2 className="text-sm font-semibold text-gray-700 mb-3">Messages</h2>
                      <div className="space-y-2">
                        {messages.map((message, index) => (
                          <div
                            key={index}
                            className="bg-gray-50 rounded-md p-3 relative group hover:bg-gray-100 transition-colors duration-200"
                          >
                            {editingMessage === index ? (
                              <div className="flex flex-col space-y-3">
                                <textarea
                                  defaultValue={message}
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
                                    onClick={() => {
                                      const newContent = document.querySelector(`textarea[defaultValue="${message}"]`).value;
                                      handleEditMessage(
                                        categories.find(cat => cat.name === selectedCategory)?._id,
                                        categories
                                          .find(cat => cat.name === selectedCategory)
                                          ?.subcategories.find(sub => sub.name === selectedSubCategory)?._id,
                                        categories
                                          .find(cat => cat.name === selectedCategory)
                                          ?.subcategories.find(sub => sub.name === selectedSubCategory)
                                          ?.messages.find(msg => msg.content === message)?._id,
                                        newContent
                                      );
                                    }}
                                    className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors duration-200"
                                  >
                                    Save Changes
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-gray-600 pr-12 whitespace-pre-wrap">{message}</p>
                                <div className="absolute top-2 right-2 flex space-x-1">
                                  {user.role === 'admin' && (
                                    <>
                                      <button
                                        onClick={() => setEditingMessage(index)}
                                        className="p-1.5 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                        title="Edit message"
                                      >
                                        <PencilIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteMessage(category._id, subcategory._id, message._id)}
                                        className="p-1.5 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                        title="Delete message"
                                      >
                                        <TrashIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                                      </button>
                                    </>
                                  )}
                                  <button
                                    onClick={() => handleCopyMessage(message, index)}
                                    className="p-1.5 rounded-md bg-white shadow-sm hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                                    title="Copy message"
                                  >
                                    {copiedMessageId === index ? (
                                      <CheckIcon className="h-4 w-4 text-green-500" />
                                    ) : (
                                      <ClipboardDocumentIcon className="h-4 w-4 text-gray-500 group-hover:text-gray-700" />
                                    )}
                                  </button>
                                </div>
                              </>
                            )}
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