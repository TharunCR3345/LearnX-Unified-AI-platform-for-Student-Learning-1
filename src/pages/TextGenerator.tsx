import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Image, ScanSearch, Presentation, FileText, Loader2, Download, Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

const TextGenerator = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "image";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast } = useToast();

  // Text to Image state
  const [imagePrompt, setImagePrompt] = useState("");
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [imageLoading, setImageLoading] = useState(false);

  // Image Analysis state
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  // Content Writer state
  const [writerPrompt, setWriterPrompt] = useState("");
  const [writerResult, setWriterResult] = useState<string | null>(null);
  const [writerLoading, setWriterLoading] = useState(false);

  // Slide Generator state
  const [slidePrompt, setSlidePrompt] = useState("");
  const [slideResult, setSlideResult] = useState<string | null>(null);
  const [slideLoading, setSlideLoading] = useState(false);

  const handleGenerateImage = async () => {
    if (!imagePrompt.trim()) {
      toast({ title: "Please enter a prompt", variant: "destructive" });
      return;
    }
    setImageLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: { prompt: imagePrompt },
      });
      if (error) throw error;
      setGeneratedImage(data.imageUrl);
      
      // Save to gallery
      const { error: saveError } = await supabase
        .from("generated_images")
        .insert({ prompt: imagePrompt, image_url: data.imageUrl });
      
      if (saveError) {
        console.error("Failed to save to gallery:", saveError);
      }
      
      toast({ title: "Image generated and saved to gallery!" });
    } catch (error: unknown) {
      const err = error as Error;
      toast({ title: "Failed to generate image", description: err.message, variant: "destructive" });
    } finally {
      setImageLoading(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!selectedImage) {
      toast({ title: "Please select an image", variant: "destructive" });
      return;
    }
    setAnalysisLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const { data, error } = await supabase.functions.invoke("explain-image", {
          body: { image: base64, mimeType: selectedImage.type },
        });
        if (error) throw error;
        setAnalysisResult(data.explanation);
        toast({ title: "Image analyzed successfully!" });
      };
      reader.readAsDataURL(selectedImage);
    } catch (error: any) {
      toast({ title: "Failed to analyze image", description: error.message, variant: "destructive" });
    } finally {
      setAnalysisLoading(false);
    }
  };

  const handleGenerateContent = async () => {
    if (!writerPrompt.trim()) {
      toast({ title: "Please enter a topic", variant: "destructive" });
      return;
    }
    setWriterLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("generate-content", {
        body: { prompt: writerPrompt },
      });
      if (error) throw error;
      setWriterResult(data.content);
      toast({ title: "Content generated successfully!" });
    } catch (error: any) {
      toast({ title: "Failed to generate content", description: error.message, variant: "destructive" });
    } finally {
      setWriterLoading(false);
    }
  };

  const handleGenerateSlides = async () => {
    if (!slidePrompt.trim()) {
      toast({ title: "Please enter content for slides", variant: "destructive" });
      return;
    }
    setSlideLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-text-for-slides", {
        body: { content: slidePrompt },
      });
      if (error) throw error;
      setSlideResult(data.slides);
      toast({ title: "Slides generated successfully!" });
    } catch (error: any) {
      toast({ title: "Failed to generate slides", description: error.message, variant: "destructive" });
    } finally {
      setSlideLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Create - LearnX</title>
        <meta name="description" content="Generate images from text, analyze images with AI, create content, and generate presentation slides." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="relative z-10 container mx-auto px-4 pt-28 pb-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-6 text-center animate-fade-in-up opacity-0 tracking-tight">
              Create Content
            </h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in-up opacity-0 delay-100">
              <TabsList className="grid grid-cols-4 mb-6 bg-secondary rounded-2xl p-1 h-auto">
                <TabsTrigger value="image" className="rounded-xl py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-ios ios-transition">
                  <Image className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Image</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="rounded-xl py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-ios ios-transition">
                  <ScanSearch className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="writer" className="rounded-xl py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-ios ios-transition">
                  <FileText className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Writer</span>
                </TabsTrigger>
                <TabsTrigger value="slides" className="rounded-xl py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-ios ios-transition">
                  <Presentation className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Slides</span>
                </TabsTrigger>
              </TabsList>

              {/* Text to Image */}
              <TabsContent value="image">
                <Card className="bg-card border border-border rounded-2xl p-6 shadow-ios">
                  <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Text to Image</h2>
                  <Textarea
                    placeholder="Describe the image you want to generate..."
                    value={imagePrompt}
                    onChange={(e) => setImagePrompt(e.target.value)}
                    className="min-h-[120px] bg-secondary border-border rounded-xl mb-4 ios-transition focus:ring-2 focus:ring-foreground/20"
                  />
                  <Button onClick={handleGenerateImage} disabled={imageLoading} className="w-full rounded-xl ios-bounce">
                    {imageLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Image className="w-4 h-4 mr-2" />}
                    Generate Image
                  </Button>
                  {generatedImage && (
                    <div className="mt-6 space-y-4">
                      <img src={generatedImage} alt="Generated" className="w-full rounded-2xl border border-border" />
                      <Button 
                        variant="outline" 
                        className="w-full rounded-xl ios-bounce"
                        onClick={() => {
                          const link = document.createElement('a');
                          link.href = generatedImage;
                          link.download = `generated-image-${Date.now()}.png`;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download Image
                      </Button>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Image Analysis */}
              <TabsContent value="analysis">
                <Card className="bg-card border border-border rounded-2xl p-6 shadow-ios">
                  <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Image Analysis</h2>
                  <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center mb-4 ios-transition hover:border-foreground/30">
                    <input type="file" accept="image/*" onChange={handleImageSelect} className="hidden" id="image-upload" />
                    <label htmlFor="image-upload" className="cursor-pointer">
                      {imagePreview ? (
                        <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded-xl" />
                      ) : (
                        <div className="text-muted-foreground">
                          <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          <p>Click to upload an image</p>
                        </div>
                      )}
                    </label>
                  </div>
                  <Button onClick={handleAnalyzeImage} disabled={analysisLoading || !selectedImage} className="w-full rounded-xl ios-bounce">
                    {analysisLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <ScanSearch className="w-4 h-4 mr-2" />}
                    Analyze Image
                  </Button>
                  {analysisResult && (
                    <div className="mt-6 p-4 bg-secondary rounded-xl">
                      <h3 className="font-semibold mb-2 text-foreground">Analysis Result:</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap">{analysisResult}</p>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Content Writer */}
              <TabsContent value="writer">
                <Card className="bg-card border border-border rounded-2xl p-6 shadow-ios">
                  <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Content Writer</h2>
                  <Textarea
                    placeholder="Enter a topic or prompt for content generation..."
                    value={writerPrompt}
                    onChange={(e) => setWriterPrompt(e.target.value)}
                    className="min-h-[120px] bg-secondary border-border rounded-xl mb-4 ios-transition focus:ring-2 focus:ring-foreground/20"
                  />
                  <Button onClick={handleGenerateContent} disabled={writerLoading} className="w-full rounded-xl ios-bounce">
                    {writerLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
                    Generate Content
                  </Button>
                  {writerResult && (
                    <div className="mt-6 p-4 bg-secondary rounded-xl">
                      <h3 className="font-semibold mb-2 text-foreground">Generated Content:</h3>
                      <div className="text-muted-foreground whitespace-pre-wrap">{writerResult}</div>
                    </div>
                  )}
                </Card>
              </TabsContent>

              {/* Slide Generator */}
              <TabsContent value="slides">
                <Card className="bg-card border border-border rounded-2xl p-6 shadow-ios">
                  <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Slide Generator</h2>
                  <Textarea
                    placeholder="Enter educational content to convert into slides..."
                    value={slidePrompt}
                    onChange={(e) => setSlidePrompt(e.target.value)}
                    className="min-h-[120px] bg-secondary border-border rounded-xl mb-4 ios-transition focus:ring-2 focus:ring-foreground/20"
                  />
                  <Button onClick={handleGenerateSlides} disabled={slideLoading} className="w-full rounded-xl ios-bounce">
                    {slideLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Presentation className="w-4 h-4 mr-2" />}
                    Generate Slides
                  </Button>
                  {slideResult && (
                    <div className="mt-6 p-4 bg-secondary rounded-xl">
                      <h3 className="font-semibold mb-2 text-foreground">Generated Slides:</h3>
                      <div className="text-muted-foreground whitespace-pre-wrap">{slideResult}</div>
                    </div>
                  )}
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </>
  );
};

export default TextGenerator;