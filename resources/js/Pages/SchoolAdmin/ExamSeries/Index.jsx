import React, { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import { Plus, Calendar, BookOpen, Users, FileText, Eye, Edit, Trash2, MoreVertical, CheckCircle, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';

export default function ExamSeriesIndex({ school, series }) {
    const handleDelete = (seriesId) => {
        if (confirm('Are you sure you want to delete this exam series?')) {
            router.delete(route('exam-series.destroy', [school.id, seriesId]));
        }
    };

    const handlePublish = (seriesId) => {
        if (confirm('Are you sure you want to publish this exam series? Results will be visible to students and parents.')) {
            router.post(route('exam-series.publish', [school.id, seriesId]));
        }
    };

    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const getSeriesStatus = (serie) => {
        const now = new Date();
        const startDate = new Date(serie.start_date);
        const endDate = new Date(serie.end_date);

        if (now < startDate) {
            return { status: 'upcoming', label: 'Upcoming', color: 'bg-blue-100 text-blue-800' };
        } else if (now >= startDate && now <= endDate) {
            return { status: 'active', label: 'Active', color: 'bg-green-100 text-green-800' };
        } else {
            return { status: 'completed', label: 'Completed', color: 'bg-gray-100 text-gray-800' };
        }
    };

    const getTermLabel = (term) => {
        const termLabels = {
            '1': 'Term 1',
            '2': 'Term 2', 
            '3': 'Term 3'
        };
        return termLabels[term] || `Term ${term}`;
    };

    return (
        <div className="space-y-6">
            <Head title="Exam Series" />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exam Series</h1>
                    <p className="text-muted-foreground">
                        Manage examination periods and term assessments
                    </p>
                </div>
                <Link href={route('exam-series.create', school.id)}>
                    <Button>
                        <Plus className="mr-2 h-4 w-4" />
                        Create Series
                    </Button>
                </Link>
            </div>

            {/* Stats */}
            <div className="grid gap-4 md:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Series</CardTitle>
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{series.length}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Series</CardTitle>
                        <CheckCircle className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {series.filter(s => s.is_active).length}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Exams</CardTitle>
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {series.reduce((total, s) => total + (s.exams_count || 0), 0)}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Published</CardTitle>
                        <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {series.filter(s => s.is_published).length}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Series List */}
            <div className="space-y-4">
                {series.map((serie, index) => {
                    const statusInfo = getSeriesStatus(serie);
                    const examProgress = serie.exams_count > 0 ? 
                        ((serie.exams?.filter(exam => exam.is_published).length || 0) / serie.exams_count) * 100 : 0;

                    return (
                        <Card key={serie.id} className="hover:shadow-md transition-shadow">
                            <CardContent className="pt-6">
                                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                                    {/* Series Info */}
                                    <div className="flex-1 space-y-3">
                                        <div className="flex items-start justify-between">
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-lg font-semibold">{serie.name}</h3>
                                                    <Badge className={statusInfo.color}>
                                                        {statusInfo.label}
                                                    </Badge>
                                                    {serie.is_published && (
                                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                                            Published
                                                        </Badge>
                                                    )}
                                                </div>
                                                
                                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                                    <span className="flex items-center gap-1">
                                                        <Calendar className="h-4 w-4" />
                                                        {serie.academic_year}
                                                    </span>
                                                    <span>{getTermLabel(serie.term)}</span>
                                                    <span>
                                                        {formatDate(serie.start_date)} - {formatDate(serie.end_date)}
                                                    </span>
                                                </div>

                                                {serie.description && (
                                                    <p className="text-sm text-muted-foreground">
                                                        {serie.description}
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        {/* Progress and Stats */}
                                        <div className="grid gap-4 sm:grid-cols-3">
                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Exams</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                                                    <span className="font-medium">{serie.exams_count || 0}</span>
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Progress</p>
                                                <div className="mt-1">
                                                    <div className="flex items-center justify-between text-sm mb-1">
                                                        <span>{Math.round(examProgress)}% Complete</span>
                                                    </div>
                                                    <Progress value={examProgress} className="h-2" />
                                                </div>
                                            </div>

                                            <div>
                                                <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Duration</p>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <Clock className="h-4 w-4 text-muted-foreground" />
                                                    <span className="text-sm">
                                                        {Math.ceil((new Date(serie.end_date) - new Date(serie.start_date)) / (1000 * 60 * 60 * 24))} days
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link href={route('exam-series.show', [school.id, serie.id])}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="mr-2 h-4 w-4" />
                                                View
                                            </Button>
                                        </Link>

                                        <Link href={route('exam-series.reports', [school.id, serie.id])}>
                                            <Button variant="outline" size="sm">
                                                <FileText className="mr-2 h-4 w-4" />
                                                Reports
                                            </Button>
                                        </Link>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild>
                                                    <Link href={route('exam-series.edit', [school.id, serie.id])}>
                                                        <Edit className="mr-2 h-4 w-4" />
                                                        Edit
                                                    </Link>
                                                </DropdownMenuItem>

                                                {!serie.is_published && serie.exams_count > 0 && (
                                                    <DropdownMenuItem onClick={() => handlePublish(serie.id)}>
                                                        <CheckCircle className="mr-2 h-4 w-4" />
                                                        Publish Results
                                                    </DropdownMenuItem>
                                                )}

                                                <DropdownMenuItem 
                                                    onClick={() => handleDelete(serie.id)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                {/* Exams Summary */}
                                {serie.exams && serie.exams.length > 0 && (
                                    <div className="mt-4 pt-4 border-t">
                                        <h4 className="text-sm font-medium mb-2">Recent Exams</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {serie.exams.slice(0, 5).map(exam => (
                                                <Badge key={exam.id} variant="outline" className="text-xs">
                                                    {exam.subject?.name} - {exam.class?.name}
                                                </Badge>
                                            ))}
                                            {serie.exams.length > 5 && (
                                                <Badge variant="outline" className="text-xs">
                                                    +{serie.exams.length - 5} more
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* Empty State */}
            {series.length === 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <Calendar className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No exam series</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Get started by creating your first exam series.
                            </p>
                            <div className="mt-6">
                                <Link href={route('exam-series.create', school.id)}>
                                    <Button>
                                        <Plus className="mr-2 h-4 w-4" />
                                        Create Series
                                    </Button>
                                </Link>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Guidelines */}
            <Card>
                <CardHeader>
                    <CardTitle>Exam Series Management</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <h4 className="font-medium mb-2">Series Planning</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Plan series dates around academic calendar</li>
                                <li>• Create series before scheduling individual exams</li>
                                <li>• Use consistent naming conventions (e.g., "Term 1 2024")</li>
                                <li>• Set appropriate duration for exam completion</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-medium mb-2">Results Management</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Complete all exams before publishing series</li>
                                <li>• Review results for accuracy before publication</li>
                                <li>• Generate term reports after publishing</li>
                                <li>• Communicate results timeline to stakeholders</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}