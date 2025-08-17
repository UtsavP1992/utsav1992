import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import MovieCard from './MovieCard';
import LoadingSpinner from './LoadingSpinner';
import ErrorMessage from './ErrorMessage';

const ContentRow = ({ title, movies, loading, error, onPlay, onAddToList, onMoreInfo, showProgress = false, onRetry }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = scrollRef.current.clientWidth * 0.8;
      const newScrollLeft = scrollRef.current.scrollLeft + (direction === 'right' ? scrollAmount : -scrollAmount);
      
      scrollRef.current.scrollTo({
        left: newScrollLeft,
        behavior: 'smooth'
      });

      // Update scroll button states
      setTimeout(() => {
        if (scrollRef.current) {
          setCanScrollLeft(scrollRef.current.scrollLeft > 0);
          setCanScrollRight(
            scrollRef.current.scrollLeft < 
            scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
          );
        }
      }, 300);
    }
  };

  const handleScroll = () => {
    if (scrollRef.current) {
      setCanScrollLeft(scrollRef.current.scrollLeft > 0);
      setCanScrollRight(
        scrollRef.current.scrollLeft < 
        scrollRef.current.scrollWidth - scrollRef.current.clientWidth - 10
      );
    }
  };

  return (
    <div className="relative mb-12 group">
      {/* Title */}
      <h2 className="text-white text-xl md:text-2xl font-bold mb-4 px-4 md:px-8 lg:px-16">
        {title}
      </h2>

      {/* Loading State */}
      {loading && (
        <div className="px-4 md:px-8 lg:px-16">
          <LoadingSpinner size="md" text={`Loading ${title.toLowerCase()}...`} />
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="px-4 md:px-8 lg:px-16">
          <ErrorMessage
            title={`Failed to load ${title.toLowerCase()}`}
            message="Unable to fetch content. Please try again."
            onRetry={onRetry}
            showRetry={!!onRetry}
          />
        </div>
      )}

      {/* Content Container */}
      {!loading && !error && movies && movies.length > 0 && (
        <div className="relative">
          {/* Left Scroll Button */}
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 text-white hover:bg-black/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={() => scroll('left')}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
          )}

          {/* Right Scroll Button */}
          {canScrollRight && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 z-10 bg-black/70 text-white hover:bg-black/90 rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all duration-300"
              onClick={() => scroll('right')}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          )}

          {/* Movies Scroll Container */}
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex space-x-4 overflow-x-auto scrollbar-hide px-4 md:px-8 lg:px-16 pb-4"
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {movies.map((movie) => (
              <div key={movie.id} className="flex-none w-64 md:w-80">
                <MovieCard
                  movie={movie}
                  onPlay={onPlay}
                  onAddToList={onAddToList}
                  onMoreInfo={onMoreInfo}
                  showProgress={showProgress}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && movies && movies.length === 0 && (
        <div className="px-4 md:px-8 lg:px-16">
          <div className="text-center text-gray-400 py-8">
            <p>No content available for {title.toLowerCase()}</p>
          </div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
};

export default ContentRow;