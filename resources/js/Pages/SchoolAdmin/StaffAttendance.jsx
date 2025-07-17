import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function StaffAttendance({ auth, staff, todayAttendance }) {
  const [attendance, setAttendance] = useState(() => {
    const initial = {};
    staff.forEach((s) => {
      const existing = todayAttendance.find((a) => a.staff_id === s.id);
      initial[s.id] = existing ? existing.status : 'present'; // default
    });
    return initial;
  });

  const { post, processing } = useForm();

  const handleSubmit = (e) => {
    e.preventDefault();

    const payload = staff.map((s) => ({
      staff_id: s.id,
      status: attendance[s.id],
    }));

    post(route('staff-attendance.store', auth.user.school_id), {
      data: {
        attendance: payload,
      },
      preserveScroll: true,
      onSuccess: () => {
        console.log('Attendance saved successfully.');
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
      },
    });
  };

  return (
    <>
      <Head title="Staff Attendance" />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>
              Staff Attendance - {new Date().toLocaleDateString()}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2">Name</th>
                      <th className="p-2">Department</th>
                      <th className="p-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.map((s) => (
                      <tr key={s.id} className="border-t">
                        <td className="p-2">{s.user.name}</td>
                        <td className="p-2">{s.department?.name || '—'}</td>
                        <td className="p-2">
                          <select
                            className="border rounded p-1"
                            value={attendance[s.id]}
                            onChange={(e) =>
                              setAttendance((prev) => ({
                                ...prev,
                                [s.id]: e.target.value,
                              }))
                            }
                          >
                            <option value="present">Present</option>
                            <option value="absent">Absent</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <Button type="submit" disabled={processing}>
                Save Attendance
              </Button>
            </form>
          </CardContent>
        </Card>
      </AppLayout>
    </>
  );
}