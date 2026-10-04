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
  // Modern / Recent Releases (2020+)
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

  // 2010s Modern Classics (Previous Era)
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

  // 2000s Golden Era Classics (Previous Era)
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
    title: 'The Lord of the Rings: The Fellowship of the Ring',
    tagline: 'One ring to rule them all.',
    description: 'A meek Hobbit from the Shire and eight companions set out on a journey to destroy the powerful One Ring and save Middle-earth from the Dark Lord Sauron.',
    release_year: 2001,
    duration: 178,
    director: 'Peter Jackson',
    cast: 'Elijah Wood, Ian McKellen, Viggo Mortensen, Orlando Bloom, Sean Astin',
    genres: 'Adventure, Fantasy, Action',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=V75dMMIW2B4'
  },
  {
    title: 'Spirited Away',
    tagline: 'Nothing that happens is ever forgotten, even if you can\'t remember it.',
    description: 'During her family\'s move to the suburbs, a 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts.',
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
    title: 'Gladiator',
    tagline: 'A hero will rise.',
    description: 'A former Roman General sets out to exact vengeance against the corrupt emperor who murdered his family and sent him into slavery.',
    release_year: 2000,
    duration: 155,
    director: 'Ridley Scott',
    cast: 'Russell Crowe, Joaquin Phoenix, Connie Nielsen, Oliver Reed',
    genres: 'Action, Adventure, Drama',
    poster_url: 'https://images.unsplash.com/photo-1533929736458-ca588d08c8be?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=owK1qxDselE'
  },

  // 1990s Revolution & Masterpieces (Previous Era)
  {
    title: 'The Matrix',
    tagline: 'Welcome to the Real World.',
    description: 'When a beautiful stranger leads computer hacker Neo to a forbidding underworld, he discovers the shocking truth--the life he knows is the elaborate deception of an evil cyber-intelligence.',
    release_year: 1999,
    duration: 136,
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: 'Keanu Reeves, Laurence Fishburne, Carrie-Anne Moss, Hugo Weaving',
    genres: 'Sci-Fi, Action',
    poster_url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=vKQi3bBA1y8'
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
    title: 'Titanic',
    tagline: 'Nothing on Earth could come between them.',
    description: 'A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.',
    release_year: 1997,
    duration: 195,
    director: 'James Cameron',
    cast: 'Leonardo DiCaprio, Kate Winslet, Billy Zane, Kathy Bates, Bill Paxton',
    genres: 'Drama, Romance',
    poster_url: 'https://images.unsplash.com/photo-1509281373149-e957c6296406?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1514306191717-452ec28c7814?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=2e-eXJ6HgkQ'
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
    title: 'Forrest Gump',
    tagline: 'The world will never be the same once you\'ve seen it through the eyes of Forrest Gump.',
    description: 'The history of the United States from the 1950s to the \'70s unfolds from the perspective of an Alabama man with an IQ of 75, who yearns to be reunited with his childhood sweetheart.',
    release_year: 1994,
    duration: 142,
    director: 'Robert Zemeckis',
    cast: 'Tom Hanks, Robin Wright, Gary Sinise, Sally Field',
    genres: 'Drama, Romance',
    poster_url: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=bLvqoHBptjg'
  },
  {
    title: 'Jurassic Park',
    tagline: 'An adventure 65 million years in the making.',
    description: 'A pragmatic paleontologist touring an almost complete theme park on an island in Central America is tasked with protecting a couple of kids after a power failure causes the park\'s cloned dinosaurs to run loose.',
    release_year: 1993,
    duration: 127,
    director: 'Steven Spielberg',
    cast: 'Sam Neill, Laura Dern, Jeff Goldblum, Richard Attenborough',
    genres: 'Sci-Fi, Adventure, Action',
    poster_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=lc0UehYemQA'
  },
  {
    title: 'Goodfellas',
    tagline: 'Three Decades of Life in the Mafia.',
    description: 'The story of Henry Hill and his life in the mafia, covering his relationship with his wife Karen and his mob partners Jimmy Conway and Tommy DeVito.',
    release_year: 1990,
    duration: 145,
    director: 'Martin Scorsese',
    cast: 'Robert De Niro, Ray Liotta, Joe Pesci, Lorraine Bracco',
    genres: 'Crime, Drama, Biography',
    poster_url: 'https://images.unsplash.com/photo-1594909122845-11baa439b7bf?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=qo5jJpHtTX8'
  },

  // Vintage Classics (Pre-90s)
  {
    title: 'The Godfather',
    tagline: 'An offer you can\'t refuse.',
    description: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    release_year: 1972,
    duration: 175,
    director: 'Francis Ford Coppola',
    cast: 'Marlon Brando, Al Pacino, James Caan, Robert Duvall, Diane Keaton',
    genres: 'Crime, Drama',
    poster_url: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?w=600&auto=format&fit=crop&q=80',
    backdrop_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1200&auto=format&fit=crop&q=80',
    trailer_url: 'https://www.youtube.com/watch?v=sY1S34973zA'
  }
];

