import React from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function Show({ auth, school, requisition }) {
  const { put, processing } = useForm();

  const handleApproveByAccountant = () => {
    put(route('requisitions.update', [school.id, requisition.id]), {
      status: 'approved_by_accountant',
    });
  };

  const handleApproveByAdmin = () => {
    put(route('requisitions.update', [school.id, requisition.id]), {
      status: 'approved_by_admin',
    });
  };

  const handleReject = () => {
    put(route('requisitions.update', [school.id, requisition.id]), {
      status: 'rejected',
    });
  };

  return (
    <>
      <Head title={`Requisition #${requisition.id}`} />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>Requisition #{requisition.id}</CardTitle>
          </CardHeader>
          <CardContent>
            <div>
              <p><strong>User:</strong> {requisition.user.name}</p>
              <p><strong>Status:</strong> {requisition.status}</p>
            </div>
            <div className="overflow-x-auto mt-4">
              <table className="min-w-full border text-sm">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="p-2">Name</th>
                    <th className="p-2">Quantity</th>
                    <th className="p-2">Price</th>
                    <th className="p-2">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {requisition.items.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="p-2">{item.name}</td>
                      <td className="p-2">{item.quantity}</td>
                      <td className="p-2">{item.price}</td>
                      <td className="p-2">{item.quantity * item.price}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4">
              {auth.user.roles.some(role => role.name === 'accountant') && requisition.status === 'pending' && (
                <>
                  <Button onClick={handleApproveByAccountant} disabled={processing}>
                    Approve (Accountant)
                  </Button>
                  <Button onClick={handleReject} disabled={processing} variant="destructive" className="ml-4">
                    Reject
                  </Button>
                </>
              )}
              {auth.user.roles.some(role => role.name === 'school_admin') && requisition.status === 'approved_by_accountant' && (
                <>
                  <Button onClick={handleApproveByAdmin} disabled={processing}>
                    Approve (Admin)
                  </Button>
                  <Button onClick={handleReject} disabled={processing} variant="destructive" className="ml-4">
                    Reject
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    </>
  );
}