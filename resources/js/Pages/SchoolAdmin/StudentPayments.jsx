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
  CreditCard, 
  TrendingUp, 
  Plus,
  Users,
  AlertCircle,
  CheckCircle,
  Info,
  Receipt,
  Banknote,
  GraduationCap,
  Hash
} from 'lucide-react';

export default function StudentPayments({ school, students, payments = [] }) {
  const [showForm, setShowForm] = useState(false);
  
  const { data, setData, post, processing, reset, errors } = useForm({
    student_id: '',
    term: '',
    amount_paid: '',
    payment_date: new Date().toISOString().split('T')[0],
    method: '',
    reference: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!school || !school.id) {
      console.error("School not loaded yet");
      return;
    }

    post(route('payments.store', school.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset('student_id', 'term', 'amount_paid', 'payment_date', 'method', 'reference');
        setShowForm(false);
      },
    });
  };

  // Calculate totals and statistics
  const totalPayments = payments.length;
  const totalAmount = payments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const currentYear = new Date().getFullYear();
  const currentYearPayments = payments.filter(p => new Date(p.payment_date).getFullYear() === currentYear);
  const currentYearTotal = currentYearPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
  const uniqueStudents = [...new Set(payments.map(p => p.student_id))].length;
  const paymentMethods = [...new Set(payments.map(p => p.method))].filter(Boolean);

  const getPaymentMethodIcon = (method) => {
    switch(method) {
      case 'Cash': return Banknote;
      case 'MPESA': return CreditCard;
      case 'Bank': return CreditCard;
      default: return Receipt;
    }
  };

  const getPaymentMethodColor = (method) => {
    switch(method) {
      case 'Cash': return 'bg-green-100 text-green-800';
      case 'MPESA': return 'bg-blue-100 text-blue-800';
      case 'Bank': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

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
      <Head title="Student Payments" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Student Payments</h1>
            <p className="text-gray-600 mt-1">
              Record and track fee payments for {school?.name || 'School'}
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Record Payment'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Payments"
            value={totalPayments}
            icon={Receipt}
            color="blue"
            subtitle="All recorded payments"
          />
          <StatCard
            title="Total Amount"
            value={`KES ${totalAmount.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subtitle="All time total"
          />
          <StatCard
            title="Current Year"
            value={`KES ${currentYearTotal.toLocaleString()}`}
            icon={TrendingUp}
            color="purple"
            subtitle={`${currentYear} total`}
          />
          <StatCard
            title="Paying Students"
            value={uniqueStudents}
            icon={Users}
            color="orange"
            subtitle="Unique students"
          />
        </div>

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Record student fee payments with proper documentation. Include payment method and reference for tracking.
          </AlertDescription>
        </Alert>

        {/* Form Section */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Record New Payment
              </CardTitle>
              <CardDescription>
                Enter student payment details with method and reference
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="student_id">Student</Label>
                    <Select 
                      value={data.student_id} 
                      onValueChange={(val) => setData('student_id', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Student" />
                      </SelectTrigger>
                      <SelectContent>
                        {(students ?? []).map((student) => (
                          <SelectItem key={student.id} value={String(student.id)}>
                            {student.user.name} ({student.class.name})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.student_id && (
                      <p className="text-sm text-red-600">{errors.student_id}</p>
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
                    <Label htmlFor="amount_paid">Amount Paid (KES)</Label>
                    <Input
                      id="amount_paid"
                      type="number"
                      placeholder="Enter amount paid"
                      value={data.amount_paid}
                      onChange={(e) => setData('amount_paid', e.target.value)}
                      min="0"
                      step="0.01"
                    />
                    {errors.amount_paid && (
                      <p className="text-sm text-red-600">{errors.amount_paid}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="payment_date">Payment Date</Label>
                    <Input
                      id="payment_date"
                      type="date"
                      value={data.payment_date}
                      onChange={(e) => setData('payment_date', e.target.value)}
                    />
                    {errors.payment_date && (
                      <p className="text-sm text-red-600">{errors.payment_date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="method">Payment Method</Label>
                    <Select 
                      value={data.method} 
                      onValueChange={(val) => setData('method', val)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select Payment Method" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="MPESA">MPESA</SelectItem>
                        <SelectItem value="Bank">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.method && (
                      <p className="text-sm text-red-600">{errors.method}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="reference">Reference / Transaction Code</Label>
                    <Input
                      id="reference"
                      type="text"
                      placeholder="Enter reference or transaction code"
                      value={data.reference}
                      onChange={(e) => setData('reference', e.target.value)}
                    />
                    {errors.reference && (
                      <p className="text-sm text-red-600">{errors.reference}</p>
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
                        Recording...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4" />
                        Record Payment
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

        {/* Payments List Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Payment Records
            </CardTitle>
            <CardDescription>
              All recorded student payments with details
            </CardDescription>
          </CardHeader>
          <CardContent>
            {payments.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments recorded yet</h3>
                <p className="text-gray-600 mb-4">
                  Start by recording your first student payment
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Record First Payment
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total: {payments.length} payments
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
                        <TableHead>Student</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead>Method</TableHead>
                        <TableHead>Reference</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payments.map((payment) => {
                        const PaymentIcon = getPaymentMethodIcon(payment.method);
                        return (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <GraduationCap className="h-4 w-4 text-gray-400" />
                                <div>
                                  <div>{payment.student?.user?.name || 'Unknown Student'}</div>
                                  <div className="text-xs text-gray-500">
                                    {payment.student?.class?.name || 'Unknown Class'}
                                  </div>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{payment.term}</Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Calendar className="h-4 w-4 text-gray-400" />
                                {new Date(payment.payment_date).toLocaleDateString()}
                              </div>
                            </TableCell>
                            <TableCell className="text-right font-medium">
                              <span className="text-green-600">
                                KES {Number(payment.amount).toLocaleString()}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge className={`gap-1 ${getPaymentMethodColor(payment.method)}`}>
                                <PaymentIcon className="h-3 w-3" />
                                {payment.method}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Hash className="h-4 w-4 text-gray-400" />
                                <span className="font-mono text-sm">
                                  {payment.reference || (
                                    <span className="text-gray-400 italic">No reference</span>
                                  )}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
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