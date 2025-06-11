# MC Sounds 🎵

A modern web audio player to explore, listen to, and organize all Minecraft Java Edition sounds, with a premium user experience (React + Tailwind).

## ✨ Main Features

- 🎛️ **Global floating audio player**: ergonomic, modern, with queue, drag & drop, favorites, loop, stop, minimize, close, resize, etc.
- 🖱️ **Drag & drop**: add sounds to the player queue from any list (categories, favorites, search) with no duplicates, including visual feedback.
- 🔍 **Instant search** and filtering by category or favorites.
- ⭐ **Persistent favorites** (localStorage), easy and fast management.
- ⏱️ **Display of durations** and source paths for each sound.
- 🌗 **UI/UX**: responsive design, dark mode, visual feedback on all buttons, smooth transitions, perfect alignment.
- 📜 **Player queue**: reorderable, clickable, adaptive.
- 🪟 **Minimize/close/restore** the player: always accessible and non-intrusive.
- ↔️ **Manual resize** of the player (top-left corner).
- 🚀 **No server dependency**: fully static, works locally or on any static hosting.

## 📁 Project Structure

```
public/
  sounds/           # All Minecraft sounds (folders, .ogg)
  sounds.json       # Manifest of sounds and categories
src/
  components/       # React components (player, SoundCard, etc.)
  pages/            # Main pages (Index.tsx)
  utils/            # Utilities (favorites, etc.)
  index.css         # Global styles (Tailwind)
  ...
```

## ⚡ Installation & Usage

1. **Install dependencies**:
   ```sh
   npm install
   # or
   bun install
   ```
2. **Start in development**:
   ```sh
   npm run dev
   # or
   bun run dev
   ```
3. **Open the app**: http://localhost:5173

## 🚢 Deployment

- Static build:
  ```sh
  npm run build
  # or
  bun run build
  ```
- The generated files are in `dist/`.
- Can be deployed to Vercel, Netlify, GitHub Pages, etc.

## 🛠️ Technologies Used

- **React 18**
- **TypeScript**
- **Tailwind CSS**
- **@hello-pangea/dnd** (drag & drop)
- **react-h5-audio-player** (custom audio player)

## 🎨 Customization

- Add your own sounds in `public/sounds/` and update `sounds.json`.
- Change colors or theme in `tailwind.config.ts`.

## 🙏 Credits

- Sounds extracted from Minecraft Java Edition (© Mojang/Microsoft, personal/educational use).
- UI inspired by the Minecraft universe.

---

## 📄 License

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

© 2024-present Djeel
