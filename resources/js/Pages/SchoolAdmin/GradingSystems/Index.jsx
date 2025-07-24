import React, { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import { PlusIcon, StarIcon, CheckIcon, PencilIcon, TrashIcon } from 'lucide-react';

export default function GradingSystemsIndex({ school, gradingSystems }) {
    const [showCreateForm, setShowCreateForm] = useState(false);
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        description: '',
        type: 'letter',
        is_default: false,
        grades: [
            { grade: 'A', min_score: 80, max_score: 100, points: 12, remarks: 'Excellent' }
        ]
    });

    const addGrade = () => {
        setData('grades', [...data.grades, { grade: '', min_score: 0, max_score: 0, points: 0, remarks: '' }]);
    };

    const removeGrade = (index) => {
        const newGrades = data.grades.filter((_, i) => i !== index);
        setData('grades', newGrades);
    };

    const updateGrade = (index, field, value) => {
        const newGrades = [...data.grades];
        newGrades[index][field] = value;
        setData('grades', newGrades);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        post(route('grading-systems.store', school.id), {
            onSuccess: () => {
                reset();
                setShowCreateForm(false);
            }
        });
    };

    const loadTemplate = (templateName) => {
        const templates = {
            kcse: {
                name: 'KCSE Grading (12-Point)',
                type: 'letter',
                grades: [
                    { grade: 'A', min_score: 80, max_score: 100, points: 12, remarks: 'Excellent' },
                    { grade: 'A-', min_score: 75, max_score: 79, points: 11, remarks: 'Very Good' },
                    { grade: 'B+', min_score: 70, max_score: 74, points: 10, remarks: 'Good Plus' },
                    { grade: 'B', min_score: 65, max_score: 69, points: 9, remarks: 'Good' },
                    { grade: 'B-', min_score: 60, max_score: 64, points: 8, remarks: 'Good Minus' },
                    { grade: 'C+', min_score: 55, max_score: 59, points: 7, remarks: 'Credit Plus' },
                    { grade: 'C', min_score: 50, max_score: 54, points: 6, remarks: 'Credit' },
                    { grade: 'C-', min_score: 45, max_score: 49, points: 5, remarks: 'Credit Minus' },
                    { grade: 'D+', min_score: 40, max_score: 44, points: 4, remarks: 'Pass Plus' },
                    { grade: 'D', min_score: 35, max_score: 39, points: 3, remarks: 'Pass' },
                    { grade: 'D-', min_score: 30, max_score: 34, points: 2, remarks: 'Pass Minus' },
                    { grade: 'E', min_score: 0, max_score: 29, points: 1, remarks: 'Fail' }
                ]
            },
            primary: {
                name: 'Primary School Grading',
                type: 'letter',
                grades: [
                    { grade: 'A', min_score: 80, max_score: 100, points: 4, remarks: 'Excellent' },
                    { grade: 'B', min_score: 60, max_score: 79, points: 3, remarks: 'Good' },
                    { grade: 'C', min_score: 40, max_score: 59, points: 2, remarks: 'Satisfactory' },
                    { grade: 'D', min_score: 0, max_score: 39, points: 1, remarks: 'Below Expectation' }
                ]
            }
        };

        const template = templates[templateName];
        setData({
            ...data,
            name: template.name,
            type: template.type,
            grades: template.grades
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            <Head title="Grading Systems" />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">Grading Systems</h1>
                            <p className="text-gray-600 mt-2">Manage custom grading scales for {school.name}</p>
                        </div>
                        <button
                            onClick={() => setShowCreateForm(!showCreateForm)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-lg"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create Grading System
                        </button>
                    </div>
                </div>

                {/* Create Form */}
                {showCreateForm && (
                    <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-200">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-semibold text-gray-900">Create New Grading System</h2>
                            <div className="flex space-x-2">
                                <button
                                    type="button"
                                    onClick={() => loadTemplate('kcse')}
                                    className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                                >
                                    Load KCSE Template
                                </button>
                                <button
                                    type="button"
                                    onClick={() => loadTemplate('primary')}
                                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200"
                                >
                                    Load Primary Template
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        System Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        placeholder="e.g., KCSE Grading System"
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Type
                                    </label>
                                    <select
                                        value={data.type}
                                        onChange={(e) => setData('type', e.target.value)}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="letter">Letter Grades (A, B, C, etc.)</option>
                                        <option value="number">Number Grades (1, 2, 3, etc.)</option>
                                        <option value="percentage">Percentage</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Description
                                </label>
                                <textarea
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    rows="2"
                                    placeholder="Optional description..."
                                />
                            </div>

                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-sm font-medium text-gray-700">
                                        Grade Definitions
                                    </label>
                                    <button
                                        type="button"
                                        onClick={addGrade}
                                        className="text-sm text-blue-600 hover:text-blue-700"
                                    >
                                        Add Grade
                                    </button>
                                </div>

                                <div className="space-y-3">
                                    {data.grades.map((grade, index) => (
                                        <div key={index} className="grid grid-cols-6 gap-3 items-end p-4 bg-gray-50 rounded-lg">
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Grade</label>
                                                <input
                                                    type="text"
                                                    value={grade.grade}
                                                    onChange={(e) => updateGrade(index, 'grade', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                    placeholder="A"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Min %</label>
                                                <input
                                                    type="number"
                                                    value={grade.min_score}
                                                    onChange={(e) => updateGrade(index, 'min_score', Number(e.target.value))}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Max %</label>
                                                <input
                                                    type="number"
                                                    value={grade.max_score}
                                                    onChange={(e) => updateGrade(index, 'max_score', Number(e.target.value))}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Points</label>
                                                <input
                                                    type="number"
                                                    value={grade.points}
                                                    onChange={(e) => updateGrade(index, 'points', Number(e.target.value))}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs font-medium text-gray-700 mb-1">Remarks</label>
                                                <input
                                                    type="text"
                                                    value={grade.remarks}
                                                    onChange={(e) => updateGrade(index, 'remarks', e.target.value)}
                                                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md"
                                                    placeholder="Excellent"
                                                />
                                            </div>
                                            <div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeGrade(index)}
                                                    className="p-2 text-red-600 hover:text-red-700"
                                                >
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={data.is_default}
                                    onChange={(e) => setData('is_default', e.target.checked)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label className="ml-2 text-sm text-gray-700">
                                    Set as default grading system
                                </label>
                            </div>

                            <div className="flex justify-end space-x-3">
                                <button
                                    type="button"
                                    onClick={() => setShowCreateForm(false)}
                                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {processing ? 'Creating...' : 'Create System'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Grading Systems List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {gradingSystems.map((system) => (
                        <div key={system.id} className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div>
                                        <div className="flex items-center">
                                            <h3 className="text-lg font-semibold text-gray-900">{system.name}</h3>
                                            {system.is_default && (
                                                <StarIcon className="w-5 h-5 text-yellow-500 ml-2" />
                                            )}
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{system.description}</p>
                                    </div>
                                </div>

                                <div className="space-y-2 mb-4">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Type:</span>
                                        <span className="font-medium capitalize">{system.type}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Grades:</span>
                                        <span className="font-medium">{system.grades.length} levels</span>
                                    </div>
                                </div>

                                {/* Grade Preview */}
                                <div className="mb-4">
                                    <div className="flex flex-wrap gap-1">
                                        {system.grades.slice(0, 6).map((grade) => (
                                            <span
                                                key={grade.id}
                                                className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded"
                                            >
                                                {grade.grade}
                                            </span>
                                        ))}
                                        {system.grades.length > 6 && (
                                            <span className="px-2 py-1 text-xs text-gray-500">
                                                +{system.grades.length - 6} more
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex justify-between items-center">
                                    <div className="flex space-x-2">
                                        <Link
                                            href={route('grading-systems.edit', [school.id, system.id])}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                        >
                                            <PencilIcon className="w-4 h-4" />
                                        </Link>
                                        {!system.is_default && (
                                            <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                                                <TrashIcon className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                    
                                    {!system.is_default && (
                                        <Link
                                            href={route('grading-systems.set-default', [school.id, system.id])}
                                            method="post"
                                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                                        >
                                            Set as Default
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {gradingSystems.length === 0 && (
                    <div className="text-center py-12">
                        <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <StarIcon className="w-12 h-12 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Grading Systems</h3>
                        <p className="text-gray-600 mb-4">Create your first grading system to get started with exams.</p>
                        <button
                            onClick={() => setShowCreateForm(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" />
                            Create Grading System
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}