'use client';

import type { ReactNode } from 'react';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Book, BookStatus } from '@/types';
import { useToast } from '@/hooks/use-toast';

interface BookContextType {
  books: Book[];
  isLoading: boolean;
  addBook: (bookData: Omit<Book, 'id' | 'addedDate'>) => void;
  updateBook: (id: string, updates: Partial<Omit<Book, 'id'>>) => void;
  deleteBook: (id: string) => void;
  getBookById: (id: string) => Book | undefined;
  isBookFormOpen: boolean;
  openBookForm: (bookId?: string) => void;
  closeBookForm: () => void;
  editingBookId: string | null;
}

const BookContext = createContext<BookContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY = 'shelfwise_books';

export const BookProvider = ({ children }: { children: ReactNode }) => {
  const [books, setBooks] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isBookFormOpen, setIsBookFormOpen] = useState(false);
  const [editingBookId, setEditingBookId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const storedBooks = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (storedBooks) {
        setBooks(JSON.parse(storedBooks));
      }
    } catch (error) {
      console.error('Failed to load books from localStorage:', error);
      toast({ title: "Error", description: "Could not load books from your browser's storage.", variant: "destructive" });
    }
    setIsLoading(false);
  }, [toast]);

  const saveBooks = useCallback((updatedBooks: Book[]) => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updatedBooks));
      setBooks(updatedBooks);
    } catch (error) {
      console.error('Failed to save books to localStorage:', error);
      toast({ title: "Error", description: "Could not save books to your browser's storage.", variant: "destructive" });
    }
  }, [toast]);

  const addBook = useCallback((bookData: Omit<Book, 'id' | 'addedDate'>) => {
    const newBook: Book = {
      ...bookData,
      id: crypto.randomUUID(),
      addedDate: new Date().toISOString(),
      currentPage: bookData.status === 'reading' ? (bookData.currentPage || 0) : undefined,
      totalPages: bookData.status === 'reading' ? (bookData.totalPages || undefined) : undefined,
    };
    const updatedBooks = [...books, newBook];
    saveBooks(updatedBooks);
    toast({ title: "Book Added", description: `"${newBook.title}" has been added to your list.` });
  }, [books, saveBooks, toast]);

  const updateBook = useCallback((id: string, updates: Partial<Omit<Book, 'id'>>) => {
    const updatedBooks = books.map(book =>
      book.id === id ? { ...book, ...updates } : book
    );
    saveBooks(updatedBooks);
    toast({ title: "Book Updated", description: `"${updates.title || 'Book'}" has been updated.` });
  }, [books, saveBooks, toast]);

  const deleteBook = useCallback((id: string) => {
    const bookToDelete = books.find(b => b.id === id);
    const updatedBooks = books.filter(book => book.id !== id);
    saveBooks(updatedBooks);
    if (bookToDelete) {
      toast({ title: "Book Deleted", description: `"${bookToDelete.title}" has been removed.`, variant: 'destructive' });
    }
  }, [books, saveBooks, toast]);

  const getBookById = useCallback((id: string) => {
    return books.find(book => book.id === id);
  }, [books]);

  const openBookForm = (bookId?: string) => {
    setEditingBookId(bookId || null);
    setIsBookFormOpen(true);
  };

  const closeBookForm = () => {
    setIsBookFormOpen(false);
    setEditingBookId(null);
  };

  return (
    <BookContext.Provider value={{ 
      books, 
      isLoading, 
      addBook, 
      updateBook, 
      deleteBook, 
      getBookById,
      isBookFormOpen,
      openBookForm,
      closeBookForm,
      editingBookId
    }}>
      {children}
    </BookContext.Provider>
  );
};

export const useBooks = (): BookContextType => {
  const context = useContext(BookContext);
  if (context === undefined) {
    throw new Error('useBooks must be used within a BookProvider');
  }
  return context;
};
