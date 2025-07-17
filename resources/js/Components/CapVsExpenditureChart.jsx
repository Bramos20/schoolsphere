// CapVsExpenditureChart.jsx
import React from 'react';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale,
  PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Card, CardContent, CardHeader, CardTitle } from '@/Components/ui/card';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function CapVsExpenditureChart({ capVsExpStats }) {
  if (!capVsExpStats?.labels?.length) {
    return (
      <Card>
        <CardHeader><CardTitle>Capitation vs Expenditure</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No data available.</p>
        </CardContent>
      </Card>
    );
  }

  const data = {
    labels: capVsExpStats.labels,
    datasets: [
      {
        label: 'Capitations (KES)',
        data: capVsExpStats.capitations,
        borderColor: 'rgba(34,197,94,1)', // green
        backgroundColor: 'rgba(34,197,94,0.2)',
        tension: 0.3,
      },
      {
        label: 'Expenditures (KES)',
        data: capVsExpStats.expenditures,
        borderColor: 'rgba(239,68,68,1)', // red
        backgroundColor: 'rgba(239,68,68,0.2)',
        tension: 0.3,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Capitation vs Expenditure (Per Term)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="w-full overflow-x-auto">
          <Line data={data} />
        </div>
      </CardContent>
    </Card>
  );
}