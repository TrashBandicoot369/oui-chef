// Script to populate admin data from current homepage content
// Run this with: node scripts/populate-admin-data.js

const API_BASE = 'http://localhost:3000/api/admin';

async function populateData() {
  console.log('🌱 Populating admin data from homepage content...');

  try {
    // 1. Site Copy Content
    const siteContent = [
      {
        section: 'hero-title',
        content: 'restaurant-quality private dining'
      },
      {
        section: 'hero-subtitle', 
        content: 'From intimate dinners to large galas, Chef Alex J crafts unforgettable culinary experiences wherever you celebrate.'
      },
      {
        section: 'about-title',
        content: 'Meet Chef Alex J'
      },
      {
        section: 'about-description',
        content: 'Raised in bustling family kitchens in Montréal and Toronto, Alex learned early on that the best way to care for people is through food. Eighteen years later, that passion still drives him. From intimate dinners to large festivals, he brings the flavours and techniques he grew up loving to every plate he serves.\n\nEvery event is tailored to your unique tastes and needs—because when you dine with us, you\'re family.\n\nWelcome to the family,\nAlex'
      },
      {
        section: 'gallery-title',
        content: 'Event Highlights'
      },
      {
        section: 'menu-title', 
        content: 'Signature Menu Items'
      },
      {
        section: 'testimonials-title',
        content: 'Testimonials'
      },
      {
        section: 'booking-title',
        content: 'Let\'s Craft Your Event'
      }
    ];

    console.log('📝 Adding site content...');
    for (const content of siteContent) {
      const response = await fetch(`${API_BASE}/content`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content)
      });
      if (response.ok) {
        console.log(`  ✅ Added: ${content.section}`);
      } else {
        console.log(`  ❌ Failed: ${content.section}`);
      }
    }

    // 2. Menu Items
    const menuItems = [
      {
        group: 'Appetizers',
        name: 'Seasonal Bruschetta',
        description: 'Fresh tomatoes, basil, and balsamic on artisanal bread',
        price: 18,
        tags: ['vegetarian', 'seasonal'],
        visible: true
      },
      {
        group: 'Appetizers', 
        name: 'Duck Confit Crostini',
        description: 'House-cured duck with fig jam and microgreens',
        price: 24,
        tags: ['signature', 'duck'],
        visible: true
      },
      {
        group: 'Mains',
        name: 'Pan-Seared Salmon',
        description: 'Atlantic salmon with lemon herb butter and seasonal vegetables',
        price: 42,
        tags: ['fish', 'signature'],
        visible: true
      },
      {
        group: 'Mains',
        name: 'Braised Short Rib',
        description: 'Wine-braised beef with root vegetables and herb jus',
        price: 48,
        tags: ['beef', 'comfort'],
        visible: true
      },
      {
        group: 'Desserts',
        name: 'Chocolate Soufflé',
        description: 'Warm chocolate soufflé with vanilla bean ice cream',
        price: 16,
        tags: ['chocolate', 'signature'],
        visible: true
      }
    ];

    console.log('🍽️ Adding menu items...');
    for (const item of menuItems) {
      const response = await fetch(`${API_BASE}/menu`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (response.ok) {
        console.log(`  ✅ Added: ${item.name}`);
      } else {
        console.log(`  ❌ Failed: ${item.name}`);
      }
    }

    // 3. Testimonials
    const testimonials = [
      {
        name: 'Sarah & Michael',
        content: 'Chef Alex transformed our backyard into a Michelin-starred experience. Every dish was a masterpiece!',
        rating: 5,
        featured: true
      },
      {
        name: 'Jennifer L.',
        content: 'The attention to detail was incredible. From the menu planning to the final presentation, everything was perfect.',
        rating: 5,
        featured: false
      },
      {
        name: 'Corporate Event Manager',
        content: 'Our corporate event was a huge success thanks to Chef Alex\'s innovative menu and professional service.',
        rating: 5,
        featured: true
      },
      {
        name: 'David Chen',
        content: 'The seasonal tasting menu was a journey through local flavors. Each course told a story.',
        rating: 5,
        featured: false
      },
      {
        name: 'Amanda R.',
        content: 'What impressed me most was how Chef Alex made everyone feel like family while maintaining professional excellence.',
        rating: 5,
        featured: true
      }
    ];

    console.log('💬 Adding testimonials...');
    for (const testimonial of testimonials) {
      const response = await fetch(`${API_BASE}/testimonials`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testimonial)
      });
      if (response.ok) {
        console.log(`  ✅ Added testimonial from: ${testimonial.name}`);
      } else {
        console.log(`  ❌ Failed testimonial from: ${testimonial.name}`);
      }
    }

    // 4. Gallery Items
    const galleryItems = [
      {
        title: 'Intimate Dinner Setup',
        imageUrl: '/images/optimized/IMG_6353.webp',
        description: 'Elegant table setting for an intimate dinner party',
        category: 'table-settings',
        featured: true,
        visible: true
      },
      {
        title: 'Gourmet Plating',
        imageUrl: '/images/optimized/IMG_6969.webp', 
        description: 'Artistic presentation of seasonal ingredients',
        category: 'food-styling',
        featured: true,
        visible: true
      },
      {
        title: 'Chef at Work',
        imageUrl: '/images/optimized/IMG_8223.webp',
        description: 'Chef Alex preparing signature dishes',
        category: 'behind-scenes',
        featured: false,
        visible: true
      },
      {
        title: 'Event Highlights',
        imageUrl: '/images/optimized/IMG_8262.webp',
        description: 'Memorable moments from recent events',
        category: 'events',
        featured: true,
        visible: true
      }
    ];

    console.log('🖼️ Adding gallery items...');
    for (const item of galleryItems) {
      const response = await fetch(`${API_BASE}/gallery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item)
      });
      if (response.ok) {
        console.log(`  ✅ Added: ${item.title}`);
      } else {
        console.log(`  ❌ Failed: ${item.title}`);
      }
    }

    // 5. Media Files
    const mediaFiles = [
      {
        filename: 'hero-video.mp4',
        url: '/images/dinnervid.mp4',
        type: 'video/mp4',
        size: 5242880,
        tags: ['hero', 'video', 'cooking'],
        alt: 'Chef cooking dinner service video'
      },
      {
        filename: 'chef-portrait.webp',
        url: '/images/optimized/IMG_6353.webp',
        type: 'image/webp', 
        size: 245760,
        tags: ['chef', 'portrait', 'about'],
        alt: 'Chef Alex J portrait'
      },
      {
        filename: 'food-styling.webp',
        url: '/images/optimized/IMG_6969.webp',
        type: 'image/webp',
        size: 198432,
        tags: ['food', 'styling', 'plating'],
        alt: 'Gourmet food plating and styling'
      },
      {
        filename: 'logo-white.png',
        url: '/images/logo-white.png',
        type: 'image/png',
        size: 12345,
        tags: ['logo', 'branding'],
        alt: 'Chef Alex J logo in white'
      }
    ];

    console.log('📁 Adding media files...');
    for (const media of mediaFiles) {
      const response = await fetch(`${API_BASE}/media`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(media)
      });
      if (response.ok) {
        console.log(`  ✅ Added: ${media.filename}`);
      } else {
        console.log(`  ❌ Failed: ${media.filename}`);
      }
    }

    console.log('🎉 Admin data population complete!');
    console.log('📋 Summary:');
    console.log(`  - ${siteContent.length} content sections`);
    console.log(`  - ${menuItems.length} menu items`);
    console.log(`  - ${testimonials.length} testimonials`);
    console.log(`  - ${galleryItems.length} gallery items`);
    console.log(`  - ${mediaFiles.length} media files`);
    console.log('\n🚀 Your admin interface should now show all this content!');

  } catch (error) {
    console.error('❌ Error populating data:', error);
  }
}

// Check if this is being run directly
if (require.main === module) {
  populateData();
}

module.exports = { populateData }; 