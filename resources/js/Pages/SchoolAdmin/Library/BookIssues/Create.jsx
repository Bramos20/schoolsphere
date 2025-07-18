import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';

export default function Create({ auth, school, books, students, staff, classes }) {
  const { data, setData, post, processing, errors } = useForm({
    book_id: '',
    user_id: '',
    issue_date: '',
    due_date: '',
    user_type: '',
    class_id: '',
    stream_id: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('book-issues.store', school.id));
  };

  return (
    <>
      <Head title="Issue Book" />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>Issue Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="user_type">User Type</Label>
                  <select
                    id="user_type"
                    className="w-full border rounded p-2"
                    value={data.user_type}
                    onChange={(e) => setData('user_type', e.target.value)}
                  >
                    <option value="">Select a user type</option>
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="book_id">Book</Label>
                  <select
                    id="book_id"
                    className="w-full border rounded p-2"
                    value={data.book_id}
                    onChange={(e) => setData('book_id', e.target.value)}
                  >
                    <option value="">Select a book</option>
                    {books.map((book) => (
                      <option key={book.id} value={book.id}>
                        {book.title}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.book_id} className="mt-2" />
                </div>
                {data.user_type === 'student' && (
                  <>
                    <div>
                      <Label htmlFor="class_id">Class</Label>
                      <select
                        id="class_id"
                        className="w-full border rounded p-2"
                        value={data.class_id}
                        onChange={(e) => {
                          setData('class_id', e.target.value);
                          setData('stream_id', '');
                        }}
                      >
                        <option value="">Select a class</option>
                        {classes.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <Label htmlFor="stream_id">Stream</Label>
                      <select
                        id="stream_id"
                        className="w-full border rounded p-2"
                        value={data.stream_id}
                        onChange={(e) => setData('stream_id', e.target.value)}
                      >
                        <option value="">Select a stream</option>
                        {data.class_id &&
                          classes
                            .find((c) => c.id == data.class_id)
                            .streams.map((s) => (
                              <option key={s.id} value={s.id}>
                                {s.name}
                              </option>
                            ))}
                      </select>
                    </div>
                  </>
                )}
                <div>
                  <Label htmlFor="user_id">User</Label>
                  <select
                    id="user_id"
                    className="w-full border rounded p-2"
                    value={data.user_id}
                    onChange={(e) => setData('user_id', e.target.value)}
                  >
                    <option value="">Select a user</option>
                    {data.user_type === 'student' &&
                      students
                        .filter((student) => {
                          if (data.stream_id) {
                            return student.stream_id == data.stream_id;
                          } else if (data.class_id) {
                            return student.stream.school_class_id == data.class_id;
                          }
                          return true;
                        })
                        .map((student) => (
                          <option key={student.user.id} value={student.user.id}>
                            {student.user.name}
                          </option>
                        ))}
                    {data.user_type === 'staff' &&
                      staff.map((s) => (
                        <option key={s.user.id} value={s.user.id}>
                          {s.user.name}
                        </option>
                      ))}
                  </select>
                  <InputError message={errors.user_id} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="issue_date">Issue Date</Label>
                  <input
                    id="issue_date"
                    type="date"
                    className="w-full border rounded p-2"
                    value={data.issue_date}
                    onChange={(e) => setData('issue_date', e.target.value)}
                  />
                  <InputError message={errors.issue_date} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <input
                    id="due_date"
                    type="date"
                    className="w-full border rounded p-2"
                    value={data.due_date}
                    onChange={(e) => setData('due_date', e.target.value)}
                  />
                  <InputError message={errors.due_date} className="mt-2" />
                </div>
              </div>
              <Button type="submit" disabled={processing} className="mt-4">
                Issue Book
              </Button>
            </form>
          </CardContent>
        </Card>
      </AppLayout>
    </>
  );
}