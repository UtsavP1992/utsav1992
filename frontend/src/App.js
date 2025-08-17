import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import ContentRow from './components/ContentRow';
import VideoPlayer from './components/VideoPlayer';
import MyListModal from './components/MyListModal';
import SearchResults from './components/SearchResults';
import Footer from './components/Footer';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Import mock data
import {
  featuredContent,
  movieCategories,
  myList as initialMyList,
  continueWatching,
  userProfiles
} from './data/mockData';

const Home = () => {
  const [currentProfile, setCurrentProfile] = useState(userProfiles[0]);
  const [myList, setMyList] = useState(initialMyList);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showMyListModal, setShowMyListModal] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState('');

  // Handle search functionality
  const handleSearch = (query) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }

    setSearchQuery(query);
    
    // Search through all movies in categories
    const allMovies = movieCategories.flatMap(category => category.movies);
    const results = allMovies.filter(movie =>
      movie.title.toLowerCase().includes(query.toLowerCase()) ||
      movie.genre.some(genre => genre.toLowerCase().includes(query.toLowerCase()))
    );
    
    setSearchResults(results);
    setShowSearchResults(true);
  };

  // Handle play trailer
  const handlePlayTrailer = (trailerUrl, movie = null) => {
    setCurrentTrailerUrl(trailerUrl);
    setSelectedMovie(movie);
    setShowVideoPlayer(true);
    toast.success(`Playing ${movie?.title || 'content'}`);
  };

  // Handle add to list
  const handleAddToList = (movie) => {
    const isAlreadyInList = myList.some(item => item.id === movie.id);
    
    if (isAlreadyInList) {
      toast.info(`${movie.title} is already in your list`);
      return;
    }

    const movieWithProgress = {
      ...movie,
      progress: 0
    };
    
    setMyList(prev => [...prev, movieWithProgress]);
    toast.success(`${movie.title} added to your list`);
  };

  // Handle remove from list
  const handleRemoveFromList = (movieId) => {
    const movie = myList.find(item => item.id === movieId);
    setMyList(prev => prev.filter(item => item.id !== movieId));
    toast.success(`${movie?.title} removed from your list`);
  };

  // Handle more info (placeholder)
  const handleMoreInfo = (movie) => {
    toast.info(`More info for ${movie.title} - Feature coming soon!`);
  };

  // Handle profile change
  const handleProfileChange = (profile) => {
    setCurrentProfile(profile);
    toast.success(`Switched to ${profile.name}'s profile`);
  };

  // Close search results
  const closeSearchResults = () => {
    setShowSearchResults(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Close video player
  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setSelectedMovie(null);
    setCurrentTrailerUrl('');
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <Header
        onSearch={handleSearch}
        currentProfile={currentProfile}
        onProfileChange={handleProfileChange}
        onShowMyList={() => setShowMyListModal(true)}
      />

      {/* Search Results */}
      <SearchResults
        query={searchQuery}
        results={searchResults}
        isVisible={showSearchResults}
        onClose={closeSearchResults}
        onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
        onAddToList={handleAddToList}
        onMoreInfo={handleMoreInfo}
      />

      {/* Main Content */}
      {!showSearchResults && (
        <>
          {/* Hero Section */}
          <HeroSection
            content={featuredContent}
            onPlayTrailer={(url) => handlePlayTrailer(url, featuredContent)}
            onAddToList={handleAddToList}
          />

          {/* Content Rows */}
          <div className="relative -mt-32 z-10">
            {/* Continue Watching */}
            {continueWatching.length > 0 && (
              <ContentRow
                title="Continue Watching for John"
                movies={continueWatching}
                onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
                onAddToList={handleAddToList}
                onMoreInfo={handleMoreInfo}
                showProgress={true}
              />
            )}

            {/* Movie Categories */}
            {movieCategories.map((category) => (
              <ContentRow
                key={category.id}
                title={category.title}
                movies={category.movies}
                onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
                onAddToList={handleAddToList}
                onMoreInfo={handleMoreInfo}
              />
            ))}
          </div>

          {/* Footer */}
          <Footer />
        </>
      )}

      {/* Video Player Modal */}
      <VideoPlayer
        movie={selectedMovie}
        isOpen={showVideoPlayer}
        onClose={closeVideoPlayer}
        trailerUrl={currentTrailerUrl}
      />

      {/* My List Modal */}
      <MyListModal
        isOpen={showMyListModal}
        onClose={() => setShowMyListModal(false)}
        myList={myList}
        onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
        onRemove={handleRemoveFromList}
      />

      {/* Toast Notifications */}
      <Toaster 
        position="top-right"
        theme="dark"
        toastOptions={{
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151'
          }
        }}
      />
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;