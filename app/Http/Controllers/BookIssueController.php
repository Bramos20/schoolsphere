<?php

namespace App\Http\Controllers;

use App\Models\BookIssue;
use App\Models\School;
use App\Models\Book;
use App\Models\Student;
use App\Models\Staff;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BookIssueController extends Controller
{
    public function index(School $school)
    {
        $bookIssues = BookIssue::where('school_id', $school->id)->with(['book', 'user'])->get();
        return Inertia::render('SchoolAdmin/Library/BookIssues/Index', [
            'school' => $school,
            'bookIssues' => $bookIssues,
        ]);
    }

    public function create(School $school)
    {
        $books = Book::where('school_id', $school->id)->where('available', '>', 0)->get();
        $students = Student::where('school_id', $school->id)->with('user', 'stream')->get();
        $staff = Staff::where('school_id', $school->id)->with('user')->get();
        $classes = \App\Models\SchoolClass::where('school_id', $school->id)->with('streams')->get();
        return Inertia::render('SchoolAdmin/Library/BookIssues/Create', [
            'school' => $school,
            'books' => $books,
            'students' => $students,
            'staff' => $staff,
            'classes' => $classes,
        ]);
    }

    public function store(Request $request, School $school)
    {
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'user_id' => 'required|exists:users,id',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after:issue_date',
            'user_type' => 'required|in:student,staff',
        ]);

        $book = Book::find($request->book_id);
        if ($book->available < 1) {
            return redirect()->back()->with('error', 'Book is not available.');
        }

        $bookIssue = new BookIssue($request->all());
        $bookIssue->school_id = $school->id;
        $bookIssue->save();

        $book->decrement('available');

        return redirect()->route('book-issues.index', $school)->with('success', 'Book issued successfully.');
    }

    public function update(Request $request, School $school, BookIssue $bookIssue)
    {
        $request->validate([
            'return_date' => 'required|date|after:issue_date',
        ]);

        $bookIssue->update($request->all());

        $book = Book::find($bookIssue->book_id);
        $book->increment('available');

        return redirect()->route('book-issues.index', $school)->with('success', 'Book returned successfully.');
    }
}
