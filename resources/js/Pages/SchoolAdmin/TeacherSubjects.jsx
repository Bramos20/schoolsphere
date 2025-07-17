import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function TeacherSubjects({ school, teachers, subjects }) {
  const { data, setData, post, delete: destroy, processing, reset } = useForm({
    teacher_id: '',
    subject_id: '',
  });

  const handleAssign = (e) => {
    e.preventDefault();
    post(route('teacher-subjects.assign', school.id), {
      preserveScroll: true,
      onSuccess: () => reset(),
    });
  };

  const handleUnassign = (subjectId, teacherId) => {
    if (confirm('Unassign this teacher from the subject?')) {
      destroy(route('teacher-subjects.unassign', school.id), {
        data: { subject_id: subjectId, teacher_id: teacherId },
        preserveScroll: true,
      });
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Teacher-Subject Assignment – {school.name}</h1>

      <Card className="max-w-xl mb-8">
        <CardHeader>
          <CardTitle>Assign Subject to Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssign} className="space-y-4">
            <Select value={data.teacher_id} onValueChange={(val) => setData('teacher_id', val)}>
              <SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={String(teacher.id)}>{teacher.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={data.subject_id} onValueChange={(val) => setData('subject_id', val)}>
              <SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={String(subject.id)}>{subject.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit" disabled={processing}>Assign Subject</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Current Assignments</h2>
      <div className="space-y-4">
        {subjects.map((subject) => (
          <Card key={subject.id}>
            <CardHeader>
              <CardTitle>{subject.name}</CardTitle>
            </CardHeader>
            <CardContent>
              {subject.teachers.length === 0 ? (
                <p className="text-gray-500">No teachers assigned</p>
              ) : (
                <ul className="list-disc ml-5">
                  {subject.teachers.map((teacher) => (
                    <li key={teacher.id} className="flex justify-between items-center">
                      {teacher.name}
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleUnassign(subject.id, teacher.id)}
                      >
                        Unassign
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}