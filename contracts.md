# Netflix Clone - Frontend & Backend Integration Contracts

## API Contracts

### 1. Movies & TV Shows API

#### GET /api/movies/trending
- **Purpose**: Get trending movies and TV shows
- **Response**: Array of movie/show objects
- **Mock Data**: `movieCategories[0].movies` (Trending Now)

#### GET /api/movies/popular
- **Purpose**: Get popular content on Netflix
- **Response**: Array of movie/show objects
- **Mock Data**: `movieCategories[1].movies` (Popular on Netflix)

#### GET /api/movies/category/:categoryId
- **Purpose**: Get movies by category (Action, Horror, etc.)
- **Response**: Array of movie/show objects
- **Mock Data**: `movieCategories` array

#### GET /api/movies/featured
- **Purpose**: Get featured content for hero section
- **Response**: Single featured content object
- **Mock Data**: `featuredContent`

#### GET /api/search?q={query}
- **Purpose**: Search movies and shows
- **Response**: Array of matching content
- **Mock Data**: Filtered results from all categories

### 2. User Management API

#### GET /api/users/profiles
- **Purpose**: Get user profiles
- **Response**: Array of user profile objects
- **Mock Data**: `userProfiles`

#### POST /api/users/profiles
- **Purpose**: Create new user profile
- **Request**: Profile data (name, avatar, isKids)
- **Response**: Created profile object

#### GET /api/users/:profileId/my-list
- **Purpose**: Get user's saved content list
- **Response**: Array of saved content
- **Mock Data**: `myList`

#### POST /api/users/:profileId/my-list
- **Purpose**: Add content to user's list
- **Request**: Movie/show ID
- **Response**: Success message

#### DELETE /api/users/:profileId/my-list/:contentId
- **Purpose**: Remove content from user's list
- **Response**: Success message

#### GET /api/users/:profileId/continue-watching
- **Purpose**: Get continue watching list with progress
- **Response**: Array of content with progress
- **Mock Data**: `continueWatching`

#### PUT /api/users/:profileId/progress/:contentId
- **Purpose**: Update viewing progress
- **Request**: Progress percentage, current episode, time left
- **Response**: Updated progress object

### 3. Content Details API

#### GET /api/content/:contentId
- **Purpose**: Get detailed information about specific content
- **Response**: Detailed content object with cast, episodes, etc.

#### GET /api/content/:contentId/similar
- **Purpose**: Get similar content recommendations
- **Response**: Array of similar content

## Data Models

### Movie/Show Object
```javascript
{
  id: number,
  title: string,
  image: string,
  backdrop?: string,
  logo?: string,
  type: 'movie' | 'series',
  rating: string,
  year: string,
  genre: string[],
  description?: string,
  seasons?: string,
  trailerUrl: string,
  progress?: number, // 0-100
  episode?: string, // For series
  timeLeft?: string // For continue watching
}
```

### User Profile Object
```javascript
{
  id: number,
  name: string,
  avatar: string,
  isKids: boolean
}
```

### Featured Content Object
```javascript
{
  id: number,
  title: string,
  description: string,
  backdrop: string,
  logo?: string,
  genre: string[],
  rating: string,
  year: string,
  seasons?: string,
  trailerUrl: string
}
```

## Mock Data Replacement Plan

### Current Mock Data in `/data/mockData.js`:
1. **featuredContent** → Replace with `/api/movies/featured`
2. **movieCategories** → Replace with multiple category API calls
3. **myList** → Replace with `/api/users/:profileId/my-list`
4. **continueWatching** → Replace with `/api/users/:profileId/continue-watching`
5. **userProfiles** → Replace with `/api/users/profiles`

### Frontend Integration Steps:
1. Create API service layer (`/services/api.js`)
2. Replace mock imports with API calls
3. Add loading states and error handling
4. Implement proper state management
5. Add pagination for large content lists

## Backend Implementation Requirements

### Database Schema (MongoDB):
1. **Content Collection**: Store movies/shows with TMDB integration
2. **Users Collection**: User profiles and preferences
3. **UserLists Collection**: My List functionality
4. **ViewingProgress Collection**: Track progress and continue watching
5. **Categories Collection**: Content categories and genres

### External Integrations:
1. **TMDB API**: Fetch real movie/show data, images, and trailers
2. **YouTube API**: For trailer playback functionality

### Features to Implement:
1. Real-time content updates from TMDB
2. User authentication and profile management
3. Personalized recommendations based on viewing history
4. Search functionality with autocomplete
5. Content categorization and filtering
6. Progress tracking and resume functionality

## Testing Strategy
1. Test all API endpoints with proper data validation
2. Test frontend-backend integration
3. Test search functionality
4. Test user profile switching
5. Test My List functionality
6. Test video player integration
7. Test responsive design on different devices

## Future Enhancements
1. Add more sophisticated recommendation algorithm
2. Implement content rating system
3. Add subtitle and language preferences
4. Implement download functionality (offline viewing)
5. Add social features (sharing, reviews)
6. Implement admin panel for content management