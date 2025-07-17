import React from 'react';
import AppLayout from '@/Layouts/AppLayout';
import { useForm, router, Link } from '@inertiajs/react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';

export default function Schools({ schools }) {
  const { toast } = useToast();
  const { data, setData, post, reset, processing } = useForm({ name: '' });

  const submit = (e) => {
    e.preventDefault();

    post(route('schools.store'), {
      onSuccess: () => {
        toast({
          title: 'School Created',
          description: `"${data.name}" was added successfully.`,
        });
        reset();
      },
      onError: () => {
        toast({
          title: 'Error',
          description: 'Failed to create school. Please try again.',
          variant: 'destructive',
        });
      }
    });
  };

  const deleteSchool = (id) => {
    if (confirm('Are you sure you want to delete this school?')) {
      router.delete(route('schools.destroy', id), {
        onSuccess: () => {
          toast({
            title: 'School Deleted',
            description: `School #${id} was deleted successfully.`,
          });
        },
        onError: () => {
          toast({
            title: 'Error',
            description: 'Failed to delete school. Please try again.',
            variant: 'destructive',
          });
        }
      });
    }
  };

  return (
    <AppLayout>
      <h1 className="text-2xl font-bold mb-6">Manage Schools</h1>

      <Card className="mb-6 max-w-md">
        <CardHeader>
          <CardTitle>Add School</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <Input
              placeholder="School Name"
              value={data.name}
              onChange={(e) => setData('name', e.target.value)}
            />
            <Button type="submit" disabled={processing}>
              Create
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        {schools.map((school) => (
          <Card key={school.id}>
            <CardHeader>
              <CardTitle>{school.name}</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="text-gray-500 mb-2">School ID: {school.id}</div>

              <div className="flex items-center justify-between">
                <Link
                  href={`/schools/${school.id}/assign-admin`}
                  className="text-sm text-blue-600 hover:underline"
                >
                  Assign Admin
                </Link>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => deleteSchool(school.id)}
                >
                  Delete
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppLayout>
  );
}