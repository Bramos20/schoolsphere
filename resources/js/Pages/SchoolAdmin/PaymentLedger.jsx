import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head } from '@inertiajs/react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/Components/ui/card';
import { Badge } from '@/Components/ui/badge';
import { Alert, AlertDescription } from '@/Components/ui/alert';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { 
  DollarSign, 
  User, 
  Calendar, 
  CreditCard,
  FileText,
  Info,
  AlertCircle,
  TrendingDown,
  Receipt,
  GraduationCap,
  Download
} from 'lucide-react';

export default function PaymentLedger({ school, student, ledger }) {
  // Calculate statistics
  const allRecords = Object.values(ledger).flat();
  const totalPayments = allRecords.reduce((sum, record) => sum + Number(record.amount), 0);
  const paymentCount = allRecords.length;
  const latestBalance = allRecords.length > 0 ? allRecords[allRecords.length - 1].balance_after : 0;
  const termsWithPayments = Object.keys(ledger).length;

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
      <Head title={`Payment Ledger - ${student.name}`} />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Payment Ledger</h1>
            <p className="text-gray-600 mt-1">
              Payment history for {student.name} at {school?.name || 'School'}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-gray-500">Student Details</p>
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium">
                  {student.class || 'N/A'} - {student.stream || 'N/A'}
                </span>
              </div>
            </div>
            <Button asChild variant="outline" className="gap-2">
              <a
                href={`/schools/${school.id}/students/${student.id}/ledger/pdf`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Download className="h-4 w-4" />
                View PDF
              </a>
            </Button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Payments"
            value={`KES ${totalPayments.toLocaleString()}`}
            icon={DollarSign}
            color="green"
            subtitle="All time payments"
          />
          <StatCard
            title="Current Balance"
            value={`KES ${Number(latestBalance).toLocaleString()}`}
            icon={TrendingDown}
            color={latestBalance < 0 ? "red" : "green"}
            subtitle={latestBalance < 0 ? "Amount owed" : "Credit balance"}
          />
          <StatCard
            title="Payment Records"
            value={paymentCount}
            icon={Receipt}
            color="blue"
            subtitle="Total transactions"
          />
          <StatCard
            title="Terms Covered"
            value={termsWithPayments}
            icon={Calendar}
            color="purple"
            subtitle="Academic terms"
          />
        </div>

        {/* Student Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            This ledger shows all payment transactions for {student.name}. 
            Negative balances indicate outstanding fees.
          </AlertDescription>
        </Alert>

        {/* Payment Records */}
        {Object.keys(ledger).length === 0 ? (
          <Card>
            <CardContent className="py-12">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No payments found</h3>
                <p className="text-gray-600">
                  No payment records are available for {student.name} at this time.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Object.entries(ledger).map(([termLabel, records], i) => {
              const termTotal = records.reduce((sum, record) => sum + Number(record.amount), 0);
              const finalBalance = records.length > 0 ? records[records.length - 1].balance_after : 0;
              
              return (
                <Card key={i}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <Calendar className="h-5 w-5 text-blue-600" />
                          {termLabel}
                        </CardTitle>
                        <CardDescription>
                          {records.length} payment{records.length !== 1 ? 's' : ''} recorded
                        </CardDescription>
                      </div>
                      <div className="text-right space-y-1">
                        <Badge variant="secondary" className="gap-1">
                          <DollarSign className="h-3 w-3" />
                          KES {termTotal.toLocaleString()}
                        </Badge>
                        <p className="text-xs text-gray-500">Term total</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Term Summary */}
                      <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <span className="text-sm font-medium text-gray-700">
                          Final Balance for {termLabel}
                        </span>
                        <Badge 
                          variant={finalBalance < 0 ? "destructive" : "secondary"} 
                          className="gap-1"
                        >
                          <DollarSign className="h-3 w-3" />
                          KES {Number(finalBalance).toLocaleString()}
                        </Badge>
                      </div>

                      {/* Payment Table */}
                      <div className="rounded-lg border">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="w-[120px]">Date</TableHead>
                              <TableHead>Amount</TableHead>
                              <TableHead>Method</TableHead>
                              <TableHead>Description</TableHead>
                              <TableHead className="text-right">Balance</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {records.map((p, index) => (
                              <TableRow key={index}>
                                <TableCell className="font-medium">
                                  <div className="flex items-center gap-2">
                                    <Calendar className="h-4 w-4 text-gray-400" />
                                    {p.date}
                                  </div>
                                </TableCell>
                                <TableCell>
                                  <span className="font-medium text-green-600">
                                    KES {Number(p.amount).toLocaleString()}
                                  </span>
                                </TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <CreditCard className="h-4 w-4 text-blue-400" />
                                    <Badge variant="outline">{p.method}</Badge>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-xs">
                                  <div className="flex items-center gap-2">
                                    <FileText className="h-4 w-4 text-gray-400" />
                                    <span className="truncate" title={p.description}>
                                      {p.description}
                                    </span>
                                  </div>
                                </TableCell>
                                <TableCell className="text-right">
                                  <span className={`font-medium ${
                                    Number(p.balance_after) < 0 ? 'text-red-600' : 'text-green-600'
                                  }`}>
                                    KES {Number(p.balance_after).toLocaleString()}
                                  </span>
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppLayout>
  );
}