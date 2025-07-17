import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function Index({ auth, school, bookIssues }) {
  return (
    <>
      <Head title="Book Issues" />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>Book Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={route('book-issues.create', school.id)}>
              <Button>Issue Book</Button>
            </Link>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Book</th>
                    <th className="p-2">User</th>
                    <th className="p-2">Issue Date</th>
                    <th className="p-2">Due Date</th>
                    <th className="p-2">Return Date</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {bookIssues.map((issue) => (
                    <tr key={issue.id} className="border-t">
                      <td className="p-2">{issue.book.title}</td>
                      <td className="p-2">{issue.user.name}</td>
                      <td className="p-2">{issue.issue_date}</td>
                      <td className="p-2">{issue.due_date}</td>
                      <td className="p-2">{issue.return_date || 'Not Returned'}</td>
                      <td className="p-2">
                        {!issue.return_date && (
                          <Link href={route('book-issues.update', [school.id, issue.id])} method="put" data={{ return_date: new Date().toISOString().slice(0, 10) }} as="button">
                            <Button variant="outline" size="sm">Return</Button>
                          </Link>
                        )}
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
