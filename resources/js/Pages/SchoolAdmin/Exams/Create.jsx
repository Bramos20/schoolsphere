import React, { useState, useEffect } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { ArrowLeft, Save, Clock, Calendar, BookOpen, Users, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function ExamsCreate({ school, classes, subjects, examSeries, categories, gradingSystems }) {
    const [selectedClass, setSelectedClass] = useState('');
    const [availableStreams, setAvailableStreams] = useState([]);
    const [showPracticalFields, setShowPracticalFields] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        exam_series_id: '',
        exam_category_id: '',
        grading_system_id: '',
        class_id: '',
        stream_id: '',
        subject_id: '',
        name: '',
        description: '',
        date: '',
        start_time: '',
        end_time: '',
        duration_minutes: '',
        total_marks: '',
        pass_mark: '',
        has_practical: false,
        practical_percentage: '',
        theory_percentage: '',
        instructions: ''
    });

    // Update available streams when class changes
    useEffect(() => {
        if (selectedClass) {
            const classData = classes.find(c => c.id.toString() === selectedClass);
            setAvailableStreams(classData?.streams || []);
            setData(prev => ({ ...prev, class_id: selectedClass, stream_id: '' }));
        }
    }, [selectedClass]);

    // Calculate duration when times change
    useEffect(() => {
        if (data.start_time && data.end_time) {
            const start = new Date(`2000-01-01T${data.start_time}`);
            const end = new Date(`2000-01-01T${data.end_time}`);
            const diffMinutes = (end - start) / (1000 * 60);
            if (diffMinutes > 0) {
                setData('duration_minutes', diffMinutes.toString());
            }
        }
    }, [data.start_time, data.end_time]);

    // Auto-adjust percentages for practical exams
    useEffect(() => {
        if (showPracticalFields) {
            if (data.practical_percentage && !data.theory_percentage) {
                setData('theory_percentage', (100 - parseFloat(data.practical_percentage)).toString());
            }
        } else {
            setData(prev => ({
                ...prev,
                practical_percentage: '',
                theory_percentage: ''
            }));
        }
    }, [showPracticalFields, data.practical_percentage]);

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('exams.store', school.id));
    };

    const validatePercentages = () => {
        if (showPracticalFields) {
            const practical = parseFloat(data.practical_percentage) || 0;
            const theory = parseFloat(data.theory_percentage) || 0;
            return practical + theory === 100;
        }
        return true;
    };

    return (
        <div className="space-y-6">
            <Head title="Create Exam" />

            {/* Header */}
            <div className="flex items-center gap-4">
                <Link href={route('exams.index', school.id)}>
                    <Button variant="outline" size="sm">
                        <ArrowLeft className="mr-2 h-4 w-4" />
                        Back to Exams
                    </Button>
                </Link>
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Create New Exam</h1>
                    <p className="text-muted-foreground">
                        Set up a new examination for your school
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 lg:grid-cols-3">
                    {/* Basic Information */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <BookOpen className="h-5 w-5" />
                                    Basic Information
                                </CardTitle>
                                <CardDescription>
                                    Enter the basic details of the exam
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">Exam Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={e => setData('name', e.target.value)}
                                            placeholder="e.g., Mathematics Mid-Term Exam"
                                        />
                                        {errors.name && (
                                            <p className="text-sm text-red-600">{errors.name}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="subject_id">Subject *</Label>
                                        <Select value={data.subject_id} onValueChange={value => setData('subject_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select subject" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {subjects.map(subject => (
                                                    <SelectItem key={subject.id} value={subject.id.toString()}>
                                                        {subject.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.subject_id && (
                                            <p className="text-sm text-red-600">{errors.subject_id}</p>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={data.description}
                                        onChange={e => setData('description', e.target.value)}
                                        placeholder="Optional description of the exam"
                                        rows={3}
                                    />
                                </div>

                                <div className="grid gap-4 md:grid-cols-3">
                                    <div className="space-y-2">
                                        <Label htmlFor="exam_series_id">Exam Series *</Label>
                                        <Select value={data.exam_series_id} onValueChange={value => setData('exam_series_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select series" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {examSeries.map(series => (
                                                    <SelectItem key={series.id} value={series.id.toString()}>
                                                        {series.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.exam_series_id && (
                                            <p className="text-sm text-red-600">{errors.exam_series_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="exam_category_id">Category *</Label>
                                        <Select value={data.exam_category_id} onValueChange={value => setData('exam_category_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select category" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {categories.map(category => (
                                                    <SelectItem key={category.id} value={category.id.toString()}>
                                                        {category.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.exam_category_id && (
                                            <p className="text-sm text-red-600">{errors.exam_category_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="grading_system_id">Grading System *</Label>
                                        <Select value={data.grading_system_id} onValueChange={value => setData('grading_system_id', value)}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select grading" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gradingSystems.map(system => (
                                                    <SelectItem key={system.id} value={system.id.toString()}>
                                                        {system.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.grading_system_id && (
                                            <p className="text-sm text-red-600">{errors.grading_system_id}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Class and Stream Selection */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="h-5 w-5" />
                                    Target Students
                                </CardTitle>
                                <CardDescription>
                                    Select the class and stream for this exam
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <Label htmlFor="class_id">Class *</Label>
                                        <Select value={selectedClass} onValueChange={setSelectedClass}>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select class" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {classes.map(cls => (
                                                    <SelectItem key={cls.id} value={cls.id.toString()}>
                                                        {cls.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.class_id && (
                                            <p className="text-sm text-red-600">{errors.class_id}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="stream_id">Stream (Optional)</Label>
                                        <Select 
                                            value={data.stream_id} 
                                            onValueChange={value => setData('stream_id', value)}
                                            disabled={!selectedClass || availableStreams.length === 0}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder={
                                                    !selectedClass ? "Select class first" : 
                                                    availableStreams.length === 0 ? "No streams available" : 
                                                    "Select stream (optional)"
                                                } />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {availableStreams.map(stream => (
                                                    <SelectItem key={stream.id} value={stream.id.toString()}>
                                                        {stream.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        {errors.stream_id && (
                                            <p className="text-sm text-red-600">{errors.stream_id}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Exam Schedule */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="h-5 w-5" />
                                    Schedule
                                </CardTitle>
                                <CardDescription>
                                    Set the date and time for the exam
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid gap-4 md:grid-cols-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="date">Exam Date *</Label>
                                        <Input
                                            id="date"
                                            type="date"
                                            value={data.date}
                                            onChange={e => setData('date', e.target.value)}
                                        />
                                        {errors.date && (
                                            <p className="text-sm text-red-600">{errors.date}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="start_time">Start Time *</Label>
                                        <Input
                                            id="start_time"
                                            type="time"
                                            value={data.start_time}
                                            onChange={e => setData('start_time', e.target.value)}
                                        />
                                        {errors.start_time && (
                                            <p className="text-sm text-red-600">{errors.start_time}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="end_time">End Time *</Label>
                                        <Input
                                            id="end_time"
                                            type="time"
                                            value={data.end_time}
                                            onChange={e => setData('end_time', e.target.value)}
                                        />
                                        {errors.end_time && (
                                            <p className="text-sm text-red-600">{errors.end_time}</p>
                                        )}
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                                        <Input
                                            id="duration_minutes"
                                            type="number"
                                            value={data.duration_minutes}
                                            onChange={e => setData('duration_minutes', e.target.value)}
                                            readOnly
                                            className="bg-muted"
                                        />
                                        {errors.duration_minutes && (
                                            <p className="text-sm text-red-600">{errors.duration_minutes}</p>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Instructions */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Exam Instructions</CardTitle>
                                <CardDescription>
                                    Special instructions for students taking this exam
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Textarea
                                    value={data.instructions}
                                    onChange={e => setData('instructions', e.target.value)}
                                    placeholder="Enter any special instructions for this exam..."
                                    rows={4}
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Marks Configuration */}
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Settings className="h-5 w-5" />
                                    Marks Configuration
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="total_marks">Total Marks *</Label>
                                    <Input
                                        id="total_marks"
                                        type="number"
                                        value={data.total_marks}
                                        onChange={e => setData('total_marks', e.target.value)}
                                        placeholder="100"
                                    />
                                    {errors.total_marks && (
                                        <p className="text-sm text-red-600">{errors.total_marks}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="pass_mark">Pass Mark *</Label>
                                    <Input
                                        id="pass_mark"
                                        type="number"
                                        value={data.pass_mark}
                                        onChange={e => setData('pass_mark', e.target.value)}
                                        placeholder="50"
                                    />
                                    {errors.pass_mark && (
                                        <p className="text-sm text-red-600">{errors.pass_mark}</p>
                                    )}
                                </div>

                                {/* Practical Component */}
                                <div className="space-y-4">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="has_practical"
                                            checked={showPracticalFields}
                                            onCheckedChange={(checked) => {
                                                setShowPracticalFields(checked);
                                                setData('has_practical', checked);
                                            }}
                                        />
                                        <Label htmlFor="has_practical">Has Practical Component</Label>
                                    </div>

                                    {showPracticalFields && (
                                        <div className="space-y-3 pl-6 border-l-2 border-blue-200">
                                            <div className="space-y-2">
                                                <Label htmlFor="theory_percentage">Theory Percentage *</Label>
                                                <Input
                                                    id="theory_percentage"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={data.theory_percentage}
                                                    onChange={e => setData('theory_percentage', e.target.value)}
                                                    placeholder="70"
                                                />
                                                {errors.theory_percentage && (
                                                    <p className="text-sm text-red-600">{errors.theory_percentage}</p>
                                                )}
                                            </div>

                                            <div className="space-y-2">
                                                <Label htmlFor="practical_percentage">Practical Percentage *</Label>
                                                <Input
                                                    id="practical_percentage"
                                                    type="number"
                                                    min="0"
                                                    max="100"
                                                    value={data.practical_percentage}
                                                    onChange={e => setData('practical_percentage', e.target.value)}
                                                    placeholder="30"
                                                />
                                                {errors.practical_percentage && (
                                                    <p className="text-sm text-red-600">{errors.practical_percentage}</p>
                                                )}
                                            </div>

                                            {!validatePercentages() && (
                                                <Alert>
                                                    <AlertDescription>
                                                        Theory and practical percentages must add up to 100%
                                                    </AlertDescription>
                                                </Alert>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="space-y-3">
                                    <Button 
                                        type="submit" 
                                        className="w-full" 
                                        disabled={processing || !validatePercentages()}
                                    >
                                        <Save className="mr-2 h-4 w-4" />
                                        {processing ? 'Creating...' : 'Create Exam'}
                                    </Button>
                                    
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        className="w-full"
                                        onClick={() => reset()}
                                    >
                                        Reset Form
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </form>
        </div>
    );
}