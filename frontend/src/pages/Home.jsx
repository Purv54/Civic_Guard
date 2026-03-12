import HeroSection from '../components/home/HeroSection';
import Features from '../components/home/Features';
import HowItWorks from '../components/home/HowItWorks';
import StatsSection from '../components/home/StatsSection';
import CTASection from '../components/home/CTASection';

const Home = () => {
    return (
        <div className="bg-slate-50 font-inter">
            <HeroSection />
            <StatsSection />
            <Features />
            <HowItWorks />
            <CTASection />
        </div>
    );
};

export default Home;
