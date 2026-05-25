import { Helmet } from 'react-helmet-async';
import Layout from '@/components/layout/Layout';
import HeroSection from '@/components/home/HeroSection';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import CategoriesSection from '@/components/home/CategoriesSection';
import WhyChooseUs from '@/components/home/WhyChooseUs';
import Newsletter from '@/components/home/Newsletter';

const Index = () => {
  return (
    <>
      <Helmet>
        <title>Nail Shingaar by Reet | Handcrafted Custom Press-On Nails</title>
        <meta
          name="description"
          content="Nail Shingaar by Reet — handcrafted custom press-on nails sized perfectly for your fingers. Everyday, western, bridal, festive & seasonal collections."
        />
      </Helmet>
      <Layout>
        <HeroSection />
        <FeaturedProducts />
        <CategoriesSection />
        <WhyChooseUs />
        <Newsletter />
      </Layout>
    </>
  );
};

export default Index;
