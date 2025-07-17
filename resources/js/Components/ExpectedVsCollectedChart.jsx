import React from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

export default function ExpectedVsCollectedChart({ termWiseFeeStats }) {
  const terms = Object.keys(termWiseFeeStats);
  const expected = terms.map(term => termWiseFeeStats[term].expected);
  const collected = terms.map(term => termWiseFeeStats[term].collected);

  const data = {
    labels: terms,
    datasets: [
      {
        label: 'Expected Fees',
        backgroundColor: '#3b82f6',
        data: expected,
      },
      {
        label: 'Collected Fees',
        backgroundColor: '#10b981',
        data: collected,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
    },
  };

  return (
    <div className="mt-8">
      <h2 className="text-lg font-semibold mb-4">Expected vs Collected Fees</h2>
      <Bar data={data} options={options} />
    </div>
  );
}