const sampleReviews = [
  {
    movieIndex: 0, // Dune Part Two
    userIndex: 2,
    rating: 5,
    title: 'A monumental sci-fi epic for the ages',
    content: 'Denis Villeneuve delivers our generation’s Lord of the Rings. The sound design rattles your teeth, the cinematography by Greig Fraser is divine, and Austin Butler is downright chilling.',
    spoilers: 0,
    likes: 27
  },
  {
    movieIndex: 1, // Oppenheimer
    userIndex: 3,
    rating: 5,
    title: 'Haunting, visceral, and a masterclass in tension',
    content: 'Cillian Murphy’s piercing gaze conveys decades of internal torment. The Trinity test sequence is sheer cinematic wizardry without a single drop of CGI.',
    spoilers: 0,
    likes: 35
  },
  {
    movieIndex: 2, // Across the Spider-Verse
    userIndex: 1,
    rating: 4.5,
    title: 'Every frame is a canvas of breathtaking art',
    content: 'The blending of watercolor aesthetics for Gwen\'s world and the gritty India/Mumbattan look is astonishing. It sets an impossibly high bar for animation storytelling.',
    spoilers: 0,
    likes: 22
  },
  {
    movieIndex: 3, // Parasite
    userIndex: 3,
    rating: 5,
    title: 'A razor-sharp satire that transforms seamlessly into a thriller',
    content: 'Bong Joon Ho crafted an airtight script with unforgettable production design. The way the architecture reflects the socio-economic division is genius. The mid-movie shift will leave your jaw on the floor.',
    spoilers: 0,
    likes: 31
  },
  {
    movieIndex: 4, // Interstellar
    userIndex: 0,
    rating: 5,
    title: 'Emotional, cosmic, and profoundly moving',
    content: 'The docking scene with Zimmer’s organ score "No Time for Caution" is one of the most heart-stopping sequences ever put to film. It combines theoretical physics with the raw human condition.',
    spoilers: 0,
    likes: 38
  },
  {
    movieIndex: 5, // Whiplash
    userIndex: 0,
    rating: 5,
    title: 'Exhausting, electrifying, and utterly relentless',
    content: 'Miles Teller and J.K. Simmons produce pure lightning. The final 10 minutes (Caravan solo) is one of the greatest climaxes in modern cinema. Not quite my tempo!',
    spoilers: 0,
    likes: 40
  },
  {
    movieIndex: 6, // Inception
    userIndex: 0,
    rating: 5,
    title: 'A towering cinematic triumph that demands repeat viewings',
    content: 'Christopher Nolan orchestrates a breathtaking symphony of narrative layers, mind-bending visual effects, and emotional weight. Hans Zimmer’s iconic score gives every scene an impossible level of tension and grandeur.',
    spoilers: 0,
    likes: 24
  },
  {
    movieIndex: 7, // The Dark Knight
    userIndex: 2,
    rating: 5,
    title: 'Heath Ledger redefined the superhero genre forever',
    content: 'Heath Ledger’s Joker is an electric, terrifying presence from his very first frame. The philosophical tug-of-war between chaos and order elevates this beyond standard action cinema into a modern tragedy.',
    spoilers: 0,
    likes: 45
  },
  {
    movieIndex: 8, // The Lord of the Rings
    userIndex: 1,
    rating: 5,
    title: 'The gold standard of epic fantasy filmmaking',
    content: 'Howard Shore’s Shire theme brings an instant wave of emotion. Peter Jackson created an immersive fantasy world with practical effects and breathtaking landscapes that still hold up flawlessly today.',
    spoilers: 0,
    likes: 42
  },
  {
    movieIndex: 11, // The Matrix
    userIndex: 0,
    rating: 5,
    title: 'Revolutionized action cinema and sci-fi philosophy',
    content: 'Bullet time, leather trench coats, and questions about simulated reality that still resonate today. Keanu Reeves was born to play Neo.',
    spoilers: 0,
    likes: 39
  },
  {
    movieIndex: 14, // The Shawshank Redemption
    userIndex: 3,
    rating: 5,
    title: 'The ultimate tale of patience, friendship, and hope',
    content: 'Morgan Freeman’s narration and Tim Robbins’ quiet resilience make this one of the most heartwarming and uplifting cinema experiences ever created.',
    spoilers: 0,
    likes: 50
  },
  {
    movieIndex: 19, // The Godfather
    userIndex: 2,
    rating: 5,
    title: 'The undisputed benchmark of dramatic storytelling',
    content: 'Marlon Brando and Al Pacino deliver career-defining performances. Nino Rota’s haunting score and Gordon Willis’ shadowed cinematography are pure cinema royalty.',
    spoilers: 0,
    likes: 48
  }
];

async function seed() {
  console.log('🌱 Starting FilmPulse Database Seeding...');
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
  console.log(`Inserting ${moviesData.length} movies...`);
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
    if (movieId && userId) {
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
  if (movieIds.length > 5) {
    insertWatchlist.run(userIds[0], movieIds[4]); // Interstellar
    insertWatchlist.run(userIds[0], movieIds[0]); // Dune Part Two
    insertWatchlist.run(userIds[0], movieIds[11]); // The Matrix
  }

  console.log('✅ FilmPulse database seeded successfully!');
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
