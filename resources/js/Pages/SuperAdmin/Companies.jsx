import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function Companies({ companies }) {
  const { data, setData, post, reset, processing } = useForm({ name: '' });

  const submit = (e) => {
    e.preventDefault();
    post(route('companies.store'), { onSuccess: () => reset() });
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Manage Companies</h1>

      <Card className="mb-6 max-w-md">
        <CardHeader>
          <CardTitle>Add New Company</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input
              placeholder="Company Name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
            <Button type="submit" disabled={processing}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {companies.map((company) => (
          <Card key={company.id}>
            <CardHeader>
              <CardTitle>{company.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-500">{company.schools_count} Schools</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}