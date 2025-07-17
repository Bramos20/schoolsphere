import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';

export default function Create({ auth, school, books, users }) {
  const { data, setData, post, processing, errors } = useForm({
    book_id: '',
    user_id: '',
    issue_date: '',
    due_date: '',
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
                <div>
                  <Label htmlFor="user_id">User</Label>
                  <select
                    id="user_id"
                    className="w-full border rounded p-2"
                    value={data.user_id}
                    onChange={(e) => setData('user_id', e.target.value)}
                  >
                    <option value="">Select a user</option>
                    {users.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name}
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
