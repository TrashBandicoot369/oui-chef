import { db } from '@/lib/firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'

async function wipe(col: string) {
  console.log(`🧹 Wiping collection: ${col}`)
  const snap = await db.collection(col).get()
  const batch = db.batch()
  snap.docs.forEach(d => batch.delete(d.ref))
  await batch.commit()
  console.log(`✅ Wiped ${snap.docs.length} documents from ${col}`)
}

async function seed() {
  console.log('🌱 Starting Firestore seed...')
  
  // ── SITE COPY ───────────────────────────────────────────
  console.log('📝 Seeding site copy...')
  await wipe('siteCopy')
  
  await db.doc('siteCopy/hero').set({
    title: 'Restaurant-quality private dining',
    subtitle: 'Playful, chic catering & events in the GTA',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  await db.doc('siteCopy/about').set({
    body: `Raised in bustling family kitchens in Montréal and Toronto, Alex learned early on that the best way to care for people is through food. Eighteen years later, that passion still drives him. From intimate dinners to large festivals, he brings the flavours and techniques he grew up loving to every plate he serves.

Every event is tailored to your unique tastes and needs—because when you dine with us, you're family.

Welcome to the family,
Alex`,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  // ── EVENT HIGHLIGHTS ───────────────────────────────────
  console.log('🎨 Seeding event highlights...')
  await wipe('eventHighlights')
  
  const events = [
    {
      order: 1,
      image: '/images/events/dinnerparty (1).jpg',
      alt: 'Dinner in a contemporary art gallery',
      description: 'A quiet, thoughtful evening where every plate felt like part of the exhibit. The space was clean and bright, the food minimal but intentional. Each course landed with a sense of purpose—no showboating, no filler. Just great pacing, warm lighting, and a menu built to reflect the art on the walls.',
    },
    {
      order: 2,
      image: '/images/events/dinnerparty (4).jpg',
      alt: 'Loft dinner filled with candles, plants, and soft light',
      description: 'This felt like spring indoors—fresh herbs on the table, linen napkins just barely wrinkled, and dishes that tasted like someone cared. Served family-style, the menu moved from light and bright to deeply comforting. Everything smelled like lemon zest, olive oil, and trust.',
    },
    {
      order: 3,
      image: '/images/events/dinnerparty (5).jpg',
      alt: 'Late-night dinner thrown in a brick-and-beam loft downtown',
      description: 'Held in a raw industrial space with long tables and loose rules, this dinner ditched formalities in favour of good wine and better pacing. Dishes came out slow and generous—built to anchor conversation, not interrupt it. A full-bodied, brick-walled kind of night that hit its stride after the second bottle.',
    },
    {
      order: 4,
      image: '/images/events/dinnerparty (7).jpg',
      alt: 'A private dinner hosted aboard a wood-paneled boat',
      description: 'Waves tapping at the hull, glasses clinking on wood—this was one of those "how is this real?" dinners. The courses felt coastal and precise, plated between portside views and clean ocean air. It moved like a tide: calm, then surprising. You left feeling lighter.',
    },
    {
      order: 5,
      image: '/images/events/dinnerparty (8).jpg',
      alt: 'Dinner in a winery hall overlooking rows of vines',
      description: 'Set against a backdrop of late-summer vineyards, this dinner leaned into the earthy and elemental. Stoneware plates, wood-fired mains, and wine poured with zero ceremony. The kind of evening that starts golden and ends with sweaters over shoulders and forks chasing the last bite of something warm.',
    },
    {
      order: 6,
      image: '/images/events/dinnerparty (9).jpg',
      alt: 'Rooftop dinner framed by city skylines and patio plants',
      description: 'Equal parts dinner and hang, this rooftop gathering delivered that perfect balance of casual and magic. Music low, wine cold, and food that arrived when it was ready. Nothing rushed, everything easy. If you\'ve ever wanted a dinner to feel like a soft landing, this was it.',
    },
    {
      order: 7,
      image: '/images/events/dinnerparty (10).jpg',
      alt: 'Minimalist dinner inside a concrete-walled private room',
      description: 'This one played with restraint. The setting was clean and architectural, the menu stripped of anything unnecessary. No centerpieces, no noise—just elegant plates arriving in rhythm and disappearing just as quietly. Precision without pretense.',
    },
    {
      order: 8,
      image: '/images/events/dinnerparty (11).jpg',
      alt: 'Tightly lit dinner in a tucked-away private space',
      description: 'Tucked behind a nondescript door and down a quiet hallway, this dinner had that rare "you had to be there" feel. The food was vibrant and unexpected, the mood a little rowdy, but always intentional. Designed to feel like a secret—one you\'re glad got out.',
    }
  ]

  for (const event of events) {
    await db.collection('eventHighlights').add({
      ...event,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })
  }

  // ── MENU ITEMS (plate stack + mobile carousel) ──────────
  console.log('🍽️ Seeding menu items...')
  await wipe('menuItems')
  
  const menuItems = [
    { order: 1, name: 'Stuffed Calamari', description: "N'Duja Parsley Oil, Herbs" },
    { order: 2, name: 'Seared Cabbage', description: "Almond Chili Butter & Chives" },
    { order: 3, name: 'Crostini', description: "Mushroom, Truffle, Gorgonzola, Mascarpone, Caramelized Onion, Thyme" },
    { order: 4, name: 'Scallop', description: "Aji Blanco, Dill, Almonds, Cucumber" },
    { order: 5, name: 'Summer Salad', description: "Ontario Peas, Charred Broccolini, Red Onion, Cumin, Yogurt, Fennel, Mint, Lemon" },
    { order: 6, name: 'Burrata', description: "Roasted Grapes, Pistachio, Saba, Basil" },
    { order: 7, name: 'Oysters', description: "Caesar · Black Garlic/Fermented Chili · Mignonette · Lime/Ginger/Fish Sauce Granita" },
    { order: 8, name: 'Tomato Carpaccio', description: "N'Duja Vinaigrette, Stracciatella Di Bufala, EVOO" },
    { order: 9, name: 'Braised Beef', description: "Birria Demi, Onion Cracker, Pickled Radish, Cilantro Oil, Spiced Carrot" },
    { order: 10, name: 'Roasted Chicken', description: "Guyanese Curry Reduction, Potato" },
    { order: 11, name: 'Pan-Seared Perch', description: "Prosecco Beurre Blanc, Pickled Chilis, Herbs" },
    { order: 12, name: 'Veal Tenderloin', description: "Rapini Pesto, Pan Jus, Pear Caponata" },
    { order: 13, name: 'Fennel & Cherry Tomato Gratin', description: "Green Olive, Celery & Raisin Salsa" },
    { order: 14, name: 'Cardamom Panna Cotta', description: "Quince Gelée, Toasted Milk Crumb" },
    { order: 15, name: 'Citrus Olive Oil Cake', description: "Mascarpone, Basil Sorbet" },
    { order: 16, name: 'Hot Chocolate Tiramisu', description: "" },
    { order: 17, name: 'Berry & Stone Fruit', description: "Almond Crumble, Whipped Vanilla Ganache" },
    { order: 18, name: 'Corn Cake', description: "Popcorn Gelato, Corn Pops" },
    { order: 19, name: 'Spiced Chocolate Cake', description: "Marshmallow, Buttered Graham Cracker Gelato, Spiced Chocolate Crème" },
    { order: 20, name: 'Parmesan & Thyme Muffins', description: "" },
    { order: 21, name: 'Guinness‐Braised Beef Stew', description: "with Mini Yorkshire Puddings" },
    { order: 22, name: 'Rabbit Orecchiette', description: "" },
    { order: 23, name: 'Potenza‐Style Chicken', description: "Fresh Tomato, Basil" },
    { order: 24, name: 'Pollo Mattone', description: "with Pan Jus" },
    { order: 25, name: 'Savoury Bread Pudding', description: "" },
    { order: 26, name: 'Zesty Kale Salad', description: "& Date Dressing" },
    { order: 27, name: 'Baby Gem Lettuce', description: "Burnt Lemon Dressing, Pecorino" },
    { order: 28, name: 'XO Grilled Shrimp', description: "" },
    { order: 29, name: 'Cannoli Tartare', description: "" },
    { order: 30, name: 'Japchae', description: "" },
    { order: 31, name: 'Braised Chicken Phyllo Cups', description: "" },
    { order: 32, name: 'Dauphine Potato', description: "Black Garlic, Tomato, Beef" },
    { order: 33, name: 'Empanadas', description: "" },
    { order: 34, name: 'Goat Cheese & Tomato Tartlet', description: "" },
    { order: 35, name: 'Seasonal Tasting Menu', description: "5-course seasonal menu subject to change depending on season & availability" },
  ]

  for (const item of menuItems) {
    await db.collection('menuItems').add({
      ...item,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })
  }

  // ── TESTIMONIALS (vertical marquee) ────────────────────
  console.log('💬 Seeding testimonials...')
  await wipe('testimonials')
  
  const testimonials = [
    { order: 1, quote: 'Chef Alex transformed our backyard into a Michelin-starred experience. Every dish was a masterpiece!', clientName: 'Sarah M.', rating: 5, approved: true },
    { order: 2, quote: 'The attention to detail was incredible. From the menu planning to the final presentation, everything was perfect.', clientName: 'Michael R.', rating: 5, approved: true },
    { order: 3, quote: 'Our corporate event was a huge success thanks to Chef Alex\'s innovative menu and professional service.', clientName: 'Jennifer L.', rating: 5, approved: true },
    { order: 4, quote: 'The seasonal tasting menu was a journey through local flavors. Each course told a story.', clientName: 'David K.', rating: 5, approved: true },
    { order: 5, quote: 'What impressed me most was how Chef Alex made everyone feel like family while maintaining professional excellence.', clientName: 'Amanda T.', rating: 5, approved: true },
    { order: 6, quote: 'The family-style feast was perfect for our large gathering. Everyone raved about the food!', clientName: 'Robert H.', rating: 5, approved: true },
    { order: 7, quote: 'Chef Alex\'s passion for local ingredients shines through in every dish. Truly exceptional dining.', clientName: 'Lisa P.', rating: 5, approved: true },
    { order: 8, quote: 'The wine pairings were spot on, and the service was impeccable. A memorable evening!', clientName: 'James W.', rating: 5, approved: true },
    { order: 9, quote: 'From intimate dinners to large events, Chef Alex delivers consistently outstanding experiences.', clientName: 'Maria G.', rating: 5, approved: true },
  ]

  for (const testimonial of testimonials) {
    await db.collection('testimonials').add({
      ...testimonial,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })
  }

  // ── GALLERY IMAGES ─────────────────────────────────────
  console.log('🖼️ Seeding gallery images...')
  await wipe('gallery')
  
  const galleryImages = [
    { order: 1, url: '/images/optimized/IMG_6253.webp', alt: 'Chef Alex plating a signature dish', category: 'behind-scenes' },
    { order: 2, url: '/images/optimized/IMG_6353.webp', alt: 'Chef Alex at work in the kitchen', category: 'behind-scenes' },
    { order: 3, url: '/images/optimized/IMG_6969.webp', alt: 'Beautifully plated appetizer', category: 'food' },
    { order: 4, url: '/images/optimized/IMG_8223.webp', alt: 'Elegant table setting', category: 'events' },
    { order: 5, url: '/images/optimized/IMG_8262.webp', alt: 'Intimate dinner setup', category: 'events' },
    { order: 6, url: '/images/optimized/IMG_8301.webp', alt: 'Gourmet main course', category: 'food' },
    { order: 7, url: '/images/optimized/IMG_8355.webp', alt: 'Private dining experience', category: 'events' },
    { order: 8, url: '/images/optimized/IMG_8386.webp', alt: 'Artfully presented dessert', category: 'food' },
    { order: 9, url: '/images/optimized/IMG_8436-Edit.webp', alt: 'Chef Alex preparing ingredients', category: 'behind-scenes' },
  ]

  for (const image of galleryImages) {
    await db.collection('gallery').add({
      ...image,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp()
    })
  }

  // ── THEME SETTINGS ─────────────────────────────────────
  console.log('🎨 Seeding theme settings...')
  await wipe('theme')
  
  await db.doc('theme/colors').set({
    primary1: '#1c1b20',
    primary2: '#383234', 
    primary3: '#3f393c',
    accent1: '#e3973b',
    accent2: '#ee962b',
    stroke: '#532030',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  await db.doc('theme/fonts').set({
    display: 'Anton',
    sans: 'Bitter',
    button: 'Oswald',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  })

  console.log('✅ Seed complete! Collections created:')
  console.log('   📝 siteCopy (2 documents)')
  console.log('   🎨 eventHighlights (8 documents)')
  console.log('   🍽️ menuItems (35 documents)')
  console.log('   💬 testimonials (9 documents)')
  console.log('   🖼️ gallery (9 documents)')
  console.log('   🎨 theme (2 documents)')
}

seed()
  .then(() => {
    console.log('🎉 Firestore seeding completed successfully!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Error seeding Firestore:', error)
    process.exit(1)
  }) 