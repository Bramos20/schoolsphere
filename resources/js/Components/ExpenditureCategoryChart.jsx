// ExpenditureCategoryChart.jsx
import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS, ArcElement, Tooltip, Legend
} from 'chart.js';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function ExpenditureCategoryChart({ categoryBreakdown }) {
  if (!categoryBreakdown || categoryBreakdown.length === 0) {
    return (
      <Card>
        <CardHeader><CardTitle>Expenditure by Category</CardTitle></CardHeader>
        <CardContent>
          <p className="text-muted-foreground text-sm">No category data available.</p>
        </CardContent>
      </Card>
    );
  }

  const labels = categoryBreakdown.map(item => item.category);
  const dataValues = categoryBreakdown.map(item => item.amount);

  const data = {
    labels,
    datasets: [
      {
        label: 'KES',
        data: dataValues,
        backgroundColor: [
          '#60a5fa', '#f87171', '#34d399',
          '#fbbf24', '#a78bfa', '#f472b6', '#38bdf8'
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expenditure by Category</CardTitle>
      </CardHeader>
      <CardContent className="flex justify-center">
        <div className="w-[300px] sm:w-[400px]">
          <Pie data={data} />
        </div>
      </CardContent>
    </Card>
  );
}