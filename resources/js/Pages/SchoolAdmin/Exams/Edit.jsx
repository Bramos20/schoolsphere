import React, { useState, useEffect } from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { Head, Link, useForm, router } from '@inertiajs/react';
import { ArrowLeft, Save, Calendar, BookOpen, Users, Settings, Plus, Minus, AlertTriangle, Info, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

export default function EditExam({ school, exam, classes, subjects, examSeries, categories, gradingSystems }) {
    const { data, setData, put, processing, errors, clearErrors } = useForm({
        name: exam.name || '',
        description: exam.description || '',
        exam_series_id: exam.exam_series_id || '',
        exam_category_id: exam.exam_category_id || '',
        grading_system_id: exam.grading_system_id || '',
        start_date: exam.start_date || '',
        end_date: exam.end_date || '',
        instructions: exam.instructions || '',
        scope_type: exam.scope_type || 'all_school',
        subject_scope_type: exam.subject_scope_type || 'all_subjects',
        exam_status: exam.exam_status || 'draft',
        selected_classes: exam.selected_classes || [],
        selected_subjects: exam.selected_subjects || [],
        single_class_id: exam.single_class_id || '',
        single_subject_id: exam.single_subject_id || '',
        subject_settings: exam.subject_settings || []
    });

    const [activeTab, setActiveTab] = useState('basic');
    const [selectedGradingSystem, setSelectedGradingSystem] = useState(null);

    useEffect(() => {
        if (data.grading_system_id) {
            const system = gradingSystems.find(gs => gs.id.toString() === data.grading_system_id.toString());
            setSelectedGradingSystem(system);
        }
    }, [data.grading_system_id, gradingSystems]);

    // Status change handlers
    const getStatusOptions = () => {
        const currentStatus = exam.exam_status;
        const options = [
            { value: 'draft', label: 'Draft', description: 'Exam is being prepared' },
            { value: 'active', label: 'Active', description: 'Exam is ongoing, results can be entered' },
            { value: 'completed', label: 'Completed', description: 'Exam finished, results being finalized' },
            { value: 'published', label: 'Published', description: 'Results are visible to students' }
        ];

        // Filter based on current status and allowed transitions
        if (currentStatus === 'draft') {
            return options.filter(opt => ['draft', 'active'].includes(opt.value));
        } else if (currentStatus === 'active') {
            return options.filter(opt => ['active', 'completed'].includes(opt.value));
        } else if (currentStatus === 'completed') {
            return options.filter(opt => ['completed', 'published'].includes(opt.value));
        } else if (currentStatus === 'published') {
            return options.filter(opt => opt.value === 'published');
        }
        
        return options;
    };

    const getStatusBadge = (status) => {
        const config = {
            draft: { color: 'bg-gray-100 text-gray-800', icon: Settings },
            active: { color: 'bg-blue-100 text-blue-800', icon: Calendar },
            completed: { color: 'bg-yellow-100 text-yellow-800', icon: AlertTriangle },
            published: { color: 'bg-green-100 text-green-800', icon: CheckCircle }
        };
        
        const { color, icon: Icon } = config[status] || config.draft;
        
        return (
            <Badge className={color}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
        );
    };

    // Subject settings helpers
    const getRelevantSubjects = () => {
        switch (data.subject_scope_type) {
            case 'all_subjects':
                return subjects;
            case 'selected_subjects':
                return subjects.filter(s => data.selected_subjects.includes(s.id));
            case 'single_subject':
                return subjects.filter(s => s.id.toString() === data.single_subject_id.toString());
            default:
                return [];
        }
    };

    const updateSubjectSettings = (subjectId, field, value) => {
        const settings = [...data.subject_settings];
        const index = settings.findIndex(s => s.subject_id === subjectId);
        
        if (index >= 0) {
            settings[index] = { ...settings[index], [field]: value };
        } else {
            settings.push({
                subject_id: subjectId,
                total_marks: 100,
                pass_mark: 40,
                has_papers: false,
                paper_count: 1,
                papers: [],
                [field]: value
            });
        }
        
        setData('subject_settings', settings);
    };

    const getSubjectSetting = (subjectId, field, defaultValue = null) => {
        const setting = data.subject_settings.find(s => s.subject_id === subjectId);
        return setting ? setting[field] : defaultValue;
    };

    const addPaper = (subjectId) => {
        const settings = [...data.subject_settings];
        const index = settings.findIndex(s => s.subject_id === subjectId);
        
        if (index >= 0) {
            const papers = settings[index].papers || [];
            papers.push({
                name: `Paper ${papers.length + 1}`,
                marks: 100,
                pass_mark: 40,
                duration_minutes: 120,
                weight: 100 / (papers.length + 1),
                instructions: ''
            });
            
            // Redistribute weights evenly
            papers.forEach(paper => {
                paper.weight = 100 / papers.length;
            });
            
            settings[index] = { ...settings[index], papers, paper_count: papers.length };
            setData('subject_settings', settings);
        }
    };

    const removePaper = (subjectId, paperIndex) => {
        const settings = [...data.subject_settings];
        const index = settings.findIndex(s => s.subject_id === subjectId);
        
        if (index >= 0) {
            const papers = settings[index].papers.filter((_, i) => i !== paperIndex);
            
            // Redistribute weights evenly
            papers.forEach(paper => {
                paper.weight = papers.length > 0 ? 100 / papers.length : 100;
            });
            
            settings[index] = { ...settings[index], papers, paper_count: papers.length };
            setData('subject_settings', settings);
        }
    };

    const updatePaper = (subjectId, paperIndex, field, value) => {
        const settings = [...data.subject_settings];
        const index = settings.findIndex(s => s.subject_id === subjectId);
        
        if (index >= 0 && settings[index].papers[paperIndex]) {
            settings[index].papers[paperIndex][field] = value;
            setData('subject_settings', settings);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        clearErrors();
        
        put(route('exams.update', [school.id, exam.id]), {
            preserveScroll: true,
        });
    };

    const handleStatusChange = (newStatus) => {
        if (newStatus !== data.exam_status) {
            const confirmMessage = newStatus === 'active' 
                ? 'Are you sure you want to activate this exam? Students and teachers will be able to access it.'
                : newStatus === 'published'
                ? 'Are you sure you want to publish the results? Students will be able to view their results.'
                : `Are you sure you want to change the exam status to ${newStatus}?`;
                
            if (confirm(confirmMessage)) {
                setData('exam_status', newStatus);
            }
        }
    };

    return (
        <AppLayout>
            <div className="space-y-6">
                <Head title={`Edit ${exam.name}`} />

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Link 
                            href={route('exams.show', [school.id, exam.id])}
                            className="text-muted-foreground hover:text-foreground"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight">Edit Exam</h1>
                            <div className="flex items-center gap-3 mt-1">
                                <p className="text-muted-foreground">{exam.name}</p>
                                {getStatusBadge(exam.exam_status)}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2">
                        <Link href={route('exams.show', [school.id, exam.id])}>
                            <Button variant="outline">Cancel</Button>
                        </Link>
                        <Button 
                            onClick={handleSubmit} 
                            disabled={processing}
                            className="min-w-[100px]"
                        >
                            {processing ? (
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Saving...
                                </div>
                            ) : (
                                <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </div>
                </div>

                {/* Status Change Alert */}
                {data.exam_status !== exam.exam_status && (
                    <Alert>
                        <Info className="h-4 w-4" />
                        <AlertDescription>
                            You are about to change the exam status from <strong>{exam.exam_status}</strong> to <strong>{data.exam_status}</strong>. 
                            {data.exam_status === 'active' && ' This will allow teachers to enter results.'}
                            {data.exam_status === 'published' && ' This will make results visible to students.'}
                        </AlertDescription>
                    </Alert>
                )}

                <form onSubmit={handleSubmit}>
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                        <TabsList className="grid w-full grid-cols-4">
                            <TabsTrigger value="basic" className="flex items-center gap-2">
                                <Settings className="w-4 h-4" />
                                Basic Info
                            </TabsTrigger>
                            <TabsTrigger value="scope" className="flex items-center gap-2">
                                <Users className="w-4 h-4" />
                                Scope & Classes
                            </TabsTrigger>
                            <TabsTrigger value="subjects" className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Subjects & Papers
                            </TabsTrigger>
                            <TabsTrigger value="status" className="flex items-center gap-2">
                                <CheckCircle className="w-4 h-4" />
                                Status & Settings
                            </TabsTrigger>
                        </TabsList>

                        {/* Basic Information Tab */}
                        <TabsContent value="basic" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Configure the basic details of your exam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Exam Name *</Label>
                                            <Input
                                                id="name"
                                                value={data.name}
                                                onChange={(e) => setData('name', e.target.value)}
                                                placeholder="e.g., Term 1 Mid-Term Exam"
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && <p className="text-sm text-red-500">{errors.name}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="exam_series">Exam Series *</Label>
                                            <Select value={data.exam_series_id.toString()} onValueChange={(value) => setData('exam_series_id', parseInt(value))}>
                                                <SelectTrigger className={errors.exam_series_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select exam series" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {examSeries.map(series => (
                                                        <SelectItem key={series.id} value={series.id.toString()}>
                                                            {series.name} ({series.academic_year})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.exam_series_id && <p className="text-sm text-red-500">{errors.exam_series_id}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="category">Exam Category *</Label>
                                            <Select value={data.exam_category_id.toString()} onValueChange={(value) => setData('exam_category_id', parseInt(value))}>
                                                <SelectTrigger className={errors.exam_category_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select category" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {categories.map(category => (
                                                        <SelectItem key={category.id} value={category.id.toString()}>
                                                            <div className="flex items-center gap-2">
                                                                <div 
                                                                    className="w-3 h-3 rounded-full"
                                                                    style={{ backgroundColor: category.color }}
                                                                />
                                                                {category.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.exam_category_id && <p className="text-sm text-red-500">{errors.exam_category_id}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="grading_system">Grading System *</Label>
                                            <Select value={data.grading_system_id.toString()} onValueChange={(value) => setData('grading_system_id', parseInt(value))}>
                                                <SelectTrigger className={errors.grading_system_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select grading system" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {gradingSystems.map(system => (
                                                        <SelectItem key={system.id} value={system.id.toString()}>
                                                            {system.name}
                                                            {system.is_default && <Badge className="ml-2 text-xs">Default</Badge>}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.grading_system_id && <p className="text-sm text-red-500">{errors.grading_system_id}</p>}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label htmlFor="start_date">Start Date *</Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                className={errors.start_date ? 'border-red-500' : ''}
                                            />
                                            {errors.start_date && <p className="text-sm text-red-500">{errors.start_date}</p>}
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="end_date">End Date *</Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                className={errors.end_date ? 'border-red-500' : ''}
                                            />
                                            {errors.end_date && <p className="text-sm text-red-500">{errors.end_date}</p>}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of the exam"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="instructions">Instructions</Label>
                                        <Textarea
                                            id="instructions"
                                            value={data.instructions}
                                            onChange={(e) => setData('instructions', e.target.value)}
                                            placeholder="Instructions for students and teachers"
                                            rows={4}
                                        />
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Scope & Classes Tab */}
                        <TabsContent value="scope" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Class Scope</CardTitle>
                                    <CardDescription>
                                        Select which classes will participate in this exam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="all_school"
                                                name="scope_type"
                                                value="all_school"
                                                checked={data.scope_type === 'all_school'}
                                                onChange={(e) => setData('scope_type', e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <Label htmlFor="all_school" className="cursor-pointer">
                                                All school classes
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="selected_classes"
                                                name="scope_type"
                                                value="selected_classes"
                                                checked={data.scope_type === 'selected_classes'}
                                                onChange={(e) => setData('scope_type', e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <Label htmlFor="selected_classes" className="cursor-pointer">
                                                Selected classes
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="single_class"
                                                name="scope_type"
                                                value="single_class"
                                                checked={data.scope_type === 'single_class'}
                                                onChange={(e) => setData('scope_type', e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <Label htmlFor="single_class" className="cursor-pointer">
                                                Single class
                                            </Label>
                                        </div>
                                    </div>

                                    {data.scope_type === 'selected_classes' && (
                                        <div className="space-y-2">
                                            <Label>Select Classes *</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                                                {classes.map(cls => (
                                                    <div key={cls.id} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`class_${cls.id}`}
                                                            checked={data.selected_classes.includes(cls.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setData('selected_classes', [...data.selected_classes, cls.id]);
                                                                } else {
                                                                    setData('selected_classes', data.selected_classes.filter(id => id !== cls.id));
                                                                }
                                                            }}
                                                            className="w-4 h-4 text-blue-600"
                                                        />
                                                        <Label htmlFor={`class_${cls.id}`} className="text-sm cursor-pointer">
                                                            {cls.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.selected_classes && <p className="text-sm text-red-500">{errors.selected_classes}</p>}
                                        </div>
                                    )}

                                    {data.scope_type === 'single_class' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="single_class_select">Select Class *</Label>
                                            <Select value={data.single_class_id.toString()} onValueChange={(value) => setData('single_class_id', parseInt(value))}>
                                                <SelectTrigger className={errors.single_class_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Choose a class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(cls => (
                                                        <SelectItem key={cls.id} value={cls.id.toString()}>
                                                            {cls.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.single_class_id && <p className="text-sm text-red-500">{errors.single_class_id}</p>}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Subjects & Papers Tab */}
                        <TabsContent value="subjects" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Subject Scope</CardTitle>
                                    <CardDescription>
                                        Select subjects and configure papers for this exam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="all_subjects"
                                                name="subject_scope_type"
                                                value="all_subjects"
                                                checked={data.subject_scope_type === 'all_subjects'}
                                                onChange={(e) => setData('subject_scope_type', e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <Label htmlFor="all_subjects" className="cursor-pointer">
                                                All school subjects
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="selected_subjects"
                                                name="subject_scope_type"
                                                value="selected_subjects"
                                                checked={data.subject_scope_type === 'selected_subjects'}
                                                onChange={(e) => setData('subject_scope_type', e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <Label htmlFor="selected_subjects" className="cursor-pointer">
                                                Selected subjects
                                            </Label>
                                        </div>

                                        <div className="flex items-center space-x-2">
                                            <input
                                                type="radio"
                                                id="single_subject"
                                                name="subject_scope_type"
                                                value="single_subject"
                                                checked={data.subject_scope_type === 'single_subject'}
                                                onChange={(e) => setData('subject_scope_type', e.target.value)}
                                                className="w-4 h-4 text-blue-600"
                                            />
                                            <Label htmlFor="single_subject" className="cursor-pointer">
                                                Single subject
                                            </Label>
                                        </div>
                                    </div>

                                    {data.subject_scope_type === 'selected_subjects' && (
                                        <div className="space-y-2">
                                            <Label>Select Subjects *</Label>
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-60 overflow-y-auto p-2 border rounded">
                                                {subjects.map(subject => (
                                                    <div key={subject.id} className="flex items-center space-x-2">
                                                        <input
                                                            type="checkbox"
                                                            id={`subject_${subject.id}`}
                                                            checked={data.selected_subjects.includes(subject.id)}
                                                            onChange={(e) => {
                                                                if (e.target.checked) {
                                                                    setData('selected_subjects', [...data.selected_subjects, subject.id]);
                                                                } else {
                                                                    setData('selected_subjects', data.selected_subjects.filter(id => id !== subject.id));
                                                                }
                                                            }}
                                                            className="w-4 h-4 text-blue-600"
                                                        />
                                                        <Label htmlFor={`subject_${subject.id}`} className="text-sm cursor-pointer">
                                                            {subject.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.selected_subjects && <p className="text-sm text-red-500">{errors.selected_subjects}</p>}
                                        </div>
                                    )}

                                    {data.subject_scope_type === 'single_subject' && (
                                        <div className="space-y-2">
                                            <Label htmlFor="single_subject_select">Select Subject *</Label>
                                            <Select value={data.single_subject_id.toString()} onValueChange={(value) => setData('single_subject_id', parseInt(value))}>
                                                <SelectTrigger className={errors.single_subject_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Choose a subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map(subject => (
                                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                                            {subject.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {errors.single_subject_id && <p className="text-sm text-red-500">{errors.single_subject_id}</p>}
                                        </div>
                                    )}

                                    <Separator />

                                    {/* Subject Settings */}
                                    <div className="space-y-4">
                                        <h3 className="text-lg font-semibold">Subject Configuration</h3>
                                        {getRelevantSubjects().map(subject => (
                                            <Card key={subject.id}>
                                                <CardHeader className="pb-3">
                                                    <CardTitle className="text-base flex items-center justify-between">
                                                        {subject.name}
                                                        <Badge variant="outline">{subject.department?.name}</Badge>
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="space-y-4">
                                                    <div className="grid grid-cols-2 gap-4">
                                                        <div className="space-y-2">
                                                            <Label>Total Marks</Label>
                                                            <Input
                                                                type="number"
                                                                value={getSubjectSetting(subject.id, 'total_marks', 100)}
                                                                onChange={(e) => updateSubjectSettings(subject.id, 'total_marks', parseInt(e.target.value))}
                                                                min="1"
                                                            />
                                                        </div>
                                                        <div className="space-y-2">
                                                            <Label>Pass Mark</Label>
                                                            <Input
                                                                type="number"
                                                                value={getSubjectSetting(subject.id, 'pass_mark', 40)}
                                                                onChange={(e) => updateSubjectSettings(subject.id, 'pass_mark', parseInt(e.target.value))}
                                                                min="0"
                                                            />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center space-x-2">
                                                        <Switch
                                                            checked={getSubjectSetting(subject.id, 'has_papers', false)}
                                                            onCheckedChange={(checked) => updateSubjectSettings(subject.id, 'has_papers', checked)}
                                                        />
                                                        <Label>Has multiple papers</Label>
                                                    </div>

                                                    {getSubjectSetting(subject.id, 'has_papers', false) && (
                                                        <div className="space-y-4 border-t pt-4">
                                                            <div className="flex items-center justify-between">
                                                                <h4 className="font-medium">Papers</h4>
                                                                <Button
                                                                    type="button"
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => addPaper(subject.id)}
                                                                    disabled={(getSubjectSetting(subject.id, 'papers', []) || []).length >= 5}
                                                                >
                                                                    <Plus className="w-4 h-4 mr-1" />
                                                                    Add Paper
                                                                </Button>
                                                            </div>

                                                            {(getSubjectSetting(subject.id, 'papers', []) || []).map((paper, index) => (
                                                                <div key={index} className="border rounded p-4 space-y-3">
                                                                    <div className="flex items-center justify-between">
                                                                        <h5 className="font-medium">Paper {index + 1}</h5>
                                                                        <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="sm"
                                                                            onClick={() => removePaper(subject.id, index)}
                                                                        >
                                                                            <Minus className="w-4 h-4" />
                                                                        </Button>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-3">
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">Paper Name</Label>
                                                                            <Input
                                                                                value={paper.name}
                                                                                onChange={(e) => updatePaper(subject.id, index, 'name', e.target.value)}
                                                                                placeholder="e.g., Paper 1"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">Marks</Label>
                                                                            <Input
                                                                                type="number"
                                                                                value={paper.marks}
                                                                                onChange={(e) => updatePaper(subject.id, index, 'marks', parseInt(e.target.value))}
                                                                                min="1"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">Pass Mark</Label>
                                                                            <Input
                                                                                type="number"
                                                                                value={paper.pass_mark}
                                                                                onChange={(e) => updatePaper(subject.id, index, 'pass_mark', parseInt(e.target.value))}
                                                                                min="0"
                                                                            />
                                                                        </div>
                                                                        <div className="space-y-1">
                                                                            <Label className="text-xs">Duration (minutes)</Label>
                                                                            <Input
                                                                                type="number"
                                                                                value={paper.duration_minutes}
                                                                                onChange={(e) => updatePaper(subject.id, index, 'duration_minutes', parseInt(e.target.value))}
                                                                                min="30"
                                                                            />
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-1">
                                                                        <Label className="text-xs">Weight (%)</Label>
                                                                        <Input
                                                                            type="number"
                                                                            value={paper.weight}
                                                                            onChange={(e) => updatePaper(subject.id, index, 'weight', parseFloat(e.target.value))}
                                                                            min="0"
                                                                            max="100"
                                                                            step="0.1"
                                                                        />
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        {/* Status & Settings Tab */}
                        <TabsContent value="status" className="space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Exam Status</CardTitle>
                                    <CardDescription>
                                        Manage the exam lifecycle and visibility
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between p-4 border rounded">
                                            <div>
                                                <h4 className="font-medium">Current Status</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    The exam is currently in <strong>{exam.exam_status}</strong> status
                                                </p>
                                            </div>
                                            {getStatusBadge(exam.exam_status)}
                                        </div>

                                        <div className="space-y-3">
                                            <Label>Change Status</Label>
                                            <Select value={data.exam_status} onValueChange={handleStatusChange}>
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {getStatusOptions().map(option => (
                                                        <SelectItem key={option.value} value={option.value}>
                                                            <div className="flex flex-col">
                                                                <span>{option.label}</span>
                                                                <span className="text-xs text-muted-foreground">
                                                                    {option.description}
                                                                </span>
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        {/* Status-specific information */}
                                        {data.exam_status === 'active' && (
                                            <Alert>
                                                <CheckCircle className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>Active Status:</strong> Teachers can now enter results for this exam. 
                                                    Students will be able to see the exam in their dashboard.
                                                </AlertDescription>
                                            </Alert>
                                        )}

                                        {data.exam_status === 'published' && (
                                            <Alert>
                                                <Info className="h-4 w-4" />
                                                <AlertDescription>
                                                    <strong>Published Status:</strong> Results are now visible to students and parents. 
                                                    Further modifications will be restricted.
                                                </AlertDescription>
                                            </Alert>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Additional Settings */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Additional Settings</h4>
                                        
                                        {selectedGradingSystem && (
                                            <div className="p-4 border rounded">
                                                <h5 className="font-medium mb-2">Selected Grading System</h5>
                                                <p className="text-sm text-muted-foreground mb-2">
                                                    {selectedGradingSystem.name} - {selectedGradingSystem.description}
                                                </p>
                                                <div className="text-xs text-muted-foreground">
                                                    Grades: A (80-100), A- (75-79), B+ (70-74), B (65-69), etc.
                                                </div>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-4 text-sm">
                                            <div className="p-3 border rounded">
                                                <div className="font-medium">Classes</div>
                                                <div className="text-muted-foreground">
                                                    {data.scope_type === 'all_school' ? 'All Classes' :
                                                     data.scope_type === 'single_class' ? '1 Class' :
                                                     `${data.selected_classes.length} Classes`}
                                                </div>
                                            </div>
                                            <div className="p-3 border rounded">
                                                <div className="font-medium">Subjects</div>
                                                <div className="text-muted-foreground">
                                                    {getRelevantSubjects().length} subjects configured
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>
                    </Tabs>
                </form>
            </div>
        </AppLayout>
    );
}