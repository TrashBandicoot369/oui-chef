import { db } from '../../lib/firebase-admin';
import fs from 'fs';
import path from 'path';

async function pushCollection(name: string, data: any) {
  const col = db.collection(name);
  if (Array.isArray(data)) {
    for (const item of data) {
      const doc = typeof item === 'object' ? item : { text: item }
      await col.add(doc);
    }
  } else if (typeof data === 'object' && data !== null) {
    const entries = Object.entries(data);
    for (const [key, value] of entries) {
      await col.doc(key).set(value as any);
    }
  }
}

async function main() {
  const base = path.join(__dirname);
  await pushCollection('siteCopy', JSON.parse(fs.readFileSync(path.join(base, 'siteCopy.json'), 'utf8')));
  await pushCollection('menu', JSON.parse(fs.readFileSync(path.join(base, 'menu.json'), 'utf8')));
  await pushCollection('testimonials', JSON.parse(fs.readFileSync(path.join(base, 'testimonials.json'), 'utf8')));
  await pushCollection('gallery', JSON.parse(fs.readFileSync(path.join(base, 'gallery.json'), 'utf8')));
  await pushCollection('theme', JSON.parse(fs.readFileSync(path.join(base, 'theme.json'), 'utf8')));
  console.log('Bootstrap data pushed');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
