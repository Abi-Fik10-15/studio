import { BookProvider } from '@/contexts/BookContext';
import { AppHeader } from '@/components/AppHeader';
import { BookForm } from '@/components/BookForm';
import { BookListClientWrapper } from '@/components/BookListClientWrapper';
import { RecommendationGenerator } from '@/components/RecommendationGenerator';

export default function HomePage() {
  return (
    <BookProvider>
      <div className="min-h-screen flex flex-col bg-background">
        <AppHeader />
        <main className="flex-grow">
          <RecommendationGenerator />
          <BookListClientWrapper />
        </main>
        <BookForm /> {/* Dialog form, managed by context state */}
        <footer className="py-6 text-center text-sm text-muted-foreground border-t border-border">
          © {new Date().getFullYear()} ShelfWise. Happy Reading!
        </footer>
      </div>
    </BookProvider>
  );
}
