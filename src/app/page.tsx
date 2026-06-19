'use client';

import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import MarqueeStrip from '@/components/home/MarqueeStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import OccasionCategories from '@/components/home/OccasionCategories';
import CategoriesSection from '@/components/home/CategoriesSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import BlogSection from '@/components/home/BlogSection';
import GoogleReviews from '@/components/home/GoogleReviews';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <MarqueeStrip />
      <FeaturedProducts />
      <OccasionCategories />
      <CategoriesSection />
      <WhyChooseUs />
      <GoogleReviews />
      <BlogSection />
      <Newsletter />
    </Layout>
  );
}
