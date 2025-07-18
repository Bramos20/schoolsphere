import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';

export default function Create({ auth, school }) {
  const { data, setData, post, processing, errors } = useForm({
    items: [{ name: '', quantity: '', price: '' }],
  });

  const handleItemChange = (index, field, value) => {
    const newItems = [...data.items];
    newItems[index][field] = value;
    setData('items', newItems);
  };

  const handleAddItem = () => {
    setData('items', [...data.items, { name: '', quantity: '', price: '' }]);
  };

  const handleRemoveItem = (index) => {
    const newItems = [...data.items];
    newItems.splice(index, 1);
    setData('items', newItems);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('requisitions.store', school.id));
  };

  return (
    <>
      <Head title="Add Requisition" />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>Add Requisition</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              {data.items.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <Label htmlFor={`name_${index}`}>Name</Label>
                    <Input
                      id={`name_${index}`}
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    />
                    <InputError message={errors[`items.${index}.name`]} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor={`quantity_${index}`}>Quantity</Label>
                    <Input
                      id={`quantity_${index}`}
                      type="number"
                      value={item.quantity}
                      onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                    />
                    <InputError message={errors[`items.${index}.quantity`]} className="mt-2" />
                  </div>
                  <div>
                    <Label htmlFor={`price_${index}`}>Price</Label>
                    <Input
                      id={`price_${index}`}
                      type="number"
                      value={item.price}
                      onChange={(e) => handleItemChange(index, 'price', e.target.value)}
                    />
                    <InputError message={errors[`items.${index}.price`]} className="mt-2" />
                  </div>
                  <div>
                    <Button type="button" variant="destructive" onClick={() => handleRemoveItem(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button type="button" onClick={handleAddItem} className="mt-4">
                Add Item
              </Button>
              <Button type="submit" disabled={processing} className="mt-4 ml-4">
                Create Requisition
              </Button>
            </form>
          </CardContent>
        </Card>
      </AppLayout>
    </>
  );
}