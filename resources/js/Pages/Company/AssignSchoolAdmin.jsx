import React from 'react';
import AppLayout from '@/Layouts/AppLayout'; // ✅ Import AppLayout
import { router, useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function AssignSchoolAdmin({ school }) {
  const { toast } = useToast();

  const { data, setData, post, processing, reset, errors } = useForm({
    name: '',
    email: '',
    password: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    post(route('schools.assignAdmin', school.id), {
      onSuccess: () => {
        toast({ title: 'Success', description: 'School admin assigned successfully.' });
        reset();
      },
      onError: () => {
        toast({ title: 'Error', description: 'Failed to assign school admin.' });
      },
    });
  };

  return (
    <AppLayout>
      <Card className="max-w-xl mx-auto mt-8">
        <CardHeader>
          <CardTitle>Assign School Admin for {school.name}</CardTitle>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={data.name}
                onChange={(e) => setData('name', e.target.value)}
              />
              {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={data.email}
                onChange={(e) => setData('email', e.target.value)}
              />
              {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={data.password}
                onChange={(e) => setData('password', e.target.value)}
              />
              {errors.password && <p className="text-red-500 text-sm">{errors.password}</p>}
            </div>

            <Button type="submit" disabled={processing}>
              {processing ? 'Assigning...' : 'Assign School Admin'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
