<?php

namespace App\Http\Controllers;

use App\Models\BookCategory;
use App\Models\School;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookCategoryController extends Controller
{
    public function index(School $school)
    {
        $bookCategories = BookCategory::where('school_id', $school->id)->get();
        return Inertia::render('SchoolAdmin/Library/BookCategories/Index', [
            'school' => $school,
            'bookCategories' => $bookCategories,
        ]);
    }

    public function create(School $school)
    {
        return Inertia::render('SchoolAdmin/Library/BookCategories/Create', [
            'school' => $school,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $bookCategory = new BookCategory($request->all());
        $bookCategory->school_id = $school->id;
        $bookCategory->save();

        return redirect()->route('book-categories.index', $school)->with('success', 'Book category created successfully.');
    }

    public function edit(School $school, BookCategory $bookCategory)
    {
        return Inertia::render('SchoolAdmin/Library/BookCategories/Edit', [
            'school' => $school,
            'bookCategory' => $bookCategory,
        ]);
    }

    public function update(Request $request, School $school, BookCategory $bookCategory)
    {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);

        $bookCategory->update($request->all());

        return redirect()->route('book-categories.index', $school)->with('success', 'Book category updated successfully.');
    }

    public function destroy(School $school, BookCategory $bookCategory)
    {
        $bookCategory->delete();

        return redirect()->route('book-categories.index', $school)->with('success', 'Book category deleted successfully.');
    }
}
