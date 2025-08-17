import React, { useState } from 'react';
import { Play, Plus, ThumbsUp, ChevronDown } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const MovieCard = ({ movie, onPlay, onAddToList, onMoreInfo, showProgress = false }) => {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="relative group cursor-pointer transform transition-all duration-300 hover:scale-105 hover:z-20"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Main Image */}
      <div className="relative aspect-video overflow-hidden rounded-md bg-gray-800">
        <img
          src={movie.image}
          alt={movie.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
          loading="lazy"
        />

        {/* Progress Bar */}
        {showProgress && movie.progress > 0 && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
            <div
              className="h-full bg-red-600 transition-all duration-300"
              style={{ width: `${movie.progress}%` }}
            />
          </div>
        )}

        {/* Hover Overlay */}
        <div className={`absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300`}>
          <Button
            size="sm"
            className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
            onClick={() => onPlay(movie)}
          >
            <Play className="h-4 w-4 fill-current" />
          </Button>
        </div>

        {/* Type Badge */}
        <div className="absolute top-2 left-2">
          <Badge
            variant="secondary"
            className="bg-black/70 text-white text-xs backdrop-blur-sm"
          >
            {movie.type === 'series' ? 'Series' : 'Movie'}
          </Badge>
        </div>
      </div>

      {/* Expanded Info Card */}
      {isHovered && (
        <div className="absolute top-0 left-0 right-0 bg-gray-900 rounded-md shadow-2xl border border-gray-700 z-30 animate-in slide-in-from-top-2 duration-200">
          {/* Image */}
          <div className="relative aspect-video overflow-hidden rounded-t-md">
            <img
              src={movie.image}
              alt={movie.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />
          </div>

          {/* Content */}
          <div className="p-4">
            <h3 className="text-white font-bold text-lg mb-2">{movie.title}</h3>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 mb-3">
              <Button
                size="sm"
                className="bg-white text-black hover:bg-gray-200 px-4"
                onClick={() => onPlay(movie)}
              >
                <Play className="h-4 w-4 fill-current mr-1" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-gray-700 p-2 rounded-full border border-gray-600"
                onClick={() => onAddToList(movie)}
              >
                <Plus className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-gray-700 p-2 rounded-full border border-gray-600"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>

              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-gray-700 p-2 rounded-full border border-gray-600 ml-auto"
                onClick={() => onMoreInfo(movie)}
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>

            {/* Info */}
            <div className="flex items-center space-x-2 text-sm text-gray-300 mb-2">
              <span className="text-green-500 font-semibold">98% Match</span>
              <span className="border border-gray-500 px-1 text-xs">{movie.rating}</span>
              <span>{movie.year}</span>
            </div>

            {/* Genres */}
            <div className="flex items-center space-x-1 text-sm text-gray-400">
              {movie.genre.map((genre, index) => (
                <React.Fragment key={genre}>
                  <span>{genre}</span>
                  {index < movie.genre.length - 1 && <span>•</span>}
                </React.Fragment>
              ))}
            </div>

            {/* Continue Watching Info */}
            {showProgress && movie.episode && (
              <div className="mt-3 text-sm text-gray-400">
                <div>{movie.episode}</div>
                <div>{movie.timeLeft}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard;