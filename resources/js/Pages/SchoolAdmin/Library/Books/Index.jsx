import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function Index({ auth, school, books }) {
  return (
    <>
      <Head title="Books" />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>Books</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={route('books.create', school.id)}>
              <Button>Add Book</Button>
            </Link>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Title</th>
                    <th className="p-2">Author</th>
                    <th className="p-2">Publisher</th>
                    <th className="p-2">ISBN</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Available</th>
                    <th className="p-2">Category</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {books.map((book) => (
                    <tr key={book.id} className="border-t">
                      <td className="p-2">{book.title}</td>
                      <td className="p-2">{book.author}</td>
                      <td className="p-2">{book.publisher}</td>
                      <td className="p-2">{book.isbn}</td>
                      <td className="p-2">{book.quantity}</td>
                      <td className="p-2">{book.available}</td>
                      <td className="p-2">{book.category?.name || '—'}</td>
                      <td className="p-2">
                        <Link href={route('books.edit', [school.id, book.id])}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Link href={route('books.destroy', [school.id, book.id])} method="delete" as="button">
                          <Button variant="destructive" size="sm" className="ml-2">Delete</Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    </>
  );
}
