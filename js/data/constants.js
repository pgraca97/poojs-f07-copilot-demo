// Utilitários

export const formatDuration = (seconds) => {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
};

export const formatPlays = (plays) => {
  if (plays >= 1000) return `${(plays / 1000).toFixed(1)}k`;
  return plays.toString();
};

// Constantes

export const GENRES = ['Pop', 'Hip-Hop', 'Jazz', 'Electronic', 'R&B'];
export const VIEWS  = ['cards', 'table'];
export const SORTS  = {
  'title-asc':     'Title (A-Z)',
  'plays-desc':    'Most Played',
  'duration-desc': 'Longest Duration',
};
