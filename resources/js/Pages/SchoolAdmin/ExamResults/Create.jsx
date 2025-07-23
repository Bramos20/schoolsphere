import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Create({ exam, students }) {
    const { data, setData, post, processing, errors } = useForm({
        student_id: '',
        score: '',
    });

    const submit = (e) => {
        e.preventDefault();
        post(route('exam_results.store', exam));
    };

    return (
        <AppLayout>
            <Head title="Add Exam Result" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-bold">Add Exam Result</h1>
                            <form onSubmit={submit}>
                                <div className="mt-4">
                                    <InputLabel htmlFor="student_id" value="Student" />
                                    <select
                                        id="student_id"
                                        name="student_id"
                                        value={data.student_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('student_id', e.target.value)}
                                    >
                                        <option value="">Select a student</option>
                                        {students.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.student_id} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="score" value="Score" />
                                    <TextInput
                                        id="score"
                                        type="number"
                                        name="score"
                                        value={data.score}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('score', e.target.value)}
                                    />
                                    <InputError message={errors.score} className="mt-2" />
                                </div>
                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        Add Result
                                    </PrimaryButton>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
