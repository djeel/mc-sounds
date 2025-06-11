import React, { useState, useEffect, useCallback, useMemo, useDeferredValue } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryTabs from '../components/CategoryTabs';
import SoundCard from '../components/SoundCard';
import UnifiedAudioPlayer from '../components/GlobalAudioPlayer';
import ThemeSwitch from '../components/ThemeSwitch';
import { FavoritesManager } from '../utils/favoritesManager';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';


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
  const [orderedSounds, setOrderedSounds] = useState<Sound[]>([]);
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

  // Met à jour orderedSounds à chaque changement de filteredSounds
  useEffect(() => {
    setOrderedSounds(filteredSounds);
  }, [filteredSounds]);

  // Gestion du drag & drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    // Drop dans la queue du player
    if (result.destination.droppableId === 'player-queue') {
      const soundId = result.draggableId;
      // Cherche le son dans la liste complète
      const sound = sounds.find(s => s.id === soundId);
      if (sound) {
        // Ajoute à la queue seulement si pas déjà présent (pas de doublon)
        setAudioQueue(prev => prev.some(s => s.id === sound.id) ? prev : [...prev, sound]);
      }
      return;
    }

    // Sinon, réordonne la liste locale (sound-list)
    if (result.source.droppableId === 'sound-list' && result.destination.droppableId === 'sound-list') {
      const newOrder = Array.from(orderedSounds);
      const [removed] = newOrder.splice(result.source.index, 1);
      newOrder.splice(result.destination.index, 0, removed);
      setOrderedSounds(newOrder);
    }
  };

  // Met à jour la queue du player avec l'ordre drag & drop si on clique sur play all
  const handlePlayAll = () => {
    if (orderedSounds.length > 0) {
      setAudioQueue(orderedSounds);
      setCurrentQueueIndex(0);
      setCurrentPlayingSound(orderedSounds[0].id);
      setIsPlaying(true);
      setIsPaused(false);
    }
  };

  // Ajoute une fonction pour ajouter un son à la queue du player
  const handleAddToQueue = (sound: Sound) => {
    setAudioQueue((prev) => [...prev, sound]);
  };

  // Ajout des handlers manquants pour le player
  const handlePlayPause = () => {
    setIsPaused((prev) => !prev);
    setIsPlaying((prev) => !prev);
  };
  const handleToggleLoop = () => {
    setIsLooping((prev) => !prev);
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
      <DragDropContext
        onDragEnd={handleDragEnd}
      >
        {/* Main content */}
        <main ref={mainContentRef} className="container mx-auto px-4 py-6">
          <button
            className="minecraft-button mb-4"
            onClick={handlePlayAll}
            disabled={orderedSounds.length === 0}
          >
            ▶️ Play all in this order
          </button>
          <Droppable droppableId="sound-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                role="tabpanel"
                id={`panel-${activeCategory}`}
                aria-labelledby={`tab-${activeCategory}`}
              >
                {orderedSounds.length > 0 ? (
                  orderedSounds.map((sound, idx) => (
                    <Draggable key={sound.id} draggableId={sound.id} index={idx}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            opacity: snapshot.isDragging ? 0.7 : 1,
                            zIndex: snapshot.isDragging ? 10000 : 'auto', // Passe la card au-dessus du player
                            position: snapshot.isDragging ? 'fixed' : 'static',
                            pointerEvents: snapshot.isDragging ? 'none' : 'auto',
                          }}
                          data-sound-id={sound.id}
                        >
                          <SoundCard
                            soundId={sound.id}
                            soundName={sound.name}
                            soundPath={sound.path}
                            category={sound.category}
                            isPlaying={currentPlayingSound === sound.id}
                            isFavorite={favorites.has(sound.id)}
                            onPlay={(soundPath, soundId) => {
                              const s = sounds.find(s => s.id === soundId);
                              if (s) handlePlaySound(s);
                            }}
                            onToggleFavorite={() => handleToggleFavorite(sound.id)}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))
                ) : (
                  <div className="col-span-full text-center py-6 text-muted-foreground">
                    No sounds found in this category.
                  </div>
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </main>
        {/* Audio player - toujours visible en bas */}
        <UnifiedAudioPlayer
          queue={audioQueue}
          currentIndex={currentQueueIndex}
          isPlaying={isPlaying}
          isPaused={isPaused}
          isLooping={isLooping}
          onPlayPause={handlePlayPause}
          onPrev={handlePrev}
          onNext={handleNext}
          onStop={handleStop}
          onToggleLoop={handleToggleLoop}
          onToggleFavorite={handleToggleFavorite}
          favorites={favorites}
          onSelectIndex={setCurrentQueueIndex}
        />
      </DragDropContext>
    </div>
  );
};

export default Index;
