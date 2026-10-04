import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Film, Search, Bookmark, User, PlusCircle, LogOut, Menu, X, Star, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ onOpenAddMovie }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const isCurrent = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#07090e]/80 backdrop-blur-xl transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
              <Film className="w-5 h-5 text-white" />
            </div>
            <span className="text-2xl font-black tracking-tight font-display bg-gradient-to-r from-white via-slate-200 to-amber-400 bg-clip-text text-transparent">
              Film<span className="text-amber-400">Pulse</span>
            </span>
          </Link>

          {/* Search Bar - Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Search movies, directors, cast..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900/90 text-slate-200 rounded-full border border-slate-700/60 focus:border-amber-500/80 focus:ring-2 focus:ring-amber-500/20 outline-none transition placeholder-slate-500"
              />
            </div>
          </form>

          {/* Desktop Nav Links & Actions */}
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-5 text-sm font-medium">
              <Link 
                to="/" 
                className={`transition-colors hover:text-amber-400 ${isCurrent('/') ? 'text-amber-400' : 'text-slate-300'}`}
              >
                Movies
              </Link>
              <Link 
                to="/previous-movies" 
                className={`transition-colors hover:text-amber-400 flex items-center gap-1.5 ${isCurrent('/previous-movies') ? 'text-amber-400' : 'text-slate-300'}`}
              >
                <History className="w-4 h-4 text-amber-400" /> Previous Movies
              </Link>
              <Link 
                to="/?sort=highest_rated" 
                className="text-slate-300 hover:text-amber-400 transition-colors flex items-center gap-1"
              >
                <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Top Rated
              </Link>
              <Link 
                to="/watchlist" 
                className={`transition-colors hover:text-amber-400 flex items-center gap-1.5 ${isCurrent('/watchlist') ? 'text-amber-400' : 'text-slate-300'}`}
              >
                <Bookmark className="w-4 h-4" /> Watchlist
              </Link>
            </nav>

            {/* Add Movie Action */}
            <button
              onClick={onOpenAddMovie}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 transition shadow-sm"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" /> Add Movie
            </button>

            {/* User Profile / Auth */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2.5 p-1 rounded-full hover:ring-2 hover:ring-amber-500/40 transition"
                >
                  <img
                    src={user.avatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${user.username}`}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/50"
                  />
                  <span className="text-sm font-medium text-slate-200 max-w-[100px] truncate">
                    {user.username}
                  </span>
                </button>

                {/* Dropdown Menu */}
                {userMenuOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-52 glass-dropdown rounded-xl py-2 shadow-2xl z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                    onMouseLeave={() => setUserMenuOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-white/10">
                      <p className="text-xs text-slate-400">Signed in as</p>
                      <p className="text-sm font-semibold text-white truncate">{user.username}</p>
                    </div>
                    <Link
                      to="/profile"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <User className="w-4 h-4 text-amber-400" /> My Profile & Reviews
                    </Link>
                    <Link
                      to="/watchlist"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-white/5 transition"
                    >
                      <Bookmark className="w-4 h-4 text-amber-400" /> My Watchlist
                    </Link>
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition text-left"
                    >
                      <LogOut className="w-4 h-4" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2.5">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black shadow-lg shadow-amber-500/20 transition-all transform active:scale-95"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-300 hover:bg-slate-800 focus:outline-none"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Search & Menu dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/10 space-y-4">
            <form onSubmit={handleSearch} className="w-full">
              <div className="relative w-full">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search movies, directors..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-sm bg-slate-900 text-slate-200 rounded-lg border border-slate-700 outline-none"
                />
              </div>
            </form>

            <nav className="flex flex-col space-y-2 text-base font-medium">
              <Link
                to="/"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Movies
              </Link>
              <Link
                to="/previous-movies"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white flex items-center justify-between"
              >
                <span>Previous Movies</span>
                <History className="w-4 h-4 text-amber-400" />
              </Link>
              <Link
                to="/?sort=highest_rated"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white"
              >
                Top Rated
              </Link>
              <Link
                to="/watchlist"
                onClick={() => setMobileMenuOpen(false)}
                className="px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white flex items-center justify-between"
              >
                <span>Watchlist</span>
                <Bookmark className="w-4 h-4 text-amber-400" />
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAddMovie();
                }}
                className="w-full text-left px-3 py-2 rounded-lg text-amber-400 hover:bg-white/5 flex items-center gap-2"
              >
                <PlusCircle className="w-4 h-4" /> Add Movie
              </button>

              {user ? (
                <>
                  <Link
                    to="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className="px-3 py-2 rounded-lg text-slate-300 hover:bg-white/5 hover:text-white flex items-center gap-2"
                  >
                    <User className="w-4 h-4 text-amber-400" /> Profile ({user.username})
                  </Link>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-lg text-red-400 hover:bg-red-500/10 flex items-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </>
              ) : (
                <div className="pt-2 flex flex-col gap-2">
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-slate-800 text-white font-medium"
                  >
                    Sign In
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2.5 rounded-lg bg-amber-500 text-black font-semibold"
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}

      </div>
    </header>
  );
}
