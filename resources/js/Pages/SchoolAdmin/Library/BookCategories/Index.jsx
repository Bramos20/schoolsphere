import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function Index({ auth, school, bookCategories }) {
  return (
    <>
      <Head title="Book Categories" />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>Book Categories</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={route('book-categories.create', school.id)}>
              <Button>Add Book Category</Button>
            </Link>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Name</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookCategories.map((category) => (
                    <tr key={category.id} className="border-t">
                      <td className="p-2">{category.name}</td>
                      <td className="p-2">
                        <Link href={route('book-categories.edit', [school.id, category.id])}>
                          <Button variant="outline" size="sm">Edit</Button>
                        </Link>
                        <Link href={route('book-categories.destroy', [school.id, category.id])} method="delete" as="button">
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
