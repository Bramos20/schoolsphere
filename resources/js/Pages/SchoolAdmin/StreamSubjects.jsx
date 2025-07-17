import React, { useState } from 'react';
import { Head, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Card, CardHeader, CardTitle, CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';

export default function StreamSubjects({ school, streams, subjects }) {
  const [selectedStreamId, setSelectedStreamId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

    const assignSubject = (e) => {
        e.preventDefault();

        if (!selectedStreamId || !selectedSubjectId) return;

        router.post(
            route('stream-subjects.assign', school.id),
            {
            stream_id: selectedStreamId,
            subject_id: selectedSubjectId,
            },
            {
            onSuccess: () => {
                setSelectedStreamId('');
                setSelectedSubjectId('');
            },
            }
        );
    };

  const unassignSubject = (streamId, subjectId) => {
    if (confirm('Unassign this subject from the stream?')) {
      router.delete(route('stream-subjects.unassign', school.id), {
        data: {
          stream_id: streamId,
          subject_id: subjectId,
        },
      });
    }
  };

  return (
    <AppLayout>
      <Head title="Assign Subjects to Streams" />
      <h1 className="text-2xl font-bold mb-6">Assign Subjects to Streams – {school.name}</h1>

      <Card className="max-w-xl mb-6">
        <CardHeader>
          <CardTitle>Assign Subject</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={assignSubject} className="space-y-4">
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

            <Select onValueChange={setSelectedSubjectId} value={selectedSubjectId}>
              <SelectTrigger>
                <SelectValue placeholder="Select Subject" />
              </SelectTrigger>
              <SelectContent>
                {subjects.map((subject) => (
                  <SelectItem key={subject.id} value={String(subject.id)}>
                    {subject.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button type="submit">
                Assign Subject
            </Button>
          </form>
        </CardContent>
      </Card>

      <h2 className="text-xl font-semibold mb-4">Assigned Subjects Per Stream</h2>
      <div className="grid gap-4 md:grid-cols-2">
        {streams.map((stream) => (
          <Card key={stream.id}>
            <CardHeader>
              <CardTitle>{stream.name} ({stream.class.name})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {stream.subjects.length > 0 ? (
                stream.subjects.map((subject) => (
                  <div key={subject.id} className="flex justify-between items-center">
                    <span>{subject.name}</span>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => unassignSubject(stream.id, subject.id)}
                    >
                      Unassign
                    </Button>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No subjects assigned.</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}