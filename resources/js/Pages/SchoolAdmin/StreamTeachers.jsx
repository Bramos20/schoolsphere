import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

export default function StreamTeachers({ school, streams, teachers }) {
  const [selectedStreamId, setSelectedStreamId] = useState('');
  const [selectedTeacherId, setSelectedTeacherId] = useState('');

  const assignTeacher = (e) => {
    e.preventDefault();

    if (!selectedStreamId || !selectedTeacherId) return;

    router.post(
      route('stream-teachers.assign', school.id),
      {
        stream_id: selectedStreamId,
        teacher_id: selectedTeacherId,
      },
      {
        onSuccess: () => {
          setSelectedStreamId('');
          setSelectedTeacherId('');
        },
      }
    );
  };

  const unassignTeacher = (streamId, teacherId) => {
    if (confirm('Unassign this teacher from the stream?')) {
      router.delete(route('stream-teachers.unassign', school.id), {
        data: {
          stream_id: streamId,
          teacher_id: teacherId,
        },
      });
    }
  };

  return (
    <AppLayout>
      <Head title="Assign Teachers to Streams" />
      <h1 className="text-2xl font-bold mb-6">
        Assign Teachers to Streams – {school.name}
      </h1>

      <Card className="max-w-xl mb-6">
        <CardHeader>
          <CardTitle>Assign Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={assignTeacher} className="space-y-4">
            <Select onValueChange={setSelectedStreamId} value={selectedStreamId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Stream" />
              </SelectTrigger>
              <SelectContent>
                {streams.map((stream) => (
                  <SelectItem key={stream.id} value={String(stream.id)}>
                    {stream.name} ({stream.class.name})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select onValueChange={setSelectedTeacherId} value={selectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Teacher" />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((teacher) => (
                  <SelectItem key={teacher.id} value={String(teacher.id)}>
                    {teacher.name} ({teacher.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit">Assign Teacher</Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Assigned Teachers Per Stream</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {streams.map((stream) => (
          <Card key={stream.id}>
            <CardHeader>
              <CardTitle>{stream.name} ({stream.class.name})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stream.teachers.length > 0 ? (
                stream.teachers.map((teacher) => (
                  <div
                    key={teacher.id}
                    className="flex justify-between items-center"
                  >
                    <span>{teacher.name} ({teacher.email})</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => unassignTeacher(stream.id, teacher.id)}
                    >
                      Unassign
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No teachers assigned.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}