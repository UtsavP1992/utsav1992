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
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';

// Import API hooks
import {
  useFeaturedContent,
  useTrendingContent,
  usePopularContent,
  useContentByGenre,
  useSearch,
  useUserProfiles,
  useMyList,
  useContinueWatching,
  useMyListManager,
  useViewingProgress
} from './hooks/useApi';

const Home = () => {
  // State management
  const [currentProfile, setCurrentProfile] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [showVideoPlayer, setShowVideoPlayer] = useState(false);
  const [showMyListModal, setShowMyListModal] = useState(false);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState('');

  // API hooks
  const { data: featuredContent, loading: featuredLoading, error: featuredError, refetch: refetchFeatured } = useFeaturedContent();
  const { data: trendingContent, loading: trendingLoading, error: trendingError } = useTrendingContent();
  const { data: popularContent, loading: popularLoading, error: popularError } = usePopularContent();
  const { data: actionContent, loading: actionLoading } = useContentByGenre('action');
  const { data: horrorContent, loading: horrorLoading } = useContentByGenre('horror');
  const { data: userProfiles, loading: profilesLoading, error: profilesError } = useUserProfiles();
  
  // Dynamic hooks based on current profile
  const { data: myList, loading: myListLoading, refetch: refetchMyList } = useMyList(currentProfile?.id);
  const { data: continueWatching, loading: continueWatchingLoading } = useContinueWatching(currentProfile?.id);
  
  // Search and actions
  const { searchResults, loading: searchLoading, search } = useSearch();
  const { addToMyList, removeFromMyList, loading: myListActionLoading } = useMyListManager();
  const { createProgress, updateProgress } = useViewingProgress();

  // Set default profile when profiles load
  useEffect(() => {
    if (userProfiles && userProfiles.length > 0 && !currentProfile) {
      setCurrentProfile(userProfiles[0]);
    }
  }, [userProfiles, currentProfile]);

  // Handle search functionality
  const handleSearch = async (query) => {
    if (!query.trim()) {
      setShowSearchResults(false);
      return;
    }

    setSearchQuery(query);
    await search(query);
    setShowSearchResults(true);
  };

  // Handle play trailer
  const handlePlayTrailer = async (trailerUrl, movie = null) => {
    setCurrentTrailerUrl(trailerUrl);
    setSelectedMovie(movie);
    setShowVideoPlayer(true);
    toast.success(`Playing ${movie?.title || 'content'}`);

    // Create viewing progress if movie is provided
    if (movie && currentProfile) {
      await createProgress(currentProfile.id, movie, 5); // 5% progress for starting
    }
  };

  // Handle add to list
  const handleAddToList = async (movie) => {
    if (!currentProfile) {
      toast.error('Please select a profile first');
      return;
    }

    const success = await addToMyList(currentProfile.id, movie);
    if (success) {
      toast.success(`${movie.title} added to your list`);
      refetchMyList(); // Refresh my list
    } else {
      toast.error(`Failed to add ${movie.title} to your list`);
    }
  };

  // Handle remove from list
  const handleRemoveFromList = async (movieId) => {
    if (!currentProfile) {
      toast.error('Please select a profile first');
      return;
    }

    const success = await removeFromMyList(currentProfile.id, movieId);
    if (success) {
      toast.success('Removed from your list');
      refetchMyList(); // Refresh my list
    } else {
      toast.error('Failed to remove from your list');
    }
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
  };

  // Close video player
  const closeVideoPlayer = () => {
    setShowVideoPlayer(false);
    setSelectedMovie(null);
    setCurrentTrailerUrl('');
  };

  // Show loading if profiles are still loading
  if (profilesLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <LoadingSpinner size="xl" text="Loading Netflix Clone..." />
      </div>
    );
  }

  // Show error if profiles failed to load
  if (profilesError) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <ErrorMessage
          title="Failed to Load Profiles"
          message="Unable to load user profiles. Please check your connection and try again."
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <Header
        onSearch={handleSearch}
        currentProfile={currentProfile}
        onProfileChange={handleProfileChange}
        onShowMyList={() => setShowMyListModal(true)}
        userProfiles={userProfiles || []}
      />

      {/* Search Results */}
      {showSearchResults && (
        <SearchResults
          query={searchQuery}
          results={searchResults}
          loading={searchLoading}
          isVisible={showSearchResults}
          onClose={closeSearchResults}
          onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
          onAddToList={handleAddToList}
          onMoreInfo={handleMoreInfo}
        />
      )}

      {/* Main Content */}
      {!showSearchResults && (
        <>
          {/* Hero Section */}
          {featuredLoading ? (
            <div className="h-screen bg-black flex items-center justify-center">
              <LoadingSpinner size="lg" text="Loading featured content..." />
            </div>
          ) : featuredError ? (
            <div className="h-screen bg-black flex items-center justify-center">
              <ErrorMessage
                title="Failed to Load Featured Content"
                message="Unable to load the featured content for the hero section."
                onRetry={refetchFeatured}
              />
            </div>
          ) : featuredContent ? (
            <HeroSection
              content={featuredContent}
              onPlayTrailer={(url) => handlePlayTrailer(url, featuredContent)}
              onAddToList={handleAddToList}
            />
          ) : null}

          {/* Content Rows */}
          <div className="relative -mt-32 z-10">
            {/* Continue Watching */}
            {continueWatching && continueWatching.length > 0 && (
              <ContentRow
                title={`Continue Watching for ${currentProfile?.name || 'User'}`}
                movies={continueWatching}
                loading={continueWatchingLoading}
                onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
                onAddToList={handleAddToList}
                onMoreInfo={handleMoreInfo}
                showProgress={true}
              />
            )}

            {/* Trending Now */}
            <ContentRow
              title="Trending Now"
              movies={trendingContent || []}
              loading={trendingLoading}
              error={trendingError}
              onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
              onAddToList={handleAddToList}
              onMoreInfo={handleMoreInfo}
            />

            {/* Popular on Netflix */}
            <ContentRow
              title="Popular on Netflix"
              movies={popularContent || []}
              loading={popularLoading}
              error={popularError}
              onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
              onAddToList={handleAddToList}
              onMoreInfo={handleMoreInfo}
            />

            {/* Action & Adventure */}
            <ContentRow
              title="Action & Adventure"
              movies={actionContent || []}
              loading={actionLoading}
              onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
              onAddToList={handleAddToList}
              onMoreInfo={handleMoreInfo}
            />

            {/* Horror & Thriller */}
            <ContentRow
              title="Horror & Thriller"
              movies={horrorContent || []}
              loading={horrorLoading}
              onPlay={(movie) => handlePlayTrailer(movie.trailerUrl, movie)}
              onAddToList={handleAddToList}
              onMoreInfo={handleMoreInfo}
            />
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
        myList={myList || []}
        loading={myListLoading}
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