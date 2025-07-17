<?php

namespace App\Http\Controllers;

use App\Models\Book;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookController extends Controller
{
    public function index(School $school)
    {
        $books = Book::where('school_id', $school->id)->with('category')->get();
        return Inertia::render('SchoolAdmin/Library/Books/Index', [
            'school' => $school,
            'books' => $books,
        ]);
    }

    public function create(School $school)
    {
        $bookCategories = \App\Models\BookCategory::where('school_id', $school->id)->get();
        return Inertia::render('SchoolAdmin/Library/Books/Create', [
            'school' => $school,
            'bookCategories' => $bookCategories,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'required|string|max:255',
            'isbn' => 'required|string|max:255|unique:books,isbn',
            'quantity' => 'required|integer|min:1',
            'book_category_id' => 'required|exists:book_categories,id',
        ]);

        $book = new Book($request->all());
        $book->school_id = $school->id;
        $book->available = $request->quantity;
        $book->save();

        return redirect()->route('books.index', $school)->with('success', 'Book created successfully.');
    }

    public function edit(School $school, Book $book)
    {
        return Inertia::render('SchoolAdmin/Library/Books/Edit', [
            'school' => $school,
            'book' => $book,
        ]);
    }

    public function update(Request $request, School $school, Book $book)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'author' => 'required|string|max:255',
            'publisher' => 'required|string|max:255',
            'isbn' => 'required|string|max:255|unique:books,isbn,' . $book->id,
            'quantity' => 'required|integer|min:1',
            'book_category_id' => 'required|exists:book_categories,id',
        ]);

        $book->update($request->all());

        return redirect()->route('books.index', $school)->with('success', 'Book updated successfully.');
    }

    public function destroy(School $school, Book $book)
    {
        $book->delete();

        return redirect()->route('books.index', $school)->with('success', 'Book deleted successfully.');
    }
}
