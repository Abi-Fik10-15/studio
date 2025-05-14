'use client';

import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from '@/components/ui/dialog';
import type { Book, BookStatus } from '@/types';
import { BookStatusOptions } from '@/types';
import { useBooks } from '@/contexts/BookContext';
// import { Textarea } from '@/components/ui/textarea'; // Not used in this version

const bookFormSchema = z.object({
  title: z.string().min(1, 'Title is required').max(100, 'Title is too long'),
  author: z.string().min(1, 'Author is required').max(100, 'Author is too long'),
  genre: z.string().min(1, 'Genre is required').max(50, 'Genre is too long'),
  status: z.enum(['to-read', 'reading', 'finished']),
  coverImage: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  currentPage: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(0, 'Cannot be negative').optional()
  ),
  totalPages: z.preprocess(
    (val) => (val === "" || val === undefined ? undefined : Number(val)),
    z.number().min(1, 'Must be at least 1').optional()
  ),
}).refine(data => {
  if (data.status === 'reading' && data.currentPage !== undefined && data.totalPages !== undefined) {
    return data.currentPage <= data.totalPages;
  }
  return true;
}, {
  message: 'Current page cannot exceed total pages',
  path: ['currentPage'],
});

type BookFormData = z.infer<typeof bookFormSchema>;

export function BookForm() {
  const { addBook, updateBook, getBookById, isBookFormOpen, closeBookForm, editingBookId } = useBooks();
  const [currentStatus, setCurrentStatus] = useState<BookStatus | undefined>(undefined);

  const editingBook = editingBookId ? getBookById(editingBookId) : null;

  const form = useForm<BookFormData>({
    resolver: zodResolver(bookFormSchema),
    defaultValues: {
      title: '',
      author: '',
      genre: '',
      status: 'to-read',
      coverImage: '',
      currentPage: undefined,
      totalPages: undefined,
    },
  });

  useEffect(() => {
    if (editingBook) {
      form.reset({
        title: editingBook.title,
        author: editingBook.author,
        genre: editingBook.genre,
        status: editingBook.status,
        coverImage: editingBook.coverImage || '',
        currentPage: editingBook.currentPage,
        totalPages: editingBook.totalPages,
      });
      setCurrentStatus(editingBook.status);
    } else {
      form.reset({ // Reset to default for new book
        title: '',
        author: '',
        genre: '',
        status: 'to-read',
        coverImage: '',
        currentPage: undefined,
        totalPages: undefined,
      });
      setCurrentStatus('to-read');
    }
  }, [editingBook, form, isBookFormOpen]);
  
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === 'status') {
        setCurrentStatus(value.status as BookStatus);
        if (value.status !== 'reading') {
          form.setValue('currentPage', undefined);
          form.setValue('totalPages', undefined);
        }
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);


  const onSubmit = (data: BookFormData) => {
    const bookDataPayload = {
      ...data,
      currentPage: data.status === 'reading' ? data.currentPage : undefined,
      totalPages: data.status === 'reading' ? data.totalPages : undefined,
    };

    if (editingBook) {
      updateBook(editingBook.id, bookDataPayload);
    } else {
      addBook(bookDataPayload);
    }
    form.reset();
    closeBookForm();
  };

  if (!isBookFormOpen) return null;

  return (
    <Dialog open={isBookFormOpen} onOpenChange={(open) => !open && closeBookForm()}>
      <DialogContent className="sm:max-w-[525px] bg-card shadow-xl rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-semibold text-foreground">
            {editingBook ? 'Edit Book' : 'Add New Book'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-6 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right text-foreground/80">Title</Label>
            <Input id="title" {...form.register('title')} className="col-span-3" placeholder="The Great Gatsby" />
            {form.formState.errors.title && <p className="col-span-4 text-right text-destructive text-sm pr-1">{form.formState.errors.title.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="author" className="text-right text-foreground/80">Author</Label>
            <Input id="author" {...form.register('author')} className="col-span-3" placeholder="F. Scott Fitzgerald" />
            {form.formState.errors.author && <p className="col-span-4 text-right text-destructive text-sm pr-1">{form.formState.errors.author.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="genre" className="text-right text-foreground/80">Genre</Label>
            <Input id="genre" {...form.register('genre')} className="col-span-3" placeholder="Classic Fiction" />
            {form.formState.errors.genre && <p className="col-span-4 text-right text-destructive text-sm pr-1">{form.formState.errors.genre.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="status" className="text-right text-foreground/80">Status</Label>
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Select onValueChange={(value) => field.onChange(value as BookStatus)} value={field.value}>
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {BookStatusOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
             {form.formState.errors.status && <p className="col-span-4 text-right text-destructive text-sm pr-1">{form.formState.errors.status.message}</p>}
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="coverImage" className="text-right text-foreground/80">Cover URL</Label>
            <Input id="coverImage" {...form.register('coverImage')} className="col-span-3" placeholder="https://placehold.co/300x450.png" />
            {form.formState.errors.coverImage && <p className="col-span-4 text-right text-destructive text-sm pr-1">{form.formState.errors.coverImage.message}</p>}
          </div>

          {currentStatus === 'reading' && (
            <>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="currentPage" className="text-right text-foreground/80">Current Page</Label>
                <Input id="currentPage" type="number" {...form.register('currentPage')} className="col-span-3" placeholder="e.g., 75" />
                {form.formState.errors.currentPage && <p className="col-span-4 text-right text-destructive text-sm pr-1">{form.formState.errors.currentPage.message}</p>}
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="totalPages" className="text-right text-foreground/80">Total Pages</Label>
                <Input id="totalPages" type="number" {...form.register('totalPages')} className="col-span-3" placeholder="e.g., 300" />
                {form.formState.errors.totalPages && <p className="col-span-4 text-right text-destructive text-sm pr-1">{form.formState.errors.totalPages.message}</p>}
              </div>
            </>
          )}
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" variant="default">{editingBook ? 'Save Changes' : 'Add Book'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
