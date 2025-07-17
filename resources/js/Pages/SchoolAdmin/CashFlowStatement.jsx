import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Info,
  ArrowUpCircle,
  ArrowDownCircle,
  Target,
  Download
} from 'lucide-react';

export default function CashFlowStatement({ school, year, term, inflows, outflows, net }) {
  const terms = ['Term 1', 'Term 2', 'Term 3'];
  const years = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);
  
  const handleFilterChange = (key, value) => {
    router.get(route('cashflow.index', school.id), {
      term: key === 'term' ? value : term,
      year: key === 'year' ? value : year,
    }, { preserveScroll: true });
  };

  // Calculate totals
  const totalInflows = Number(inflows.fees_collected) + Number(inflows.capitation_received);
  const totalOutflows = Number(outflows.expenditures);
  const netCashFlow = Number(net);

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle, trend }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          <div className={`p-3 rounded-full bg-${color}-100`}>
            <Icon className={`h-5 w-5 text-${color}-600`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <AppLayout>
      <Head title="Cash Flow Statement" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Cash Flow Statement</h1>
            <p className="text-gray-600 mt-1">
              Financial overview for {school?.name || 'School'} - {term} {year}
            </p>
          </div>
          <div className="flex gap-4">
            <Select value={term} onValueChange={(value) => handleFilterChange('term', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select Term" />
              </SelectTrigger>
              <SelectContent>
                {terms.map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={String(year)} onValueChange={(value) => handleFilterChange('year', value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Select Year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => (
                  <SelectItem key={y} value={String(y)}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => {
                const url = route('cashflow.exportPdf', school.id) + `?term=${term}&year=${year}`;
                window.open(url, '_blank');
              }}
              variant="outline"
              className="gap-2"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Inflows"
            value={`KES ${totalInflows.toLocaleString()}`}
            icon={ArrowUpCircle}
            color="green"
            subtitle="Money coming in"
          />
          <StatCard
            title="Total Outflows"
            value={`KES ${totalOutflows.toLocaleString()}`}
            icon={ArrowDownCircle}
            color="red"
            subtitle="Money going out"
          />
          <StatCard
            title="Net Cash Flow"
            value={`KES ${Math.abs(netCashFlow).toLocaleString()}`}
            icon={netCashFlow >= 0 ? TrendingUp : TrendingDown}
            color={netCashFlow >= 0 ? "green" : "red"}
            subtitle={netCashFlow >= 0 ? "Surplus" : "Deficit"}
          />
          <StatCard
            title="Period"
            value={`${term} ${year}`}
            icon={Calendar}
            color="blue"
            subtitle="Selected period"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This cash flow statement shows the movement of money in and out of the school for the selected period.
          </AlertDescription>
        </Alert>

        {/* Cash Flow Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cash Inflows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowUpCircle className="h-5 w-5 text-green-600" />
                Cash Inflows
              </CardTitle>
              <CardDescription>
                Money received during {term} {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
                  <span className="text-sm font-medium text-green-700">
                    Total Inflows
                  </span>
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-800">
                    <DollarSign className="h-3 w-3" />
                    KES {totalInflows.toLocaleString()}
                  </Badge>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Fees Collected</p>
                      <p className="text-xs text-gray-500">Student fee payments</p>
                    </div>
                    <span className="font-medium text-green-600">
                      KES {Number(inflows.fees_collected).toLocaleString()}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Government Capitation</p>
                      <p className="text-xs text-gray-500">Government funding</p>
                    </div>
                    <span className="font-medium text-green-600">
                      KES {Number(inflows.capitation_received).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cash Outflows */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowDownCircle className="h-5 w-5 text-red-600" />
                Cash Outflows
              </CardTitle>
              <CardDescription>
                Money spent during {term} {year}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Summary */}
                <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
                  <span className="text-sm font-medium text-red-700">
                    Total Outflows
                  </span>
                  <Badge variant="secondary" className="gap-1 bg-red-100 text-red-800">
                    <DollarSign className="h-3 w-3" />
                    KES {totalOutflows.toLocaleString()}
                  </Badge>
                </div>

                {/* Breakdown */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">Total Expenditures</p>
                      <p className="text-xs text-gray-500">All school expenses</p>
                    </div>
                    <span className="font-medium text-red-600">
                      KES {Number(outflows.expenditures).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Net Cash Flow Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Net Cash Flow Summary
            </CardTitle>
            <CardDescription>
              Overall financial position for {term} {year}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className={`p-6 rounded-lg border-2 ${
                netCashFlow >= 0 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-red-50 border-red-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Net Cash Flow</p>
                    <p className={`text-3xl font-bold ${
                      netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {netCashFlow >= 0 ? 'Surplus' : 'Deficit'}: KES {Math.abs(netCashFlow).toLocaleString()}
                    </p>
                    <p className="text-sm text-gray-500 mt-1">
                      {netCashFlow >= 0 
                        ? 'The school has a positive cash flow this period' 
                        : 'The school has a negative cash flow this period'
                      }
                    </p>
                  </div>
                  <div className={`p-4 rounded-full ${
                    netCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'
                  }`}>
                    {netCashFlow >= 0 ? (
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    ) : (
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    )}
                  </div>
                </div>
              </div>

              {/* Calculation breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">Total Inflows</p>
                  <p className="text-lg font-bold text-green-600">
                    KES {totalInflows.toLocaleString()}
                  </p>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-medium">MINUS</span>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium text-gray-700">Total Outflows</p>
                  <p className="text-lg font-bold text-red-600">
                    KES {totalOutflows.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}