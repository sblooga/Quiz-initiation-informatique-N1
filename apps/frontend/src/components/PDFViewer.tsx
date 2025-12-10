import { useEffect, useRef, useState } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import 'react-pdf/dist/Page/AnnotationLayer.css';
import 'react-pdf/dist/Page/TextLayer.css';

// Configuration du worker via CDN pour éviter les problèmes de version locale
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
    file: string;
    initialPage?: number;
    searchText?: string;
    onClose: () => void;
}

export default function PDFViewer({ file, initialPage = 1, searchText, onClose }: PDFViewerProps) {
    const [numPages, setNumPages] = useState<number>(0);
    const [scale, setScale] = useState(1.2);
    const containerRef = useRef<HTMLDivElement>(null);

    async function onDocumentLoadSuccess(pdf: any) {
        setNumPages(pdf.numPages);

        let targetPage = initialPage;

        // Si un texte de recherche est fourni, on cherche la page correspondante
        if (searchText) {
            console.log(`🔍 PDFViewer: Recherche du texte : "${searchText}"...`);
            console.log(`📄 PDFViewer: Document chargé avec ${pdf.numPages} pages`);
            console.log(`📍 PDFViewer: Page initiale demandée: ${initialPage}`);
            try {
                for (let i = 1; i <= pdf.numPages; i++) {
                    const page = await pdf.getPage(i);
                    const textContent = await page.getTextContent();
                    const text = textContent.items.map((item: any) => item.str).join(' ');

                    if (text.toLowerCase().includes(searchText.toLowerCase())) {
                        console.log(`✅ PDFViewer: Texte "${searchText}" trouvé à la page ${i}`);
                        console.log(`📝 PDFViewer: Extrait de texte: ${text.substring(0, 200)}...`);
                        targetPage = i;
                        break;
                    }
                }
                if (targetPage === initialPage) {
                    console.log(`❌ PDFViewer: Texte "${searchText}" NON trouvé dans le document`);
                }
            } catch (error) {
                console.error('❌ PDFViewer: Erreur lors de la recherche:', error);
            }
        } else {
            console.log(`📍 PDFViewer: Pas de recherche textuelle, utilisation de la page ${initialPage}`);
        }

        // Scroll automatique vers la page cible
        if (targetPage > 0) {
            setTimeout(() => {
                const pageElement = document.getElementById(`page_${targetPage}`);
                if (pageElement) {
                    console.log(`📜 PDFViewer: Scroll vers la page ${targetPage}`);
                    pageElement.scrollIntoView({ behavior: 'smooth' });
                }
            }, 500);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex flex-col bg-gray-900/95 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between bg-gray-900 px-6 py-4 shadow-md">
                <div className="flex items-center gap-4">
                    <h2 className="text-xl font-bold text-white">Support de cours</h2>
                    <div className="flex items-center gap-2 rounded-lg bg-gray-800 px-3 py-1">
                        <button
                            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                            className="text-white hover:text-red-400"
                        >
                            -
                        </button>
                        <span className="text-sm text-slate-300">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => setScale(s => Math.min(2.5, s + 0.1))}
                            className="text-white hover:text-red-400"
                        >
                            +
                        </button>
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="rounded-full bg-red-600 px-4 py-2 font-bold text-white hover:bg-red-700"
                >
                    Fermer
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-8" ref={containerRef}>
                <div className="mx-auto max-w-min">
                    <Document
                        file={file}
                        onLoadSuccess={onDocumentLoadSuccess}
                        loading={
                            <div className="flex h-96 items-center justify-center text-white">
                                Chargement du document...
                            </div>
                        }
                        error={
                            <div className="flex h-96 items-center justify-center text-red-400">
                                Impossible de charger le PDF.
                            </div>
                        }
                    >
                        {Array.from(new Array(numPages), (_, index) => (
                            <div key={`page_${index + 1}`} id={`page_${index + 1}`} className="mb-4 shadow-2xl">
                                <Page
                                    pageNumber={index + 1}
                                    scale={scale}
                                    renderTextLayer={false}
                                    renderAnnotationLayer={false}
                                    className="bg-white"
                                />
                                <div className="mt-1 text-center text-xs text-slate-500">
                                    Page {index + 1}
                                </div>
                            </div>
                        ))}
                    </Document>
                </div>
            </div>
        </div>
    );
}
