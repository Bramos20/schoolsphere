import React, { useState, useEffect } from 'react';
import { Head, useForm, Link, router } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Plus, Trash2, BookOpen, AlertTriangle } from 'lucide-react';

export default function CreateExam({ school, classes, subjects, examSeries, categories, gradingSystems }) {
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [subjectSettings, setSubjectSettings] = useState({});
    const [submitting, setSubmitting] = useState(false); // Add this missing state

    // Debug props on component mount
    useEffect(() => {
        console.log('CreateExam component props:');
        console.log('- school:', school);
        console.log('- classes:', classes?.length || 0, 'classes');
        console.log('- subjects:', subjects?.length || 0, 'subjects');
        console.log('- examSeries:', examSeries?.length || 0, 'series');
        console.log('- categories:', categories?.length || 0, 'categories');
        console.log('- gradingSystems:', gradingSystems?.length || 0, 'grading systems');
        
        if (subjects && subjects.length > 0) {
            console.log('First few subjects:', subjects.slice(0, 3));
        }
    }, []);

    const { data, setData, post, processing, errors, setError, clearErrors } = useForm({
        exam_series_id: '',
        exam_category_id: '',
        grading_system_id: '',
        name: '',
        description: '',
        start_date: '',
        end_date: '',
        instructions: '',
        scope_type: 'all_school',
        subject_scope_type: 'all_subjects',
        selected_classes: [],
        selected_subjects: [],
        single_class_id: '',
        single_subject_id: '',
        subject_settings: []
    });

    // Debug errors
    useEffect(() => {
        if (Object.keys(errors).length > 0) {
            console.log('Form errors:', errors);
        }
    }, [errors]);

    // Error display component
    const ErrorDisplay = ({ error, className = "" }) => {
        if (!error) return null;
        return <p className={`text-red-500 text-sm mt-1 ${className}`}>{error}</p>;
    };

    const handleSubjectSelection = (subjectId, checked) => {
        const updated = checked 
            ? [...selectedSubjects, subjectId]
            : selectedSubjects.filter(id => id !== subjectId);
        
        setSelectedSubjects(updated);
        setData('selected_subjects', updated);

        // Initialize or remove subject settings
        if (checked) {
            const subject = subjects.find(s => s.id === subjectId);
            setSubjectSettings(prev => ({
                ...prev,
                [subjectId]: {
                    subject_id: subjectId,
                    subject_name: subject.name,
                    total_marks: 100,
                    pass_mark: 40,
                    has_papers: false,
                    paper_count: 1,
                    papers: []
                }
            }));
        } else {
            setSubjectSettings(prev => {
                const updated = { ...prev };
                delete updated[subjectId];
                return updated;
            });
        }
    };

    const updateSubjectSetting = (subjectId, field, value) => {
        setSubjectSettings(prev => ({
            ...prev,
            [subjectId]: {
                ...prev[subjectId],
                [field]: value
            }
        }));
    };

    const toggleSubjectPapers = (subjectId, hasPapers) => {
        setSubjectSettings(prev => {
            const updated = {
                ...prev,
                [subjectId]: {
                    ...prev[subjectId],
                    has_papers: hasPapers,
                    paper_count: hasPapers ? 1 : 0,
                    papers: hasPapers ? [createDefaultPaper(1)] : []
                }
            };
            return updated;
        });
    };

    const createDefaultPaper = (paperNumber) => ({
        name: `Paper ${paperNumber}`,
        marks: 100,
        pass_mark: 40,
        duration_minutes: 120,
        weight: 100,
        instructions: ''
    });

    const updatePaperCount = (subjectId, count) => {
        setSubjectSettings(prev => {
            const currentPapers = prev[subjectId].papers || [];
            const newPapers = [];
            
            // Keep existing papers and add new ones if needed
            for (let i = 0; i < count; i++) {
                if (currentPapers[i]) {
                    newPapers.push(currentPapers[i]);
                } else {
                    newPapers.push(createDefaultPaper(i + 1));
                }
            }

            // Distribute weights evenly
            const weightPerPaper = 100 / count;
            newPapers.forEach(paper => {
                paper.weight = weightPerPaper;
            });

            return {
                ...prev,
                [subjectId]: {
                    ...prev[subjectId],
                    paper_count: count,
                    papers: newPapers
                }
            };
        });
    };

    const updatePaper = (subjectId, paperIndex, field, value) => {
        setSubjectSettings(prev => {
            const updated = { ...prev };
            updated[subjectId].papers[paperIndex][field] = value;
            return updated;
        });
    };

    const handleClassSelection = (classId, checked) => {
        const updated = checked 
            ? [...data.selected_classes, classId]
            : data.selected_classes.filter(id => id !== classId);
        setData('selected_classes', updated);
    };

    const handleSingleSubjectSelection = (subjectId) => {
        setData('single_subject_id', subjectId);
        const subject = subjects.find(s => s.id == subjectId);
        if (subject) {
            setSubjectSettings({
                [subjectId]: {
                    subject_id: parseInt(subjectId),
                    subject_name: subject.name,
                    total_marks: 100,
                    pass_mark: 40,
                    has_papers: false,
                    paper_count: 1,
                    papers: []
                }
            });
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        console.log('=== FORM SUBMISSION START ===');
        
        // Clear previous errors
        clearErrors();
        
        let settingsArray = [];
        
        console.log('Form submission debug:');
        console.log('- subject_scope_type:', data.subject_scope_type);
        console.log('- single_subject_id:', data.single_subject_id);
        console.log('- selected_subjects:', selectedSubjects);
        console.log('- subjects available:', subjects?.length || 0);
        console.log('- subjects data:', subjects);
        console.log('- subjectSettings state:', subjectSettings);
        
        // Safety check for subjects
        if (!subjects || subjects.length === 0) {
            console.error('❌ CRITICAL: No subjects available from backend!');
            setError('subject_settings', 'No subjects available. Please check if subjects are created for this school.');
            return;
        }
        
        if (data.subject_scope_type === 'single_subject') {
            if (!data.single_subject_id) {
                console.error('Single subject not selected');
                setError('single_subject_id', 'Please select a subject');
                return;
            }
            const subject = subjects.find(s => s.id == data.single_subject_id);
            if (subject) {
                const setting = subjectSettings[data.single_subject_id] || {
                    subject_id: parseInt(data.single_subject_id),
                    total_marks: 100,
                    pass_mark: 40,
                    has_papers: false,
                    paper_count: 1,
                    papers: []
                };
                settingsArray = [setting];
                console.log('✅ Single subject settings:', settingsArray);
            }
        } else if (data.subject_scope_type === 'all_subjects') {
            console.log('🔄 Processing all subjects...');
            settingsArray = subjects.map(subject => {
                console.log('Processing subject:', subject.name, 'ID:', subject.id);
                return {
                    subject_id: subject.id,
                    total_marks: 100,
                    pass_mark: 40,
                    has_papers: false,
                    paper_count: 1,
                    papers: []
                };
            });
            console.log('✅ All subjects settings created:', settingsArray.length, 'subjects');
            console.log('Settings:', settingsArray);
        } else if (data.subject_scope_type === 'selected_subjects') {
            if (selectedSubjects.length === 0) {
                console.error('No subjects selected');
                setError('selected_subjects', 'Please select at least one subject');
                return;
            }
            settingsArray = Object.values(subjectSettings).filter(setting => 
                selectedSubjects.includes(setting.subject_id)
            );
            console.log('✅ Selected subjects settings:', settingsArray);
        }

        // Validate that we have settings
        if (settingsArray.length === 0) {
            console.error('❌ CRITICAL: No subject settings prepared - this is the problem!');
            console.log('Debug info:');
            console.log('- subjects prop:', subjects);
            console.log('- subjects length:', subjects?.length);
            console.log('- data.subject_scope_type:', data.subject_scope_type);
            setError('subject_settings', 'Could not prepare subject settings. Please check console for details.');
            return;
        }

        // Ensure all required fields are present and properly typed
        settingsArray = settingsArray.map(setting => ({
            ...setting,
            subject_id: parseInt(setting.subject_id),
            total_marks: parseInt(setting.total_marks) || 100,
            pass_mark: parseInt(setting.pass_mark) || 40,
            has_papers: Boolean(setting.has_papers),
            paper_count: parseInt(setting.paper_count) || 1,
            papers: setting.has_papers ? (setting.papers || []).map(paper => ({
                ...paper,
                marks: parseInt(paper.marks) || 100,
                pass_mark: parseInt(paper.pass_mark) || 40,
                duration_minutes: parseInt(paper.duration_minutes) || 120,
                weight: parseFloat(paper.weight) || 100
            })) : []
        }));

        console.log('✅ Final processed settings:', settingsArray.length, 'subjects');

        // Build final data - only include fields that should be sent based on scope
        const finalData = { 
            ...data,
            subject_settings: settingsArray
        };

        // Add conditional fields based on scope types
        if (data.scope_type === 'selected_classes') {
            finalData.selected_classes = data.selected_classes.map(id => parseInt(id));
        } else if (data.scope_type === 'single_class') {
            finalData.single_class_id = parseInt(data.single_class_id);
        }

        if (data.subject_scope_type === 'selected_subjects') {
            finalData.selected_subjects = data.selected_subjects.map(id => parseInt(id));
        } else if (data.subject_scope_type === 'single_subject') {
            finalData.single_subject_id = parseInt(data.single_subject_id);
        }

        console.log('🚀 Final data being submitted:');
        console.log('- subject_settings length:', finalData.subject_settings.length);
        console.log('- full data:', finalData);
        console.log('=== FORM SUBMISSION END ===');
        
        router.post(route('exams.store', { school: school.id }), finalData, {
            onStart: () => setSubmitting(true),
            onFinish: () => setSubmitting(false),
            onError: (errors) => {
                console.error('❌ Submission errors:', errors);
                Object.keys(errors).forEach(key => {
                    setError(key, errors[key]);
                });
                // Scroll to first error
                const firstErrorElement = document.querySelector('.text-red-500');
                if (firstErrorElement) {
                    firstErrorElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            },
            onSuccess: () => {
                console.log('✅ Exam created successfully');
            }
        });
    };

    return (
        <>
            <Head title="Create Exam" />
            
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/schools/${school.id}/exams`}>
                        <Button variant="outline" size="sm">
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Exams
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Create New Exam</h1>
                        <p className="text-gray-600 mt-2">Set up a new exam for your students</p>
                    </div>
                </div>

                {/* Global error display */}
                {Object.keys(errors).length > 0 && (
                    <Alert className="mb-6 border-red-200 bg-red-50">
                        <AlertTriangle className="h-4 w-4" />
                        <AlertDescription className="text-red-800">
                            There are errors in your form. Please check the highlighted fields below.
                        </AlertDescription>
                    </Alert>
                )}

                {/* Debug info in development */}
                {process.env.NODE_ENV === 'development' && Object.keys(errors).length > 0 && (
                    <div className="mb-4 p-4 bg-gray-100 rounded">
                        <details>
                            <summary className="cursor-pointer text-sm font-medium">Debug Info (Development Only)</summary>
                            <pre className="mt-2 text-xs overflow-auto">{JSON.stringify({ errors, dataSubset: { subject_settings: data.subject_settings } }, null, 2)}</pre>
                        </details>
                    </div>
                )}

                <form onSubmit={handleSubmit}>
                    <div className="grid gap-6 lg:grid-cols-3">
                        <div className="lg:col-span-2">
                            {/* Basic Information */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Basic Information</CardTitle>
                                    <CardDescription>
                                        Enter the basic details for this exam
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="exam_series_id">Exam Series *</Label>
                                            <Select value={data.exam_series_id} onValueChange={(value) => setData('exam_series_id', value)}>
                                                <SelectTrigger className={errors.exam_series_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select exam series" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {examSeries.map(series => (
                                                        <SelectItem key={series.id} value={series.id.toString()}>
                                                            {series.name} - {series.term} {series.year}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <ErrorDisplay error={errors.exam_series_id} />
                                        </div>

                                        <div>
                                            <Label htmlFor="exam_category_id">Category *</Label>
                                            <Select value={data.exam_category_id} onValueChange={(value) => setData('exam_category_id', value)}>
                                                <SelectTrigger className={errors.exam_category_id ? 'border-red-500' : ''}>
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
                                            <ErrorDisplay error={errors.exam_category_id} />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="name">Exam Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., End of Term 2 Exams"
                                            className={errors.name ? 'border-red-500' : ''}
                                        />
                                        <ErrorDisplay error={errors.name} />
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of the exam"
                                            rows={3}
                                            className={errors.description ? 'border-red-500' : ''}
                                        />
                                        <ErrorDisplay error={errors.description} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="start_date">Start Date *</Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                                className={errors.start_date ? 'border-red-500' : ''}
                                            />
                                            <ErrorDisplay error={errors.start_date} />
                                        </div>

                                        <div>
                                            <Label htmlFor="end_date">End Date *</Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                                className={errors.end_date ? 'border-red-500' : ''}
                                            />
                                            <ErrorDisplay error={errors.end_date} />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Class Selection */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Class Selection</CardTitle>
                                    <CardDescription>
                                        Choose which classes this exam covers
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Exam Scope</Label>
                                        <Select value={data.scope_type} onValueChange={(value) => setData('scope_type', value)}>
                                            <SelectTrigger className={errors.scope_type ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all_school">All School</SelectItem>
                                                <SelectItem value="selected_classes">Selected Classes</SelectItem>
                                                <SelectItem value="single_class">Single Class</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <ErrorDisplay error={errors.scope_type} />
                                    </div>

                                    {data.scope_type === 'selected_classes' && (
                                        <div>
                                            <Label>Select Classes *</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded p-3">
                                                {classes.map(cls => (
                                                    <div key={cls.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`class_${cls.id}`}
                                                            checked={data.selected_classes.includes(cls.id)}
                                                            onCheckedChange={(checked) => handleClassSelection(cls.id, checked)}
                                                        />
                                                        <Label htmlFor={`class_${cls.id}`} className="text-sm">
                                                            {cls.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            <ErrorDisplay error={errors.selected_classes} />
                                        </div>
                                    )}

                                    {data.scope_type === 'single_class' && (
                                        <div>
                                            <Label htmlFor="single_class_id">Select Class *</Label>
                                            <Select value={data.single_class_id} onValueChange={(value) => setData('single_class_id', value)}>
                                                <SelectTrigger className={errors.single_class_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a class" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {classes.map(cls => (
                                                        <SelectItem key={cls.id} value={cls.id.toString()}>
                                                            {cls.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <ErrorDisplay error={errors.single_class_id} />
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Subject Selection and Configuration */}
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Subject Configuration</CardTitle>
                                    <CardDescription>
                                        Select subjects and configure their paper structure
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label>Subject Scope</Label>
                                        <Select value={data.subject_scope_type} onValueChange={(value) => setData('subject_scope_type', value)}>
                                            <SelectTrigger className={errors.subject_scope_type ? 'border-red-500' : ''}>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all_subjects">All Subjects</SelectItem>
                                                <SelectItem value="selected_subjects">Selected Subjects</SelectItem>
                                                <SelectItem value="single_subject">Single Subject</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <ErrorDisplay error={errors.subject_scope_type} />
                                    </div>

                                    {data.subject_scope_type === 'selected_subjects' && (
                                        <div>
                                            <Label>Select Subjects *</Label>
                                            <div className="grid grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto border rounded p-3">
                                                {subjects.map(subject => (
                                                    <div key={subject.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`subject_${subject.id}`}
                                                            checked={selectedSubjects.includes(subject.id)}
                                                            onCheckedChange={(checked) => handleSubjectSelection(subject.id, checked)}
                                                        />
                                                        <Label htmlFor={`subject_${subject.id}`} className="text-sm">
                                                            {subject.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                            <ErrorDisplay error={errors.selected_subjects} />
                                        </div>
                                    )}

                                    {data.subject_scope_type === 'single_subject' && (
                                        <div>
                                            <Label htmlFor="single_subject_id">Select Subject *</Label>
                                            <Select value={data.single_subject_id} onValueChange={(value) => handleSingleSubjectSelection(value)}>
                                                <SelectTrigger className={errors.single_subject_id ? 'border-red-500' : ''}>
                                                    <SelectValue placeholder="Select a subject" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {subjects.map(subject => (
                                                        <SelectItem key={subject.id} value={subject.id.toString()}>
                                                            {subject.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <ErrorDisplay error={errors.single_subject_id} />
                                        </div>
                                    )}

                                    {/* Subject Settings */}
                                    {(data.subject_scope_type === 'selected_subjects' && selectedSubjects.length > 0) && (
                                        <div className="space-y-4">
                                            <h3 className="text-lg font-semibold">Configure Selected Subjects</h3>
                                            {selectedSubjects.map(subjectId => {
                                                const subject = subjects.find(s => s.id === subjectId);
                                                const settings = subjectSettings[subjectId] || {};
                                                
                                                return (
                                                    <Card key={subjectId} className="border-l-4 border-l-blue-500">
                                                        <CardHeader className="pb-3">
                                                            <CardTitle className="text-base flex items-center gap-2">
                                                                <BookOpen className="h-4 w-4" />
                                                                {subject?.name}
                                                            </CardTitle>
                                                        </CardHeader>
                                                        <CardContent className="space-y-4">
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div>
                                                                    <Label>Total Marks</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={settings.total_marks || 100}
                                                                        onChange={(e) => updateSubjectSetting(subjectId, 'total_marks', parseInt(e.target.value))}
                                                                        min="1"
                                                                    />
                                                                </div>
                                                                <div>
                                                                    <Label>Pass Mark</Label>
                                                                    <Input
                                                                        type="number"
                                                                        value={settings.pass_mark || 40}
                                                                        onChange={(e) => updateSubjectSetting(subjectId, 'pass_mark', parseInt(e.target.value))}
                                                                        min="0"
                                                                    />
                                                                </div>
                                                            </div>

                                                            <div className="flex items-center space-x-2">
                                                                <Checkbox
                                                                    id={`papers_${subjectId}`}
                                                                    checked={settings.has_papers || false}
                                                                    onCheckedChange={(checked) => toggleSubjectPapers(subjectId, checked)}
                                                                />
                                                                <Label htmlFor={`papers_${subjectId}`}>
                                                                    This subject has multiple papers
                                                                </Label>
                                                            </div>

                                                            {settings.has_papers && (
                                                                <div className="space-y-4 pl-4 border-l-2 border-gray-200">
                                                                    <div>
                                                                        <Label>Number of Papers</Label>
                                                                        <Select 
                                                                            value={settings.paper_count?.toString() || '1'} 
                                                                            onValueChange={(value) => updatePaperCount(subjectId, parseInt(value))}
                                                                        >
                                                                            <SelectTrigger className="w-32">
                                                                                <SelectValue />
                                                                            </SelectTrigger>
                                                                            <SelectContent>
                                                                                {[1, 2, 3, 4, 5].map(num => (
                                                                                    <SelectItem key={num} value={num.toString()}>
                                                                                        {num} Paper{num > 1 ? 's' : ''}
                                                                                    </SelectItem>
                                                                                ))}
                                                                            </SelectContent>
                                                                        </Select>
                                                                    </div>

                                                                    {settings.papers?.map((paper, index) => (
                                                                        <Card key={index} className="bg-gray-50">
                                                                            <CardHeader className="pb-2">
                                                                                <CardTitle className="text-sm">Paper {index + 1}</CardTitle>
                                                                            </CardHeader>
                                                                            <CardContent className="space-y-3">
                                                                                <div className="grid grid-cols-2 gap-3">
                                                                                    <div>
                                                                                        <Label className="text-xs">Paper Name</Label>
                                                                                        <Input
                                                                                            size="sm"
                                                                                            value={paper.name}
                                                                                            onChange={(e) => updatePaper(subjectId, index, 'name', e.target.value)}
                                                                                            placeholder="e.g., Theory, Practical"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Label className="text-xs">Marks</Label>
                                                                                        <Input
                                                                                            size="sm"
                                                                                            type="number"
                                                                                            value={paper.marks}
                                                                                            onChange={(e) => updatePaper(subjectId, index, 'marks', parseInt(e.target.value))}
                                                                                            min="1"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                                <div className="grid grid-cols-3 gap-3">
                                                                                    <div>
                                                                                        <Label className="text-xs">Pass Mark</Label>
                                                                                        <Input
                                                                                            size="sm"
                                                                                            type="number"
                                                                                            value={paper.pass_mark}
                                                                                            onChange={(e) => updatePaper(subjectId, index, 'pass_mark', parseInt(e.target.value))}
                                                                                            min="0"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Label className="text-xs">Duration (mins)</Label>
                                                                                        <Input
                                                                                            size="sm"
                                                                                            type="number"
                                                                                            value={paper.duration_minutes}
                                                                                            onChange={(e) => updatePaper(subjectId, index, 'duration_minutes', parseInt(e.target.value))}
                                                                                            min="30"
                                                                                        />
                                                                                    </div>
                                                                                    <div>
                                                                                        <Label className="text-xs">Weight (%)</Label>
                                                                                        <Input
                                                                                            size="sm"
                                                                                            type="number"
                                                                                            value={paper.weight}
                                                                                            onChange={(e) => updatePaper(subjectId, index, 'weight', parseFloat(e.target.value))}
                                                                                            min="0"
                                                                                            max="100"
                                                                                            step="0.1"
                                                                                        />
                                                                                    </div>
                                                                                </div>
                                                                            </CardContent>
                                                                        </Card>
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </CardContent>
                                                    </Card>
                                                );
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar */}
                        <div>
                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Grading System</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor="grading_system_id">Grading System *</Label>
                                        <Select value={data.grading_system_id} onValueChange={(value) => setData('grading_system_id', value)}>
                                            <SelectTrigger className={errors.grading_system_id ? 'border-red-500' : ''}>
                                                <SelectValue placeholder="Select grading system" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {gradingSystems.map(system => (
                                                    <SelectItem key={system.id} value={system.id.toString()}>
                                                        {system.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <ErrorDisplay error={errors.grading_system_id} />
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="mb-6">
                                <CardHeader>
                                    <CardTitle>Additional Instructions</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <Textarea
                                        value={data.instructions}
                                        onChange={(e) => setData('instructions', e.target.value)}
                                        placeholder="Any special instructions for this exam..."
                                        rows={4}
                                        className={errors.instructions ? 'border-red-500' : ''}
                                    />
                                    <ErrorDisplay error={errors.instructions} />
                                </CardContent>
                            </Card>

                            <Button type="submit" disabled={submitting} className="w-full">
                                <Save className="h-4 w-4 mr-2" />
                                {submitting ? 'Creating...' : 'Create Exam'}
                            </Button>

                            {/* Additional validation messages */}
                            {errors.subject_settings && (
                                <Alert className="mt-4 border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-red-800">
                                        {typeof errors.subject_settings === 'string' 
                                            ? errors.subject_settings 
                                            : 'There are errors in subject configuration. Please check your settings.'}
                                    </AlertDescription>
                                </Alert>
                            )}

                            {/* Show nested validation errors for subject settings */}
                            {Object.keys(errors).some(key => key.startsWith('subject_settings.')) && (
                                <Alert className="mt-4 border-red-200 bg-red-50">
                                    <AlertTriangle className="h-4 w-4" />
                                    <AlertDescription className="text-red-800">
                                        <div className="text-sm">
                                            <p className="font-medium mb-2">Subject Configuration Errors:</p>
                                            <ul className="list-disc list-inside space-y-1">
                                                {Object.entries(errors)
                                                    .filter(([key]) => key.startsWith('subject_settings.'))
                                                    .map(([key, error]) => (
                                                        <li key={key} className="text-xs">
                                                            {key.replace('subject_settings.', '')}: {error}
                                                        </li>
                                                    ))}
                                            </ul>
                                        </div>
                                    </AlertDescription>
                                </Alert>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}