import React from 'react';
import { Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Input } from '@/components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

export default function StudentList({ school, students, search }) {
  const { data, setData, get } = useForm({ search });

  const handleSearch = (e) => {
    e.preventDefault();
    get(route('students.index', school.id), { preserveState: true });
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Students – {school.name}</h1>

      <form onSubmit={handleSearch} className="mb-6 max-w-md">
        <Input
          placeholder="Search by name or email"
          value={data.search}
          onChange={(e) => setData('search', e.target.value)}
        />
      </form>

      <div className="grid gap-4 md:grid-cols-2">
        {students.map((student) => (
          <Card key={student.id}>
            <CardHeader>
              <CardTitle>{student.user.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Email: {student.user.email}</p>
              <p>Class: {student.class?.name}</p>
              <p>Stream: {student.stream?.name}</p>
              <Link
                href={route('students.edit', [school.id, student.id])}
                className="text-sm text-blue-600 hover:underline mt-2 inline-block"
              >
                Edit
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}