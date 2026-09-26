'use client';

import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import CategoriesSection from '@/components/home/CategoriesSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import MeetReet from '@/components/home/MeetReet';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import GoogleReviews from '@/components/home/GoogleReviews';
import OurWork from '@/components/home/OurWork';
import BlogSection from '@/components/home/BlogSection';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <CategoriesSection />
      <FeaturedProducts />
      <MeetReet />
      <WhyChooseUs />
      <GoogleReviews />
      <OurWork />
      <BlogSection />
    </Layout>
  );
}
