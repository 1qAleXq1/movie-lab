import React, { useState, useEffect } from 'react';
import './index.css';

function App() {
  // списки фільмів: топ і звичайні
  const [topFilms, setTopFilms] = useState([]);
  const [extraFilms, setExtraFilms] = useState([]);
  
  // стан завантаження, щоб не було пустого екрану
  const [loading, setLoading] = useState(true);
  
  // яка зараз вкладка (Catalog, Stats чи Faworites)
  const [currentPage, setCurrentPage] = useState('top20');
  
  // список обраного - беремо з пам'яті браузера
  const [faworites, setFavorites] = useState(JSON.parse(localStorage.getItem('faworites')) || []);

  useEffect(() => {
    // функція для завантаження даних
    const loadData = async () => {
      try {
        // робимо запити один за одним
        const res1 = await fetch('https://www.omdbapi.com/?apikey=4d6ca14a&s=batman');
        const data1 = await res1.json();
        setTopFilms(data1.Search || []);

        const res2 = await fetch('https://www.omdbapi.com/?apikey=4d6ca14a&s=marvel');
        const data2 = await res2.json();
        setExtraFilms(data2.Search || []);
        
        // все прийшло, вимикаємо завантаження
        setLoading(false);
      } catch (err) {
        console.log("блін, щось не так з API:", err);
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // коли список обраного змінюється зберігаємо його в пам'ять
  useEffect(() => { 
    localStorage.setItem('faworites', JSON.stringify(faworites)); 
  }, [faworites]);

  // функція перемикач для зірочки
  const toggleFav = (movie) => {
    const вжеЄ = faworites.find(film => film.imdbID === movie.imdbID);
    if (вжеЄ) {
      // видаляємо якщо вже додали
      setFavorites(faworites.filter(film => film.imdbID !== movie.imdbID));
    } else {
      // додаємо новий фільм
      setFavorites([...faworites, movie]);
    }
  };

  // текст завантаження
  if (loading) return <div style={{textAlign: 'center', padding: '50px', fontSize: '20px'}}>Завантаження каталогу...</div>;

  // рахуємо статистику для графіку
  const allMovies = [...topFilms, ...extraFilms];
  const movieCount = allMovies.filter(film => film.Type === 'movie').length;
  const seriesCount = allMovies.filter(film => film.Type === 'series').length;
  const moviePercentage = (movieCount / allMovies.length) * 100;

  return (
    <div>
      <header>
        <h1>MOVIE.LAB</h1>
        <nav>
          {/* кнопки меню додаємо клас active щоб світилися */}
          <button className={currentPage === 'top20' ? 'active' : ''} onClick={() => setCurrentPage('top20')}>Catalog</button>
          <button className={currentPage === 'stats' ? 'active' : ''} onClick={() => setCurrentPage('stats')}>Analytics</button>
          <button className={currentPage === 'faworites' ? 'active' : ''} onClick={() => setCurrentPage('faworites')}>Fav ({faworites.length})</button>
        </nav>
      </header>

      <main>
        {/* вкладка з каталогом */}
        {currentPage === 'top20' && (
          <>
            <h2 className="section-title">⭐ TOP 20 Selection</h2>
            <div className="movie-grid">
              {topFilms.map(movie => (
                <MovieCard 
                  key={movie.imdbID} 
                  movie={movie} 
                  isFav={faworites.some(film => film.imdbID === movie.imdbID)} 
                  onToggle={toggleFav} 
                />
              ))}
            </div>
            
            <h2 className="section-title">📂 Full Catalog</h2>
            <div className="movie-grid">
              {extraFilms.map(movie => (
                <MovieCard 
                  key={movie.imdbID} 
                  movie={movie} 
                  isFav={faworites.some(film => film.imdbID === movie.imdbID)} 
                  onToggle={toggleFav} 
                />
              ))}
            </div>
          </>
        )}

        {/* вкладка зі статистикою */}
        {currentPage === 'stats' && (
          <div className="stats-container">
            <div className="stats-box">
              <h3>Content Split</h3>
              <div className="pie-wrap">
                <div className="pie-circle" style={{background: `conic-gradient(#3b82f6 ${moviePercentage}%, #e2e8f0 0)`}}></div>
                <div className="pie-hole"></div>
                <div className="pie-count">{allMovies.length}</div>
              </div>
              <p style={{fontSize: '12px', color: '#64748b'}}>Всього одиниць контенту</p>
            </div>
            
            <div className="stats-box">
              <h3>Quick Data</h3>
              <div className="info-row"><span>Movies</span><b>{movieCount}</b></div>
              <div className="info-row"><span>Series</span><b>{seriesCount}</b></div>
              <div className="info-row"><span>My Faworites</span><b>{faworites.length}</b></div>
            </div>
          </div>
        )}

        {/* вкладка з обраним */}
        {currentPage === 'faworites' && (
          <div className="movie-grid">
            {faworites.length > 0 ? (
              faworites.map(movie => (
                <MovieCard key={movie.imdbID} movie={movie} isFav={true} onToggle={toggleFav} />
              ))
            ) : (
              <div style={{padding: '40px', textAlign: 'center', width: '100%', color: '#94a3b8'}}>
                Список faworites порожній. Додай щось!
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

// окремо картка щоб код не був занадто довгим
const MovieCard = ({ movie, isFav, onToggle }) => (
  <div className="movie-card">
    <img 
      className="card-poster" 
      src={movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'} 
      alt={movie.Title} 
    />
    <div className="card-info">
      <span className="card-year">{movie.Year}</span>
      <h3>{movie.Title}</h3>
      <span className="card-type">{movie.Type}</span>
    </div>
    <button className={`star ${isFav ? 'active' : ''}`} onClick={() => onToggle(movie)}>★</button>
  </div>
);

export default App;