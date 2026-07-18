'use client';

import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import OccasionCategories from '@/components/home/OccasionCategories';
import CategoriesSection from '@/components/home/CategoriesSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import BlogSection from '@/components/home/BlogSection';
import GoogleReviews from '@/components/home/GoogleReviews';
export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <WhyChooseUs />
      <GoogleReviews />
      <BlogSection />
    </Layout>
  );
}
