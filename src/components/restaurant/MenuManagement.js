import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { 
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Save,
  X,
  DollarSign,
  Clock,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle,
  Image as ImageIcon
} from 'lucide-react';
import { restaurantAdminAPI } from '../../services/api';
import { toast } from 'react-hot-toast';

const MenuManagement = ({ restaurantId }) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [showAddItem, setShowAddItem] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [newCategory, setNewCategory] = useState('');

  // Fetch menu data
  const { data: menuData, isLoading } = useQuery(
    ['restaurant-menu', restaurantId],
    () => restaurantAdminAPI.getMenu(restaurantId),
    { enabled: !!restaurantId }
  );

  // Toggle menu mutation
  const toggleMenuMutation = useMutation(
    () => restaurantAdminAPI.toggleMenu(restaurantId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['restaurant-menu', restaurantId]);
        toast.success('Menu status updated successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to update menu status');
      }
    }
  );

  // Add category mutation
  const addCategoryMutation = useMutation(
    (categoryData) => restaurantAdminAPI.addCategory(restaurantId, categoryData),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['restaurant-menu', restaurantId]);
        toast.success('Category added successfully');
        setShowAddCategory(false);
        setNewCategory('');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to add category');
      }
    }
  );

  // Delete category mutation
  const deleteCategoryMutation = useMutation(
    (categoryName) => restaurantAdminAPI.deleteCategory(restaurantId, categoryName),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['restaurant-menu', restaurantId]);
        toast.success('Category deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete category');
      }
    }
  );

  // Add/Update item mutation
  const saveItemMutation = useMutation(
    ({ itemId, itemData }) => {
      if (itemId) {
        return restaurantAdminAPI.updateMenuItem(restaurantId, itemId, itemData);
      } else {
        return restaurantAdminAPI.addMenuItem(restaurantId, itemData);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['restaurant-menu', restaurantId]);
        toast.success(editingItem ? 'Item updated successfully' : 'Item added successfully');
        setShowAddItem(false);
        setEditingItem(null);
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to save item');
      }
    }
  );

  // Delete item mutation
  const deleteItemMutation = useMutation(
    (itemId) => restaurantAdminAPI.deleteMenuItem(restaurantId, itemId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['restaurant-menu', restaurantId]);
        toast.success('Item deleted successfully');
      },
      onError: (error) => {
        toast.error(error.response?.data?.message || 'Failed to delete item');
      }
    }
  );

  const { menu = [], isActive = false, totalItems = 0, categories = [] } = menuData || {};

  // Filter menu items
  const filteredItems = menu.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleAddCategory = () => {
    if (!newCategory.trim()) return;
    addCategoryMutation.mutate({ name: newCategory.trim() });
  };

  const handleDeleteCategory = (categoryName) => {
    if (window.confirm(`Are you sure you want to delete the "${categoryName}" category? This will also delete all items in this category.`)) {
      deleteCategoryMutation.mutate(categoryName);
    }
  };

  const ItemForm = ({ item = null, onClose }) => {
    const [formData, setFormData] = useState({
      name: item?.name || '',
      description: item?.description || '',
      price: item?.price || '',
      category: item?.category || categories[0] || '',
      isAvailable: item?.isAvailable !== false,
      preparationTime: item?.preparationTime || '',
      ingredients: item?.ingredients?.join(', ') || '',
      allergens: item?.allergens?.join(', ') || '',
      image: null
    });

    const handleSubmit = (e) => {
      e.preventDefault();
      
      const itemData = new FormData();
      itemData.append('name', formData.name);
      itemData.append('description', formData.description);
      itemData.append('price', parseFloat(formData.price));
      itemData.append('category', formData.category);
      itemData.append('isAvailable', formData.isAvailable);
      
      if (formData.preparationTime) {
        itemData.append('preparationTime', parseInt(formData.preparationTime));
      }
      
      if (formData.ingredients) {
        itemData.append('ingredients', JSON.stringify(formData.ingredients.split(',').map(i => i.trim())));
      }
      
      if (formData.allergens) {
        itemData.append('allergens', JSON.stringify(formData.allergens.split(',').map(a => a.trim())));
      }
      
      if (formData.image) {
        itemData.append('image', formData.image);
      }

      saveItemMutation.mutate({ 
        itemId: item?._id, 
        itemData 
      });
    };

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-gray-900">
                {item ? 'Edit Menu Item' : 'Add New Menu Item'}
              </h3>
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Item Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter item name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      required
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Preparation Time (minutes)
                  </label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                    <input
                      type="number"
                      min="1"
                      value={formData.preparationTime}
                      onChange={(e) => setFormData({ ...formData, preparationTime: e.target.value })}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="15"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="Describe this menu item..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ingredients (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.ingredients}
                  onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="tomato, cheese, basil"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Allergens (comma-separated)
                </label>
                <input
                  type="text"
                  value={formData.allergens}
                  onChange={(e) => setFormData({ ...formData, allergens: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  placeholder="dairy, nuts, gluten"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Item Image
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setFormData({ ...formData, image: e.target.files[0] })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onChange={(e) => setFormData({ ...formData, isAvailable: e.target.checked })}
                  className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                />
                <label htmlFor="isAvailable" className="text-sm font-medium text-gray-700">
                  Item is available
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saveItemMutation.isLoading}
                  className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                >
                  {saveItemMutation.isLoading ? 'Saving...' : (item ? 'Update Item' : 'Add Item')}
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </motion.div>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Menu Management</h2>
          <p className="text-gray-600 mt-1">
            Manage your restaurant menu items and categories
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Menu Status:</span>
            <button
              onClick={() => toggleMenuMutation.mutate()}
              disabled={toggleMenuMutation.isLoading}
              className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm font-medium ${
                isActive 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {isActive ? <Eye size={16} /> : <EyeOff size={16} />}
              <span>{isActive ? 'Active' : 'Inactive'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-gray-900">{totalItems}</div>
            <div className="ml-2 text-sm text-gray-600">Total Items</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-gray-900">{categories.length}</div>
            <div className="ml-2 text-sm text-gray-600">Categories</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-gray-900">
              {menu.filter(item => item.isAvailable).length}
            </div>
            <div className="ml-2 text-sm text-gray-600">Available</div>
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center">
            <div className="text-2xl font-semibold text-gray-900">
              {menu.filter(item => !item.isAvailable).length}
            </div>
            <div className="ml-2 text-sm text-gray-600">Unavailable</div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search menu items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
            </div>

            {/* Category Filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            >
              <option value="all">All Categories</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddCategory(true)}
              className="px-4 py-2 text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50"
            >
              Add Category
            </button>
            <button
              onClick={() => setShowAddItem(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center space-x-2"
            >
              <Plus size={16} />
              <span>Add Item</span>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        {filteredItems.length === 0 ? (
          <div className="p-12 text-center">
            <div className="text-gray-400 mb-4">
              <AlertCircle size={48} className="mx-auto" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No menu items found</h3>
            <p className="text-gray-600 mb-4">
              {searchTerm || selectedCategory !== 'all' 
                ? 'Try adjusting your search or filter criteria'
                : 'Get started by adding your first menu item'
              }
            </p>
            {!searchTerm && selectedCategory === 'all' && (
              <button
                onClick={() => setShowAddItem(true)}
                className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
              >
                Add Your First Item
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredItems.map((item, index) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">{item.name}</h4>
                      <span className="text-sm px-2 py-1 bg-gray-100 text-gray-600 rounded">
                        {item.category}
                      </span>
                      {!item.isAvailable && (
                        <span className="text-sm px-2 py-1 bg-red-100 text-red-600 rounded">
                          Unavailable
                        </span>
                      )}
                    </div>
                    {item.description && (
                      <p className="text-gray-600 mt-1">{item.description}</p>
                    )}
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span className="flex items-center space-x-1">
                        <DollarSign size={16} />
                        <span>${item.price}</span>
                      </span>
                      {item.preparationTime && (
                        <span className="flex items-center space-x-1">
                          <Clock size={16} />
                          <span>{item.preparationTime}min</span>
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        setEditingItem(item);
                        setShowAddItem(true);
                      }}
                      className="p-2 text-gray-400 hover:text-blue-600 rounded"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${item.name}"?`)) {
                          deleteItemMutation.mutate(item._id);
                        }
                      }}
                      className="p-2 text-gray-400 hover:text-red-600 rounded"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Add Category Modal */}
      <AnimatePresence>
        {showAddCategory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Add New Category</h3>
                <button
                  onClick={() => setShowAddCategory(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Category name"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                />

                <div className="flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setShowAddCategory(false)}
                    className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleAddCategory}
                    disabled={!newCategory.trim() || addCategoryMutation.isLoading}
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 disabled:opacity-50"
                  >
                    {addCategoryMutation.isLoading ? 'Adding...' : 'Add Category'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Item Form Modal */}
      <AnimatePresence>
        {showAddItem && (
          <ItemForm
            item={editingItem}
            onClose={() => {
              setShowAddItem(false);
              setEditingItem(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MenuManagement; 