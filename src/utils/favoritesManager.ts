
/**
 * Favorites Manager Utility
 * Handles localStorage persistence for favorite sounds
 */

const FAVORITES_KEY = 'soundLibrary_favorites';

export class FavoritesManager {
  private static favorites = new Set<string>();
  private static listeners = new Set<(favorites: Set<string>) => void>();

  static initialize(): void {
    try {
      const stored = localStorage.getItem(FAVORITES_KEY);
      if (stored) {
        const favoritesList = JSON.parse(stored);
        this.favorites = new Set(favoritesList);
      }
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error);
    }
  }

  static addFavorite(soundId: string): void {
    this.favorites.add(soundId);
    this.persist();
    this.notifyListeners();
  }

  static removeFavorite(soundId: string): void {
    this.favorites.delete(soundId);
    this.persist();
    this.notifyListeners();
  }

  static toggleFavorite(soundId: string): boolean {
    if (this.favorites.has(soundId)) {
      this.removeFavorite(soundId);
      return false;
    } else {
      this.addFavorite(soundId);
      return true;
    }
  }

  static isFavorite(soundId: string): boolean {
    return this.favorites.has(soundId);
  }

  static getFavorites(): Set<string> {
    return new Set(this.favorites);
  }

  static subscribe(listener: (favorites: Set<string>) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private static persist(): void {
    try {
      const favoritesList = Array.from(this.favorites);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(favoritesList));
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error);
    }
  }

  private static notifyListeners(): void {
    this.listeners.forEach(listener => listener(new Set(this.favorites)));
  }
}
