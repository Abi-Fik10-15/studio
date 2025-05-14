'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Loader2, Sparkles, Lightbulb } from 'lucide-react';
import { useBooks } from '@/contexts/BookContext';
import { generateBookRecommendation } from '@/ai/flows/generate-book-recommendation';
import type { GenerateBookRecommendationInput, GenerateBookRecommendationOutput } from '@/ai/flows/generate-book-recommendation';
import { useToast } from '@/hooks/use-toast';

export function RecommendationGenerator() {
  const { books } = useBooks();
  const [isLoading, setIsLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleGetRecommendations = async () => {
    if (books.length === 0) {
      toast({
        title: "Add Books First",
        description: "Please add some books to your list to get personalized recommendations.",
        variant: "default",
      });
      return;
    }

    setIsLoading(true);
    setError(null);
    setRecommendations(null);
    setIsDialogOpen(true); // Open dialog to show loading state

    const titles = Array.from(new Set(books.map(book => book.title).filter(t => t)));
    const authors = Array.from(new Set(books.map(book => book.author).filter(a => a)));
    const genres = Array.from(new Set(books.map(book => book.genre).filter(g => g)));
        
    const input: GenerateBookRecommendationInput = {
      titles: titles.length > 0 ? titles : [],
      authors: authors.length > 0 ? authors : [],
      genres: genres.length > 0 ? genres : [],
    };

    try {
      const result: GenerateBookRecommendationOutput = await generateBookRecommendation(input);
      if (result && result.recommendations && result.recommendations.length > 0) {
        setRecommendations(result.recommendations);
      } else {
        setRecommendations([]); // Ensure recommendations is not null for dialog logic
        setError("No recommendations found. Try adding more diverse books to your list.");
      }
    } catch (e) {
      console.error("Failed to generate recommendations:", e);
      setError("Sorry, something went wrong while generating recommendations. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="my-8 container mx-auto px-4 md:px-0 text-center">
      <Button
        onClick={handleGetRecommendations}
        disabled={isLoading || books.length === 0}
        size="lg"
        variant="outline"
        className="bg-secondary hover:bg-secondary/80 text-secondary-foreground shadow-md hover:shadow-lg transition-shadow"
      >
        {isLoading && isDialogOpen ? ( // Only show spinner if dialog is open (meaning request is active)
          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
        ) : (
          <Sparkles className="mr-2 h-5 w-5" />
        )}
        Get Personalized Recommendations
      </Button>
      {books.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">Add at least one book to enable recommendations.</p>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card">
          <DialogHeader>
            <DialogTitle className="flex items-center text-xl font-semibold">
              <Lightbulb className="mr-2 h-6 w-6 text-primary" />
              Book Recommendations
            </DialogTitle>
          </DialogHeader>
          
          {isLoading && (
            <div className="flex justify-center items-center h-32">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="ml-2 text-muted-foreground">Finding books for you...</p>
            </div>
          )}

          {!isLoading && recommendations && recommendations.length > 0 && (
            <>
              <DialogDescription className="my-2">
                Here are some books you might enjoy based on your reading list:
              </DialogDescription>
              <ul className="list-disc list-inside space-y-2 my-4 pl-4 text-foreground">
                {recommendations.map((rec, index) => (
                  <li key={index}>{rec}</li>
                ))}
              </ul>
            </>
          )}

          {!isLoading && recommendations && recommendations.length === 0 && !error && (
             <p className="my-4 text-muted-foreground">No specific recommendations found. Try adding more diverse books!</p>
          )}

          {!isLoading && error && (
             <Alert variant="destructive" className="my-4">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
