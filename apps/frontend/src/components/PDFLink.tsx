interface Props {
  page?: number;
  motCle?: string;
}

const pdfPath = import.meta.env.VITE_PDF_PATH || 'cours.pdf';

export default function PDFLink({ page, motCle }: Props) {
  const url = page ? `${pdfPath}#page=${page}` : pdfPath;
  return (
    <a href={url} target="_blank" rel="noopener" className="underline">
      Réviser le cours
    </a>
  );
}
