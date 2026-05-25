'use client';

import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoriesSection from '@/components/home/CategoriesSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Newsletter from '@/components/home/Newsletter';

export default function Home() {
  return (
    <Layout>
      <HeroSection />
      <FeaturedProducts />
      <CategoriesSection />
      <WhyChooseUs />
      <Newsletter />
    </Layout>
  );
}
