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
  Info,
  GraduationCap,
  BookOpen
} from 'lucide-react';

export default function FeeStructures({ school, classes = [], feeStructures = [] }) {
  const [showForm, setShowForm] = useState(false);
  
  const { data, setData, post, processing, reset, errors } = useForm({
    class_id: '',
    term: '',
    amount: '',
    year: new Date().getFullYear()
  });

  const handleSubmit = (e) => {
    e.preventDefault();

    post(route('fees.store', school.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset('class_id', 'term', 'amount', 'year');
        setShowForm(false);
      },
    });
  };

  // Calculate totals and statistics
  const totalFeeStructures = feeStructures.length;
  const averageFee = feeStructures.length > 0 
    ? feeStructures.reduce((sum, f) => sum + Number(f.amount), 0) / feeStructures.length 
    : 0;
  const currentYear = new Date().getFullYear();
  const currentYearStructures = feeStructures.filter(f => f.year === currentYear);
  const uniqueClasses = [...new Set(feeStructures.map(f => f.class?.name))].filter(Boolean).length;
  const termsWithStructures = [...new Set(feeStructures.map(f => f.term))].length;

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
      <Head title="Fee Structures" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Fee Structures</h1>
            <p className="text-gray-600 mt-1">
              Manage class fee structures for {school?.name || 'School'}
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Set Fee Structure'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Structures"
            value={totalFeeStructures}
            icon={FileText}
            color="blue"
            subtitle="All fee structures"
          />
          <StatCard
            title="Average Fee"
            value={`KES ${averageFee.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subtitle="Across all classes"
          />
          <StatCard
            title="Classes Covered"
            value={uniqueClasses}
            icon={GraduationCap}
            color="purple"
            subtitle="With fee structures"
          />
          <StatCard
            title="Terms Covered"
            value={termsWithStructures}
            icon={BookOpen}
            color="orange"
            subtitle="With structures"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Set fee structures for each class and term. These will be used for fee collection and billing.
          </AlertDescription>
        </Alert>

        {/* Form Section */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Set New Fee Structure
              </CardTitle>
              <CardDescription>
                Configure fee amounts for specific classes and terms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="class_id">Class</Label>
                    <Select 
                      value={data.class_id} 
                      onValueChange={(val) => setData('class_id', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Class" />
                      </SelectTrigger>
                      <SelectContent>
                        {classes.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.class_id && (
                      <p className="text-sm text-red-600">{errors.class_id}</p>
                    )}
                  </div>

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
                    <Label htmlFor="amount">Amount (KES)</Label>
                    <Input
                      id="amount"
                      type="number"
                      placeholder="Enter fee amount"
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
                    <Label htmlFor="year">Year</Label>
                    <Input
                      id="year"
                      type="number"
                      placeholder="Year (e.g. 2025)"
                      value={data.year}
                      onChange={(e) => setData('year', e.target.value)}
                      min="2020"
                      max="2030"
                    />
                    {errors.year && (
                      <p className="text-sm text-red-600">{errors.year}</p>
                    )}
                  </div>
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
                        Saving...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Save Fee Structure
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
              Fee Structure Records
            </CardTitle>
            <CardDescription>
              All configured fee structures by class and term
            </CardDescription>
          </CardHeader>
          <CardContent>
            {feeStructures.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No fee structures yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by setting your first fee structure
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Set First Fee Structure
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total: {feeStructures.length} structures
                  </span>
                  <Badge variant="secondary" className="gap-1">
                    <DollarSign className="h-3 w-3" />
                    Avg: KES {averageFee.toLocaleString()}
                  </Badge>
                </div>

                {/* Table */}
                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Class</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {feeStructures.map((fee) => (
                        <TableRow key={fee.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <GraduationCap className="h-4 w-4 text-gray-400" />
                              {fee.class?.name || 'Unknown Class'}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{fee.term}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{fee.year}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className="text-green-600">
                              KES {Number(fee.amount).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge 
                              variant={fee.year === currentYear ? "default" : "secondary"}
                              className="gap-1"
                            >
                              {fee.year === currentYear ? (
                                <>
                                  <CheckCircle className="h-3 w-3" />
                                  Current
                                </>
                              ) : (
                                <>
                                  <Calendar className="h-3 w-3" />
                                  Archive
                                </>
                              )}
                            </Badge>
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