// frontend/src/pages/HomePage.tsx
import React from 'react'; // Import React
import HeroSection from '../components/home/HeroSection';
import FeaturedCategories from '../components/home/FeaturedCategories';
import FeaturedProducts from '../components/home/FeaturedProducts';
import WhyChooseUs from '../components/home/WhyChooseUs';
import TestimonialSection from '../components/home/TestimonialSection';
import PageTransition from '../components/ui/PageTransition';
// Add other sections like Blog preview, CTA etc. as needed
// import BlogPreview from '../components/home/BlogPreview';
// import CallToAction from '../components/home/CallToAction';

const HomePage: React.FC = () => {
    return (
        <PageTransition>
            <HeroSection />
            <FeaturedCategories /> {/* Requires API or mock data */}
            <FeaturedProducts />   {/* Requires API or mock data */}
            <WhyChooseUs />
            <TestimonialSection /> {/* Requires API or mock data */}
            {/* <CallToAction /> */}
            {/* <BlogPreview /> */}
        </PageTransition>
    );
};

export default HomePage;