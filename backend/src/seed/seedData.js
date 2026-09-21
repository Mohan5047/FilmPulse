const bcrypt = require('bcryptjs');
const { db, updateMovieRating, initializeDatabase } = require('../config/db');

const usersData = [
  {
    username: 'cinephile',
    email: 'cinephile@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    role: 'admin'
  },
  {
    username: 'sarah_watches',
    email: 'sarah@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'user'
  },
  {
    username: 'alex_critic',
    email: 'alex@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    role: 'user'
  },
  {
    username: 'elena_rodriguez',
    email: 'elena@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    role: 'user'
  }
];

const moviesData = [
  {
    title: 'Inception',
    tagline: 'Your mind is the scene of the crime.',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O., but his tragic past may doom the project and his team to disaster.',
    release_year: 2010,
    duration: 148,
    director: 'Christopher Nolan',
    cast: 'Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page, Tom Hardy, Ken Watanabe',
    genres: 'Sci-Fi, Action, Thriller',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=YoHD9XEInc0'
  },
  {
    title: 'The Dark Knight',
    tagline: 'Why so serious?',
    description: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    release_year: 2008,
    duration: 152,
    director: 'Christopher Nolan',
    cast: 'Christian Bale, Heath Ledger, Aaron Eckhart, Michael Caine, Maggie Gyllenhaal',
    genres: 'Action, Crime, Drama',
    poster_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=EXeTwQWrcwY'
  },
  {
    title: 'Interstellar',
    tagline: 'Mankind was born on Earth. It was never meant to die here.',
    description: 'When Earth becomes uninhabitable in the future, a farmer and ex-NASA pilot, Joseph Cooper, is tasked to pilot a spacecraft, along with a team of researchers, to find a new planet for humans.',
    release_year: 2014,
    duration: 169,
    director: 'Christopher Nolan',
    cast: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain, Michael Caine',
    genres: 'Sci-Fi, Adventure, Drama',
    poster_url: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=zSWdZVtXT7E'
  },
  {
    title: 'Pulp Fiction',
    tagline: 'Just because you are a character doesn\'t mean you have character.',
    description: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    release_year: 1994,
    duration: 154,
    director: 'Quentin Tarantino',
    cast: 'John Travolta, Uma Thurman, Samuel L. Jackson, Bruce Willis',
    genres: 'Crime, Drama',
    poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=s7EdQ4FqbhY'
  },
  {
    title: 'Spirited Away',
    tagline: 'Nothing that happens is ever forgotten, even if you can\'t remember it.',
    description: 'During her family\'s move to the suburbs, a indicator 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
    release_year: 2001,
    duration: 125,
    director: 'Hayao Miyazaki',
    cast: 'Rumi Hiiragi, Miyu Irino, Mari Natsuki, Takashi Naito',
    genres: 'Animation, Adventure, Fantasy',
    poster_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=ByXuk9QqQkk'
  },
  {
    title: 'Parasite',
    tagline: 'Act like you own the place.',
    description: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    release_year: 2019,
    duration: 132,
    director: 'Bong Joon Ho',
    cast: 'Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong, Choi Woo-shik, Park So-dam',
    genres: 'Thriller, Drama, Comedy',
    poster_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=5xH0RzeSojI'
  },
  {
    title: 'Dune: Part Two',
    tagline: 'Long live the fighters.',
    description: 'Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between love and the fate of the universe.',
    release_year: 2024,
    duration: 166,
    director: 'Denis Villeneuve',
    cast: 'Timothée Chalamet, Zendaya, Rebecca Ferguson, Javier Bardem, Austin Butler',
    genres: 'Sci-Fi, Adventure, Action',
    poster_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=Way9Dexny3w'
  },
  {
    title: 'Whiplash',
    tagline: 'The road to greatness can take you to the edge.',
    description: 'A promising young drummer enrolls at a cut-throat music conservatory where his dreams of greatness are mentored by an instructor who will stop at nothing to realize a student\'s potential.',
    release_year: 2014,
    duration: 107,
    director: 'Damien Chazelle',
    cast: 'Miles Teller, J.K. Simmons, Paul Reiser, Melissa Benoist',
    genres: 'Drama, Music',
    poster_url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=7d_jQycdQGo'
  },
  {
    title: 'Spider-Man: Across the Spider-Verse',
    tagline: 'It\'s how you wear the mask that matters.',
    description: 'Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence.',
    release_year: 2023,
    duration: 140,
    director: 'Joaquim Dos Santos, Kemp Powers, Justin K. Thompson',
    cast: 'Shameik Moore, Hailee Steinfeld, Oscar Isaac, Daniel Kaluuya',
    genres: 'Animation, Action, Sci-Fi',
    poster_url: 'https://images.unsplash.com/photo-1635805737707-575885ab0820?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=cqGjhVJWtEg'
  },
  {
    title: 'Oppenheimer',
    tagline: 'The world forever changes.',
    description: 'The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb during World War II.',
    release_year: 2023,
    duration: 180,
    director: 'Christopher Nolan',
    cast: 'Cillian Murphy, Emily Blunt, Matt Damon, Robert Downey Jr., Florence Pugh',
    genres: 'Biography, Drama, History',
    poster_url: 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=uYPbbksJxIg'
  },
  {
    title: 'Fight Club',
    tagline: 'Mischief. Mayhem. Soap.',
    description: 'An insomniac office worker and a devil-may-care soap maker form an underground fight club that evolves into much more.',
    release_year: 1999,
    duration: 139,
    director: 'David Fincher',
    cast: 'Brad Pitt, Edward Norton, Helena Bonham Carter, Meat Loaf',
    genres: 'Drama, Thriller',
    poster_url: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=qtRKdV9EIJU'
  },
  {
    title: 'The Shawshank Redemption',
    tagline: 'Fear can hold you prisoner. Hope can set you free.',
    description: 'Over the course of several years, two convicts form a friendship, seeking consolation and, eventually, redemption through basic compassion.',
    release_year: 1994,
    duration: 142,
    director: 'Frank Darabont',
    cast: 'Tim Robbins, Morgan Freeman, Bob Gunton, William Sadler',
    genres: 'Drama',
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=PLl99DlL6b4'
  }
];

