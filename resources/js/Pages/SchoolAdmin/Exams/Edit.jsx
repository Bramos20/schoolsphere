import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import PrimaryButton from '@/Components/PrimaryButton';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Edit({ school, exam, classes, subjects }) {
    const { data, setData, put, processing, errors } = useForm({
        class_id: exam.class_id,
        subject_id: exam.subject_id,
        name: exam.name,
        date: exam.date,
        start_time: exam.start_time,
        end_time: exam.end_time,
    });

    const submit = (e) => {
        e.preventDefault();
        put(route('exams.update', [school, exam]));
    };

    return (
        <AppLayout>
            <Head title="Edit Exam" />
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <h1 className="text-2xl font-bold">Edit Exam</h1>
                            <form onSubmit={submit}>
                                <div className="mt-4">
                                    <InputLabel htmlFor="class_id" value="Class" />
                                    <select
                                        id="class_id"
                                        name="class_id"
                                        value={data.class_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('class_id', e.target.value)}
                                    >
                                        <option value="">Select a class</option>
                                        {classes.map((c) => (
                                            <option key={c.id} value={c.id}>
                                                {c.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.class_id} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="subject_id" value="Subject" />
                                    <select
                                        id="subject_id"
                                        name="subject_id"
                                        value={data.subject_id}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('subject_id', e.target.value)}
                                    >
                                        <option value="">Select a subject</option>
                                        {subjects.map((s) => (
                                            <option key={s.id} value={s.id}>
                                                {s.name}
                                            </option>
                                        ))}
                                    </select>
                                    <InputError message={errors.subject_id} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="name" value="Name" />
                                    <TextInput
                                        id="name"
                                        type="text"
                                        name="name"
                                        value={data.name}
                                        className="mt-1 block w-full"
                                        isFocused={true}
                                        onChange={(e) => setData('name', e.target.value)}
                                    />
                                    <InputError message={errors.name} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="date" value="Date" />
                                    <TextInput
                                        id="date"
                                        type="date"
                                        name="date"
                                        value={data.date}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('date', e.target.value)}
                                    />
                                    <InputError message={errors.date} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="start_time" value="Start Time" />
                                    <TextInput
                                        id="start_time"
                                        type="time"
                                        name="start_time"
                                        value={data.start_time}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('start_time', e.target.value)}
                                    />
                                    <InputError message={errors.start_time} className="mt-2" />
                                </div>
                                <div className="mt-4">
                                    <InputLabel htmlFor="end_time" value="End Time" />
                                    <TextInput
                                        id="end_time"
                                        type="time"
                                        name="end_time"
                                        value={data.end_time}
                                        className="mt-1 block w-full"
                                        onChange={(e) => setData('end_time', e.target.value)}
                                    />
                                    <InputError message={errors.end_time} className="mt-2" />
                                </div>
                                <div className="flex items-center justify-end mt-4">
                                    <PrimaryButton className="ml-4" disabled={processing}>
                                        Update
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
