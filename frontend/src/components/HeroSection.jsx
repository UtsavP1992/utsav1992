import React, { useState } from 'react';
import { Play, Info, Plus, Volume2, VolumeX } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const HeroSection = ({ content, onPlayTrailer, onAddToList }) => {
  const [isMuted, setIsMuted] = useState(true);

  if (!content) return null;

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src={content.backdrop}
          alt={content.title}
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="px-4 md:px-8 lg:px-16 max-w-4xl">
          {/* Netflix Logo for the show */}
          {content.logo && (
            <div className="mb-6">
              <img
                src={content.logo}
                alt={`${content.title} logo`}
                className="h-20 md:h-32 object-contain"
              />
            </div>
          )}

          {/* Title if no logo */}
          {!content.logo && (
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 drop-shadow-lg">
              {content.title}
            </h1>
          )}

          {/* Badges */}
          <div className="flex items-center space-x-4 mb-4">
            <Badge variant="outline" className="bg-red-600 text-white border-red-600 text-sm font-bold">
              #1 in TV Shows Today
            </Badge>
            <div className="flex items-center space-x-2 text-white text-sm">
              <span className="border border-gray-400 px-2 py-1 text-xs">{content.rating}</span>
              <span>{content.year}</span>
              <span>{content.seasons}</span>
            </div>
          </div>

          {/* Genres */}
          <div className="flex items-center space-x-2 mb-6">
            {content.genre.map((genre, index) => (
              <React.Fragment key={genre}>
                <span className="text-white text-sm font-medium">{genre}</span>
                {index < content.genre.length - 1 && (
                  <span className="text-gray-400">•</span>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Description */}
          <p className="text-white text-lg md:text-xl leading-relaxed mb-8 max-w-2xl drop-shadow-lg">
            {content.description}
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 font-bold px-8 py-3 text-lg flex items-center space-x-2"
              onClick={() => onPlayTrailer(content.trailerUrl)}
            >
              <Play className="h-6 w-6 fill-current" />
              <span>Play</span>
            </Button>

            <Button
              size="lg"
              variant="secondary"
              className="bg-gray-600/70 text-white hover:bg-gray-500/70 font-bold px-8 py-3 text-lg flex items-center space-x-2 backdrop-blur-sm"
              onClick={() => onAddToList(content)}
            >
              <Info className="h-6 w-6" />
              <span>More Info</span>
            </Button>

            <Button
              size="lg"
              variant="ghost"
              className="text-white hover:bg-white/20 p-3 rounded-full ml-auto sm:ml-4"
              onClick={() => onAddToList(content)}
            >
              <Plus className="h-6 w-6" />
            </Button>
          </div>
        </div>

        {/* Volume Control */}
        <div className="absolute bottom-24 right-8">
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 p-3 rounded-full border border-white/30"
            onClick={() => setIsMuted(!isMuted)}
          >
            {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Age Rating Info */}
      <div className="absolute bottom-8 left-4 md:left-8 lg:left-16 text-white text-sm opacity-60">
        This show: {content.genre.join(', ')}
      </div>
    </div>
  );
};

export default HeroSection;