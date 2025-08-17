import React from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import MovieCard from './MovieCard';
import LoadingSpinner from './LoadingSpinner';

const SearchResults = ({ query, results, loading, isVisible, onClose, onPlay, onAddToList, onMoreInfo }) => {
  if (!isVisible || !query) return null;

  return (
    <div className="fixed inset-0 bg-black/95 z-40 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-sm border-b border-gray-800 p-4 md:p-8">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <div>
            <h1 className="text-white text-2xl md:text-3xl font-bold">
              Search Results for "{query}"
            </h1>
            {!loading && (
              <p className="text-gray-400 mt-1">
                {results.length} {results.length === 1 ? 'result' : 'results'} found
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800"
            onClick={onClose}
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
      </div>

      {/* Results */}
      <div className="p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {/* Loading State */}
          {loading && (
            <div className="flex justify-center py-20">
              <LoadingSpinner size="lg" text={`Searching for "${query}"...`} />
            </div>
          )}

          {/* Results Grid */}
          {!loading && results.length > 0 && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
              {results.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onPlay={onPlay}
                  onAddToList={onAddToList}
                  onMoreInfo={onMoreInfo}
                />
              ))}
            </div>
          )}

          {/* No Results */}
          {!loading && results.length === 0 && (
            <div className="text-center py-20">
              <div className="text-gray-400 text-xl mb-4">
                No results found for "{query}"
              </div>
              <p className="text-gray-500 mb-8 max-w-md mx-auto">
                Try different keywords or browse our categories to find something you'll love
              </p>
              <Button
                variant="outline"
                className="border-gray-600 text-white hover:bg-gray-800"
                onClick={onClose}
              >
                Back to Browse
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResults;