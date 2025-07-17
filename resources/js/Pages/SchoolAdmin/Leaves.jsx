import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Textarea } from '@/Components/ui/textarea';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/Components/ui/select';
import dayjs from 'dayjs';

export default function Leaves({ auth, leaves }) {
  const { data, setData, post, processing, reset } = useForm({
    staff_id: '',
    type: '',
    start_date: '',
    end_date: '',
    reason: '',
  });

  const [showForm, setShowForm] = useState(false);

  // ✅ Auto-set staff_id from logged-in user
  useEffect(() => {
    if (auth?.user?.staff?.id) {
      setData('staff_id', auth.user.staff.id);
    }
  }, [auth?.user?.staff?.id]);

  // ✅ Debug: log roles in browser console
  useEffect(() => {
    console.log('✅ auth.roles:', auth.roles);
  }, [auth.roles]);

  const submit = (e) => {
    e.preventDefault();
    post(route('leaves.store', auth.user.school_id), {
      onSuccess: () => {
        reset();
        setData('staff_id', auth.user.staff.id);
        setShowForm(false);
      },
    });
  };

  const handleStatusChange = (id, status) => {
    router.put(
      route('leaves.updateStatus', id),
      { status },
      {
        preserveScroll: true,
      }
    );
  };

  return (
    <>
      <Head title="Leave Management" />
      <AppLayout user={auth.user}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Leave Management</h2>
          <Button onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : 'Apply for Leave'}
          </Button>
        </div>

        {showForm && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Leave Application Form</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select value={data.type} onValueChange={(value) => setData('type', value)} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Leave Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Sick">Sick</SelectItem>
                    <SelectItem value="Annual">Annual</SelectItem>
                    <SelectItem value="Maternity">Maternity</SelectItem>
                  </SelectContent>
                </Select>
                <Input
                  type="date"
                  value={data.start_date}
                  onChange={(e) => setData('start_date', e.target.value)}
                  required
                />
                <Input
                  type="date"
                  value={data.end_date}
                  onChange={(e) => setData('end_date', e.target.value)}
                  required
                />
                <Textarea
                  placeholder="Reason (optional)"
                  value={data.reason}
                  onChange={(e) => setData('reason', e.target.value)}
                  className="col-span-full"
                />
                <Button type="submit" disabled={processing}>Submit</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Leave Applications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full border text-sm">
                <thead className="bg-gray-100 text-left">
                  <tr>
                    <th className="p-2">Staff</th>
                    <th className="p-2">Type</th>
                    <th className="p-2">Period</th>
                    <th className="p-2">Reason</th>
                    <th className="p-2">Status</th>
                    <th className="p-2">Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {leaves.map((leave) => (
                    <tr key={leave.id} className="border-t">
                      <td className="p-2">{leave.staff?.user?.name}</td>
                      <td className="p-2">{leave.type}</td>
                      <td className="p-2">
                        {dayjs(leave.start_date).format('YYYY-MM-DD')} to{' '}
                        {dayjs(leave.end_date).format('YYYY-MM-DD')}
                      </td>
                      <td className="p-2">{leave.reason || '—'}</td>
                      <td className="p-2 capitalize">
                        {leave.status === 'pending' ? (
                          auth.roles?.includes('school_admin') ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700 text-white"
                                onClick={() => handleStatusChange(leave.id, 'approved')}
                              >
                                Approve
                              </Button>
                              <Button
                                size="sm"
                                className="bg-red-600 hover:bg-red-700 text-white"
                                onClick={() => handleStatusChange(leave.id, 'rejected')}
                              >
                                Reject
                              </Button>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">Pending</span>
                          )
                        ) : (
                          <span
                            className={`px-2 py-1 rounded text-white ${
                              leave.status === 'approved' ? 'bg-green-600' : 'bg-red-600'
                            }`}
                          >
                            {leave.status}
                          </span>
                        )}
                      </td>
                      <td className="p-2">{leave.approver?.name || '—'}</td>
                    </tr>
                  ))}
                  {leaves.length === 0 && (
                    <tr>
                      <td colSpan="6" className="text-center p-4 text-gray-500">
                        No leave applications found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </AppLayout>
    </>
  );
}
