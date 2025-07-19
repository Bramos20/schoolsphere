import React, { useState } from 'react';
import { useForm } from '@inertiajs/react';

export default function Create({ school }) {
  const { data, setData, post, processing, errors } = useForm({
    title: '',
    description: '',
    items: [{ item_name: '', quantity: 1, estimated_cost: '' }],
  });

  const addItem = () => {
    setData('items', [...data.items, { item_name: '', quantity: 1, estimated_cost: '' }]);
  };

  const removeItem = index => {
    const updated = [...data.items];
    updated.splice(index, 1);
    setData('items', updated);
  };

  const handleSubmit = e => {
    e.preventDefault();
    post(route('requisitions.store', school.id));
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-4">Create Requisition</h1>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block">Title</label>
          <input
            className="input"
            value={data.title}
            onChange={e => setData('title', e.target.value)}
          />
          {errors.title && <div className="text-red-500">{errors.title}</div>}
        </div>

        <div className="mb-4">
          <label className="block">Description</label>
          <textarea
            className="input"
            value={data.description}
            onChange={e => setData('description', e.target.value)}
          />
          {errors.description && <div className="text-red-500">{errors.description}</div>}
        </div>

        <h2 className="font-semibold mb-2">Items</h2>
        {data.items.map((item, index) => (
          <div key={index} className="flex gap-4 mb-2">
            <input
              className="input"
              placeholder="Item Name"
              value={item.item_name}
              onChange={e => {
                const updated = [...data.items];
                updated[index].item_name = e.target.value;
                setData('items', updated);
              }}
            />
            <input
              className="input"
              type="number"
              placeholder="Quantity"
              value={item.quantity}
              onChange={e => {
                const updated = [...data.items];
                updated[index].quantity = e.target.value;
                setData('items', updated);
              }}
            />
            <input
              className="input"
              type="number"
              placeholder="Estimated Cost"
              value={item.estimated_cost}
              onChange={e => {
                const updated = [...data.items];
                updated[index].estimated_cost = e.target.value;
                setData('items', updated);
              }}
            />
            <button type="button" onClick={() => removeItem(index)} className="text-red-600">X</button>
          </div>
        ))}

        <button type="button" onClick={addItem} className="btn btn-secondary my-2">+ Add Item</button>

        <div>
          <button type="submit" className="btn btn-primary" disabled={processing}>
            Submit Requisition
          </button>
        </div>
      </form>
    </div>
  );
}
