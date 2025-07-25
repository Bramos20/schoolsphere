import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Calendar, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExamSeriesCreate({ school }) {
    const { data, setData, post, processing, errors } = useForm({
        name: '',
        description: '',
        academic_year: new Date().getFullYear().toString(),
        term: '',
        start_date: '',
        end_date: ''
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('exam-series.store', school.id));
    };

    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = currentYear - 2; i <= currentYear + 2; i++) {
        years.push(i.toString());
    }

    return (
        <div className="space-y-6">
            <Head title="Create Exam Series" />

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={route('exam-series.index', school.id)}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create Exam Series</h1>
                    <p className="text-muted-foreground">
                        Set up a new examination period for your school
                    </p>
                </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Main Form */}
                <div className="lg:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Series Details</CardTitle>
                            <CardDescription>
                                Configure the basic information for your exam series
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {/* Series Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name">Series Name *</Label>
                                    <Input
                                        id="name"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., End of Term 1 Examinations"
                                        className={errors.name ? 'border-red-500' : ''}
                                    />
                                    {errors.name && (
                                        <p className="text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Optional description for this exam series"
                                        rows={3}
                                        className={errors.description ? 'border-red-500' : ''}
                                    />
                                    {errors.description && (
                                        <p className="text-sm text-red-600">{errors.description}</p>
                                    )}
                                </div>

                                {/* Academic Year and Term */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="academic_year">Academic Year *</Label>
                                        <Select
                                            value={data.academic_year}
                                            onValueChange={(value) => setData('academic_year', value)}
                                        >
                                            <SelectTrigger className={errors.academic_year ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select academic year" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {years.map(year => (
                                                    <SelectItem key={year} value={year}>
                                                        {year}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.academic_year && (
                                            <p className="text-sm text-red-600">{errors.academic_year}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="term">Term *</Label>
                                        <Select
                                            value={data.term}
                                            onValueChange={(value) => setData('term', value)}
                                        >
                                            <SelectTrigger className={errors.term ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select term" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="1">Term 1</SelectItem>
                                                <SelectItem value="2">Term 2</SelectItem>
                                                <SelectItem value="3">Term 3</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        {errors.term && (
                                            <p className="text-sm text-red-600">{errors.term}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Date Range */}
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="start_date">Start Date *</Label>
                                        <Input
                                            id="start_date"
                                            type="date"
                                            value={data.start_date}
                                            onChange={(e) => setData('start_date', e.target.value)}
                                            className={errors.start_date ? 'border-red-500' : ''}
                                        />
                                        {errors.start_date && (
                                            <p className="text-sm text-red-600">{errors.start_date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_date">End Date *</Label>
                                        <Input
                                            id="end_date"
                                            type="date"
                                            value={data.end_date}
                                            onChange={(e) => setData('end_date', e.target.value)}
                                            min={data.start_date}
                                            className={errors.end_date ? 'border-red-500' : ''}
                                        />
                                        {errors.end_date && (
                                            <p className="text-sm text-red-600">{errors.end_date}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="flex justify-end pt-4">
                                    <Button onClick={handleSubmit} disabled={processing}>
                                        {processing ? (
                                            <>
                                                <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                                Creating...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="mr-2 h-4 w-4" />
                                                Create Series
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Guidelines */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Calendar className="h-5 w-5" />
                                Guidelines
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-medium mb-2">Series Planning</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Use clear, descriptive names</li>
                                    <li>• Align with academic calendar</li>
                                    <li>• Allow sufficient time for all exams</li>
                                    <li>• Consider marking and result processing time</li>
                                </ul>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Best Practices</h4>
                                <ul className="text-sm text-muted-foreground space-y-1">
                                    <li>• Create series before scheduling exams</li>
                                    <li>• Include buffer days for delays</li>
                                    <li>• Coordinate with other school activities</li>
                                    <li>• Communicate dates to all stakeholders</li>
                                </ul>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Quick Reference */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Reference</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3 text-sm">
                                <div>
                                    <p className="font-medium">Typical Duration</p>
                                    <p className="text-muted-foreground">2-4 weeks per series</p>
                                </div>
                                <div>
                                    <p className="font-medium">Next Steps</p>
                                    <p className="text-muted-foreground">
                                        Create individual exams within this series
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium">Publishing</p>
                                    <p className="text-muted-foreground">
                                        Results can be published after all exams are complete
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Warning */}
                    <Alert>
                        <AlertDescription>
                            Once created, you can add individual exams to this series. 
                            Make sure the dates allow sufficient time for all planned examinations.
                        </AlertDescription>
                    </Alert>
                </div>
            </div>
        </div>
    );
}