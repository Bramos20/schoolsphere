import React from 'react';
import { Head, useForm } from '@inertiajs/react';
import AppLayout from '@/Layouts/AppLayout';
import { Card, CardHeader, CardTitle, CardContent } from '@/Components/ui/card';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Label } from '@/Components/ui/label';
import InputError from '@/Components/InputError';

export default function Edit({ auth, school, book, bookCategories }) {
  const { data, setData, put, processing, errors } = useForm({
    title: book.title,
    author: book.author,
    publisher: book.publisher,
    isbn: book.isbn,
    quantity: book.quantity,
    book_category_id: book.book_category_id,
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    put(route('books.update', [school.id, book.id]));
  };

  return (
    <>
      <Head title="Edit Book" />
      <AppLayout user={auth.user}>
        <Card>
          <CardHeader>
            <CardTitle>Edit Book</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    type="text"
                    value={data.title}
                    onChange={(e) => setData('title', e.target.value)}
                  />
                  <InputError message={errors.title} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    type="text"
                    value={data.author}
                    onChange={(e) => setData('author', e.target.value)}
                  />
                  <InputError message={errors.author} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="publisher">Publisher</Label>
                  <Input
                    id="publisher"
                    type="text"
                    value={data.publisher}
                    onChange={(e) => setData('publisher', e.target.value)}
                  />
                  <InputError message={errors.publisher} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="isbn">ISBN</Label>
                  <Input
                    id="isbn"
                    type="text"
                    value={data.isbn}
                    onChange={(e) => setData('isbn', e.target.value)}
                  />
                  <InputError message={errors.isbn} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input
                    id="quantity"
                    type="number"
                    value={data.quantity}
                    onChange={(e) => setData('quantity', e.target.value)}
                  />
                  <InputError message={errors.quantity} className="mt-2" />
                </div>
                <div>
                  <Label htmlFor="book_category_id">Category</Label>
                  <select
                    id="book_category_id"
                    className="w-full border rounded p-2"
                    value={data.book_category_id}
                    onChange={(e) => setData('book_category_id', e.target.value)}
                  >
                    <option value="">Select a category</option>
                    {bookCategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  <InputError message={errors.book_category_id} className="mt-2" />
                </div>
              </div>
              <Button type="submit" disabled={processing} className="mt-4">
                Update Book
              </Button>
            </form>
          </CardContent>
        </Card>
      </AppLayout>
    </>
  );
}
