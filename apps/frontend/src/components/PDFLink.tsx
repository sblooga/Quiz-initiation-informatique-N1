import { useState } from 'react';
import PDFViewer from './PDFViewer';

interface PDFLinkProps {
  lesson?: string;
  page?: number;
  motCle?: string;
  searchText?: string;
}

export default function PDFLink({ lesson, page, motCle, searchText }: PDFLinkProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Logique de priorité : Leçon → Page → Search
  let navigationMode: 'lesson' | 'page' | 'search' | null = null;
  let effectivePage = page;
  let effectiveSearchText = searchText;

  if (lesson && lesson.trim()) {
    navigationMode = 'lesson';
    effectiveSearchText = lesson; // Recherche par le texte de la leçon
  } else if (page && page > 0) {
    navigationMode = 'page';
  } else if (searchText && searchText.trim()) {
    navigationMode = 'search';
  }

  // Si aucune navigation n'est possible, ne rien afficher
  if (!navigationMode) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-sm font-semibold text-blue-400 underline hover:text-blue-300"
      >
        Réviser le cours {motCle ? `(voir "${motCle}")` : ''}
      </button>

      {isOpen && (
        <PDFViewer
          file="/cours.pdf"
          initialPage={effectivePage || 1}
          searchText={effectiveSearchText}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
