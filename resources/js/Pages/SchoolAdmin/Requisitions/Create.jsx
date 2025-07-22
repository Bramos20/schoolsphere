import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Trash2, Plus, DollarSign, Package, AlertTriangle } from 'lucide-react';

export default function Create({ school, departments = [] }) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    priority: 'medium',
    department_id: '',
    items: [{ item_name: '', quantity: 1, estimated_cost: '', description: '', category: '' }],
  });

  const [totalCost, setTotalCost] = useState(0);

  const calculateTotalCost = (items) => {
    return items.reduce((total, item) => {
      const cost = parseFloat(item.estimated_cost) || 0;
      const quantity = parseInt(item.quantity) || 0;
      return total + (cost * quantity);
    }, 0);
  };

  const addItem = () => {
    const newItems = [...data.items, { item_name: '', quantity: 1, estimated_cost: '', description: '', category: '' }];
    setData('items', newItems);
  };

  const removeItem = (index) => {
    if (data.items.length > 1) {
      const newItems = data.items.filter((_, i) => i !== index);
      setData('items', newItems);
      setTotalCost(calculateTotalCost(newItems));
    }
  };

  const updateItem = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData('items', newItems);
    
    if (field === 'estimated_cost' || field === 'quantity') {
      setTotalCost(calculateTotalCost(newItems));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('requisitions.store', school.id));
  };

  const priorityOptions = [
    { value: 'low', label: 'Low', color: 'text-gray-600' },
    { value: 'medium', label: 'Medium', color: 'text-blue-600' },
    { value: 'high', label: 'High', color: 'text-orange-600' },
    { value: 'urgent', label: 'Urgent', color: 'text-red-600' },
  ];

  const categoryOptions = [
    'Office Supplies',
    'Teaching Materials',
    'Technology',
    'Furniture',
    'Maintenance',
    'Books & Resources',
    'Laboratory Equipment',
    'Sports Equipment',
    'Other'
  ];

  return (
    <AppLayout>
      <Head title="Create Requisition" />
      
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Create New Requisition
            </CardTitle>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Title *
                  </label>
                  <input
                    type="text"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                    placeholder="Enter requisition title"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Department *
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={data.department_id}
                    onChange={(e) => setData('department_id', e.target.value)}
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                  {errors.department_id && (
                    <p className="mt-1 text-sm text-red-600">{errors.department_id}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={data.priority}
                    onChange={(e) => setData('priority', e.target.value)}
                  >
                    {priorityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={3}
                    value={data.description}
                    onChange={(e) => setData('description', e.target.value)}
                    placeholder="Provide additional details about this requisition"
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>
              </div>

              {/* Items Section */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Requisition Items</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <DollarSign className="h-4 w-4" />
                    Total Estimated Cost: <span className="font-semibold">${totalCost.toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  {data.items.map((item, index) => (
                    <div key={index} className="p-4 border border-gray-200 rounded-lg bg-gray-50">
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <div className="lg:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Item Name *
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.item_name}
                            onChange={(e) => updateItem(index, 'item_name', e.target.value)}
                            placeholder="Enter item name"
                          />
                          {errors[`items.${index}.item_name`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`items.${index}.item_name`]}</p>
                          )}
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Category
                          </label>
                          <select
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.category}
                            onChange={(e) => updateItem(index, 'category', e.target.value)}
                          >
                            <option value="">Select Category</option>
                            {categoryOptions.map((category) => (
                              <option key={category} value={category}>
                                {category}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Quantity *
                          </label>
                          <input
                            type="number"
                            min="1"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={item.quantity}
                            onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                          />
                          {errors[`items.${index}.quantity`] && (
                            <p className="mt-1 text-sm text-red-600">{errors[`items.${index}.quantity`]}</p>
                          )}
                        </div>

                        <div className="flex items-end">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Est. Cost ($)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                              value={item.estimated_cost}
                              onChange={(e) => updateItem(index, 'estimated_cost', e.target.value)}
                            />
                          </div>
                          {data.items.length > 1 && (
                            <Button
                              type="button"
                              variant="destructive"
                              size="sm"
                              className="ml-2 mb-0"
                              onClick={() => removeItem(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Item Description
                        </label>
                        <textarea
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          rows={2}
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          placeholder="Additional details about this item"
                        />
                      </div>
                    </div>
                  ))}

                  <Button
                    type="button"
                    variant="outline"
                    onClick={addItem}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Another Item
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t">
                <Button
                  type="submit"
                  disabled={processing}
                  className="flex-1 md:flex-none"
                >
                  {processing ? 'Submitting...' : 'Submit Requisition'}
                </Button>
                
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => window.history.back()}
                  disabled={processing}
                >
                  Cancel
                </Button>
              </div>

              {/* Info Alert */}
              <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                <div className="flex">
                  <AlertTriangle className="h-5 w-5 text-blue-400 mt-0.5" />
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Approval Process</h3>
                    <div className="mt-2 text-sm text-blue-700">
                      <p>Your requisition will go through the following approval stages:</p>
                      <ol className="mt-2 list-decimal list-inside space-y-1">
                        <li>Accountant review and approval</li>
                        <li>School Admin final approval</li>
                        <li>Ready for procurement</li>
                      </ol>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}