import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function Dashboard() {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Welcome to SchoolSphere</h1>
      <p className="text-gray-600">This is your admin dashboard.</p>
    </AppLayout>
  );
}