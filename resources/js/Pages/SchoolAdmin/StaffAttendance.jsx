import React, { useState, useEffect } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';

export default function StaffAttendance({ auth, staff, todayAttendance, school }) {
  const { data, setData, post, processing, errors } = useForm({
    attendance: []
  });

  // Initialize attendance data
  useEffect(() => {
    const initialAttendance = staff.map((s) => {
      const existing = todayAttendance[s.id]; // Using keyed object now
      return {
        staff_id: s.id,
        status: existing ? existing.status : 'present'
      };
    });
    setData('attendance', initialAttendance);
  }, [staff, todayAttendance]);

  const handleStatusChange = (staffId, newStatus) => {
    const updatedAttendance = data.attendance.map(item => 
      item.staff_id === staffId 
        ? { ...item, status: newStatus }
        : item
    );
    setData('attendance', updatedAttendance);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Debug logging
    console.log('Submitting attendance:', data.attendance);
    console.log('School ID:', school?.id || auth.user.school_id);

    post(route('staff-attendance.store', school?.id || auth.user.school_id), {
      preserveScroll: true,
      onSuccess: () => {
        console.log('Attendance saved successfully.');
      },
      onError: (errors) => {
        console.error('Validation errors:', errors);
      },
    });
  };

  // Debug logging
  console.log('Staff data:', staff);
  console.log('Today attendance:', todayAttendance);
  console.log('Current form data:', data);

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
            {/* Display any validation errors */}
            {Object.keys(errors).length > 0 && (
              <div className="mb-4 p-4 bg-red-100 border border-red-400 rounded">
                <h4 className="font-semibold text-red-800">Please correct the following errors:</h4>
                <ul className="mt-2 text-red-700">
                  {Object.entries(errors).map(([key, error]) => (
                    <li key={key}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="overflow-x-auto">
                <table className="min-w-full border text-sm mb-4">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left border">Name</th>
                      <th className="p-2 text-left border">Department</th>
                      <th className="p-2 text-left border">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {staff.length > 0 ? (
                      staff.map((s) => {
                        const currentAttendance = data.attendance.find(a => a.staff_id === s.id);
                        return (
                          <tr key={s.id} className="border-t">
                            <td className="p-2 border">{s.user?.name || 'N/A'}</td>
                            <td className="p-2 border">{s.department?.name || '—'}</td>
                            <td className="p-2 border">
                              <select
                                className="border rounded p-1 w-full"
                                value={currentAttendance?.status || 'present'}
                                onChange={(e) => handleStatusChange(s.id, e.target.value)}
                              >
                                <option value="present">Present</option>
                                <option value="absent">Absent</option>
                              </select>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan="3" className="p-4 text-center text-gray-500">
                          No staff members found.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              <div className="flex justify-between items-center">
                <p className="text-sm text-gray-600">
                  Total Staff: {staff.length}
                </p>
                <Button 
                  type="submit" 
                  disabled={processing || staff.length === 0}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {processing ? 'Saving...' : 'Save Attendance'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </AppLayout>
    </>
  );
}