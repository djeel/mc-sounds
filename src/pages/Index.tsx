
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import CategoryTabs from '../components/CategoryTabs';
import SoundCard from '../components/SoundCard';
import GlobalAudioPlayer from '../components/GlobalAudioPlayer';
import { AudioManager } from '../utils/audioManager';
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
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize managers and load data
  useEffect(() => {
    FavoritesManager.initialize();
    setFavorites(FavoritesManager.getFavorites());

    // Set up audio manager callbacks
    const audioManager = AudioManager.getInstance();
    audioManager.setCallbacks(
      (soundId: string) => {
        setCurrentPlayingSound(soundId);
        setIsPlaying(true);
      },
      () => {
        setCurrentPlayingSound(null);
        setIsPlaying(false);
      }
    );

    // Subscribe to favorites changes
    const unsubscribeFavorites = FavoritesManager.subscribe((newFavorites) => {
      setFavorites(newFavorites);
    });

    // Simulate loading sound files (in a real app, this would scan the file system)
    loadSoundData();

    return () => {
      unsubscribeFavorites();
      audioManager.destroy();
    };
  }, []);

  // Simulate loading sound files from different categories
  const loadSoundData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Mock sound data (in a real app, this would come from file system scanning)
      const mockSounds: Sound[] = [
        // Block sounds
        { id: 'block_stone_break', name: 'stone_break.ogg', path: '/sounds/block/stone_break.ogg', category: 'block' },
        { id: 'block_wood_place', name: 'wood_place.ogg', path: '/sounds/block/wood_place.ogg', category: 'block' },
        { id: 'block_grass_step', name: 'grass_step.ogg', path: '/sounds/block/grass_step.ogg', category: 'block' },
        { id: 'block_sand_dig', name: 'sand_dig.ogg', path: '/sounds/block/sand_dig.ogg', category: 'block' },
        
        // Item sounds
        { id: 'item_pickup', name: 'item_pickup.ogg', path: '/sounds/item/pickup.ogg', category: 'item' },
        { id: 'item_sword_swing', name: 'sword_swing.ogg', path: '/sounds/item/sword_swing.ogg', category: 'item' },
        { id: 'item_bow_shoot', name: 'bow_shoot.ogg', path: '/sounds/item/bow_shoot.ogg', category: 'item' },
        { id: 'item_eat_apple', name: 'eat_apple.ogg', path: '/sounds/item/eat_apple.ogg', category: 'item' },
        
        // Music
        { id: 'music_calm1', name: 'calm1.ogg', path: '/sounds/music/calm1.ogg', category: 'music' },
        { id: 'music_creative', name: 'creative.ogg', path: '/sounds/music/creative.ogg', category: 'music' },
        { id: 'music_nether', name: 'nether_theme.ogg', path: '/sounds/music/nether_theme.ogg', category: 'music' },
        
        // UI sounds
        { id: 'ui_button_click', name: 'button_click.ogg', path: '/sounds/ui/button_click.ogg', category: 'ui' },
        { id: 'ui_inventory_open', name: 'inventory_open.ogg', path: '/sounds/ui/inventory_open.ogg', category: 'ui' },
        { id: 'ui_level_up', name: 'level_up.ogg', path: '/sounds/ui/level_up.ogg', category: 'ui' },
        
        // Entity sounds
        { id: 'entity_zombie_groan', name: 'zombie_groan.ogg', path: '/sounds/entity/zombie_groan.ogg', category: 'entity' },
        { id: 'entity_cow_moo', name: 'cow_moo.ogg', path: '/sounds/entity/cow_moo.ogg', category: 'entity' },
        { id: 'entity_chicken_cluck', name: 'chicken_cluck.ogg', path: '/sounds/entity/chicken_cluck.ogg', category: 'entity' },
      ];

      setSounds(mockSounds);
      
      const uniqueCategories = Array.from(new Set(mockSounds.map(sound => sound.category))).sort();
      setCategories(uniqueCategories);
      
      // Set first category as active if no favorites
      if (favorites.size === 0 && uniqueCategories.length > 0) {
        setActiveCategory(uniqueCategories[0]);
      }
    } catch (err) {
      setError('Failed to load sound library. Please try again.');
      console.error('Error loading sounds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter sounds based on search term and active category
  const filteredSounds = useMemo(() => {
    let filtered = sounds;

    // Filter by search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(sound =>
        sound.name.toLowerCase().includes(term) ||
        sound.category.toLowerCase().includes(term)
      );
    }

    // Filter by category
    if (activeCategory === 'favorites') {
      filtered = filtered.filter(sound => favorites.has(sound.id));
    } else {
      filtered = filtered.filter(sound => sound.category === activeCategory);
    }

    return filtered;
  }, [sounds, searchTerm, activeCategory, favorites]);

  // Handle playing a sound
  const handlePlaySound = useCallback(async (soundPath: string, soundId: string) => {
    const audioManager = AudioManager.getInstance();
    await audioManager.playSound(soundPath, soundId);
  }, []);

  // Handle stopping current sound
  const handleStopSound = useCallback(() => {
    const audioManager = AudioManager.getInstance();
    audioManager.stopCurrent();
  }, []);

  // Handle toggling favorites
  const handleToggleFavorite = useCallback((soundId: string) => {
    FavoritesManager.toggleFavorite(soundId);
  }, []);

  // Get current playing sound name
  const getCurrentSoundName = useCallback(() => {
    if (!currentPlayingSound) return null;
    const sound = sounds.find(s => s.id === currentPlayingSound);
    return sound ? sound.name : null;
  }, [currentPlayingSound, sounds]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-modrinth-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
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
            onClick={loadSoundData}
            className="minecraft-button px-4 py-2 bg-modrinth-green-500 text-white border-modrinth-green-600 hover:bg-modrinth-green-600"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <div className="w-8 h-8 bg-modrinth-green-500 border-2 border-modrinth-green-600" />
              Sound Library
            </h1>
            <div className="text-sm text-muted-foreground">
              {sounds.length} sounds • {favorites.size} favorites
            </div>
          </div>
          
          <SearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />
          
          <CategoryTabs
            categories={categories}
            activeCategory={activeCategory}
            onCategoryChange={setActiveCategory}
            favoritesCount={favorites.size}
          />
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-4 py-6">
        <div 
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
                onPlay={handlePlaySound}
                onToggleFavorite={handleToggleFavorite}
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <div className="text-muted-foreground text-4xl mb-4">🔍</div>
              <h2 className="text-lg font-semibold text-foreground mb-2">
                {activeCategory === 'favorites' 
                  ? favorites.size === 0 
                    ? "No favorites yet" 
                    : "No favorite sounds match your search"
                  : searchTerm 
                    ? "No sounds found" 
                    : "No sounds in this category"}
              </h2>
              <p className="text-muted-foreground">
                {activeCategory === 'favorites' && favorites.size === 0
                  ? "Start adding sounds to your favorites by clicking the heart icon"
                  : searchTerm
                    ? "Try adjusting your search terms"
                    : "This category appears to be empty"}
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Global audio player */}
      <GlobalAudioPlayer
        currentSound={getCurrentSoundName()}
        isPlaying={isPlaying}
        onStop={handleStopSound}
      />
      
      {/* Footer */}
      <footer className="bg-card border-t border-border mt-12">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>Sound Library • Built with React & Tailwind CSS</p>
          <p className="mt-1">Press Space to pause/resume • Use arrow keys to navigate</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
