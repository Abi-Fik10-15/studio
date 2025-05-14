'use client';

import React from 'react';
import { useBooks } from '@/contexts/BookContext';
import { BookList } from '@/components/BookList';

export function BookListClientWrapper() {
  const { books, isLoading } = useBooks();
  return <BookList books={books} isLoading={isLoading} />;
}
