import Navbar from "@/components/Navbar";
import GeneratorCard from "@/components/GeneratorCard";
import { Image, FileText, Mic, AudioLines, Presentation, ScanSearch } from "lucide-react";
import { Helmet } from "react-helmet-async";

const Dashboard = () => {
  const generators = [
    {
      title: "Image Generator",
      description: "Create stunning images from text descriptions using AI.",
      icon: Image,
      href: "/text-generator?tab=image",
      gradient: "blue" as const,
    },
    {
      title: "Image Analysis",
      description: "Analyze and understand images with AI-powered insights.",
      icon: ScanSearch,
      href: "/text-generator?tab=analysis",
      gradient: "green" as const,
    },
    {
      title: "Content Writer",
      description: "Generate high-quality written content with AI assistance for any purpose.",
      icon: FileText,
      href: "/text-generator?tab=writer",
      gradient: "purple" as const,
    },
    {
      title: "Slide Generator",
      description: "Generate presentation slides from your content with AI-powered breakdown.",
      icon: Presentation,
      href: "/text-generator?tab=slides",
      gradient: "cyan" as const,
    },
    {
      title: "Audio Tools",
      description: "Convert text to speech and transcribe audio with advanced AI.",
      icon: AudioLines,
      href: "/audio-generator",
      gradient: "orange" as const,
    },
  ];

  return (
    <>
      <Helmet>
        <title>Dashboard - LearnX</title>
        <meta name="description" content="Access all AI-powered learning tools. Create images, analyze content, generate audio, and more from one dashboard." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="relative z-10 container mx-auto px-4 pt-28 pb-16">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="font-display text-3xl md:text-4xl font-semibold mb-3 animate-fade-in-up opacity-0 tracking-tight">
              Choose a Tool
            </h1>
            <p className="text-muted-foreground text-base max-w-md mx-auto animate-fade-in-up opacity-0 delay-100">
              Select a tool to start creating with AI
            </p>
          </div>

          {/* Generator Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
            {generators.map((generator, index) => (
              <GeneratorCard
                key={generator.title}
                {...generator}
                delay={200 + index * 100}
              />
            ))}
          </div>
        </main>
      </div>
    </>
  );
};

export default Dashboard;