const sampleReviews = [
  {
    movieIndex: 0, // Inception
    userIndex: 0,
    rating: 5,
    title: 'A towering cinematic triumph that demands repeat viewings',
    content: 'Christopher Nolan orchestrates a breathtaking symphony of narrative layers, mind-bending visual effects, and emotional weight. Hans Zimmer’s iconic score gives every scene an impossible level of tension and grandeur.',
    spoilers: 0,
    likes: 24
  },
  {
    movieIndex: 0, // Inception
    userIndex: 1,
    rating: 4.5,
    title: 'Visually brilliant with great pacing',
    content: 'The zero-gravity hallway sequence alone justifies this film’s place in history. While the emotional core sometimes feels complex, DiCaprio carries the vulnerability beautifully.',
    spoilers: 0,
    likes: 12
  },
  {
    movieIndex: 1, // The Dark Knight
    userIndex: 2,
    rating: 5,
    title: 'Heath Ledger redefined the superhero genre forever',
    content: 'Heath Ledger’s Joker is an electric, terrifying presence from his very first frame. The philosophical tug-of-war between chaos and order elevates this beyond standard action cinema into a modern tragedy.',
    spoilers: 0,
    likes: 45
  },
  {
    movieIndex: 1, // The Dark Knight
    userIndex: 3,
    rating: 5,
    title: 'Flawless pacing and unmatched atmosphere',
    content: 'Every choice feels deliberate. The tension escalates with surgical precision up to the hospital sequence and the ferry dilemma. Unmatched in the comic book genre.',
    spoilers: 0,
    likes: 19
  },
  {
    movieIndex: 2, // Interstellar
    userIndex: 0,
    rating: 5,
    title: 'Emotional, cosmic, and profoundly moving',
    content: 'The docking scene with Zimmer’s organ score "No Time for Caution" is one of the most heart-stopping sequences ever put to film. It combines theoretical physics with the raw human condition.',
    spoilers: 0,
    likes: 38
  },
  {
    movieIndex: 2, // Interstellar
    userIndex: 1,
    rating: 4,
    title: 'Breathtaking ambition with an emotional third act',
    content: 'A visual spectacle that truly captures the awe and terror of the cosmos. Some dialogue about love navigating dimensions feels a bit poetic, but the sheer scale forgives all.',
    spoilers: 1,
    likes: 15
  },
  {
    movieIndex: 5, // Parasite
    userIndex: 3,
    rating: 5,
    title: 'A razor-sharp satire that transforms seamlessly into a thriller',
    content: 'Bong Joon Ho crafted an airtight script with unforgettable production design. The way the architecture reflects the socio-economic division is genius. The mid-movie shift will leave your jaw on the floor.',
    spoilers: 0,
    likes: 31
  },
  {
    movieIndex: 6, // Dune: Part Two
    userIndex: 2,
    rating: 5,
    title: 'A monumental sci-fi epic for the ages',
    content: 'Denis Villeneuve delivers our generation’s Lord of the Rings. The sound design rattles your teeth, the cinematography by Greig Fraser is divine, and Austin Butler is downright chilling.',
    spoilers: 0,
    likes: 27
  },
  {
    movieIndex: 7, // Whiplash
    userIndex: 0,
    rating: 5,
    title: 'Exhausting, electrifying, and utterly relentless',
    content: 'Miles Teller and J.K. Simmons produce pure lightning. The final 10 minutes (Caravan solo) is one of the greatest climaxes in modern cinema. Not quite my tempo!',
    spoilers: 0,
    likes: 40
  },
  {
    movieIndex: 8, // Across the Spider-Verse
    userIndex: 1,
    rating: 4.5,
    title: 'Every frame is a canvas of breathtaking art',
    content: 'The blending of watercolor aesthetics for Gwen\'s world and the gritty India/Mumbattan look is astonishing. It sets an impossibly high bar for animation storytelling.',
    spoilers: 0,
    likes: 22
  }
];

