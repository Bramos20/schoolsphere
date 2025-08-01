import React, { useState } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Search, Filter, Calendar, BookOpen, Users, Award, Eye, Edit, Trash2, FileText, Upload, Clock, TrendingUp, AlertCircle, CheckCircle, Play, Square, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExamsIndex({ school, exams, examSeries, categories, userRole }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedSeries, setSelectedSeries] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');

    const filteredExams = exams.filter(exam => {
        const matchesSearch =
            (exam.name && exam.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (exam.subjects && exam.subjects.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()))) ||
            (exam.classes && exam.classes.some(c => c.name.toLowerCase().includes(searchTerm.toLowerCase())));
        const matchesSeries = !selectedSeries || exam.exam_series_id.toString() === selectedSeries;
        const matchesCategory = !selectedCategory || exam.exam_category_id.toString() === selectedCategory;
        const matchesStatus = !selectedStatus || exam.exam_status === selectedStatus;
        
        return matchesSearch && matchesSeries && matchesCategory && matchesStatus;
    });

    const handleDelete = (examId) => {
        if (confirm('Are you sure you want to delete this exam? This action cannot be undone.')) {
            router.delete(route('exams.destroy', [school.id, examId]));
        }
    };

    const handleStatusChange = (exam, newStatus) => {
        const confirmMessages = {
            'active': 'Are you sure you want to activate this exam? Teachers will be able to enter results.',
            'completed': 'Are you sure you want to mark this exam as completed?',
            'published': 'Are you sure you want to publish the results? Students will be able to view their results.',
        };

        if (confirm(confirmMessages[newStatus] || 'Are you sure you want to change the exam status?')) {
            router.put(route('exams.update', [school.id, exam.id]), {
                ...exam,
                exam_status: newStatus
            }, {
                preserveScroll: true,
                onSuccess: () => {
                    // Optionally show a success message
                }
            });
        }
    };

    const getStatusBadge = (exam) => {
        const statusConfig = {
            'draft': { color: 'bg-gray-100 text-gray-800', icon: Edit },
            'active': { color: 'bg-blue-100 text-blue-800', icon: Clock },
            'completed': { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle },
            'published': { color: 'bg-green-100 text-green-800', icon: CheckCircle }
        };

        const config = statusConfig[exam.exam_status] || statusConfig['draft'];
        const Icon = config.icon;

        return (
            <Badge className={config.color}>
                <Icon className="w-3 h-3 mr-1" />
                {exam.exam_status.charAt(0).toUpperCase() + exam.exam_status.slice(1)}
            </Badge>
        );
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-GB', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getExamProgress = (exam) => {
        // Calculate progress based on exam status and results
        if (exam.exam_status === 'draft') return 0;
        if (exam.exam_status === 'active') return 25;
        if (exam.exam_status === 'completed') return 75;
        if (exam.exam_status === 'published') return 100;
        return 0;
    };

    const getScopeText = (exam) => {
        const classText = exam.scope_type === 'all_school' ? 'All Classes' :
                         exam.scope_type === 'single_class' ? '1 Class' :
                         `${exam.classes?.length || 0} Classes`;
        
        const subjectText = exam.subject_scope_type === 'all_subjects' ? 'All Subjects' :
                           exam.subject_scope_type === 'single_subject' ? '1 Subject' :
                           `${exam.subjects?.length || 0} Subjects`;

        return `${classText} • ${subjectText}`;
    };

    const getAvailableStatusActions = (exam) => {
        const actions = [];
        
        if (exam.exam_status === 'draft') {
            actions.push({ status: 'active', label: 'Activate Exam', icon: Play, color: 'text-blue-600' });
        } else if (exam.exam_status === 'active') {
            actions.push({ status: 'completed', label: 'Mark Completed', icon: Square, color: 'text-yellow-600' });
        } else if (exam.exam_status === 'completed') {
            actions.push({ status: 'published', label: 'Publish Results', icon: CheckCircle, color: 'text-green-600' });
        }
        
        return actions;
    };

    const canEnterResults = (exam) => {
        if (userRole === 'school_admin') {
            return ['draft', 'active', 'completed'].includes(exam.exam_status);
        }
        return ['active', 'completed'].includes(exam.exam_status);
    };

    const totalExams = exams.length;
    const draftExams = exams.filter(e => e.exam_status === 'draft').length;
    const activeExams = exams.filter(e => e.exam_status === 'active').length;
    const publishedExams = exams.filter(e => e.exam_status === 'published').length;

    return (
        <AppLayout>
            <div className="space-y-6">
                <Head title="Exams" />

                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Exams Management</h1>
                        <p className="text-muted-foreground">
                            Manage school examinations, papers, and results for {school.name}
                        </p>
                    </div>
                    {userRole === 'school_admin' && (
                        <Link href={route('exams.create', school.id)}>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Create New Exam
                            </Button>
                        </Link>
                    )}
                </div>

                {/* Stats Cards */}
                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                            <BookOpen className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{totalExams}</div>
                            <p className="text-xs text-muted-foreground">
                                Across all series
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Active Exams</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{activeExams}</div>
                            <p className="text-xs text-muted-foreground">
                                Currently ongoing
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Published Results</CardTitle>
                            <Award className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{publishedExams}</div>
                            <p className="text-xs text-muted-foreground">
                                Results available
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Draft Exams</CardTitle>
                            <Edit className="h-4 w-4 text-gray-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-gray-600">{draftExams}</div>
                            <p className="text-xs text-muted-foreground">
                                Pending setup
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Filter className="h-4 w-4" />
                            Filter & Search
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="lg:col-span-2">
                                <Input
                                    placeholder="Search exams, subjects, or classes..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full"
                                />
                            </div>

                            <Select value={selectedSeries} onValueChange={value => setSelectedSeries(value === 'all' ? '' : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Series" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Series</SelectItem>
                                    {examSeries.map(series => (
                                        <SelectItem key={series.id} value={series.id.toString()}>
                                            {series.name} ({series.academic_year})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>

                            <Select value={selectedCategory} onValueChange={value => setSelectedCategory(value === 'all' ? '' : value)}>
                                <SelectTrigger>
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

                            <Select value={selectedStatus} onValueChange={value => setSelectedStatus(value === 'all' ? '' : value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Status" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    <SelectItem value="draft">Draft</SelectItem>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="published">Published</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Exams List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Exams ({filteredExams.length})</CardTitle>
                        <CardDescription>
                            {filteredExams.length} exam(s) found
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {filteredExams.map((exam) => (
                                <div key={exam.id} className="border rounded-lg p-6 hover:bg-gray-50 transition-colors">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-lg">{exam.name}</h3>
                                                {getStatusBadge(exam)}
                                            </div>
                                            {exam.description && (
                                                <p className="text-sm text-muted-foreground mb-3">
                                                    {exam.description}
                                                </p>
                                            )}
                                            
                                            {/* Progress Bar */}
                                            <div className="mb-4">
                                                <div className="flex justify-between items-center mb-1">
                                                    <span className="text-xs font-medium text-gray-700">Progress</span>
                                                    <span className="text-xs text-gray-500">{getExamProgress(exam)}%</span>
                                                </div>
                                                <Progress value={getExamProgress(exam)} className="h-2" />
                                            </div>
                                        </div>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01" />
                                                    </svg>
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-56">
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('exams.show', [school.id, exam.id])}>
                                                        <Eye className="mr-2 h-4 w-4" />
                                                        View Details
                                                    </Link>
                                                </DropdownMenuItem>

                                                {userRole === 'school_admin' && (
                                                    <>
                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('exams.edit', [school.id, exam.id])}>
                                                                <Edit className="mr-2 h-4 w-4" />
                                                                Edit Exam
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuSeparator />

                                                        {/* Status Actions */}
                                                        {getAvailableStatusActions(exam).map(action => (
                                                            <DropdownMenuItem 
                                                                key={action.status}
                                                                onClick={() => handleStatusChange(exam, action.status)}
                                                                className={action.color}
                                                            >
                                                                <action.icon className="mr-2 h-4 w-4" />
                                                                {action.label}
                                                            </DropdownMenuItem>
                                                        ))}

                                                        <DropdownMenuSeparator />

                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('exams.statistics', [school.id, exam.id])}>
                                                                <BarChart3 className="mr-2 h-4 w-4" />
                                                                View Statistics
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('exams.bulk-import', [school.id, exam.id])}>
                                                                <Upload className="mr-2 h-4 w-4" />
                                                                Import Results
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        <DropdownMenuItem asChild>
                                                            <Link href={route('exams.export', [school.id, exam.id])}>
                                                                <FileText className="mr-2 h-4 w-4" />
                                                                Export Results
                                                            </Link>
                                                        </DropdownMenuItem>

                                                        {exam.exam_status === 'draft' && (
                                                            <>
                                                                <DropdownMenuSeparator />
                                                                <DropdownMenuItem
                                                                    onClick={() => handleDelete(exam.id)}
                                                                    className="text-red-600"
                                                                >
                                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                                    Delete
                                                                </DropdownMenuItem>
                                                            </>
                                                        )}
                                                    </>
                                                )}
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Scope</p>
                                            <div className="mt-1">
                                                <p className="font-medium text-sm">{getScopeText(exam)}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {exam.classes?.map(c => c.name).join(', ') || 'No classes'}
                                                </p>
                                            </div>
                                        </div>

                                        <div>
                                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Subjects</p>
                                            <div className="mt-1">
                                                <p className="font-medium text-sm">
                                                    {exam.subjects?.length || 0} subjects
                                                </p>
                                                <div className="flex flex-wrap gap-1 mt-1">
                                                    {exam.subjects?.slice(0, 3).map(subject => (
                                                        <Badge key={subject.id} variant="secondary" className="text-xs">
                                                            {subject.name}
                                                        </Badge>
                                                    ))}
                                                    {exam.subjects?.length > 3 && (
                                                        <Badge variant="secondary" className="text-xs">
                                                            +{exam.subjects.length - 3} more
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Actions for Results Entry */}
                                    {canEnterResults(exam) && exam.subjects?.length > 0 && (
                                        <div className="mt-4 pt-4 border-t">
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-medium text-muted-foreground">
                                                    Quick Actions:
                                                </p>
                                                <div className="flex flex-wrap gap-2">
                                                    {exam.subjects?.slice(0, 4).map(subject => (
                                                        <Link 
                                                            key={subject.id}
                                                            href={route('exams.enter-results', [school.id, exam.id, subject.id])}
                                                        >
                                                            <Button variant="outline" size="sm" className="text-xs">
                                                                Enter {subject.name} Results
                                                            </Button>
                                                        </Link>
                                                    ))}
                                                    {exam.subjects?.length > 4 && (
                                                        <Link href={route('exams.show', [school.id, exam.id])}>
                                                            <Button variant="outline" size="sm" className="text-xs">
                                                                +{exam.subjects.length - 4} more subjects
                                                            </Button>
                                                        </Link>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Status-specific alerts */}
                                    {exam.exam_status === 'draft' && userRole === 'school_admin' && (
                                        <div className="mt-4 pt-4 border-t">
                                            <Alert>
                                                <AlertCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    This exam is in draft mode. 
                                                    <Link 
                                                        href={route('exams.edit', [school.id, exam.id])}
                                                        className="ml-1 underline text-blue-600 hover:text-blue-800"
                                                    >
                                                        Activate it
                                                    </Link> to allow result entry.
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    )}

                                    {exam.exam_status === 'completed' && userRole === 'school_admin' && (
                                        <div className="mt-4 pt-4 border-t">
                                            <Alert>
                                                <CheckCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    Exam completed! Ready to publish results when finalized.
                                                </AlertDescription>
                                            </Alert>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        {filteredExams.length === 0 && (
                            <div className="text-center py-12">
                                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                                <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No exams found</h3>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {searchTerm || selectedSeries || selectedCategory || selectedStatus ? 
                                        'Try adjusting your filters to see more results.' :
                                        'Get started by creating your first exam.'
                                    }
                                </p>
                                {userRole === 'school_admin' && !searchTerm && !selectedSeries && !selectedCategory && !selectedStatus && (
                                    <div className="mt-6">
                                        <Link href={route('exams.create', school.id)}>
                                            <Button>
                                                <Plus className="mr-2 h-4 w-4" />
                                                Create Your First Exam
                                            </Button>
                                        </Link>
                                    </div>
                                )}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
} 