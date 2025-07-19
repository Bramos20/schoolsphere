import React from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function Show({ school, requisition }) {
  const handleAction = (action) => {
    if (action === 'approve') {
      router.post(route('requisitions.approve', [school.id, requisition.id]));
    } else if (action === 'reject') {
      router.post(route('requisitions.reject', [school.id, requisition.id]));
    }
  };

  return (
    <AppLayout>
      <Head title="Requisition Details" />
      <Card>
        <CardHeader>
          <CardTitle>Requisition by {requisition.user.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Status: <strong>{requisition.status.replace(/_/g, ' ')}</strong></p>
          <h3 className="mt-4 font-semibold">Items:</h3>
          <ul className="list-disc pl-6">
            {requisition.items.map((item) => (
              <li key={item.id}>
                {item.item_name} - Qty: {item.quantity}
              </li>
            ))}
          </ul>

          <div className="mt-4 flex gap-2">
            <Button onClick={() => handleAction('approve')} variant="default">
              Approve
            </Button>
            <Button onClick={() => handleAction('reject')} variant="destructive">
              Reject
            </Button>
            <Link href={route('requisitions.index', school.id)}>
              <Button variant="secondary">Back</Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </AppLayout>
  );
}
