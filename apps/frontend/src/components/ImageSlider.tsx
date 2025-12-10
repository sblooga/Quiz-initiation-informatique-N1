import { useEffect, useState } from 'react';

interface ImageSliderProps {
    images: string[];
}

export default function ImageSlider({ images }: ImageSliderProps) {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(timer);
    }, [images.length]);

    const goToSlide = (index: number) => {
        setCurrentIndex(index);
    };

    return (
        <div className="h-full w-full overflow-hidden rounded-[2.75rem] shadow-2xl relative group">
            <div
                className="h-full w-full bg-cover bg-center transition-all duration-1000 ease-in-out transform"
                style={{ backgroundImage: `url(${images[currentIndex]})` }}
            ></div>

            {/* Overlay gradient pour améliorer la lisibilité si besoin */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            {/* Navigation dots */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
                {images.map((_, slideIndex) => (
                    <div
                        key={slideIndex}
                        onClick={() => goToSlide(slideIndex)}
                        className={`h-3 w-3 cursor-pointer rounded-full transition-all duration-300 ${currentIndex === slideIndex ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                            }`}
                    ></div>
                ))}
            </div>
        </div>
    );
}
