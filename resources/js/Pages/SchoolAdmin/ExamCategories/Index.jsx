import React, { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Plus, Edit, Trash2, Palette, Percent, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';


export default function ExamCategoriesIndex({ school, categories }) {
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editingCategory, setEditingCategory] = useState(null);

    const { data, setData, post, put, processing, errors, reset } = useForm({
        name: '',
        description: '',
        weight_percentage: '',
        color: '#3b82f6'
    });

    const predefinedColors = [
        '#3b82f6', // blue
        '#ef4444', // red
        '#10b981', // green
        '#f59e0b', // yellow
        '#8b5cf6', // purple
        '#ec4899', // pink
        '#06b6d4', // cyan
        '#84cc16', // lime
        '#f97316', // orange
        '#6b7280'  // gray
    ];

    const handleSubmit = (e) => {
        e.preventDefault();
        
        if (editingCategory) {
            put(route('exam-categories.update', [school.id, editingCategory.id]), {
                onSuccess: () => {
                    reset();
                    setEditingCategory(null);
                }
            });
        } else {
            post(route('exam-categories.store', school.id), {
                onSuccess: () => {
                    reset();
                    setIsCreateOpen(false);
                }
            });
        }
    };

    const handleEdit = (category) => {
        setData({
            name: category.name,
            description: category.description || '',
            weight_percentage: category.weight_percentage.toString(),
            color: category.color || '#3b82f6'
        });
        setEditingCategory(category);
        setIsCreateOpen(true);
    };

    const handleDelete = (categoryId) => {
        if (confirm('Are you sure you want to delete this exam category?')) {
            router.delete(route('exam-categories.destroy', [school.id, categoryId]));
        }
    };

    const closeDialog = () => {
        setIsCreateOpen(false);
        setEditingCategory(null);
        reset();
    };

    const totalWeight = categories.reduce((sum, cat) => sum + parseFloat(cat.weight_percentage), 0);

    return (
        <div className="space-y-6">
            <Head title="Exam Categories" />

            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Exam Categories</h1>
                    <p className="text-muted-foreground">
                        Organize exams by categories with weight percentages
                    </p>
                </div>
                
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button onClick={() => setEditingCategory(null)}>
                            <Plus className="mr-2 h-4 w-4" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>
                                {editingCategory ? 'Edit Category' : 'Create New Category'}
                            </DialogTitle>
                            <DialogDescription>
                                Set up a new exam category with weight percentage for term calculations.
                            </DialogDescription>
                        </DialogHeader>
                        
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Category Name *</Label>
                                <Input
                                    id="name"
                                    value={data.name}
                                    onChange={e => setData('name', e.target.value)}
                                    placeholder="e.g., Mid-Term, End-Term, CAT"
                                />
                                {errors.name && (
                                    <p className="text-sm text-red-600">{errors.name}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={data.description}
                                    onChange={e => setData('description', e.target.value)}
                                    placeholder="Optional description of this category"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="weight_percentage">Weight Percentage *</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        id="weight_percentage"
                                        type="number"
                                        min="0"
                                        max="100"
                                        step="0.1"
                                        value={data.weight_percentage}
                                        onChange={e => setData('weight_percentage', e.target.value)}
                                        placeholder="30"
                                    />
                                    <Percent className="h-4 w-4 text-muted-foreground" />
                                </div>
                                {errors.weight_percentage && (
                                    <p className="text-sm text-red-600">{errors.weight_percentage}</p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                    Current total: {totalWeight}% {editingCategory && `(excluding current: ${totalWeight - parseFloat(editingCategory.weight_percentage)}%)`}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label>Color</Label>
                                <div className="flex items-center gap-2">
                                    <div 
                                        className="w-8 h-8 rounded border-2 border-gray-200"
                                        style={{ backgroundColor: data.color }}
                                    />
                                    <Input
                                        type="color"
                                        value={data.color}
                                        onChange={e => setData('color', e.target.value)}
                                        className="w-16 p-1 h-8"
                                    />
                                </div>
                                
                                <div className="grid grid-cols-5 gap-2 mt-2">
                                    {predefinedColors.map(color => (
                                        <button
                                            key={color}
                                            type="button"
                                            className={`w-8 h-8 rounded border-2 transition-all ${
                                                data.color === color ? 'border-gray-900 scale-110' : 'border-gray-200 hover:border-gray-400'
                                            }`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => setData('color', color)}
                                        />
                                    ))}
                                </div>
                            </div>

                            <div className="flex gap-2 pt-4">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Saving...' : editingCategory ? 'Update Category' : 'Create Category'}
                                </Button>
                                <Button type="button" variant="outline" onClick={closeDialog}>
                                    Cancel
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Weight Overview */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Percent className="h-5 w-5" />
                        Weight Distribution
                    </CardTitle>
                    <CardDescription>
                        Total weight across all categories: {totalWeight}%
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center text-sm">
                            <span>Total Weight:</span>
                            <span className={`font-medium ${totalWeight === 100 ? 'text-green-600' : totalWeight > 100 ? 'text-red-600' : 'text-yellow-600'}`}>
                                {totalWeight}%
                            </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-3">
                            <div 
                                className={`h-3 rounded-full transition-all ${
                                    totalWeight === 100 ? 'bg-green-500' : 
                                    totalWeight > 100 ? 'bg-red-500' : 
                                    'bg-yellow-500'
                                }`}
                                style={{ width: `${Math.min(totalWeight, 100)}%` }}
                            />
                        </div>

                        {totalWeight !== 100 && (
                            <p className="text-sm text-muted-foreground">
                                {totalWeight > 100 
                                    ? `Reduce weights by ${totalWeight - 100}% to balance categories`
                                    : `Add ${100 - totalWeight}% more weight to reach 100%`
                                }
                            </p>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Categories Grid */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {categories.map((category) => (
                    <Card key={category.id} className="relative">
                        <CardHeader>
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <CardTitle className="flex items-center gap-2">
                                        <div 
                                            className="w-4 h-4 rounded"
                                            style={{ backgroundColor: category.color }}
                                        />
                                        {category.name}
                                    </CardTitle>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline">
                                            {category.weight_percentage}%
                                        </Badge>
                                        <Badge variant={category.is_active ? 'default' : 'secondary'}>
                                            {category.is_active ? 'Active' : 'Inactive'}
                                        </Badge>
                                    </div>
                                </div>
                                
                                <div className="flex gap-1">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleEdit(category)}
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleDelete(category.id)}
                                        className="text-red-600 hover:text-red-700"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardHeader>
                        
                        <CardContent>
                            {category.description && (
                                <p className="text-sm text-muted-foreground mb-4">
                                    {category.description}
                                </p>
                            )}
                            
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Weight:</span>
                                    <span className="font-medium">{category.weight_percentage}%</span>
                                </div>
                                
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Exams:</span>
                                    <span className="font-medium">{category.exams?.length || 0}</span>
                                </div>
                                
                                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
                                    <div 
                                        className="h-2 rounded-full"
                                        style={{ 
                                            backgroundColor: category.color,
                                            width: `${category.weight_percentage}%`
                                        }}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Empty State */}
            {categories.length === 0 && (
                <Card>
                    <CardContent className="pt-6">
                        <div className="text-center py-8">
                            <Tag className="mx-auto h-12 w-12 text-muted-foreground" />
                            <h3 className="mt-2 text-sm font-semibold text-muted-foreground">No exam categories</h3>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Get started by creating your first exam category.
                            </p>
                            <div className="mt-6">
                                <Button onClick={() => setIsCreateOpen(true)}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Category
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Guidelines */}
            <Card>
                <CardHeader>
                    <CardTitle>Category Guidelines</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid gap-4 md:grid-cols-2">
                        <div>
                            <h4 className="font-medium mb-2">Common Categories</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• <strong>CAT (30%):</strong> Continuous Assessment Tests</li>
                                <li>• <strong>Mid-Term (30%):</strong> Mid-term examinations</li>
                                <li>• <strong>End-Term (40%):</strong> Final term exams</li>
                                <li>• <strong>Assignments (10%):</strong> Homework and projects</li>
                            </ul>
                        </div>
                        
                        <div>
                            <h4 className="font-medium mb-2">Best Practices</h4>
                            <ul className="text-sm text-muted-foreground space-y-1">
                                <li>• Ensure total weights equal 100%</li>
                                <li>• Use distinct colors for easy identification</li>
                                <li>• Keep category names short and clear</li>
                                <li>• Balance weights based on assessment importance</li>
                            </ul>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}