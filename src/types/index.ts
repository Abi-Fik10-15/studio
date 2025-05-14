export type BookStatus = 'to-read' | 'reading' | 'finished';

export const BookStatusOptions: { value: BookStatus; label: string }[] = [
  { value: 'to-read', label: 'Want to Read' },
  { value: 'reading', label: 'Currently Reading' },
  { value: 'finished', label: 'Finished' },
];

export interface Book {
  id: string;
  title: string;
  author: string;
  genre: string;
  status: BookStatus;
  coverImage?: string;
  currentPage?: number;
  totalPages?: number;
  addedDate: string; // ISO string for date
  // notes?: string; // Future enhancement
}
