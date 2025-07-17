import React from 'react';
import { useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function EditStudent({ school, student, classes }) {
  const { data, setData, put, processing } = useForm({
    name: student.user.name || '',
    email: student.user.email || '',
    class_id: student.class_id || '',
    stream_id: student.stream_id || '',
  });

  const selectedClass = classes.find((c) => c.id == data.class_id);

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('students.update', [school.id, student.id]));
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Edit Student – {student.user.name}</h1>

      <Card className="max-w-xl">
        <CardHeader>
          <CardTitle>Edit Student Info</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input placeholder="Name" value={data.name} onChange={(e) => setData('name', e.target.value)} />
            <Input placeholder="Email" value={data.email} onChange={(e) => setData('email', e.target.value)} />

            <Select value={data.class_id} onValueChange={(val) => setData('class_id', val)}>
              <SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger>
              <SelectContent>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={String(cls.id)}>{cls.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={data.stream_id} onValueChange={(val) => setData('stream_id', val)} disabled={!data.class_id}>
              <SelectTrigger><SelectValue placeholder="Select Stream" /></SelectTrigger>
              <SelectContent>
                {selectedClass?.streams?.map((stream) => (
                  <SelectItem key={stream.id} value={String(stream.id)}>{stream.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" disabled={processing}>Update Student</Button>
          </form>
        </CardContent>
      </Card>
    </AppLayout>
  );
}