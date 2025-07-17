import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';

export default function Create({ auth, school }) {
  const { data, setData, post, processing, errors } = useForm({
    name: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('book-categories.store', school.id));
  };

  return (
    <>
      <Head title="Add Book Category" />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>Add Book Category</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div>
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={data.name}
                  onChange={(e) => setData('name', e.target.value)}
                />
                <InputError message={errors.name} className="mt-2" />
              </div>
              <Button type="submit" disabled={processing} className="mt-4">
                Add Book Category
              </Button>
            </form>
          </CardContent>
        </Card>
      </AppLayout>
    </>
  );
}
