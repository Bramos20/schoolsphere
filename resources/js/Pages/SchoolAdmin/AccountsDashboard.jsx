import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, router } from '@inertiajs/react';
import {
  Card, CardContent, CardHeader, CardTitle
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import {
  Select, SelectTrigger, SelectContent, SelectItem, SelectValue
} from '@/Components/ui/select';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import ExpectedVsCollectedChart from '@/Components/ExpectedVsCollectedChart';
import CapVsExpenditureChart from '@/Components/CapVsExpenditureChart';
import ExpenditureCategoryChart from '@/Components/ExpenditureCategoryChart';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  CreditCard, 
  AlertCircle,
  Calendar,
  Filter,
  BarChart3
} from 'lucide-react';

export default function AccountsDashboard({
  school,
  year,
  term,
  expectedFees,
  collectedFees,
  capitations,
  expenditures,
  outstanding,
  balance,
  termWiseFeeStats,
  capVsExpStats,
  categoryBreakdown,
}) {
  const [selectedTerm, setSelectedTerm] = useState(term || 'all');
  const [selectedYear, setSelectedYear] = useState(year || new Date().getFullYear());
  const [isFiltering, setIsFiltering] = useState(false);

  const applyFilters = () => {
    setIsFiltering(true);
    router.get(route('accounts.dashboard', school.id), {
      term: selectedTerm === 'all' ? '' : selectedTerm,
      year: selectedYear
    }, {
      preserveScroll: true,
      preserveState: true,
      onFinish: () => setIsFiltering(false)
    });
  };

  const MetricCard = ({ title, value, icon: Icon, trend, color = "blue", subtitle }) => (
    <Card className="relative overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
        <div className={`p-2 rounded-full bg-${color}-100`}>
          <Icon className={`h-4 w-4 text-${color}-600`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-gray-900">
          {value}
        </div>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <Badge variant={trend.type === 'increase' ? 'default' : 'destructive'} className="text-xs">
              {trend.type === 'increase' ? '↗' : '↘'} {trend.value}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  );

  const collectionRate = expectedFees > 0 ? ((collectedFees / expectedFees) * 100).toFixed(1) : 0;
  const outstandingRate = expectedFees > 0 ? ((outstanding / expectedFees) * 100).toFixed(1) : 0;

  return (
    <AppLayout>
      <Head title="Accounts Dashboard" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Accounts Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Financial overview for {school?.name || 'School'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-2">
              <Calendar className="h-3 w-3" />
              {selectedTerm === 'all' ? 'All Terms' : selectedTerm} {selectedYear}
            </Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Term</label>
                <Select value={selectedTerm} onValueChange={setSelectedTerm}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Select Term" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Terms</SelectItem>
                    <SelectItem value="Term 1">Term 1</SelectItem>
                    <SelectItem value="Term 2">Term 2</SelectItem>
                    <SelectItem value="Term 3">Term 3</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700">Year</label>
                <Input
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  className="w-[120px]"
                  placeholder="Year"
                />
              </div>

              <Button 
                onClick={applyFilters}
                disabled={isFiltering}
                className="gap-2"
              >
                {isFiltering ? 'Applying...' : 'Apply Filters'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          <MetricCard
            title="Expected Fees"
            value={`KES ${Number(expectedFees).toLocaleString()}`}
            icon={DollarSign}
            color="blue"
            subtitle="Total expected revenue"
          />
          
          <MetricCard
            title="Collected Fees"
            value={`KES ${Number(collectedFees).toLocaleString()}`}
            icon={TrendingUp}
            color="green"
            subtitle={`${collectionRate}% collection rate`}
          />
          
          <MetricCard
            title="Outstanding Fees"
            value={`KES ${Number(outstanding).toLocaleString()}`}
            icon={AlertCircle}
            color="orange"
            subtitle={`${outstandingRate}% of expected`}
          />
          
          <MetricCard
            title="Capitations"
            value={capitations > 0 ? `KES ${Number(capitations).toLocaleString()}` : 'No data'}
            icon={Users}
            color="cyan"
            subtitle="Government funding"
          />
          
          <MetricCard
            title="Total Expenditures"
            value={`KES ${Number(expenditures).toLocaleString()}`}
            icon={TrendingDown}
            color="red"
            subtitle="Total spending"
          />
          
          <MetricCard
            title="Net Balance"
            value={`KES ${Number(balance).toLocaleString()}`}
            icon={CreditCard}
            color={balance >= 0 ? 'green' : 'red'}
            subtitle={balance >= 0 ? 'Positive balance' : 'Deficit'}
          />
        </div>

        {/* Quick Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Financial Health
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Collection Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(collectionRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{collectionRate}%</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Outstanding Rate</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-orange-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min(outstandingRate, 100)}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{outstandingRate}%</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {expectedFees > 0 ? Math.round((collectedFees / expectedFees) * 100) : 0}%
                    </div>
                    <div className="text-xs text-gray-500">Collection Efficiency</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">
                      KES {Number(expectedFees - collectedFees).toLocaleString()}
                    </div>
                    <div className="text-xs text-gray-500">Pending Collection</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start gap-2">
                <DollarSign className="h-4 w-4" />
                Record Fee Payment
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <TrendingDown className="h-4 w-4" />
                Add Expenditure
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <Users className="h-4 w-4" />
                Update Capitation
              </Button>
              <Button variant="outline" className="w-full justify-start gap-2">
                <BarChart3 className="h-4 w-4" />
                Generate Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Expected vs Collected Fees</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpectedVsCollectedChart termWiseFeeStats={termWiseFeeStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Capitation vs Expenditure</CardTitle>
            </CardHeader>
            <CardContent>
              <CapVsExpenditureChart capVsExpStats={capVsExpStats} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Expenditure by Category</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenditureCategoryChart categoryBreakdown={categoryBreakdown} />
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}