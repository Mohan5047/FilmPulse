import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Film, History, SlidersHorizontal, Search, Sparkles, Star, Calendar, RefreshCw, Loader2, ArrowLeft } from 'lucide-react';
import MovieCard from '../components/MovieCard';
import { moviesAPI } from '../services/api';

const ERA_TABS = [
  { id: 'all', label: 'All Previous Classics', icon: Film, desc: 'All films before 2020' },
  { id: '2010s', label: '2010s Hits', icon: Sparkles, desc: 'Inception, Interstellar, Parasite' },
  { id: '2000s', label: '2000s Era', icon: Star, desc: 'Dark Knight, LOTR, Gladiator' },
  { id: '90s', label: '90s Revolution', icon: History, desc: 'Matrix, Shawshank, Pulp Fiction' },
  { id: 'vintage', label: 'Vintage Classics', icon: Calendar, desc: 'The Godfather & Pre-90s' }
];

export default function PreviousMoviesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const eraFromUrl = searchParams.get('era') || 'all';
  const searchFromUrl = searchParams.get('search') || '';
  const sortFromUrl = searchParams.get('sort') || 'highest_rated';

  const [movies, setMovies] = useState([]);
  const [selectedEra, setSelectedEra] = useState(eraFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [sortBy, setSortBy] = useState(sortFromUrl);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [genres, setGenres] = useState([]);
  const [eraStats, setEraStats] = useState({ all: 0, '2010s': 0, '2000s': 0, '90s': 0, vintage: 0 });
  const [loading, setLoading] = useState(true);

  // Sync params
  useEffect(() => {
    if (eraFromUrl !== selectedEra) setSelectedEra(eraFromUrl);
    if (searchFromUrl !== searchQuery) setSearchQuery(searchFromUrl);
    if (sortFromUrl !== sortBy) setSortBy(sortFromUrl);
  }, [eraFromUrl, searchFromUrl, sortFromUrl]);

  // Load genres
  useEffect(() => {
    async function loadGenres() {
      try {
        const res = await moviesAPI.getGenres();
        if (res.data.success) {
          setGenres([{ name: 'All', count: 0 }, ...res.data.data]);
        }
      } catch (err) {
        // Ignore
      }
    }
    loadGenres();
  }, []);

  // Fetch previous movies
  const fetchPreviousMovies = async () => {
    setLoading(true);
    try {
      const params = {
        era: selectedEra,
        sort: sortBy,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        search: searchQuery.trim() || undefined
      };

      const res = await moviesAPI.getPrevious(params);
      if (res.data.success) {
        setMovies(res.data.data);
        if (res.data.eraStats) {
          setEraStats(res.data.eraStats);
        }
      }
    } catch (err) {
      console.error('Failed to fetch previous movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPreviousMovies();
  }, [selectedEra, sortBy, selectedGenre, searchQuery]);

  const handleEraChange = (eraId) => {
    setSelectedEra(eraId);
    setSearchParams(prev => {
      if (eraId !== 'all') {
        prev.set('era', eraId);
      } else {
        prev.delete('era');
      }
      return prev;
    });
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setSearchParams(prev => {
      prev.set('sort', newSort);
      return prev;
    });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchParams(prev => {
      if (searchQuery.trim()) {
        prev.set('search', searchQuery.trim());
      } else {
        prev.delete('search');
      }
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSelectedEra('all');
    setSelectedGenre('All');
    setSearchQuery('');
    setSortBy('highest_rated');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="mb-4">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition"
        >
          <ArrowLeft className="w-4 h-4" /> Back to All Movies
        </Link>
      </div>

      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel p-8 sm:p-10 border border-white/10 shadow-2xl mb-10 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-950">
        <div className="max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider">
            <History className="w-3.5 h-3.5 text-amber-400" /> Classic Cinema Vault
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display text-white tracking-tight">
            Previous & Classic Movies
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            A dedicated collection of timeless cinema masterpieces from previous eras. From 90s groundbreaking epics to 2000s blockbusters and vintage gems.
          </p>
        </div>

        {/* Quick Era Badges */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mt-8 pt-6 border-t border-white/10">
          {ERA_TABS.map((tab) => {
            const isSelected = selectedEra === tab.id;
            const count = eraStats[tab.id] ?? 0;
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => handleEraChange(tab.id)}
                className={`flex flex-col items-start p-3.5 rounded-2xl text-left transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20 font-bold scale-102'
                    : 'bg-white/[0.03] text-slate-300 hover:bg-white/[0.08] hover:text-white border border-white/5'
                }`}
              >
                <div className="flex items-center justify-between w-full mb-1">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-black' : 'text-amber-400'}`} />
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${isSelected ? 'bg-black/20 text-black' : 'bg-slate-800 text-amber-400'}`}>
                    {count > 0 ? count : '•'}
                  </span>
                </div>
                <span className="text-xs font-bold leading-snug">{tab.label}</span>
                <span className={`text-[10px] mt-0.5 line-clamp-1 ${isSelected ? 'text-black/80 font-medium' : 'text-slate-500'}`}>
                  {tab.desc}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter and Search Bar Section */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search previous movies by title, director, or cast..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2.5 rounded-xl bg-slate-900/90 text-white placeholder-slate-500 border border-slate-700/60 focus:border-amber-500/80 outline-none text-sm transition"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSearchParams(prev => {
                    prev.delete('search');
                    return prev;
                  });
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800"
              >
                Clear
              </button>
            )}
          </form>

          {/* Sort Selection */}
          <div className="flex items-center gap-3 self-end md:self-auto">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
              <SlidersHorizontal className="w-4 h-4 text-amber-400" />
              <span>Sort By:</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => handleSortChange(e.target.value)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 text-slate-200 border border-slate-700 text-sm outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="highest_rated">Highest Rated ⭐</option>
              <option value="oldest">Release Year (Oldest First)</option>
              <option value="newest">Release Year (Newest First)</option>
              <option value="most_reviewed">Most Reviewed 💬</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Genre Filter Chips */}
        {genres.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            {genres.map((g) => {
              const isSelected = selectedGenre === g.name;
              return (
                <button
                  key={g.name}
                  onClick={() => setSelectedGenre(g.name)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                    isSelected
                      ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                      : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                  }`}
                >
                  {g.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            {selectedEra !== 'all' ? ERA_TABS.find(t => t.id === selectedEra)?.label : 'All Previous Movies'}
            {selectedGenre !== 'All' ? ` • ${selectedGenre}` : ''}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Displaying {movies.length} classic cinema titles
          </p>
        </div>

        {(searchQuery || selectedGenre !== 'All' || selectedEra !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset All Filters
          </button>
        )}
      </div>

      {/* Movies Grid */}
      {loading ? (
        <div className="min-h-[300px] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 rounded-3xl bg-slate-900/40 border border-slate-800">
          <Search className="w-12 h-12 mx-auto text-slate-600 mb-3" />
          <h3 className="text-lg font-bold text-white">No previous movies match your criteria</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Try choosing a different era or clearing your search keywords.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
