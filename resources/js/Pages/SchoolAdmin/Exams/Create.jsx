import React, { useState } from 'react';
import { Head, useForm, Link } from '@inertiajs/react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Save, Plus, Trash2, BookOpen } from 'lucide-react';

export default function CreateExam({ school, classes, subjects, examSeries, categories, gradingSystems }) {
    const [selectedSubjects, setSelectedSubjects] = useState([]);
    const [subjectSettings, setSubjectSettings] = useState({});

    const { data, setData, post, processing, errors } = useForm({
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
        const subject = subjects.find(s => s.id === subjectId);
        setSubjectSettings({
            [subjectId]: {
                subject_id: subjectId,
                subject_name: subject.name,
                total_marks: 100,
                pass_mark: 40,
                has_papers: false,
                paper_count: 1,
                papers: []
            }
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        let settingsArray = [];
        if (data.subject_scope_type === 'single_subject') {
            const subject = subjects.find(s => s.id === data.single_subject_id);
            if (subject) {
                settingsArray = [{
                    subject_id: data.single_subject_id,
                    subject_name: subject.name,
                    total_marks: 100,
                    pass_mark: 40,
                    has_papers: false,
                    paper_count: 1,
                    papers: []
                }];
            }
        } else if (data.subject_scope_type === 'all_subjects') {
            settingsArray = subjects.map(subject => ({
                subject_id: subject.id,
                subject_name: subject.name,
                total_marks: 100,
                pass_mark: 40,
                has_papers: false,
                paper_count: 1,
                papers: []
            }));
        } else {
            settingsArray = Object.values(subjectSettings);
        }
        
        const finalData = { ...data, subject_settings: settingsArray };
        post(route('exams.store', { school: school.id }), finalData);
    };

    // Get subjects to show based on scope type
    const getSubjectsToShow = () => {
        if (data.subject_scope_type === 'all_subjects') {
            return subjects;
        }
        return subjects;
    };

    // Get classes to show based on scope type
    const getClassesToShow = () => {
        if (data.scope_type === 'all_school') {
            return [];
        }
        return classes;
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
                                                <SelectTrigger>
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
                                            {errors.exam_series_id && <p className="text-red-500 text-sm mt-1">{errors.exam_series_id}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="exam_category_id">Category *</Label>
                                            <Select value={data.exam_category_id} onValueChange={(value) => setData('exam_category_id', value)}>
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
                                            {errors.exam_category_id && <p className="text-red-500 text-sm mt-1">{errors.exam_category_id}</p>}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="name">Exam Name *</Label>
                                        <Input
                                            id="name"
                                            value={data.name}
                                            onChange={(e) => setData('name', e.target.value)}
                                            placeholder="e.g., End of Term 2 Exams"
                                        />
                                        {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                    </div>

                                    <div>
                                        <Label htmlFor="description">Description</Label>
                                        <Textarea
                                            id="description"
                                            value={data.description}
                                            onChange={(e) => setData('description', e.target.value)}
                                            placeholder="Brief description of the exam"
                                            rows={3}
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="start_date">Start Date *</Label>
                                            <Input
                                                id="start_date"
                                                type="date"
                                                value={data.start_date}
                                                onChange={(e) => setData('start_date', e.target.value)}
                                            />
                                            {errors.start_date && <p className="text-red-500 text-sm mt-1">{errors.start_date}</p>}
                                        </div>

                                        <div>
                                            <Label htmlFor="end_date">End Date *</Label>
                                            <Input
                                                id="end_date"
                                                type="date"
                                                value={data.end_date}
                                                onChange={(e) => setData('end_date', e.target.value)}
                                            />
                                            {errors.end_date && <p className="text-red-500 text-sm mt-1">{errors.end_date}</p>}
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
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all_school">All School</SelectItem>
                                                <SelectItem value="selected_classes">Selected Classes</SelectItem>
                                                <SelectItem value="single_class">Single Class</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                            {errors.selected_classes && <p className="text-red-500 text-sm mt-1">{errors.selected_classes}</p>}
                                        </div>
                                    )}

                                    {data.scope_type === 'single_class' && (
                                        <div>
                                            <Label htmlFor="single_class_id">Select Class *</Label>
                                            <Select value={data.single_class_id} onValueChange={(value) => setData('single_class_id', value)}>
                                                <SelectTrigger>
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
                                            {errors.single_class_id && <p className="text-red-500 text-sm mt-1">{errors.single_class_id}</p>}
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
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all_subjects">All Subjects</SelectItem>
                                                <SelectItem value="selected_subjects">Selected Subjects</SelectItem>
                                                <SelectItem value="single_subject">Single Subject</SelectItem>
                                            </SelectContent>
                                        </Select>
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
                                            {errors.selected_subjects && <p className="text-red-500 text-sm mt-1">{errors.selected_subjects}</p>}
                                        </div>
                                    )}

                                    {data.subject_scope_type === 'single_subject' && (
                                        <div>
                                            <Label htmlFor="single_subject_id">Select Subject *</Label>
                                            <Select value={data.single_subject_id} onValueChange={(value) => handleSingleSubjectSelection(value)}>
                                                <SelectTrigger>
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
                                            {errors.single_subject_id && <p className="text-red-500 text-sm mt-1">{errors.single_subject_id}</p>}
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
                                            <SelectTrigger>
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
                                        {errors.grading_system_id && <p className="text-red-500 text-sm mt-1">{errors.grading_system_id}</p>}
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
                                    />
                                </CardContent>
                            </Card>

                            <Button type="submit" disabled={processing} className="w-full">
                                <Save className="h-4 w-4 mr-2" />
                                {processing ? 'Creating...' : 'Create Exam'}
                            </Button>
                        </div>
                    </div>
                </form>
            </div>
        </>
    );
}