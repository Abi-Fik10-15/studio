'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, BookMarked } from 'lucide-react';
import { useBooks } from '@/contexts/BookContext';

export function AppHeader() {
  const { openBookForm } = useBooks();

  return (
    <header className="py-6 px-4 md:px-8 border-b border-border bg-card shadow-sm">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2">
          <BookMarked className="h-8 w-8 text-primary" />
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            ShelfWise
          </h1>
        </div>
        <Button onClick={() => openBookForm()} variant="default" size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Add New Book
        </Button>
      </div>
    </header>
  );
}
