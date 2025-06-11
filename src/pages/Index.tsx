import React, { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryTabs from '../components/CategoryTabs';
import SoundCard from '../components/SoundCard';
import UnifiedAudioPlayer from '../components/GlobalAudioPlayer';
import ThemeSwitch from '../components/ThemeSwitch';
import { FavoritesManager } from '../utils/favoritesManager';


interface Sound {
  id: string;
  name: string;
  path: string;
  category: string;
}

const Index: React.FC = () => {
  const [sounds, setSounds] = useState<Sound[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('favorites');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPlayingSound, setCurrentPlayingSound] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [audioQueue, setAudioQueue] = useState<Sound[]>([]);
  const [currentQueueIndex, setCurrentQueueIndex] = useState<number>(0);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const mainContentRef = React.useRef<HTMLDivElement>(null);

  // Initialize managers and load data
  useEffect(() => {
    FavoritesManager.initialize();
    setFavorites(FavoritesManager.getFavorites());

    // Subscribe to favorites changes
    const unsubscribeFavorites = FavoritesManager.subscribe((newFavorites) => {
      setFavorites(newFavorites);
    });

    // Dynamically load categories and sounds
    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const { categories, sounds } = await fetchSoundCategoriesAndFiles();
        setCategories(categories);
        setSounds(sounds);
        // Nettoie les favoris invalides uniquement dans le localStorage, ne touche pas au state local ici
        const validIds = new Set(sounds.map(s => s.id));
        const currentFavorites = FavoritesManager.getFavorites();
        currentFavorites.forEach(id => {
          if (!validIds.has(id)) {
            FavoritesManager.removeFavorite(id);
          }
        });
        // Set first category as active if no favorites
        if (FavoritesManager.getFavorites().size === 0 && categories.length > 0) {
          setActiveCategory(categories[0] as string);
        }
      } catch (err) {
        setError('Failed to load sound library. Please try again.');
        console.error('Error loading sounds:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();

    return () => {
      unsubscribeFavorites();
    };
  }, []);

  // Helper to fetch directory structure from /public/sounds/sounds.json
  const fetchSoundCategoriesAndFiles = async () => {
    const res = await fetch('/sounds/sounds.json');
    const data = await res.json();
    // Parse categories and sounds
    const categoriesSet = new Set<string>();
    const sounds: Sound[] = [];
    const seen = new Set<string>(); // Pour dédoublonner par id
    for (const key of Object.keys(data)) {
      if (!data[key].sounds) continue;
      // Category is the first part before the dot
      const cat = key.split('.')[0];
      categoriesSet.add(cat);
      for (const entry of data[key].sounds) {
        // Entry can be a string or object
        let name: string, relPath: string;
        if (typeof entry === 'string') {
          name = entry.split('/').pop() + '.ogg';
          relPath = entry + '.ogg';
        } else if (typeof entry === 'object' && entry.name) {
          name = entry.name.split('/').pop() + '.ogg';
          relPath = entry.name + '.ogg';
        } else {
          continue;
        }
        const id = relPath.replace(/\.[^/.]+$/, '').replace(/[\/]/g, '_');
        // Dédoublonnage : on ne garde qu'un son unique par id
        if (!seen.has(cat + ':' + id)) {
          seen.add(cat + ':' + id);
          sounds.push({
            id,
            name,
            path: '/sounds/' + relPath,
            category: cat
          });
        }
      }
    }
    const categories = Array.from(categoriesSet) as string[];
    return { categories, sounds };
  };

  // Utilitaire pour formater le nom comme dans SoundCard
  const formatSoundName = (filename: string): string => {
    return filename
      .replace(/\.[^/.]+$/, '') // Remove extension
      .replace(/[_-]/g, ' ') // Replace underscores and hyphens with spaces
      .replace(/\b\w/g, l => l.toUpperCase()); // Capitalize first letter of each word
  };

  const deferredSearchTerm = useDeferredValue(searchTerm);

  // Memoize filteredSounds for performance
  const filteredSounds = useMemo(() => {
    const term = deferredSearchTerm.trim().toLowerCase();
    if (!term) {
      // Pas de recherche : filtrage classique par catégorie ou favoris
      if (activeCategory === 'favorites') {
        // Dédoublonnage par id pour éviter les doublons dans les favoris
        const unique = new Map();
        sounds.forEach(sound => {
          if (favorites.has(sound.id) && !unique.has(sound.id)) {
            unique.set(sound.id, sound);
          }
        });
        return Array.from(unique.values());
      } else {
        return sounds.filter(sound => sound.category === activeCategory);
      }
    }
    // Recherche globale : tous les sons qui matchent le nom formaté ou la catégorie
    // On calcule un score de pertinence pour chaque son
    const scored = sounds.map(sound => {
      const formattedName = formatSoundName(sound.name).toLowerCase();
      const cat = sound.category.toLowerCase();
      let score = 0;
      if (formattedName === term || cat === term) {
        score = 100; // Exact match
      } else if (formattedName.startsWith(term) || cat.startsWith(term)) {
        score = 75; // Starts with
      } else if (formattedName.includes(term) || cat.includes(term)) {
        score = 50; // Includes
      } else {
        score = 0;
      }
      return { sound, score };
    })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score || a.sound.name.localeCompare(b.sound.name));
    return scored.map(({ sound }) => sound);
  }, [sounds, deferredSearchTerm, activeCategory, favorites]);

  // Handle toggling favorites
  const handleToggleFavorite = useCallback((soundId: string) => {
    FavoritesManager.toggleFavorite(soundId);
  }, []);

  const [sequentialCategories, setSequentialCategories] = useState<string[]>([]);
  const [isSequentialMode, setIsSequentialMode] = useState<boolean>(false);

  // Handle play action from SoundCard
  const handlePlaySound = (sound: Sound) => {
    setCurrentPlayingSound(sound.id);
    setIsPlaying(true);
    setIsPaused(false);
    setAudioQueue([sound]);
    setCurrentQueueIndex(0);
  };

  // Handle stop action
  const handleStop = () => {
    setIsPlaying(false);
    setIsPaused(false);
    setCurrentPlayingSound(null);
  };

  // Handle previous track
  const handlePrev = () => {
    if (audioQueue.length > 1 && currentQueueIndex > 0) {
      const prevIndex = currentQueueIndex - 1;
      setCurrentQueueIndex(prevIndex);
      setIsPlaying(true);
      setIsPaused(false);
    } else if (isLooping && audioQueue.length > 0) {
      const lastIndex = audioQueue.length - 1;
      setCurrentQueueIndex(lastIndex);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  // Handle next track
  const handleNext = () => {
    if (audioQueue.length > 1 && currentQueueIndex < audioQueue.length - 1) {
      const nextIndex = currentQueueIndex + 1;
      setCurrentQueueIndex(nextIndex);
      setIsPlaying(true);
      setIsPaused(false);
    } else if (isLooping && audioQueue.length > 0) {
      setCurrentQueueIndex(0);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading sound library...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-destructive text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-bold text-foreground mb-2">Error Loading Sounds</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="minecraft-button px-4 py-2 bg-primary-green-500 text-white border-primary-green-600 hover:bg-primary-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 bg-primary border-2 border-primary rounded" aria-label="Logo carré vert" />
              MC Sounds
            </h1>
            <div className="flex items-center gap-4">
              <div className="text-sm text-foreground">
                {sounds.length} sounds • {favorites.size} favorites
              </div>
              <ThemeSwitch />
            </div>
          </div>
          
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            favoritesCount={favorites.size}
            isSequentialMode={isSequentialMode}
            currentSequentialCategory={undefined}
          />
        </div>
      </header>

      {/* Main content */}
      <main ref={mainContentRef} className="container mx-auto px-4 py-6">
        <div
          key={activeCategory + '-' + deferredSearchTerm}
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          role="tabpanel"
          id={`panel-${activeCategory}`}
          aria-labelledby={`tab-${activeCategory}`}
        >
          {filteredSounds.length > 0 ? (
            filteredSounds.map((sound) => (
              <SoundCard
                key={sound.id}
                soundId={sound.id}
                soundName={sound.name}
                soundPath={sound.path}
                category={sound.category}
                isPlaying={currentPlayingSound === sound.id}
                isFavorite={favorites.has(sound.id)}
                onPlay={(soundPath, soundId) => {
                  const sound = sounds.find(s => s.id === soundId);
                  if (sound) {
                    setAudioQueue([sound]);
                    setCurrentQueueIndex(0);
                    setCurrentPlayingSound(sound.id);
                    setIsPlaying(true);
                    setIsPaused(false);
                  }
                }}
                onToggleFavorite={handleToggleFavorite}
                disableAnimation={!!deferredSearchTerm}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground text-4xl mb-4">🔍</div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {deferredSearchTerm.trim()
                  ? "No sounds found"
                  : activeCategory === 'favorites' && favorites.size === 0
                    ? "No favorites yet"
                    : activeCategory === 'favorites'
                      ? "No favorite sounds match your search"
                      : "No sounds in this category"}
              </h2>
              <p className="text-foreground">
                {deferredSearchTerm.trim()
                  ? "Try adjusting your search terms"
                  : activeCategory === 'favorites' && favorites.size === 0
                    ? "Start adding sounds to your favorites by clicking the heart icon"
                    : activeCategory === 'favorites'
                      ? "You have no favorite sounds in this category"
                      : "This category appears to be empty"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Unified audio player */}
      <UnifiedAudioPlayer
        queue={audioQueue}
        currentIndex={currentQueueIndex}
        isPlaying={isPlaying}
        isPaused={isPaused}
        isLooping={isLooping}
        onPlayPause={() => {
          if (audioQueue.length > 0) {
            setIsPlaying((prev) => !prev);
            setIsPaused((prev) => !prev);
          }
        }}
        onPrev={() => {
          if (audioQueue.length > 1 && currentQueueIndex > 0) {
            const prevIndex = currentQueueIndex - 1;
            setCurrentQueueIndex(prevIndex);
            setCurrentPlayingSound(audioQueue[prevIndex].id);
            setIsPlaying(true);
            setIsPaused(false);
          } else if (isLooping && audioQueue.length > 0) {
            const lastIndex = audioQueue.length - 1;
            setCurrentQueueIndex(lastIndex);
            setCurrentPlayingSound(audioQueue[lastIndex].id);
            setIsPlaying(true);
            setIsPaused(false);
          }
        }}
        onNext={() => {
          if (audioQueue.length > 1 && currentQueueIndex < audioQueue.length - 1) {
            const nextIndex = currentQueueIndex + 1;
            setCurrentQueueIndex(nextIndex);
            setCurrentPlayingSound(audioQueue[nextIndex].id);
            setIsPlaying(true);
            setIsPaused(false);
          } else if (isLooping && audioQueue.length > 0) {
            setCurrentQueueIndex(0);
            setCurrentPlayingSound(audioQueue[0].id);
            setIsPlaying(true);
            setIsPaused(false);
          }
        }}
        onStop={() => {
          setIsPlaying(false);
          setIsPaused(false);
          setCurrentPlayingSound(null);
        }}
        onToggleLoop={() => setIsLooping(l => !l)}
        onToggleFavorite={handleToggleFavorite}
        favorites={favorites}
        onSelectIndex={(idx) => {
          setCurrentQueueIndex(idx);
          setCurrentPlayingSound(audioQueue[idx].id);
          setIsPlaying(true);
          setIsPaused(false);
        }}
      />
      
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-foreground">
          <p>MC Sounds • Built with React & Tailwind CSS</p>
          <p className="mt-1">Press Space to pause/resume • Use arrow keys to navigate</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
