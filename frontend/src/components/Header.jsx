import React, { useState, useEffect } from 'react';
import { Search, Bell, ChevronDown, Menu } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from './ui/dropdown-menu';
import { userProfiles } from '../data/mockData';

const Header = ({ onSearch, onGenreSelect, currentProfile, onProfileChange, onShowMyList }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    onSearch(searchQuery);
  };

  const navItems = [
    { name: 'Home', active: true },
    { name: 'TV Shows', active: false },
    { name: 'Movies', active: false },
    { name: 'New & Popular', active: false },
    { name: 'My List', active: false, onClick: onShowMyList },
    { name: 'Browse by Languages', active: false }
  ];

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? 'bg-black/90 backdrop-blur-sm' : 'bg-gradient-to-b from-black/80 to-transparent'
    }`}>
      <div className="flex items-center justify-between px-4 md:px-8 py-4">
        {/* Left side - Logo and Navigation */}
        <div className="flex items-center space-x-8">
          {/* Netflix Logo */}
          <div className="text-red-600 font-bold text-2xl md:text-3xl cursor-pointer">
            NETFLIX
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-6">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={item.onClick}
                className={`text-sm font-medium transition-colors hover:text-gray-300 ${
                  item.active ? 'text-white' : 'text-gray-400'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-gray-800"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <Menu className="h-5 w-5" />
          </Button>
        </div>

        {/* Right side - Search, Notifications, Profile */}
        <div className="flex items-center space-x-4">
          {/* Search */}
          <div className="relative">
            {isSearchVisible ? (
              <form onSubmit={handleSearch} className="flex items-center">
                <Input
                  type="text"
                  placeholder="Titles, people, genres"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-black/70 border-white/20 text-white placeholder:text-gray-400 focus:bg-black/90"
                  autoFocus
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800 ml-2"
                  onClick={() => setIsSearchVisible(false)}
                >
                  ×
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="sm"
                className="text-white hover:bg-gray-800"
                onClick={() => setIsSearchVisible(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}
          </div>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="sm"
            className="text-white hover:bg-gray-800 hidden md:flex"
          >
            <Bell className="h-5 w-5" />
          </Button>

          {/* Profile Dropdown */}
          {currentProfile && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-white hover:bg-gray-800 flex items-center space-x-2"
                >
                  <img
                    src={currentProfile.avatar}
                    alt={currentProfile.name}
                    className="w-8 h-8 rounded"
                  />
                  <ChevronDown className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-black/90 border-gray-700 text-white min-w-[200px]">
                {userProfiles.map((profile) => (
                  <DropdownMenuItem
                    key={profile.id}
                    onClick={() => onProfileChange(profile)}
                    className="flex items-center space-x-3 hover:bg-gray-800 cursor-pointer"
                  >
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="w-6 h-6 rounded"
                    />
                    <span>{profile.name}</span>
                  </DropdownMenuItem>
                ))}
                <hr className="border-gray-700 my-2" />
                <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                  Manage Profiles
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                  Account
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                  Help Center
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-gray-800 cursor-pointer">
                  Sign out of Netflix
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="lg:hidden bg-black/95 border-t border-gray-800">
          <nav className="px-4 py-2 space-y-2">
            {navItems.map((item) => (
              <button
                key={item.name}
                onClick={() => {
                  if (item.onClick) item.onClick();
                  setIsMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 text-sm font-medium transition-colors hover:text-gray-300 ${
                  item.active ? 'text-white' : 'text-gray-400'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
};

export default Header;