'use client';

import React, { useState, useMemo, useEffect } from 'react';
import type { Book, BookStatus } from '@/types';
import { BookCard } from '@/components/BookCard';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { BookStatusOptions } from '@/types';
import { Skeleton } from '@/components/ui/skeleton';
import { FileText } from 'lucide-react';

interface BookListProps {
  books: Book[];
  isLoading: boolean;
}

const AllStatusValue = 'all';

export function BookList({ books, isLoading }: BookListProps) {
  const [activeStatusFilter, setActiveStatusFilter] = useState<BookStatus | typeof AllStatusValue>(AllStatusValue);
  const [selectedGenre, setSelectedGenre] = useState<string>(AllStatusValue);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // Ensures component is mounted before rendering potentially client-side specific UI
  }, []);

  const genres = useMemo(() => {
    const uniqueGenres = new Set<string>();
    books.forEach(book => uniqueGenres.add(book.genre));
    return [AllStatusValue, ...Array.from(uniqueGenres).sort()];
  }, [books]);

  const filteredBooks = useMemo(() => {
    return books.filter(book => {
      const statusMatch = activeStatusFilter === AllStatusValue || book.status === activeStatusFilter;
      const genreMatch = selectedGenre === AllStatusValue || book.genre === selectedGenre;
      const searchTermMatch = searchTerm === '' || 
                              book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                              book.author.toLowerCase().includes(searchTerm.toLowerCase());
      return statusMatch && genreMatch && searchTermMatch;
    }).sort((a, b) => new Date(b.addedDate).getTime() - new Date(a.addedDate).getTime()); // Sort by most recently added
  }, [books, activeStatusFilter, selectedGenre, searchTerm]);

  if (!mounted && isLoading) { 
    return (
       <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4 md:p-6">
        {Array.from({ length: 8 }).map((_, index) => (
          <Skeleton key={index} className="h-[450px] w-full rounded-lg" />
        ))}
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 px-4 md:px-0">
      <div className="mb-8 p-6 bg-card rounded-lg shadow">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <Label htmlFor="search-books" className="block text-sm font-medium text-foreground mb-1">Search by Title/Author</Label>
            <Input
              id="search-books"
              type="text"
              placeholder="Search books..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full"
            />
          </div>
          <div>
            <Label htmlFor="genre-filter" className="block text-sm font-medium text-foreground mb-1">Filter by Genre</Label>
            <Select value={selectedGenre} onValueChange={setSelectedGenre}>
              <SelectTrigger id="genre-filter" className="w-full">
                <SelectValue placeholder="Filter by genre" />
              </SelectTrigger>
              <SelectContent>
                {genres.map(genre => (
                  <SelectItem key={genre} value={genre}>
                    {genre === AllStatusValue ? 'All Genres' : genre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-3">
             <Label className="block text-sm font-medium text-foreground mb-1">Filter by Status</Label>
            <Tabs value={activeStatusFilter} onValueChange={(value) => setActiveStatusFilter(value as BookStatus | typeof AllStatusValue)} className="w-full">
              <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                <TabsTrigger value={AllStatusValue}>All</TabsTrigger>
                {BookStatusOptions.map(option => (
                  <TabsTrigger key={option.value} value={option.value}>
                    {option.label}
                  </TabsTrigger>
                ))}
              </TabsList>
            </Tabs>
          </div>
        </div>
      </div>

      {isLoading && mounted ? (
         <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
         {Array.from({ length: 4 }).map((_, index) => (
           <Skeleton key={index} className="h-[450px] w-full rounded-lg" />
         ))}
       </div>
      ) : filteredBooks.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredBooks.map(book => (
            <BookCard key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <FileText className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-xl font-semibold text-foreground mb-2">No Books Found</h3>
          <p className="text-muted-foreground">
            {books.length === 0 ? "You haven't added any books yet. Get started by adding one!" : "Try adjusting your filters or add more books."}
          </p>
        </div>
      )}
    </div>
  );
}