async function seed() {
  console.log('🌱 Starting CineVerse Database Seeding...');
  await initializeDatabase();

  // Clear existing records to ensure fresh state
  db.exec(`
    DELETE FROM review_likes;
    DELETE FROM watchlist;
    DELETE FROM reviews;
    DELETE FROM movies;
    DELETE FROM users;
    DELETE FROM sqlite_sequence;
  `);

  // 1. Seed Users
  console.log('Inserting demo users...');
  const userIds = [];
  const insertUser = db.prepare(`
    INSERT INTO users (username, email, password, avatar, role)
    VALUES (?, ?, ?, ?, ?)
  `);

  for (const user of usersData) {
    const salt = bcrypt.genSaltSync(10);
    const hash = bcrypt.hashSync(user.password, salt);
    const res = insertUser.run(user.username, user.email, hash, user.avatar, user.role);
    userIds.push(res.lastInsertRowid);
  }

  // 2. Seed Movies
  console.log('Inserting movies...');
  const movieIds = [];
  const insertMovie = db.prepare(`
    INSERT INTO movies (
      title, tagline, description, release_year, duration,
      director, cast, genres, poster_url, backdrop_url, trailer_url
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  for (const movie of moviesData) {
    const res = insertMovie.run(
      movie.title,
      movie.tagline,
      movie.description,
      movie.release_year,
      movie.duration,
      movie.director,
      movie.cast,
      movie.genres,
      movie.poster_url,
      movie.backdrop_url,
      movie.trailer_url
    );
    movieIds.push(res.lastInsertRowid);
  }

  // 3. Seed Reviews
  console.log('Inserting sample reviews & calculating ratings...');
  const insertReview = db.prepare(`
    INSERT INTO reviews (
      movie_id, user_id, rating, title, content, contains_spoilers, likes_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  for (const review of sampleReviews) {
    const movieId = movieIds[review.movieIndex];
    const userId = userIds[review.userIndex];
    insertReview.run(
      movieId,
      userId,
      review.rating,
      review.title,
      review.content,
      review.spoilers,
      review.likes
    );
  }

  // 4. Update aggregated movie ratings
  for (const movieId of movieIds) {
    updateMovieRating(movieId);
  }

  // 5. Seed sample watchlist items
  console.log('Inserting sample watchlist entries...');
  const insertWatchlist = db.prepare(`
    INSERT INTO watchlist (user_id, movie_id) VALUES (?, ?)
  `);
  // Add some movies to cinephile's watchlist (user 0)
  insertWatchlist.run(userIds[0], movieIds[2]); // Interstellar
  insertWatchlist.run(userIds[0], movieIds[6]); // Dune Part Two
  insertWatchlist.run(userIds[0], movieIds[9]); // Oppenheimer

  console.log('✅ Database seeded successfully!');
  console.log(`   - Users: ${userIds.length}`);
  console.log(`   - Movies: ${movieIds.length}`);
  console.log(`   - Reviews: ${sampleReviews.length}`);
}

if (require.main === module) {
  seed().catch(err => {
    console.error('Seeding failed:', err);
    process.exit(1);
  });
}

module.exports = { seed };
