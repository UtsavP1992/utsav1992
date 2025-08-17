import httpx
import asyncio
from typing import List, Optional, Dict, Any
import logging
from datetime import datetime

logger = logging.getLogger(__name__)

class TMDBService:
    def __init__(self):
        self.api_keys = [
            "c8dea14dc917687ac631a52620e4f7ad",
            "3cb41ecea3bf606c56552db3d17adefd"
        ]
        self.current_key_index = 0
        self.base_url = "https://api.themoviedb.org/3"
        self.image_base_url = "https://image.tmdb.org/t/p/w500"
        self.backdrop_base_url = "https://image.tmdb.org/t/p/original"
        
    def get_current_api_key(self) -> str:
        return self.api_keys[self.current_key_index]
    
    def rotate_api_key(self):
        self.current_key_index = (self.current_key_index + 1) % len(self.api_keys)
        logger.info(f"Rotated to API key index: {self.current_key_index}")

    async def make_request(self, endpoint: str, params: Dict[str, Any] = None) -> Optional[Dict[str, Any]]:
        if params is None:
            params = {}
        
        params['api_key'] = self.get_current_api_key()
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            try:
                response = await client.get(f"{self.base_url}{endpoint}", params=params)
                
                if response.status_code == 429:  # Rate limit
                    logger.warning("Rate limit hit, rotating API key")
                    self.rotate_api_key()
                    params['api_key'] = self.get_current_api_key()
                    response = await client.get(f"{self.base_url}{endpoint}", params=params)
                
                if response.status_code == 200:
                    return response.json()
                else:
                    logger.error(f"TMDB API error: {response.status_code} - {response.text}")
                    return None
                    
            except Exception as e:
                logger.error(f"Error making TMDB request: {str(e)}")
                return None

    async def get_trending_movies(self, time_window: str = "week") -> List[Dict[str, Any]]:
        """Get trending movies"""
        data = await self.make_request(f"/trending/movie/{time_window}")
        return data.get("results", []) if data else []

    async def get_trending_tv(self, time_window: str = "week") -> List[Dict[str, Any]]:
        """Get trending TV shows"""
        data = await self.make_request(f"/trending/tv/{time_window}")
        return data.get("results", []) if data else []

    async def get_popular_movies(self) -> List[Dict[str, Any]]:
        """Get popular movies"""
        data = await self.make_request("/movie/popular")
        return data.get("results", []) if data else []

    async def get_popular_tv(self) -> List[Dict[str, Any]]:
        """Get popular TV shows"""
        data = await self.make_request("/tv/popular")
        return data.get("results", []) if data else []

    async def discover_movies(self, genre_id: Optional[int] = None, page: int = 1) -> List[Dict[str, Any]]:
        """Discover movies by genre"""
        params = {"page": page, "sort_by": "popularity.desc"}
        if genre_id:
            params["with_genres"] = genre_id
        
        data = await self.make_request("/discover/movie", params)
        return data.get("results", []) if data else []

    async def discover_tv(self, genre_id: Optional[int] = None, page: int = 1) -> List[Dict[str, Any]]:
        """Discover TV shows by genre"""
        params = {"page": page, "sort_by": "popularity.desc"}
        if genre_id:
            params["with_genres"] = genre_id
        
        data = await self.make_request("/discover/tv", params)
        return data.get("results", []) if data else []

    async def search_multi(self, query: str, page: int = 1) -> List[Dict[str, Any]]:
        """Search for movies and TV shows"""
        params = {"query": query, "page": page}
        data = await self.make_request("/search/multi", params)
        return data.get("results", []) if data else []

    async def get_movie_details(self, movie_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed movie information"""
        return await self.make_request(f"/movie/{movie_id}")

    async def get_tv_details(self, tv_id: int) -> Optional[Dict[str, Any]]:
        """Get detailed TV show information"""
        return await self.make_request(f"/tv/{tv_id}")

    async def get_movie_videos(self, movie_id: int) -> List[Dict[str, Any]]:
        """Get movie trailers and videos"""
        data = await self.make_request(f"/movie/{movie_id}/videos")
        return data.get("results", []) if data else []

    async def get_tv_videos(self, tv_id: int) -> List[Dict[str, Any]]:
        """Get TV show trailers and videos"""
        data = await self.make_request(f"/tv/{tv_id}/videos")
        return data.get("results", []) if data else []

    async def get_genres(self) -> Dict[str, List[Dict[str, Any]]]:
        """Get all genres for movies and TV shows"""
        movie_genres = await self.make_request("/genre/movie/list")
        tv_genres = await self.make_request("/genre/tv/list")
        
        return {
            "movie_genres": movie_genres.get("genres", []) if movie_genres else [],
            "tv_genres": tv_genres.get("genres", []) if tv_genres else []
        }

    def get_full_image_url(self, path: Optional[str], size: str = "w500") -> Optional[str]:
        """Convert relative image path to full URL"""
        if not path:
            return None
        
        base_url = self.backdrop_base_url if size == "original" else f"https://image.tmdb.org/t/p/{size}"
        return f"{base_url}{path}"

    def extract_youtube_trailer(self, videos: List[Dict[str, Any]]) -> Optional[str]:
        """Extract YouTube trailer URL from videos"""
        for video in videos:
            if (video.get("type") == "Trailer" and 
                video.get("site") == "YouTube" and 
                video.get("key")):
                return f"https://www.youtube.com/watch?v={video['key']}"
        return None

    def get_content_year(self, item: Dict[str, Any]) -> str:
        """Extract year from release date or first air date"""
        date_str = item.get("release_date") or item.get("first_air_date", "")
        if date_str:
            try:
                return datetime.strptime(date_str, "%Y-%m-%d").year
            except:
                pass
        return "2023"

    def get_content_rating(self, item: Dict[str, Any], content_type: str) -> str:
        """Get content rating based on content type"""
        if content_type == "movie":
            return "PG-13" if not item.get("adult", False) else "R"
        else:
            return "TV-14"  # Default for TV shows

    def format_content_response(self, item: Dict[str, Any], content_type: str, trailer_url: Optional[str] = None) -> Dict[str, Any]:
        """Format TMDB response to match frontend expected format"""
        title = item.get("title") or item.get("name", "Unknown Title")
        
        return {
            "id": item.get("id"),
            "title": title,
            "image": self.get_full_image_url(item.get("poster_path")),
            "backdrop": self.get_full_image_url(item.get("backdrop_path"), "original"),
            "type": content_type,
            "rating": self.get_content_rating(item, content_type),
            "year": str(self.get_content_year(item)),
            "genre": [genre["name"] for genre in item.get("genres", [])] if item.get("genres") else ["Drama"],
            "description": item.get("overview"),
            "seasons": f"{item.get('number_of_seasons', 1)} Season{'s' if item.get('number_of_seasons', 1) != 1 else ''}" if content_type == "tv" else None,
            "trailerUrl": trailer_url,
            "tmdb_id": item.get("id"),
            "vote_average": item.get("vote_average", 0),
            "popularity": item.get("popularity", 0)
        }

# Global instance
tmdb_service = TMDBService()