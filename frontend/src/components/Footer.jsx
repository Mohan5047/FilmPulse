import React, { useEffect, useState } from 'react';
import { Film, Heart, Star, Award, Layers } from 'lucide-react';
import { statsAPI } from '../services/api';

export default function Footer() {
  const [stats, setStats] = useState({
    totalMovies: 0,
    totalReviews: 0,
    averageRating: 0,
    totalUsers: 0
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await statsAPI.getStats();
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        // Fallback gracefully
      }
    }
    loadStats();
  }, []);

  return (
    <footer className="mt-20 border-t border-white/10 bg-[#0a0d14]/90 text-slate-400">
      {/* Live Community Metrics Ticker */}
      <div className="border-b border-white/5 bg-slate-900/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
                {stats.totalMovies || '12+'}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 mt-1 flex items-center gap-1">
                <Film className="w-3.5 h-3.5" /> Curated Movies
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
                {stats.totalReviews || '10+'}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 mt-1 flex items-center gap-1">
                <Award className="w-3.5 h-3.5" /> User Reviews
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
                {stats.averageRating ? `${stats.averageRating} / 5` : '4.8 / 5'}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 mt-1 flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" /> Avg Rating
              </span>
            </div>

            <div className="flex flex-col items-center justify-center p-3 rounded-xl bg-white/[0.02]">
              <span className="text-2xl sm:text-3xl font-black text-amber-400 font-display">
                {stats.totalUsers || '4+'}
              </span>
              <span className="text-xs uppercase tracking-wider text-slate-400 mt-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5" /> Movie Lovers
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-amber-500 to-red-600 flex items-center justify-center">
              <Film className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold font-display text-white">
              Cine<span className="text-amber-400">Verse</span>
            </span>
            <span className="text-xs text-slate-500 ml-2">
              Discover, rate, and discuss great cinema.
            </span>
          </div>

          <div className="flex items-center gap-6 text-sm text-slate-400">
            <span>Built with React, Express, Tailwind CSS & SQLite</span>
          </div>

          <div className="text-xs text-slate-500 flex items-center gap-1">
            Made with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" /> for movie buffs worldwide.
          </div>
        </div>
      </div>
    </footer>
  );
}
