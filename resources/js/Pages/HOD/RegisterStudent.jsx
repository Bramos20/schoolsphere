import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Input } from '@/components/ui/input';
import { Select, SelectItem, SelectTrigger, SelectContent, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function RegisterStudent({ school, classes }) {
  const { data, setData, post, processing, reset } = useForm({
    name: '',
    email: '',
    password: '',
    class_id: '',
    stream_id: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('students.store', school.id), {
      onSuccess: () => reset()
    });
  };

  const selectedClass = classes.find(c => c.id == data.class_id);

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Register Student – {school.name}</h1>

      <Card className="max-w-xl mb-6">
        <CardHeader>
          <CardTitle>Student Registration</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Name" value={data.name} onChange={e => setData('name', e.target.value)} />
            <Input placeholder="Email" type="email" value={data.email} onChange={e => setData('email', e.target.value)} />
            <Input placeholder="Password" type="password" value={data.password} onChange={e => setData('password', e.target.value)} />

            <Select value={data.class_id} onValueChange={val => setData('class_id', val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(cls => (
                  <SelectItem key={cls.id} value={String(cls.id)}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={data.stream_id} onValueChange={val => setData('stream_id', val)} disabled={!data.class_id}>
              <SelectTrigger>
                <SelectValue placeholder="Select Stream" />
              </SelectTrigger>
              <SelectContent>
                {selectedClass?.streams?.map(stream => (
                  <SelectItem key={stream.id} value={String(stream.id)}>{stream.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" disabled={processing}>Register</Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}