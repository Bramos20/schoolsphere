import React from 'react';
import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function Index({ school, requisitions }) {
  return (
    <AppLayout>
      <Head title="Requisitions" />
      <Card>
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Requisitions</span>
            <Link href={route('requisitions.create', school.id)}>
              <Button>Create New</Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <table className="min-w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 text-left">Submitted By</th>
                <th className="p-2">Status</th>
                <th className="p-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requisitions.map((req) => (
                <tr key={req.id} className="border-t">
                  <td className="p-2">{req.user.name}</td>
                  <td className="p-2 capitalize">{req.status.replace(/_/g, ' ')}</td>
                  <td className="p-2">
                    <Link
                      href={route('requisitions.show', [school.id, req.id])}
                      className="text-blue-600 hover:underline"
                    >
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
