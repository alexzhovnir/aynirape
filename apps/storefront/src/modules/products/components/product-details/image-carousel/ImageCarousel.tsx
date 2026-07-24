import clsx from "clsx";
import { useState } from "react";

interface OptimizedImageData {
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  sizes?: string;
}

export interface OptimizedCarouselImage {
  originalUrl: string;
  main: OptimizedImageData;
  thumb: OptimizedImageData;
}

interface Props {
  images: OptimizedCarouselImage[];
  alt: string;
}

export const ImageCarousel = ({ images, alt }: Props) => {
  if (images.length === 0) return null;

  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [isPreviewing, setIsPreviewing] = useState<boolean>(false);
  const currentImage = images[currentIndex];

  const handlePreview = () => setIsPreviewing(true);
  const handleClosePreview = () => setIsPreviewing(false);
  const handleImageClick = (event: React.MouseEvent<HTMLImageElement>) =>
    event.stopPropagation();

  const renderOptimizedImg = (
    data: OptimizedImageData,
    extraProps?: React.ImgHTMLAttributes<HTMLImageElement>,
  ) => (
    <img
      src={data.src}
      srcSet={data.srcSet}
      sizes={data.sizes}
      width={data.width}
      height={data.height}
      alt={alt}
      loading={extraProps?.loading ?? "lazy"}
      decoding="async"
      draggable={false}
      {...extraProps}
    />
  );

  return (
    <>
      {/* Fullscreen Modal Preview */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 transition-all duration-300",
          {
            "opacity-0 pointer-events-none": !isPreviewing,
            "opacity-100": isPreviewing,
          },
        )}
        onClick={handleClosePreview}
      >
        <div className="relative max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden shadow-2xl border border-stone-700 bg-stone-900">
          {renderOptimizedImg(currentImage.main, {
            className: "object-contain max-h-[85vh] w-full rounded-2xl",
            onClick: handleImageClick,
          })}
          <button
            onClick={handleClosePreview}
            className="absolute top-4 right-4 text-white text-2xl w-10 h-10 rounded-full bg-black/60 flex items-center justify-center hover:bg-black transition-colors"
          >
            &times;
          </button>
        </div>
      </div>

      {/* Carousel Display */}
      <div className="flex flex-col gap-6 items-center">
        {/* Main Image Card */}
        <div className="relative w-full max-w-md aspect-square rounded-full p-2 bg-[var(--color-bg-surface)] border-2 border-[var(--color-accent-gold)] shadow-xl overflow-hidden group flex items-center justify-center">
          {renderOptimizedImg(currentImage.main, {
            className: "w-full h-full aspect-square object-cover cursor-pointer rounded-full group-hover:scale-105 transition-transform duration-500",
            onClick: handlePreview,
            loading: "eager",
          })}
          <div className="absolute inset-0 rounded-full bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="bg-[var(--color-bg-surface-elevated)]/90 backdrop-blur-md text-[var(--color-text-primary)] text-xs font-semibold px-4 py-2 rounded-full border border-[var(--color-border-subtle)] shadow-md">
              🔍 Click to enlarge
            </span>
          </div>
        </div>

        {/* Thumbnails Strip */}
        {images.length > 1 && (
          <div className="flex gap-3 justify-center flex-wrap pt-2">
            {images.map((image, index) => (
              <button
                key={image.originalUrl}
                onClick={() => setCurrentIndex(index)}
                className={clsx(
                  "cursor-pointer rounded-full p-0.5 transition-all duration-300",
                  currentIndex === index
                    ? "border-2 border-[var(--color-accent-gold)] scale-110 shadow-md"
                    : "border border-[var(--color-border-subtle)] opacity-70 hover:opacity-100 hover:scale-105"
                )}
              >
                {renderOptimizedImg(image.thumb, {
                  className: "w-14 h-14 rounded-full object-cover",
                })}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
};
