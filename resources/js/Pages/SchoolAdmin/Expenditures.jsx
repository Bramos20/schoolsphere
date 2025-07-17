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
  SelectValue,
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
  Receipt, 
  TrendingDown, 
  Plus,
  Trash2,
  AlertCircle,
  CheckCircle,
  Info,
  CreditCard,
  List,
  Building,
  User,
  FileText
} from 'lucide-react';

export default function Expenditures({ school, expenditures }) {
  const [showForm, setShowForm] = useState(false);
  
  const { data, setData, post, delete: destroy, processing, reset, errors } = useForm({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: '',
    paid_to: '',
    term: 'Term 1',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('expenditures.store', school.id), {
      preserveScroll: true,
      onSuccess: () => {
        reset('description', 'amount', 'category', 'paid_to', 'term');
        setShowForm(false);
      },
    });
  };

  const handleDelete = (expenditureId) => {
    if (confirm('Are you sure you want to delete this expenditure?')) {
      destroy(route('expenditures.destroy', [school.id, expenditureId]), {
        preserveScroll: true,
      });
    }
  };

  // Calculate statistics
  const totalExpenditure = expenditures.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const currentYear = new Date().getFullYear();
  const currentYearExpenses = expenditures.filter(exp => new Date(exp.date).getFullYear() === currentYear);
  const currentYearTotal = currentYearExpenses.reduce((sum, exp) => sum + Number(exp.amount), 0);
  const categoriesCount = [...new Set(expenditures.map(exp => exp.category))].length;
  const avgExpenditure = expenditures.length > 0 ? (totalExpenditure / expenditures.length) : 0;

  // Get category breakdown
  const categoryBreakdown = expenditures.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + Number(exp.amount);
    return acc;
  }, {});

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

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Salaries': return User;
      case 'Utilities': return Building;
      case 'Maintenance': return FileText;
      case 'Supplies': return Receipt;
      case 'Transport': return CreditCard;
      default: return DollarSign;
    }
  };

  const getCategoryColor = (category) => {
    switch(category) {
      case 'Salaries': return 'bg-blue-100 text-blue-800';
      case 'Utilities': return 'bg-green-100 text-green-800';
      case 'Maintenance': return 'bg-yellow-100 text-yellow-800';
      case 'Supplies': return 'bg-purple-100 text-purple-800';
      case 'Transport': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <AppLayout>
      <Head title="School Expenditures" />
      
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">School Expenditures</h1>
            <p className="text-gray-600 mt-1">
              Track and manage expenses for {school?.name || 'School'}
            </p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            {showForm ? 'Cancel' : 'Record Expenditure'}
          </Button>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Expenditure"
            value={`KES ${totalExpenditure.toLocaleString()}`}
            icon={DollarSign}
            color="red"
            subtitle="All time total"
          />
          <StatCard
            title="Current Year"
            value={`KES ${currentYearTotal.toLocaleString()}`}
            icon={TrendingDown}
            color="orange"
            subtitle={`${currentYear} expenses`}
          />
          <StatCard
            title="Total Records"
            value={expenditures.length}
            icon={Receipt}
            color="blue"
            subtitle="All expenditures"
          />
          <StatCard
            title="Categories"
            value={categoriesCount}
            icon={List}
            color="purple"
            subtitle="Expense categories"
          />
        </div>

        {/* Category Breakdown */}
        {Object.keys(categoryBreakdown).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <List className="h-5 w-5" />
                Category Breakdown
              </CardTitle>
              <CardDescription>
                Expenses by category for better budget analysis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Object.entries(categoryBreakdown).map(([category, amount]) => {
                  const Icon = getCategoryIcon(category);
                  return (
                    <div key={category} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <span className="font-medium">{category}</span>
                      </div>
                      <Badge variant="secondary">
                        KES {amount.toLocaleString()}
                      </Badge>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Info Alert */}
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Track all school expenses systematically. Categorize expenditures for better financial planning and budget management.
          </AlertDescription>
        </Alert>

        {/* Form Section */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Record New Expenditure
              </CardTitle>
              <CardDescription>
                Enter the details of the expenditure for proper financial tracking
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                      id="description"
                      placeholder="Enter expenditure description"
                      value={data.description}
                      onChange={(e) => setData('description', e.target.value)}
                    />
                    {errors.description && (
                      <p className="text-sm text-red-600">{errors.description}</p>
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
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={data.date}
                      onChange={(e) => setData('date', e.target.value)}
                    />
                    {errors.date && (
                      <p className="text-sm text-red-600">{errors.date}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="paid_to">Paid To (Optional)</Label>
                    <Input
                      id="paid_to"
                      placeholder="Recipient or vendor name"
                      value={data.paid_to}
                      onChange={(e) => setData('paid_to', e.target.value)}
                    />
                    {errors.paid_to && (
                      <p className="text-sm text-red-600">{errors.paid_to}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={data.category} onValueChange={(value) => setData('category', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Salaries">Salaries</SelectItem>
                        <SelectItem value="Utilities">Utilities</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Supplies">Supplies</SelectItem>
                        <SelectItem value="Transport">Transport</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    {errors.category && (
                      <p className="text-sm text-red-600">{errors.category}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="term">Term</Label>
                    <Select value={data.term} onValueChange={(value) => setData('term', value)}>
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
                        Record Expenditure
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

        {/* Expenditure Records Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Expenditure Records
            </CardTitle>
            <CardDescription>
              All recorded expenditures with detailed information
            </CardDescription>
          </CardHeader>
          <CardContent>
            {expenditures.length === 0 ? (
              <div className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No expenditures recorded yet</h3>
                <p className="text-gray-600 mb-4">
                  Start tracking your school expenses by recording the first expenditure
                </p>
                <Button 
                  onClick={() => setShowForm(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Record First Expenditure
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Summary row */}
                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Total: {expenditures.length} records
                  </span>
                  <Badge variant="secondary" className="gap-1">
                    <DollarSign className="h-3 w-3" />
                    KES {totalExpenditure.toLocaleString()}
                  </Badge>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Paid To</TableHead>
                        <TableHead>Term</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expenditures.map((exp) => (
                        <TableRow key={exp.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-gray-400" />
                              {new Date(exp.date).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell className="max-w-xs">
                            <div className="truncate" title={exp.description}>
                              {exp.description}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getCategoryColor(exp.category)}>
                              {exp.category}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="truncate max-w-[120px]" title={exp.paid_to || 'Not specified'}>
                                {exp.paid_to || 'Not specified'}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{exp.term || 'N/A'}</Badge>
                          </TableCell>
                          <TableCell className="text-right font-medium">
                            <span className="text-red-600">
                              KES {Number(exp.amount).toLocaleString()}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDelete(exp.id)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden grid gap-4">
                  {expenditures.map((exp) => (
                    <Card key={exp.id}>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg truncate">{exp.description}</CardTitle>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(exp.id)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <Badge className={getCategoryColor(exp.category)}>
                              {exp.category}
                            </Badge>
                            <Badge variant="outline">{exp.term || 'N/A'}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Calendar className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">
                                {new Date(exp.date).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="text-lg font-medium text-red-600">
                              KES {Number(exp.amount).toLocaleString()}
                            </span>
                          </div>
                          {exp.paid_to && (
                            <div className="flex items-center gap-2">
                              <User className="h-3 w-3 text-gray-400" />
                              <span className="text-sm text-gray-600">{exp.paid_to}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}