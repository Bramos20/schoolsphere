import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function Index({ auth, school, requisitions }) {
  return (
    <>
      <Head title="Requisitions" />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>Requisitions</CardTitle>
          </CardHeader>
          <CardContent>
            {auth.user.roles.some(role => role.name === 'librarian') && (
              <Link href={route('requisitions.create', school.id)}>
                <Button>Add Requisition</Button>
              </Link>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm mt-4">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">ID</th>
                    <th className="p-2">User</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {requisitions.map((requisition) => (
                    <tr key={requisition.id} className="border-t">
                      <td className="p-2">{requisition.id}</td>
                      <td className="p-2">{requisition.user.name}</td>
                      <td className="p-2">{requisition.status}</td>
                      <td className="p-2">
                        <Link href={route('requisitions.show', [school.id, requisition.id])}>
                          <Button variant="outline" size="sm">View</Button>
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