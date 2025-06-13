'use client';

import FontSwitcher from './components/FontSwitcher'
import ColorManager from './components/ColorManager'
import QuoteChat from './components/QuoteChat'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useState, useEffect } from 'react'
import TestimonialCarousel from './components/TestimonialCarousel';



function HomeContent() {
  const [scrolled, setScrolled] = useState(false);
  const [parallaxOffset, setParallaxOffset] = useState({ x: 0, y: 0 });
  const { scrollY } = useScroll();

  useEffect(() => {
    const unsubscribe = scrollY.on('change', (y) => {
      setScrolled(y > 30);
    });
    return () => unsubscribe();
  }, [scrollY]);

  const handleMouseMove = (
    e: React.MouseEvent<HTMLDivElement, MouseEvent>
  ) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width - 0.5) * 20;
    const y = ((e.clientY - rect.top) / rect.height - 0.5) * 20;
    setParallaxOffset({ x, y });
  };

  const handleMouseLeave = () => setParallaxOffset({ x: 0, y: 0 });

  return (
    <>
      <FontSwitcher />
      <ColorManager />

      {/* Floating logo that appears at top center on load */}
      <div
  className={`fixed top-32 left-1/2 z-40 transition-all duration-300 ease-in-out pointer-events-none ${
    !scrolled ? 'floating-logo' : ''
  }`}
  style={{
    transform: scrolled
      ? 'translate(calc(-50% + 6px), -150px) scale(0.6)'
      : 'translate(calc(-50% + 6px), 0) scale(3.5)',
    opacity: scrolled ? 0 : 1
  }}
>
  <img
    src="/images/logo-black.png"
    alt="Chef Alex J Logo"
    className="w-[80px] sm:w-[100px]"
  />
</div>

      {/* Navigation bar */}
      <nav
        className="w-full fixed h-20 fixed top-0 z-50 transition-all duration-300 font-display ease-in-out"
        style={{
          backgroundColor: scrolled ? 'var(--color-accent2)' : 'transparent',
          
          outlineOffset: '-6px',
        }}
      >
        <div className="max-w-7xl mx-auto relative flex h-full items-center justify-between px-4 md:px-8">
          {/* Left navigation items */}
          <ul className="hidden md:flex space-x-8 uppercase text-lg tracking-wide">
            <li>
              <a href="#about" className="hover:text-primary1 transition-colors duration-200">
                About
              </a>
            </li>
            <li>
              <a href="#menu" className="hover:text-primary1 transition-colors duration-200">
                Menu
              </a>
            </li>
          </ul>

          {/* Centered logo */}
          <div
            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 transition-all duration-300 ease-in-out"
            style={{
              opacity: scrolled ? 1 : 0,
              transform: scrolled
                ? 'translate(-50%, -50%) scale(1.5)'
                : 'translate(-50%, -50%) scale(0)',
            }}
          >
            <img
              src="/images/logo-black.png"
              alt="Chef Alex J Logo"
              className="w-[40px] h-auto"
            />
          </div>

          {/* Right navigation items */}
          <ul className="hidden md:flex space-x-8 uppercase text-lg tracking-wide">
            <li>
              <a href="#gallery" className="hover:text-primary1 transition-colors duration-200">
                Gallery
              </a>
            </li>
            <li>
              <a href="#booking" className="hover:text-primary1 transition-colors duration-200">
                Book Event
              </a>
            </li>
          </ul>
        </div>
      </nav>

{/* hero - now goes to top of page */}
<header
  className="relative min-h-[100vh] flex items-center justify-center overflow-hidden bg-[#ffe4d6] pt-0"
  onMouseMove={handleMouseMove}
  onMouseLeave={handleMouseLeave}
>
  
  <img
    src="/images/optimized/IMG_6969.webp"
    className="absolute inset-0 w-full h-full object-cover opacity-50"
    style={{ transform: `translate(${parallaxOffset.x}px, ${parallaxOffset.y}px)` }}
    alt="Chef cooking in kitchen"
  />

  <div className="relative z-10 text-center px-4">
    <h1 className="font-display tracking-tight leading-tight text-5xl sm:text-7xl md:text-8xl uppercase">
      restaurant-quality<br />private dining
    </h1>
    <p className="mt-6 max-w-xl mx-auto text-lg">
      From intimate dinners to large galas, Chef Alex J crafts unforgettable culinary experiences wherever you
      celebrate.
    </p>
    <a
      href="#booking"
      className="inline-block mt-8 bg-primary1 text-white px-6 py-2 text-xs uppercase tracking-wider hover:bg-white hover:text-accent1 transition font-button"
    >
      Start Your Booking
    </a>
  </div>

  
  
  {/* Top wave separator now inside hero */}
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"
  className="absolute bottom-0 w-full h-20 z-10"
>
  {/* filled wave */}
  <path
    className="fill-primary3"
    d="M0,128L34.3,149.3C68.6,171,137,213,206,240C274.3,267,343,277,411,234.7C480,192,549,96,617,85.3C685.7,75,754,149,823,160C891.4,171,960,117,1029,128C1097.1,139,1166,213,1234,213.3C1302.9,213,1371,139,1406,101.3L1440,64L1440,320L0,320Z"
  />


</svg>

</header>





{/* about */}
<section id="about" className="-mt-1 bg-primary3 text-accent1 py-20 px-4">
  <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
  <img
  src="/images/optimized/IMG_6253.webp"
  className="w-full h-full object-cover rounded-lg opacity-80"
  style={{
    outline: '4px solid var(--color-stroke)',
    outlineOffset: '-2px',
    boxShadow: '8px 8px 0 var(--color-accent2)'
  }}
  alt="Chef Alex J at work"
/>



<div>
  <TextMarquee className="font-display text-accent2 text-4xl sm:text-5xl mb-4">
    Meet Chef Alex J
  </TextMarquee>

  <p className="text-accent2 mb-4">
    Raised in bustling family kitchens in Montréal and Toronto, Alex learned
    early on that the best way to care for people is through food. Eighteen
    years later, that passion still drives him. From intimate dinners to large
    festivals, he brings the flavours and techniques he grew up loving to every
    plate he serves.
  </p>

  <p className="text-accent2 mb-4">
    Every event is tailored to your unique tastes and needs—because when you
    dine with us, you’re family.
  </p>

  <p className="text-accent2 mb-4">
    Welcome to the family,
    <br />
    Alex
  </p>
    </div>
  </div>
</section>

<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"
  className="block w-full h-20 -mt-px"
>
  {/* Fill shape */}
  <path
    className="fill-primary3"
    d="M0,288L26.7,288C53.3,288,107,288,160,282.7C213.3,277,267,267,320,256C373.3,245,427,235,480,229.3C533.3,224,587,224,640,229.3C693.3,235,747,245,800,213.3C853.3,181,907,107,960,112C1013.3,117,1067,203,1120,202.7C1173.3,203,1227,117,1280,90.7C1333.3,64,1387,96,1413,112L1440,128L1440,0L0,0Z"
  />

 
</svg>

      {/* menu */}
      <section id="menu" className="bg-primary2 text-accent1 py-24 px-4">
        <TextMarquee className="text-center font-display text-3xl sm:text-5xl uppercase mb-12">
          Signature Menus
        </TextMarquee>
        <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-10">
          <article className="bg-white p-6 rounded-xl shadow-lg hover:scale-105 transition">
            <h3 className="font-bold mb-2">Seasonal Tasting</h3>
            <p className="text-sm mb-4">Five courses celebrating Ontario&apos;s freshest produce.</p>
            <span className="text-xs uppercase tracking-widest">ideal for weddings</span>
          </article>
          <article className="bg-white p-6 rounded-xl shadow-lg hover:scale-105 transition">
            <h3 className="font-bold mb-2">Family-Style Feast</h3>
            <p className="text-sm mb-4">Abundant platters designed for sharing and conversation.</p>
            <span className="text-xs uppercase tracking-widest">perfect for festivals</span>
          </article>
          <article className="bg-white p-6 rounded-xl shadow-lg hover:scale-105 transition">
            <h3 className="font-bold mb-2">Corporate Luncheon</h3>
            <p className="text-sm mb-4">Elegant three-course menu delivered to your boardroom.</p>
            <span className="text-xs uppercase tracking-widest">ideal for business</span>
          </article>
        </div>
      </section>

      {/* Top wave separator */}
<svg
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"
  className="block w-full"
>
  {/* filled wave */}
  <path
    className="fill-primary3"
    d="M0,128L34.3,149.3C68.6,171,137,213,206,240C274.3,267,343,277,411,234.7C480,192,549,96,617,85.3C685.7,75,754,149,823,160C891.4,171,960,117,1029,128C1097.1,139,1166,213,1234,213.3C1302.9,213,1371,139,1406,101.3L1440,64L1440,320L1405.7,320C1371.4,320,1303,320,1234,320C1165.7,320,1097,320,1029,320C960,320,891,320,823,320C754.3,320,686,320,617,320C548.6,320,480,320,411,320C342.9,320,274,320,206,320C137.1,320,69,320,34,320L0,320Z"
  />

 
</svg>

      {/* gallery */}
<section id="gallery" className="bg-primary3 text-accent2 py-24 px-4">
  <TextMarquee className="text-center font-display text-3xl sm:text-5xl uppercase mb-12">
    Event Highlights
  </TextMarquee>
  <div className="max-w-6xl mx-auto grid sm:grid-cols-2 lg:grid-cols-3 gap-6 opacity-80">
    <img
      src="/images/optimized/IMG_8262.webp"
      className="w-full h-80 object-cover rounded-md"
      style={{
        outline: '4px solid var(--color-stroke)',
        outlineOffset: '-2px',
        boxShadow: '8px 8px 0 var(--color-accent2)'
      }}
      alt="Intimate dining event with guests enjoying conversation"
    />
    <img
      src="/images/optimized/IMG_8301.webp"
      className="w-full h-80 object-cover rounded-md"
      style={{
        outline: '4px solid var(--color-stroke)',
        outlineOffset: '-2px',
        boxShadow: '8px 8px 0 var(--color-accent2)'
      }}
      alt="Elegantly plated dish with artistic presentation"
    />
    <img
      src="/images/optimized/IMG_8355.webp"
      className="w-full h-80 object-cover rounded-md"
      style={{
        outline: '4px solid var(--color-stroke)',
        outlineOffset: '-2px',
        boxShadow: '8px 8px 0 var(--color-accent2)'
      }}
      alt="Gourmet dish with green sauce in artisan bowl"
    />
    <img
      src="/images/optimized/IMG_8386.webp"
      className="w-full h-80 object-cover rounded-md"
      style={{
        outline: '4px solid var(--color-stroke)',
        outlineOffset: '-2px',
        boxShadow: '8px 8px 0 var(--color-accent2)'
      }}
      alt="Artistic plated dish with creative garnish"
    />
    <img
      src="/images/optimized/IMG_8436-Edit.webp"
      className="w-full h-80 object-cover rounded-md"
      style={{
        outline: '4px solid var(--color-stroke)',
        outlineOffset: '-2px',
        boxShadow: '8px 8px 0 var(--color-accent2)'
      }}
      alt="Premium meat dish with colorful vegetable garnish"
    />
    <img
      src="/images/optimized/IMG_8223.webp"
      className="w-full h-80 object-cover rounded-md"
      style={{
        outline: '4px solid var(--color-stroke)',
        outlineOffset: '-2px',
        boxShadow: '8px 8px 0 var(--color-accent2)'
      }}
      alt="Additional culinary creation"
    />
  </div>
</section>

      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320">
  {/* Filled base wave */}
  <path
    className="fill-primary3"
    fillOpacity="1"
    d="M0,160L26.7,138.7C53.3,117,107,75,160,69.3C213.3,64,267,96,320,138.7C373.3,181,427,235,480,250.7C533.3,267,587,245,640,229.3C693.3,213,747,203,800,192C853.3,181,907,171,960,165.3C1013.3,160,1067,160,1120,170.7C1173.3,181,1227,203,1280,176C1333.3,149,1387,75,1413,37.3L1440,0L1440,0L1413.3,0C1386.7,0,1333,0,1280,0C1226.7,0,1173,0,1120,0C1066.7,0,1013,0,960,0C906.7,0,853,0,800,0C746.7,0,693,0,640,0C586.7,0,533,0,480,0C426.7,0,373,0,320,0C266.7,0,213,0,160,0C106.7,0,53,0,27,0L0,0Z"
  />

 
</svg>

      {/* testimonials */}
      <section id="testimonials" className="relative bg-primary2 text-center py-24 px-4">
        <TestimonialCarousel />
      </section>

      <svg
  className="block w-full -mb-px"   /* 1-px negative top margin + display:block */
  xmlns="http://www.w3.org/2000/svg"
  viewBox="0 0 1440 320"
  preserveAspectRatio="none"        /* stretches edge-to-edge, no sub-pixel gap */
>
  {/* filled wave */}
  <path
    className="fill-primary3"
    d="M0,128L34.3,149.3C68.6,171,137,213,206,240C274.3,267,343,277,411,234.7C480,192,549,96,617,85.3C685.7,75,754,149,823,160C891.4,171,960,117,1029,128C1097.1,139,1166,213,1234,213.3C1302.9,213,1371,139,1406,101.3L1440,64L1440,320L0,320Z"
  />
</svg>


      {/* booking */}
      <section id="booking" className="bg-primary3 text-accent2 py-24 px-8">
        <TextMarquee className="text-center font-display text-3xl sm:text-5xl uppercase mb-12">
          Let&apos;s Craft Your Event
        </TextMarquee>
        <div className="max-w-xl mx-auto">
          <QuoteChat />
        </div>
      </section>

  


      {/* footer */}
      <footer className="bg-accent2 text-accent1 py-16 px-8">
        <div className="max-w-6xl mx-auto grid md:grid-cols-3 gap-12">
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
            <p className="text-sm mb-4">Seasonal menus, pop-ups & chef&apos;s secrets—straight to your inbox.</p>
            <form className="flex gap-2 max-w-xs">
              <input type="email" placeholder="Email Address" className="flex-1 px-3 py-2 text-xs text-black placeholder:text-gray-400" />
              <button className="bg-primary1 px-4 py-2 text-xs text-accent1 uppercase tracking-wider hover:bg-white hover:text-accent1 transition font-button">
                Sign Up
              </button>
            </form>
          </div>
          <div>
            <h4 className="font-bold uppercase mb-4">Contact</h4>
            <p className="text-xs leading-6">
              Toronto, ON<br />
              info@chefalexj.com<br />
              416-555-0123
            </p>
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