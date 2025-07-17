import React, { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from '@/Components/ui/card';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Textarea } from '@/Components/ui/textarea';
import { Badge } from '@/Components/ui/badge';
import { Label } from '@/Components/ui/label';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue
} from '@/Components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { 
  DollarSign, 
  Calendar, 
  FileText, 
  TrendingUp, 
  Plus,
  Users,
  AlertCircle,
  CheckCircle,
  Info
} from 'lucide-react';

export default function Capitations({ school, capitations }) {
  const [showForm, setShowForm] = useState(false);
  
  const { data, setData, post, processing, reset, errors } = useForm({
    term: '',
    year: new Date().getFullYear(),
    amount: '',
    received_date: new Date().toISOString().split('T')[0],
    remarks: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    post(route('capitations.store', school.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset('term', 'year', 'amount', 'received_date', 'remarks');
        setShowForm(false);
      },
    });
  };

  // Calculate totals and statistics
  const totalAmount = capitations.reduce((sum, c) => sum + Number(c.amount), 0);
  const currentYear = new Date().getFullYear();
  const currentYearCapitations = capitations.filter(c => c.year === currentYear);
  const currentYearTotal = currentYearCapitations.reduce((sum, c) => sum + Number(c.amount), 0);
  const termsWithCapitation = [...new Set(capitations.map(c => c.term))].length;

  const StatCard = ({ title, value, icon: Icon, color = "blue", subtitle }) => (
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
      <Head title="Capitation Tracking" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Capitation Tracking</h1>
            <p className="text-gray-600 mt-1">
              Government funding management for {school?.name || 'School'}
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Record Capitation'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Capitation"
            value={`KES ${totalAmount.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subtitle="All time total"
          />
          <StatCard
            title="Current Year"
            value={`KES ${currentYearTotal.toLocaleString()}`}
            icon={TrendingUp}
            color="blue"
            subtitle={`${currentYear} total`}
          />
          <StatCard
            title="Total Records"
            value={capitations.length}
            icon={FileText}
            color="purple"
            subtitle="All entries"
          />
          <StatCard
            title="Terms Covered"
            value={termsWithCapitation}
            icon={Users}
            color="orange"
            subtitle="Terms with funding"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Capitation is per-pupil funding from the government. Record all received amounts with proper documentation.
          </AlertDescription>
        </Alert>

        {/* Form Section */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Record New Capitation
              </CardTitle>
              <CardDescription>
                Enter the details of the capitation funding received
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="term">Term</Label>
                    <Select 
                      value={data.term} 
                      onValueChange={(val) => setData('term', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Term" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Term 1">Term 1</SelectItem>
                        <SelectItem value="Term 2">Term 2</SelectItem>
                        <SelectItem value="Term 3">Term 3</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.term && (
                      <p className="text-sm text-red-600">{errors.term}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="Year"
                      value={data.year}
                      onChange={(e) => setData('year', e.target.value)}
                      min="2020"
                      max="2030"
                    />
                    {errors.year && (
                      <p className="text-sm text-red-600">{errors.year}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="amount">Amount (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter amount"
                      value={data.amount}
                      onChange={(e) => setData('amount', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    {errors.amount && (
                      <p className="text-sm text-red-600">{errors.amount}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="received_date">Date Received</Label>
                    <Input
                      id="received_date"
                      type="date"
                      value={data.received_date}
                      onChange={(e) => setData('received_date', e.target.value)}
                    />
                    {errors.received_date && (
                      <p className="text-sm text-red-600">{errors.received_date}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="remarks">Remarks (Optional)</Label>
                  <Textarea
                    id="remarks"
                    placeholder="Additional notes about this capitation..."
                    value={data.remarks}
                    onChange={(e) => setData('remarks', e.target.value)}
                    rows={3}
                  />
                  {errors.remarks && (
                    <p className="text-sm text-red-600">{errors.remarks}</p>
                  )}
                </div>

                <div className="flex gap-4">
                  <Button 
                    type="submit" 
                    disabled={processing}
                    className="gap-2"
                  >
                    {processing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Recording...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Record Capitation
                      </>
                    )}
                  </Button>
                  <Button 
                    type="button" 
                    variant="outline"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Records Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Capitation Records
            </CardTitle>
            <CardDescription>
              All recorded capitation funding with details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {capitations.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No records yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by recording your first capitation entry
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Record First Capitation
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total: {capitations.length} records
                  </span>
                  <Badge variant="secondary" className="gap-1">
                    <DollarSign className="h-3 w-3" />
                    KES {totalAmount.toLocaleString()}
                  </Badge>
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[120px]">Date</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Remarks</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {capitations.map((c) => (
                        <TableRow key={c.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(c.received_date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{c.term}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{c.year}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className="text-green-600">
                              KES {Number(c.amount).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={c.remarks || 'No remarks'}>
                              {c.remarks || (
                                <span className="text-gray-400 italic">No remarks</span>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}