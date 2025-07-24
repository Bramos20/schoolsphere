import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, Calendar, BookOpen, Users, Award, Eye, Edit, Trash2, FileText, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

export default function ExamsIndex({ school, exams, examSeries, categories }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeries, setSelectedSeries] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');

    const filteredExams = exams.filter(exam => {
        const matchesSearch = exam.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exam.subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            exam.class.name.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSeries = !selectedSeries || exam.exam_series_id.toString() === selectedSeries;
        const matchesCategory = !selectedCategory || exam.exam_category_id.toString() === selectedCategory;
        
        return matchesSearch && matchesSeries && matchesCategory;
    });

    const handleDelete = (examId) => {
        if (confirm('Are you sure you want to delete this exam?')) {
            router.delete(route('exams.destroy', [school.id, examId]));
        }
    };

    const getStatusBadge = (exam) => {
        if (exam.is_published) {
            return <Badge className="bg-green-100 text-green-800">Published</Badge>;
        }
        if (exam.results_count > 0) {
            return <Badge className="bg-blue-100 text-blue-800">Results Entered</Badge>;
        }
        return <Badge className="bg-gray-100 text-gray-800">Pending</Badge>;
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatTime = (time) => {
        return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        });
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <Head title="Exams" />

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Exams</h1>
                        <p className="text-muted-foreground">
                            Manage school examinations and results
                        </p>
                    </div>
                    <Link href={route('exams.create', school.id)}>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" />
                            Create Exam
                        </Button>
                    </Link>
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{exams.length}</div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published</CardTitle>
                            <Award className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {exams.filter(exam => exam.is_published).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Results</CardTitle>
                            <Users className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {exams.filter(exam => !exam.is_published && exam.results_count === 0).length}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Series</CardTitle>
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {examSeries.filter(series => series.is_active).length}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filter Exams</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search exams, subjects, or classes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="max-w-sm"
                                />
                            </div>

                            <Select value={selectedSeries} onValueChange={value => setSelectedSeries(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All Series" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Series</SelectItem>
                                    {examSeries.map(series => (
                                        <SelectItem key={series.id} value={series.id.toString()}>
                                            {series.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedCategory} onValueChange={value => setSelectedCategory(value === 'all' ? '' : value)}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="All Categories" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Categories</SelectItem>
                                    {categories.map(category => (
                                        <SelectItem key={category.id} value={category.id.toString()}>
                                            {category.name}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Exams Grid */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exams List</CardTitle>
                        <CardDescription>
                            {filteredExams.length} exam(s) found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredExams.map((exam) => (
                                <div key={exam.id} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1 space-y-3">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="font-semibold text-lg">{exam.name}</h3>
                                                    {exam.description && (
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            {exam.description}
                                                        </p>
                                                    )}
                                                </div>
                                                {getStatusBadge(exam)}
                                            </div>

                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Series & Category</p>
                                                    <div className="space-y-1 mt-1">
                                                        <Badge variant="outline" className="mr-1">{exam.exam_series ? exam.exam_series.name : 'N/A'}</Badge>
                                                        {exam.exam_category ? (
                                                            <Badge
                                                                variant="outline"
                                                                style={{
                                                                    backgroundColor: exam.exam_category.color + '20',
                                                                    borderColor: exam.exam_category.color
                                                                }}
                                                            >
                                                                {exam.exam_category.name}
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="outline">N/A</Badge>
                                                        )}
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Class & Subject</p>
                                                    <div className="mt-1">
                                                        <p className="font-medium">
                                                            {exam.class.name}
                                                            {exam.stream && ` - ${exam.stream.name}`}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {exam.subject.name}
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Date & Time</p>
                                                    <div className="mt-1">
                                                        <p className="font-medium">{formatDate(exam.date)}</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            {formatTime(exam.start_time)} - {formatTime(exam.end_time)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground">
                                                            {exam.duration_minutes} min
                                                        </p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Marks</p>
                                                    <div className="mt-1">
                                                        <p className="font-medium">{exam.total_marks} marks</p>
                                                        <p className="text-sm text-muted-foreground">
                                                            Pass: {exam.pass_mark}
                                                        </p>
                                                        {exam.has_practical && (
                                                            <p className="text-xs text-muted-foreground">
                                                                Theory: {exam.theory_percentage}% | Practical: {exam.practical_percentage}%
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('exams.show', [school.id, exam.id])}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem asChild>
                                                    <Link href={route('exams.edit', [school.id, exam.id])}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem asChild>
                                                    <Link href={route('exams.bulk-import', [school.id, exam.id])}>
                                                        <Upload className="mr-2 h-4 w-4" />
                                                        Import Results
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem asChild>
                                                    <Link href={route('exams.reports', [school.id, exam.id])}>
                                                        <FileText className="mr-2 h-4 w-4" />
                                                        Reports
                                                    </Link>
                                                </DropdownMenuItem>

                                                <DropdownMenuItem
                                                    onClick={() => handleDelete(exam.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {filteredExams.length === 0 && (
                            <div className="text-center py-8">
                                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No exams found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    Get started by creating your first exam.
                                </p>
                                <div className="mt-6">
                                    <Link href={route('exams.create', school.id)}>
                                        <Button>
                                            <Plus className="mr-2 h-4 w-4" />
                                            Create Exam
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}