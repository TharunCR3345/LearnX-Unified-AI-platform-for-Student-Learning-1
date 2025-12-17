import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Clean gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-background to-secondary/20" />
      
      <div className="relative z-10 container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary border border-border mb-8 animate-fade-in-up opacity-0 ios-bounce">
            <Sparkles className="w-4 h-4 text-foreground" />
            <span className="text-sm font-medium text-muted-foreground">AI-Powered Learning</span>
          </div>

          {/* Main heading */}
          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-semibold mb-6 animate-fade-in-up opacity-0 delay-100 tracking-tight">
            Learn Smarter with
            <span className="block mt-2">LearnX</span>
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 animate-fade-in-up opacity-0 delay-200 leading-relaxed">
            Create images, analyze content, generate audio, and build presentations — all powered by AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center animate-fade-in-up opacity-0 delay-300">
            <Link to="/dashboard">
              <Button variant="default" size="lg" className="group rounded-2xl ios-bounce">
                Get Started
                <ArrowRight className="w-4 h-4 ios-transition group-hover:translate-x-1" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="rounded-2xl ios-bounce">
              Learn More
            </Button>
          </div>

          {/* Feature highlights */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-20 animate-fade-in-up opacity-0 delay-400">
            {[
              { label: "Text to Image", icon: "🎨" },
              { label: "Image Analysis", icon: "🔍" },
              { label: "Text to Audio", icon: "🔊" },
              { label: "Speech to Text", icon: "🎤" },
            ].map((feature) => (
              <div
                key={feature.label}
                className="bg-secondary/50 rounded-2xl p-4 border border-border ios-transition hover:bg-secondary hover:shadow-ios-md ios-bounce cursor-default"
              >
                <div className="text-2xl mb-2">{feature.icon}</div>
                <div className="text-sm font-medium text-foreground">{feature.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom fade */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
};

export default HeroSection;