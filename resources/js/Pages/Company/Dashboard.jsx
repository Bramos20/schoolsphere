import React from 'react';
import AppLayout from '@/Layouts/AppLayout';

export default function Dashboard({ company }) {
  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-4">Company Dashboard</h1>
      <p>Welcome, you are managing <strong>{company.name}</strong>.</p>
    </AppLayout>
  );
}