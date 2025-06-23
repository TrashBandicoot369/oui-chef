'use client';


import QuoteChat from './components/QuoteChat'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import TextMarquee from './components/TextMarquee'
import EventHighlights from './components/EventHighlights'
import MobileEventHighlights from './components/MobileEventHighlights'
import TestimonialsSection from './components/TestimonialsSection'
import PlateStack from './components/PlateStack'
import MobilePlateCarousel from './components/MobilePlateCarousel'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import dynamic from 'next/dynamic'
import { Dialog } from '@headlessui/react'
import useApi from '@/lib/useApi'
const BounceArrow = dynamic(() => import('./components/BounceArrow'), { ssr: false })

type ContentItem = {
  id: string
  section: string
  content: string
}


// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

function HomeContent() {
  const [scrolled, setScrolled] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0, tiltX: 0, tiltY: 0 });
  const [bookingBgImage, setBookingBgImage] = useState('');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const contentData = useApi<ContentItem>('content');
  
  // Helper function to get content by section
  const getContent = (section: string, fallback: string = '') => {
    const item = contentData?.find(item => item.section === section);
    return item?.content || fallback;
  };
  
  // Refs for hero text animation
  const heroTitleRef = useRef<HTMLHeadingElement>(null);
  const heroSubtitleRef = useRef<HTMLParagraphElement>(null);
  
  // Refs for about section animation
  const aboutRef = useRef<HTMLElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  // Logo Color - uses exact accent1 color by masking
  const logoStyle = {
    backgroundColor: 'var(--color-accent1)',
    WebkitMask: 'url("/images/logo-white.png") no-repeat center',
    WebkitMaskSize: 'contain',
    mask: 'url("/images/logo-white.png") no-repeat center',
    maskSize: 'contain'
  };

  useEffect(() => {
    // Lock in current colors and fonts
    const root = document.documentElement;
    
    // Set locked colors (current values with -72% brightness on primaries)
    root.style.setProperty('--color-primary1', '#1c1b20');
    root.style.setProperty('--color-primary2', '#383234');
    root.style.setProperty('--color-primary3', '#3f393c');
    root.style.setProperty('--color-accent1', '#e3973b');
    root.style.setProperty('--color-accent2', '#ee962b');
    root.style.setProperty('--color-stroke', '#532030');
    
    // Set locked fonts (current values from your font picker)
    root.style.setProperty('--font-display', '"Anton", cursive');
    root.style.setProperty('--font-sans', '"Bitter", sans-serif');
    root.style.setProperty('--font-button', '"Oswald", sans-serif');
    
    // Load Google Fonts
    const loadFont = (fontName: string) => {
      if (!document.querySelector(`link[href*="${encodeURIComponent(fontName)}"]`)) {
        const link = document.createElement('link');
        link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(fontName)}:wght@300;400;500;600;700&display=swap`;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
    };
    
    loadFont('Anton');
    loadFont('Bitter');
    loadFont('Oswald');

    // Set random background image for booking section
    const backgroundImages = [
      '/images/plates-bg/Image_fx (8).jpg',
      '/images/plates-bg/Image_fx (9).jpg',
      '/images/plates-bg/Image_fx (10).jpg',
      '/images/plates-bg/Image_fx (11).jpg',
      '/images/plates-bg/asdf.jpg',
      '/images/plates-bg/sdf.jpg',
      '/images/plates-bg/sdfa.jpg'
    ];
    
    const randomImage = backgroundImages[Math.floor(Math.random() * backgroundImages.length)];
    setBookingBgImage(randomImage);

    // Set initial hidden state for hero text immediately
    if (heroTitleRef.current && heroSubtitleRef.current) {
      gsap.set(heroTitleRef.current, { y: 60, opacity: 0 });
      gsap.set(heroSubtitleRef.current, { y: 40, opacity: 0 });
    }

    const unsubscribe = scrollY.on('change', (y) => {
      setScrolled(y > 30);
    });

    const unsubscribeScroll = scrollY.on('change', (y) => {
      setScrolled(y > 30)

      if (heroTitleRef.current && heroSubtitleRef.current) {
        const isVisible = y > 5

        gsap.to(heroTitleRef.current, {
          y: isVisible ? 0 : 60,
          opacity: isVisible ? 1 : 0,
          duration: .5,
          ease: 'power3.inOut',
        })

        gsap.to(heroSubtitleRef.current, {
          y: isVisible ? 0 : 40,
          opacity: isVisible ? 1 : 0,
          duration: .5,
          ease: 'power3.inOut',
          delay: isVisible ? -0.6 : 0,
        })
      }
    })

    return () => {
      unsubscribeScroll();
      ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    };
  }, [scrollY]);

  // About section animation
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(imageRef.current, {
        x: -100,
        opacity: 0,
        scale: 0.9,
        duration: 1,
        delay: .5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: aboutRef.current,
          start: 'top 80%',
        },
      })

      gsap.from(textRef.current, {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        delay: .5,
        scrollTrigger: {
          trigger: aboutRef.current,
          start: 'top 80%',
        },
      })
    }, aboutRef)

    return () => ctx.revert()
  }, [])

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    // PARALLAX PAN EFFECT
    // Adjust the multiplier (20) to change how far the image moves
    // Higher = more movement, Lower = less movement
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    
    // TILT EFFECT PARAMETERS
    // Adjust these values to change the tilt behavior:
    // MAX_TILT_DEGREES: Maximum rotation in degrees (currently 15)
    // - Higher = more dramatic tilt
    // - Lower = subtler tilt
    const MAX_TILT_DEGREES = 4;
    
    // Calculate tilt based on mouse position relative to center
    // Negative multiplier for tiltX makes the image tilt down when mouse is below center
    // Positive multiplier for tiltY makes the image tilt right when mouse is right of center
    const tiltX = ((e.clientY - rect.top - centerY) / centerY) * -MAX_TILT_DEGREES;
    const tiltY = ((e.clientX - rect.left - centerX) / centerX) * MAX_TILT_DEGREES;
    
    setParallaxOffset({ x, y, tiltX, tiltY });
  };

  const handleMouseLeave = () => {
    // TRANSITION TIMING
    // Adjust the timeout (300) to change how quickly the image returns to center
    // Higher = slower return, Lower = faster return
    setTimeout(() => {
      setParallaxOffset({ x: 0, y: 0, tiltX: 0, tiltY: 0 });
    }, 300);
  };

  return (
    <>


     {/* Floating logo that appears at top center on load */}
<div
  className={`fixed inset-0 z-40 flex items-center justify-center pointer-events-none transition-all duration-500 ease-in-out ${
    scrolled 
      ? 'transform -translate-y-[1200px] scale-[0.6] opacity-0' 
      : 'transform translate-y-0 scale-[3] sm:scale-[5] md:scale-[7] opacity-100'
  }`}
>
  <div
    className="w-[80px] sm:w-[100px] h-[80px] sm:h-[100px]"
    style={{
      backgroundColor: 'var(--color-accent1)',
      WebkitMask: 'url("/images/logo-white.png") no-repeat center',
      WebkitMaskSize: 'contain',
      mask: 'url("/images/logo-white.png") no-repeat center',
      maskSize: 'contain',
    }}
    aria-label="Chef Alex J Logo"
  />
</div>








      {/* Navigation bar */}
      <nav
        className="w-full fixed h-20 fixed top-0 z-50 transition-all duration-300 font-display ease-in-out"
        style={{
          backgroundColor: scrolled ? 'var(--color-primary1)' : 'transparent',
          
          outlineOffset: '-6px',
        }}
      >
        <div className="max-w-7xl mx-auto relative flex h-full items-center justify-between px-4 md:px-8">
          {/* Mobile hamburger menu button */}
          <button
            className="flex md:hidden items-center p-2"
            aria-label="Open menu"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

          {/* Mobile menu dialog */}
          <Dialog
            open={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
            className="fixed inset-0 z-50 flex md:hidden"
          >
            <Dialog.Panel className="w-3/4 bg-primary1 p-6 shadow-xl">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-accent1 font-display text-xl uppercase tracking-wide">Menu</h2>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-accent1 p-2"
                  aria-label="Close menu"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav>
                <ul className="space-y-6 uppercase text-lg tracking-wide text-accent1">
                  <li>
                    <a 
                      href="#about" 
                      className="block hover:text-accent2 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      About
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#menu" 
                      className="block hover:text-accent2 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Menu
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#gallery" 
                      className="block hover:text-accent2 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Gallery
                    </a>
                  </li>
                  <li>
                    <a 
                      href="#booking" 
                      className="block hover:text-accent2 transition-colors duration-200"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Book Event
                    </a>
                  </li>
                </ul>
              </nav>
            </Dialog.Panel>
            {/* Backdrop */}
            <div className="w-1/4 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          </Dialog>

          {/* Left navigation items */}
          <ul className="hidden md:flex space-x-8 uppercase text-lg tracking-wide">
            <li>
              <a 
                href="#about" 
                className="hover:text-primary1 transition-colors duration-200"
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
              >
                About
              </a>
            </li>
            <li>
              <a 
                href="#menu" 
                className="hover:text-primary1 transition-colors duration-200"
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
              >
                Menu
              </a>
            </li>
          </ul>

          {/* Centered logo */}
          <div
  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ease-in-out"
  style={{
    opacity: scrolled ? 1 : 0,
    transform: scrolled
      ? 'translate(-50%, -50%) scale(1.5)'
      : 'translate(-50%, -50%) scale(0)',
  }}
>
  <div
    className="w-[40px] h-[40px]"
    style={logoStyle}
    aria-label="Chef Alex J Logo"
  />
</div>

          {/* Right navigation items */}
          <ul className="hidden md:flex space-x-8 uppercase text-lg tracking-wide">
            <li>
              <a 
                href="#gallery" 
                className="hover:text-primary1 transition-colors duration-200"
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
              >
                Gallery
              </a>
            </li>
            <li>
              <a 
                href="#booking" 
                className="hover:text-primary1 transition-colors duration-200"
                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)' }}
              >
                Book Event
              </a>
            </li>
          </ul>
        </div>
      </nav>

{/* hero - now goes to top of page */}
<header
  className="relative min-h-[120vh] flex items-center justify-center overflow-hidden bg-[#ffe4d6] pt-0"
  // PERSPECTIVE DEPTH
  // Adjust the perspective value (5000px) to change the 3D effect depth
  // Higher = more subtle 3D, Lower = more dramatic 3D
  style={{ perspective: '10000px' }}
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
>
  
{/*<img
    src="/images/optimized/IMG_6969.webp"
    className="absolute inset-0 w-full h-full object-cover opacity-50"
    style={{ 
      transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px) scale(1.1) rotateX(${parallaxOffset.tiltX}deg) rotateY(${parallaxOffset.tiltY}deg)`,
      transformOrigin: 'center center',
      // TRANSITION TIMING
      // Adjust the duration (0.3s) and easing (ease-out) to change animation smoothness
      // Duration: Higher = slower movement, Lower = snappier movement
      // Easing: ease-out = smooth deceleration, ease-in-out = smooth both ways
      transition: 'transform 0.3s ease-out',
      transformStyle: 'preserve-3d',
      filter: 'brightness(0.5) contrast(1.2) blur(2px) saturate(1.2)',
      willChange: 'transform' // Optimize performance
    }}
    alt="Chef cooking in kitchen"
  />
  */}

