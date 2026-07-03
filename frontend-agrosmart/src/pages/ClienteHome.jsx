import React from 'react';
import ClientNavbar from '@/components/ClientNavbar';
import Hero from '@/components/landing/Hero';
import TrustBar from '@/components/landing/TrustBar';
import Categories from '@/components/landing/Categories';
import FeaturedCarousel from '@/components/landing/FeaturedCarousel';
import HowItWorks from '@/components/landing/HowItWorks';
import Pillars from '@/components/landing/Pillars';
import Courses from '@/components/landing/Courses';
import Testimonials from '@/components/landing/Testimonials';
import FinalCTA from '@/components/landing/FinalCTA';
import Contact from '@/components/landing/Contact';
import Footer from '@/components/landing/Footer';

export default function ClienteHome() {
  return (
    <div
      className="text-white antialiased"
      style={{
        fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif',
        backgroundImage:
          'radial-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(135deg, #00122e 0%, #001d3d 40%, #004d2e 100%)',
        backgroundSize: '25px 25px, 100% 100%',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
      }}
    >
      <ClientNavbar />
      <main>
        <Hero />
        <TrustBar />
        <Categories />
        <FeaturedCarousel />
        <HowItWorks />
        <Pillars />
        <Courses />
        <Testimonials />
        <FinalCTA />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
