import { useState, useEffect, useCallback } from 'react';
import { contentApi, userApi } from '../services/api';

// Custom hook for API calls with loading states
export const useApi = (apiCall, dependencies = []) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCall();
      setData(result);
    } catch (err) {
      setError(err);
      console.error('API call failed:', err);
    } finally {
      setLoading(false);
    }
  }, [apiCall]);

  useEffect(() => {
    fetchData();
  }, dependencies);

  return { data, loading, error, refetch: fetchData };
};

// Hook for featured content
export const useFeaturedContent = () => {
  return useApi(contentApi.getFeaturedContent);
};

// Hook for trending content
export const useTrendingContent = () => {
  return useApi(contentApi.getTrendingContent);
};

// Hook for popular content
export const usePopularContent = () => {
  return useApi(contentApi.getPopularContent);
};

// Hook for content by genre
export const useContentByGenre = (genre) => {
  return useApi(() => contentApi.getContentByGenre(genre), [genre]);
};

// Hook for search
export const useSearch = () => {
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const search = useCallback(async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const results = await contentApi.searchContent(query);
      setSearchResults(results);
    } catch (err) {
      setError(err);
      console.error('Search failed:', err);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { searchResults, loading, error, search };
};

// Hook for user profiles
export const useUserProfiles = () => {
  return useApi(userApi.getUserProfiles);
};

// Hook for my list
export const useMyList = (profileId) => {
  return useApi(() => userApi.getMyList(profileId), [profileId]);
};

// Hook for continue watching
export const useContinueWatching = (profileId) => {
  return useApi(() => userApi.getContinueWatching(profileId), [profileId]);
};

// Hook for managing my list
export const useMyListManager = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const addToMyList = useCallback(async (profileId, content) => {
    try {
      setLoading(true);
      setError(null);
      
      const contentData = {
        content_id: content.id,
        tmdb_id: content.tmdb_id,
        content_type: content.type === 'series' ? 'tv' : 'movie'
      };
      
      await userApi.addToMyList(profileId, contentData);
      return true;
    } catch (err) {
      setError(err);
      console.error('Failed to add to my list:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const removeFromMyList = useCallback(async (profileId, contentId) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.removeFromMyList(profileId, contentId);
      return true;
    } catch (err) {
      setError(err);
      console.error('Failed to remove from my list:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { addToMyList, removeFromMyList, loading, error };
};

// Hook for viewing progress
export const useViewingProgress = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const createProgress = useCallback(async (profileId, content, progress) => {
    try {
      setLoading(true);
      setError(null);
      
      const progressData = {
        content_id: content.id,
        tmdb_id: content.tmdb_id,
        content_type: content.type === 'series' ? 'tv' : 'movie',
        progress: progress,
        current_episode: content.episode,
        time_left: content.timeLeft
      };
      
      await userApi.createViewingProgress(profileId, progressData);
      return true;
    } catch (err) {
      setError(err);
      console.error('Failed to create viewing progress:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProgress = useCallback(async (profileId, contentId, progressData) => {
    try {
      setLoading(true);
      setError(null);
      await userApi.updateViewingProgress(profileId, contentId, progressData);
      return true;
    } catch (err) {
      setError(err);
      console.error('Failed to update viewing progress:', err);
      return false;
    } finally {
      setLoading(false);
    }
  }, []);

  return { createProgress, updateProgress, loading, error };
};