<video
  src="/images/dinnervid.mp4"
  className="absolute inset-0 w-full h-full object-cover opacity-70"
  style={{
    transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px) scale(1.1) rotateX(${parallaxOffset.tiltX}deg) rotateY(${parallaxOffset.tiltY}deg)`,
    transformOrigin: 'center center',
    transition: 'transform 0.3s ease-out',
    transformStyle: 'preserve-3d',
    filter: 'brightness(0.5) contrast(1.2)  saturate(1.2)',
    willChange: 'transform'
  }}
  autoPlay
  muted
  loop
  playsInline
/>


  <div className="relative z-10 text-center px-4">
    <h1 
      ref={heroTitleRef}
      className="font-display tracking-tight text-3xl sm:text-5xl md:text-7xl leading-snug sm:leading-tight uppercase drop-shadow-lg"
      dangerouslySetInnerHTML={{ 
        __html: getContent('hero_title', 'restaurant-quality<br />private dining') 
      }}
    />
    <p 
      ref={heroSubtitleRef}
      className="mt-6 max-w-xl mx-auto text-lg drop-shadow-lg"
    >
      {getContent('hero_subtitle', 'From intimate dinners to large galas, Chef Alex J crafts unforgettable culinary experiences wherever you celebrate.')}
    </p>
    
      <a
      href="#booking"
      className="inline-block mt-8 bg-accent1 text-white px-6 py-2 text-xs uppercase tracking-wider hover:bg-white hover:text-accent1 transition font-button drop-shadow-lg"
    >
      Start Your Booking

     


    </a>
  </div>

  
  
  {/* Top wave separator now inside hero */}
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"
  className="absolute -bottom-1 w-full h-24 z-10"
>


  
  {/* filled wave */}
  <path
    className="fill-primary3"
    d="M0,128L34.3,149.3C68.6,171,137,213,206,240C274.3,267,343,277,411,234.7C480,192,549,96,617,85.3C685.7,75,754,149,823,160C891.4,171,960,117,1029,128C1097.1,139,1166,213,1234,213.3C1302.9,213,1371,139,1406,101.3L1440,64L1440,320L0,320Z"
  />


</svg>



</header>

<BounceArrow />




{/* about */}
<section id="about" ref={aboutRef} className="-mt-1 bg-primary3 text-accent1 py-40 px-4 sm:px-6 lg:px-8">
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
  <img
  ref={imageRef}
  src="/images/optimized/IMG_6353.webp"
  className="w-full h-full object-cover rounded-lg opacity-80"
  style={{
    outline: '4px solid var(--color-stroke)',
    outlineOffset: '-2px',
    boxShadow: '8px 8px 0 var(--color-accent2)'
  }}
  alt="Chef Alex J at work"
/>



<div ref={textRef}>
<h2 className="font-display text-accent2 text-4xl sm:text-5xl mb-4">
    {getContent('about_title', 'Meet Chef Alex J')}
  </h2>

  <div 
    className="text-accent2 space-y-4"
    dangerouslySetInnerHTML={{ 
      __html: getContent('about_content', `
        <p>Raised in bustling family kitchens in Montréal and Toronto, Alex learned early on that the best way to care for people is through food. Eighteen years later, that passion still drives him. From intimate dinners to large festivals, he brings the flavours and techniques he grew up loving to every plate he serves.</p>
        <p>Every event is tailored to your unique tastes and needs—because when you dine with us, you're family.</p>
        <p>Welcome to the family,<br />Alex</p>
      `).replace(/\n\s+/g, ' ').trim()
    }}
  />
    </div>
  </div>
</section>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
  className="w-full h-auto"
  style={{ transform: 'scaleY(-1)' }}
>
  <path
    fill="var(--color-primary3)"
    fillOpacity="1"
d="M0,224L34.3,240C68.6,256,137,288,206,282.7C274.3,277,343,235,
411,229.3C480,224,549,256,617,240C685.7,224,754,160,823,154.7C891.4,
149,960,203,1029,208C1097.1,213,1166,171,1234,144C1302.9,117,1371,107,
1406,101.3L1440,96L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,
320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,
320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
>

</path>
</svg>

      {/* gallery */}
      <section id="gallery" className="bg-primary2 z-10 text-accent2 py-4">
  <div className="text-center mb-2">
    <TextMarquee className="font-display text-3xl sm:text-5xl uppercase text-accent2">
      Event Highlights
    </TextMarquee>
  </div>
  {/* Mobile version */}
  <div className="block sm:hidden">
    <MobileEventHighlights />
  </div>
  {/* Desktop version */}
  <div className="hidden sm:block">
    <EventHighlights />
  </div>
</section>




    


  <section
    id="menu"
    className="relative"
  >
    {/* blurred BG */}
    <div
      className="absolute inset-0 bg-cover bg-center filter blur-[2px]"
      style={{
        backgroundImage: "url('/images/Image_fx (10).jpg')",
      }}
    />

    {/* Top wave overlay */}
    <svg
      className="absolute -top-1 left-0 w-full h-24 z-20"
      viewBox="0 0 1440 320"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        className="fill-primary2"
        d="M0,128L34.3,149.3C68.6,171,137,213,206,240C274.3,267,343,277,411,234.7C480,192,549,96,617,85.3C685.7,75,754,149,823,160C891.4,171,960,117,1029,128C1097.1,139,1166,213,1234,213.3C1302.9,213,1371,139,1406,101.3L1440,64L1440,0L0,0Z"
      />
    </svg>

    {/* Content with TextMarquee and PlateStack */}
    <div className="relative z-50 py-32">
      <div className="w-full max-w-none">
        <TextMarquee className="w-full text-center font-display text-3xl sm:text-5xl uppercase mb-12 text-accent2">
          Signature Menu Items
        </TextMarquee>
      </div>
      <div className="px-4 sm:px-8 h-full flex items-center justify-center relative z-50">
        {/* Mobile carousel */}
        <div className="block sm:hidden w-full">
          <MobilePlateCarousel />
        </div>
        {/* Desktop plate stack */}
        <div className="hidden sm:block w-full">
          <PlateStack />
        </div>
      </div>
    </div>

  {/* Bottom wave overlay */}
  <svg
    className="absolute -bottom-1 left-0 w-full h-24 z-20"
    viewBox="0 0 1440 320"
    preserveAspectRatio="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      className="fill-primary2"
      d="M0,288L26.7,288C53.3,288,107,288,160,282.7C213.3,277,267,267,320,256C373.3,245,427,235,480,229.3C533.3,224,587,224,640,229.3C693.3,235,747,245,800,213.3C853.3,181,907,107,960,112C1013.3,117,1067,203,1120,202.7C1173.3,203,1227,117,1280,90.7C1333.3,64,1387,96,1413,112L1440,128L1440,320L0,320Z"
    />
  </svg>
</section>









      {/* testimonials */}
      <TestimonialsSection />

     


      {/* booking */}
<section
  id="booking"
  className="relative bg-primary3 text-accent2 py-32 overflow-hidden"
  style={{
    backgroundImage: bookingBgImage ? `url('${bookingBgImage}')` : undefined,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
  }}
>
  {/* Dark, blurred overlay for text readability */}
  <div className="absolute inset-0 bg-black/10 backdrop-blur-[2px] z-0"></div>

  {/* Content */}
  <div className="relative z-10">
    <div className="w-full max-w-none">
      <TextMarquee className="text-center font-display text-3xl sm:text-5xl uppercase mb-12 text-accent2 drop-shadow-lg">
        Let&apos;s Craft Your Event
      </TextMarquee>
    </div>
    <div className="px-4 sm:px-6 lg:px-8 max-w-xl mx-auto">
      <QuoteChat />
    </div>
  </div>
</section>


  


      {/* footer */}
      <footer className="bg-primary1 text-accent1 py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-y-4 gap-12">
          <div>
            <h4 className="font-bold uppercase mb-4">Explore</h4>
            <ul className="space-y-1 text-sm">
              <li><a href="#menu" className="hover:text-primary1">Menu</a></li>
              <li><a href="#gallery" className="hover:text-primary1">Gallery</a></li>
              <li><a href="#booking" className="hover:text-primary1">Book Event</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold uppercase mb-4">Join the Mailing List</h4>
            <p className="text-sm mb-4">{getContent('footer_newsletter', 'Seasonal menus, pop-ups & chef\'s secrets—straight to your inbox.')}</p>
            <form className="flex gap-2 w-full sm:w-auto sm:max-w-xs">
              <input type="email" placeholder="Email Address" className="flex-1 px-3 py-2 text-xs text-black placeholder:text-gray-400" />
              <button className="bg-primary1 px-4 py-2 text-xs text-accent1 uppercase tracking-wider hover:bg-white hover:text-accent1 transition font-button">
                Sign Up
              </button>
            </form>
          </div>
          <div>
            <h4 className="font-bold uppercase mb-4">Contact</h4>
            <div 
              className="text-xs leading-6"
              dangerouslySetInnerHTML={{ 
                __html: getContent('footer_contact', 'Toronto, ON<br />info@chefalexj.com<br />416-555-0123') 
              }}
            />
            <h4 className="font-bold uppercase mt-6 mb-2">Follow</h4>
            <div className="flex space-x-4 text-xl">
              <a href="#">🐦</a><a href="#">📸</a><a href="#">🎵</a>
            </div>
          </div>
        </div>
        <p className="text-center text-xs mt-12 opacity-70">&copy; 2025 Chef Alex J. All rights reserved.</p>
      </footer>
    </>
  );
}

export default function Home() {
  return <HomeContent />;
}
