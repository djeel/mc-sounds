const fs = require('fs');
const path = require('path');

const SOUNDS_DIR = path.join(__dirname, '../public/sounds');
const MANIFEST_PATH = path.join(SOUNDS_DIR, 'manifest.json');

function walk(dir, category = '', results = []) {
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const filePath = path.join(dir, file);
    const relPath = path.relative(SOUNDS_DIR, filePath).replace(/\\/g, '/');
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      walk(filePath, category || file, results);
    } else if (file.endsWith('.ogg')) {
      // Category is the first folder in relPath
      const cat = relPath.split('/')[0];
      results.push({
        id: relPath.replace(/\.[^/.]+$/, '').replace(/[\/]/g, '_'),
        name: file,
        path: `/sounds/${relPath}`,
        category: cat
      });
    }
  });
  return results;
}

function getCategories(sounds) {
  return Array.from(new Set(sounds.map(s => s.category))).sort();
}

function main() {
  const sounds = walk(SOUNDS_DIR);
  const categories = getCategories(sounds);
  const manifest = { categories, sounds };
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2));
  console.log(`Manifest generated with ${sounds.length} sounds in ${categories.length} categories.`);
}

main();
