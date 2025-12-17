import HeroSection from "@/components/HeroSection";
import Navbar from "@/components/Navbar";
import { Helmet } from "react-helmet-async";

const Index = () => {
  return (
    <>
      <Helmet>
        <title>LearnX - AI-Powered Learning Platform</title>
        <meta name="description" content="Transform your learning journey with LearnX. Create images, analyze content, generate audio, and build presentations with advanced AI technology." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />
        <HeroSection />
      </div>
    </>
  );
};

export default Index;