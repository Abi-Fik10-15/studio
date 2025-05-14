'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import type { Book } from '@/types';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Edit3, Trash2, BookOpen, Library, BookmarkPlus, Save } from 'lucide-react';
import { useBooks } from '@/contexts/BookContext';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

interface BookCardProps {
  book: Book;
}

export function BookCard({ book }: BookCardProps) {
  const { updateBook, deleteBook, openBookForm } = useBooks();
  const { toast } = useToast();
  const [isProgressPopoverOpen, setIsProgressPopoverOpen] = useState(false);
  const [tempCurrentPage, setTempCurrentPage] = useState<string>(book.currentPage?.toString() || '0');
  const [tempTotalPages, setTempTotalPages] = useState<string>(book.totalPages?.toString() || '');

  const handleProgressUpdate = () => {
    const current = parseInt(tempCurrentPage, 10);
    const total = parseInt(tempTotalPages, 10);
    let validUpdate = false;

    if (!isNaN(current) && current >= 0) {
      if (!isNaN(total) && total > 0) { // Both current and total provided and valid
        if (current <= total) {
          updateBook(book.id, { currentPage: current, totalPages: total });
          validUpdate = true;
        } else {
          toast({ title: "Invalid Input", description: "Current page cannot exceed total pages.", variant: "destructive" });
        }
      } else if (isNaN(total) || total <= 0) { // Only current page provided or total is invalid, use existing total
        if (book.totalPages && current <= book.totalPages) {
           updateBook(book.id, { currentPage: current });
           validUpdate = true;
        } else if (!book.totalPages) {
          // If no total pages ever set, and user tries to update only current page
          toast({ title: "Missing Information", description: "Please set total pages first or update both.", variant: "destructive" });
        } else {
           toast({ title: "Invalid Input", description: "Current page cannot exceed total pages.", variant: "destructive" });
        }
      }
    } else {
      toast({ title: "Invalid Input", description: "Current page must be a non-negative number.", variant: "destructive" });
    }
    
    if (validUpdate) {
      setIsProgressPopoverOpen(false);
      toast({ title: "Progress Updated", description: `Progress for "${book.title}" saved.`});
    }
  };
  
  const getStatusIcon = () => {
    switch (book.status) {
      case 'reading': return <BookOpen className="h-4 w-4 mr-1.5" />;
      case 'finished': return <Library className="h-4 w-4 mr-1.5" />;
      case 'to-read': return <BookmarkPlus className="h-4 w-4 mr-1.5" />;
      default: return null;
    }
  };

  const getStatusVariant = () => {
    switch (book.status) {
      case 'reading': return 'default'; // using primary color (teal)
      case 'finished': return 'secondary'; // using secondary color (calm blue)
      case 'to-read': return 'outline';
      default: return 'default';
    }
  };

  const progressValue = book.totalPages && book.currentPage !== undefined ? (book.currentPage / book.totalPages) * 100 : 0;
  const coverImageUrl = book.coverImage || `https://placehold.co/300x450.png?text=${encodeURIComponent(book.title)}`;

  return (
    <Card className="flex flex-col overflow-hidden shadow-lg hover:shadow-xl transition-shadow duration-300 h-full bg-card rounded-lg border border-border">
      <CardHeader className="p-0 relative">
        <Image
          src={coverImageUrl}
          alt={`Cover of ${book.title}`}
          width={300}
          height={450}
          className="w-full h-60 object-cover"
          data-ai-hint="book cover"
          onError={(e) => { e.currentTarget.src = `https://placehold.co/300x450.png?text=${encodeURIComponent(book.title)}`; }}
        />
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="text-xl font-semibold mb-1 text-foreground truncate" title={book.title}>{book.title}</CardTitle>
        <CardDescription className="text-sm text-muted-foreground mb-1 truncate" title={book.author}>By {book.author}</CardDescription>
        <CardDescription className="text-xs text-muted-foreground mb-3">Genre: {book.genre}</CardDescription>
        
        <div className="flex items-center mb-3">
          {getStatusIcon()}
          <Badge variant={getStatusVariant()} className="capitalize text-xs">
            {book.status.replace('-', ' ')}
          </Badge>
        </div>

        {book.status === 'reading' && (
          <div className="space-y-2">
            <Progress value={progressValue} className="w-full h-2" />
            <p className="text-xs text-muted-foreground">
              {book.currentPage !== undefined ? book.currentPage : 'N/A'} / {book.totalPages !== undefined ? book.totalPages : 'N/A'} pages
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 border-t border-border bg-muted/30 flex items-center justify-between gap-2">
        <div className="flex gap-2">
        {book.status === 'reading' && (
           <Popover open={isProgressPopoverOpen} onOpenChange={setIsProgressPopoverOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="text-xs">
                <Save className="h-3.5 w-3.5 mr-1.5" /> Progress
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-60 p-4 space-y-3 bg-card">
              <h4 className="font-medium leading-none text-foreground">Update Progress</h4>
              <div className="grid gap-2">
                <Label htmlFor={`current-page-${book.id}`} className="text-sm">Current Page</Label>
                <Input
                  id={`current-page-${book.id}`}
                  type="number"
                  value={tempCurrentPage}
                  onChange={(e) => setTempCurrentPage(e.target.value)}
                  className="h-8 text-sm"
                  min="0"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor={`total-pages-${book.id}`} className="text-sm">Total Pages</Label>
                <Input
                  id={`total-pages-${book.id}`}
                  type="number"
                  value={tempTotalPages}
                  onChange={(e) => setTempTotalPages(e.target.value)}
                  className="h-8 text-sm"
                  min="1"
                />
              </div>
              <Button onClick={handleProgressUpdate} size="sm" className="w-full">Save</Button>
            </PopoverContent>
          </Popover>
        )}
         <Button variant="outline" size="sm" onClick={() => openBookForm(book.id)} className="text-xs">
            <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit
          </Button>
        </div>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive" size="sm" className="text-xs">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete "{book.title}" from your list.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => deleteBook(book.id)}>Delete</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>
    </Card>
  );
}
