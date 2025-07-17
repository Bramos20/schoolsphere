import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function CompanyAdmins({ company, admins }) {
  const { data, setData, post, reset, processing } = useForm({
    name: '',
    email: '',
    password: '',
  });

  const submit = (e) => {
    e.preventDefault();
    post(route('company.admins.store', company.id), {
      onSuccess: () => reset(),
    });
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Admins for {company.name}</h1>

      <Card className="mb-6 max-w-md">
        <CardHeader>
          <CardTitle>Add New Admin</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input placeholder="Name" value={data.name} onChange={e => setData('name', e.target.value)} />
            <Input placeholder="Email" value={data.email} onChange={e => setData('email', e.target.value)} />
            <Input placeholder="Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} />
            <Button type="submit" disabled={processing}>Create Admin</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {admins.map((admin) => (
          <Card key={admin.id}>
            <CardHeader>
              <CardTitle>{admin.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{admin.email}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}