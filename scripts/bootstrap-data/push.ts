import { db } from '../../lib/firebase-admin';
import copy from './copy.json';
import menu from './menu.json';
import testimonials from './testimonials.json';
import gallery from './gallery.json';
import theme from './theme.json';

async function run() {
  console.log('Pushing bootstrap data...');

  await Promise.all(
    (copy as { section: string; content: string }[]).map((doc) =>
      db.collection('siteCopy').doc(doc.section).set({ content: doc.content })
    )
  );
  console.log('copy ✅');

  await Promise.all(
    (menu as string[]).map((name, idx) =>
      db.collection('menu').doc(String(idx)).set({ name })
    )
  );
  console.log('menu ✅');

  await Promise.all(
    (testimonials as string[]).map((content, idx) =>
      db.collection('testimonials').doc(String(idx)).set({ content })
    )
  );
  console.log('testimonials ✅');

  await Promise.all(
    (gallery as { id: number; image: string; alt: string; description: string }[]).map((item) =>
      db
        .collection('gallery')
        .doc(String(item.id))
        .set({ image: item.image, alt: item.alt, description: item.description })
    )
  );
  console.log('gallery ✅');

  await db.collection('theme').doc('current').set(theme);
  console.log('theme ✅');

  console.log('Bootstrap complete');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
