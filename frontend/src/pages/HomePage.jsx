import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, SlidersHorizontal, Loader2, RefreshCw, History, Sparkles, ArrowRight, Film } from 'lucide-react';
import HeroBanner from '../components/HeroBanner';
import MovieCard from '../components/MovieCard';
import { moviesAPI } from '../services/api';

export default function HomePage({ onOpenAddMovie }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  const sortFromUrl = searchParams.get('sort') || 'highest_rated';
  const eraFromUrl = searchParams.get('era') || 'all';

  const [movies, setMovies] = useState([]);
  const [previousMoviesSpotlight, setPreviousMoviesSpotlight] = useState([]);
  const [featuredMovie, setFeaturedMovie] = useState(null);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [selectedEra, setSelectedEra] = useState(eraFromUrl);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [sortBy, setSortBy] = useState(sortFromUrl);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  // Sync with searchParams
  useEffect(() => {
    if (searchFromUrl !== searchQuery) setSearchQuery(searchFromUrl);
    if (sortFromUrl !== sortBy) setSortBy(sortFromUrl);
    if (eraFromUrl !== selectedEra) setSelectedEra(eraFromUrl);
  }, [searchFromUrl, sortFromUrl, eraFromUrl]);

  // Load genres, featured movie, and previous movies spotlight
  useEffect(() => {
    async function loadMeta() {
      try {
        const [featRes, genRes, prevRes] = await Promise.all([
          moviesAPI.getFeatured(),
          moviesAPI.getGenres(),
          moviesAPI.getPrevious({ limit: 4, sort: 'highest_rated' })
        ]);
        if (featRes.data.success) {
          setFeaturedMovie(featRes.data.data);
        }
        if (genRes.data.success) {
          setGenres([{ name: 'All', count: 0 }, ...genRes.data.data]);
        }
        if (prevRes.data.success) {
          setPreviousMoviesSpotlight(prevRes.data.data.slice(0, 4));
        }
      } catch (err) {
        console.error('Failed to load initial metadata:', err);
      }
    }
    loadMeta();
  }, []);

  // Fetch movies when filters or search change
  const fetchMovies = async (page = 1) => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        sort: sortBy,
        genre: selectedGenre !== 'All' ? selectedGenre : undefined,
        search: searchQuery.trim() || undefined,
        era: selectedEra !== 'all' ? selectedEra : undefined
      };

      const res = await moviesAPI.getAll(params);
      if (res.data.success) {
        setMovies(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch movies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies(1);
  }, [selectedGenre, sortBy, searchQuery, selectedEra]);

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

  const handleGenreChange = (genreName) => {
    setSelectedGenre(genreName);
  };

  const handleSortChange = (newSort) => {
    setSortBy(newSort);
    setSearchParams(prev => {
      prev.set('sort', newSort);
      return prev;
    });
  };

  const handleEraChange = (era) => {
    setSelectedEra(era);
    setSearchParams(prev => {
      if (era !== 'all') {
        prev.set('era', era);
      } else {
        prev.delete('era');
      }
      return prev;
    });
  };

  const handleClearFilters = () => {
    setSelectedGenre('All');
    setSelectedEra('all');
    setSearchQuery('');
    setSortBy('highest_rated');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Featured Film Hero - Only shown when not searching */}
      {!searchQuery && selectedGenre === 'All' && selectedEra === 'all' && featuredMovie && (
        <HeroBanner movie={featuredMovie} />
      )}

      {/* DEDICATED SEPARATE SECTION: Previous Movies Spotlight */}
      {!searchQuery && selectedGenre === 'All' && selectedEra === 'all' && previousMoviesSpotlight.length > 0 && (
        <section className="mb-14 p-6 sm:p-8 rounded-3xl glass-panel border border-amber-500/20 bg-gradient-to-r from-amber-950/20 via-slate-900/60 to-slate-900/90 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-300 text-xs font-bold uppercase tracking-wider mb-2">
                <History className="w-3.5 h-3.5" /> Classic Cinema Vault
              </div>
              <h2 className="text-2xl sm:text-3xl font-black font-display text-white">
                🎞️ Previous & Classic Movies
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 mt-1">
                Timeless masterpieces from previous eras (90s, 2000s, 2010s & Vintage).
              </p>
            </div>

            <Link
              to="/previous-movies"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs sm:text-sm shadow-lg shadow-amber-500/20 transition transform active:scale-95"
            >
              <span>Explore All Previous Movies</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Previous Movies Grid List */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
            {previousMoviesSpotlight.map((movie) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        </section>
      )}

      {/* Filter and Search Bar Section */}
      <div className="mb-8 space-y-4">
        {/* ERA FILTER TOGGLE BAR (All vs Previous vs Recent) */}
        <div className="flex flex-wrap items-center gap-2 pb-2">
          <button
            onClick={() => handleEraChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedEra === 'all'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Film className="w-3.5 h-3.5" /> All Movies
          </button>

          <button
            onClick={() => handleEraChange('previous')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedEra === 'previous'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <History className="w-3.5 h-3.5 text-amber-400" /> 📼 Previous Movies (Classics)
          </button>

          <button
            onClick={() => handleEraChange('recent')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedEra === 'recent'
                ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                : 'bg-slate-900 text-slate-300 border border-slate-800 hover:text-white hover:border-slate-700'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> 🔥 Recent Releases (2020+)
          </button>

          <Link
            to="/previous-movies"
            className="ml-auto text-xs font-semibold text-amber-400 hover:text-amber-300 transition flex items-center gap-1 hidden sm:flex"
          >
            <span>Open Dedicated Classics Vault</span> &rarr;
          </Link>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          {/* Search form */}
          <form onSubmit={handleSearchSubmit} className="relative flex-1 max-w-lg">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, director, or cast..."
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

          {/* Sort selection */}
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
              <option value="most_reviewed">Most Reviewed 💬</option>
              <option value="newest">Release Year (Newest)</option>
              <option value="oldest">Release Year (Oldest)</option>
              <option value="title_asc">Title (A-Z)</option>
            </select>
          </div>
        </div>

        {/* Genre Pill Carousel / Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {genres.map((g) => {
            const isSelected = selectedGenre === g.name;
            return (
              <button
                key={g.name}
                onClick={() => handleGenreChange(g.name)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                    : 'bg-slate-900/80 text-slate-300 border border-slate-800 hover:border-slate-700 hover:text-white'
                }`}
              >
                {g.name} {g.count > 0 ? `(${g.count})` : ''}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold font-display text-white">
            {searchQuery
              ? `Search results for "${searchQuery}"`
              : selectedEra === 'previous'
              ? '📼 Previous Movies & Classics'
              : selectedEra === 'recent'
              ? '🔥 Recent Releases (2020+)'
              : selectedGenre !== 'All'
              ? `${selectedGenre} Movies`
              : 'Browse Catalog'}
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Showing {movies.length} of {pagination.total} movies
          </p>
        </div>

        {(searchQuery || selectedGenre !== 'All' || selectedEra !== 'all') && (
          <button
            onClick={handleClearFilters}
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Filters
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
          <h3 className="text-lg font-bold text-white">No movies match your criteria</h3>
          <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">
            Try adjusting your search terms or genre filter, or add this film to the catalog.
          </p>
          <div className="mt-5 flex items-center justify-center gap-3">
            <button
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-slate-800 hover:bg-slate-700 text-white transition"
            >
              Clear Filters
            </button>
            <button
              onClick={onOpenAddMovie}
              className="px-4 py-2 rounded-xl text-sm font-semibold bg-amber-500 hover:bg-amber-400 text-black transition"
            >
              Add New Movie
            </button>
          </div>
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-12">
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((pageNum) => (
            <button
              key={pageNum}
              onClick={() => fetchMovies(pageNum)}
              className={`w-10 h-10 rounded-xl text-sm font-bold transition ${
                pagination.page === pageNum
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800 hover:border-slate-700'
              }`}
            >
              {pageNum}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
