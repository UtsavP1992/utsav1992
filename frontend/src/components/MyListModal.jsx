import React from 'react';
import { X, Play, Trash2 } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Badge } from './ui/badge';
import LoadingSpinner from './LoadingSpinner';

const MyListModal = ({ isOpen, onClose, myList, loading, onPlay, onRemove }) => {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-gray-900 border-gray-700 text-white max-w-4xl max-h-[80vh] overflow-hidden">
        <DialogHeader className="pb-4">
          <DialogTitle className="text-2xl font-bold">My List</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)]">
          {/* Loading State */}
          {loading && (
            <div className="py-12">
              <LoadingSpinner size="lg" text="Loading your list..." />
            </div>
          )}

          {/* Content */}
          {!loading && myList && myList.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myList.map((item) => (
                <div key={item.id} className="group relative">
                  {/* Thumbnail */}
                  <div className="relative aspect-video rounded-lg overflow-hidden bg-gray-800">
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Progress Bar */}
                    {item.progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600">
                        <div
                          className="h-full bg-red-600"
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}

                    {/* Overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-2">
                      <Button
                        size="sm"
                        className="bg-white text-black hover:bg-gray-200"
                        onClick={() => onPlay(item)}
                      >
                        <Play className="h-4 w-4 fill-current" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        className="bg-red-600 hover:bg-red-700"
                        onClick={() => onRemove(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Content Info */}
                  <div className="mt-3">
                    <h3 className="font-semibold text-lg mb-1 line-clamp-1">{item.title}</h3>
                    
                    <div className="flex items-center space-x-2 text-sm text-gray-400 mb-2">
                      <Badge variant="outline" className="border-gray-600 text-gray-300 text-xs">
                        {item.type === 'series' ? 'Series' : 'Movie'}
                      </Badge>
                      <span className="border border-gray-500 px-1 text-xs">{item.rating}</span>
                      <span>{item.year}</span>
                    </div>

                    <div className="flex items-center space-x-1 text-sm text-gray-400">
                      {item.genre && item.genre.map((genre, index) => (
                        <React.Fragment key={genre}>
                          <span>{genre}</span>
                          {index < item.genre.length - 1 && <span>•</span>}
                        </React.Fragment>
                      ))}
                    </div>

                    {/* Continue Watching Info */}
                    {item.progress > 0 && (
                      <div className="mt-2 text-sm text-gray-400">
                        {item.progress}% watched
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : !loading ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-4">Your list is empty</div>
              <p className="text-gray-500">
                Add movies and shows to your list to watch them later
              </p>
            </div>
          ) : null}
        </div>

        {/* Close Button */}
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-4 right-4 text-gray-400 hover:text-white hover:bg-gray-800"
          onClick={onClose}
        >
          <X className="h-5 w-5" />
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default MyListModal;