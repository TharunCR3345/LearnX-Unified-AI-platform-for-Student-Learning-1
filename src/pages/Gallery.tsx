import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Download, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface GeneratedImage {
  id: string;
  prompt: string;
  image_url: string;
  created_at: string;
}

const Gallery = () => {
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);
  const { toast } = useToast();

  const fetchImages = async () => {
    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      setImages(data || []);
    } catch (error: unknown) {
      const err = error as Error;
      toast({ title: "Failed to load images", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();

    const channel = supabase
      .channel("gallery-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "generated_images" },
        () => fetchImages()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generated_images")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      toast({ title: "Image deleted successfully" });
      setSelectedImage(null);
    } catch (error: unknown) {
      const err = error as Error;
      toast({ title: "Failed to delete image", description: err.message, variant: "destructive" });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <>
      <Helmet>
        <title>Gallery - LearnX</title>
        <meta name="description" content="View and manage your AI-generated images in the LearnX gallery." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="relative z-10 container mx-auto px-4 pt-28 pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10 animate-fade-in-up opacity-0">
              <h1 className="font-display text-2xl md:text-3xl font-semibold mb-2 tracking-tight">
                Your Gallery
              </h1>
              <p className="text-muted-foreground text-sm">
                View and manage all your AI-generated images
              </p>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-foreground" />
              </div>
            ) : images.length === 0 ? (
              <Card className="bg-card border border-border rounded-2xl p-12 text-center shadow-ios animate-fade-in-up opacity-0 delay-100">
                <ImageIcon className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
                <h2 className="font-display text-lg font-semibold text-foreground mb-2">No images yet</h2>
                <p className="text-muted-foreground mb-6 text-sm">
                  Generate your first image to see it here.
                </p>
                <a href="/text-generator">
                  <Button className="rounded-xl ios-bounce">Generate Image</Button>
                </a>
              </Card>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-fade-in-up opacity-0 delay-100">
                {images.map((image, index) => (
                  <Card
                    key={image.id}
                    className="bg-card border border-border rounded-2xl overflow-hidden group cursor-pointer ios-transition hover:shadow-ios-lg hover:border-foreground/20 ios-bounce"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => setSelectedImage(image)}
                  >
                    <div className="aspect-square relative overflow-hidden">
                      <img
                        src={image.image_url}
                        alt={image.prompt}
                        className="w-full h-full object-cover ios-transition group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 ios-transition" />
                      <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 ios-transition">
                        <Button size="sm" className="w-full rounded-xl">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          View Details
                        </Button>
                      </div>
                    </div>
                    <div className="p-3">
                      <p className="text-sm text-foreground line-clamp-2 mb-1">{image.prompt}</p>
                      <p className="text-xs text-muted-foreground">{formatDate(image.created_at)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>

        <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
          <DialogContent className="max-w-2xl bg-card border border-border rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display font-semibold">Image Details</DialogTitle>
            </DialogHeader>
            {selectedImage && (
              <div className="space-y-4">
                <div className="rounded-xl overflow-hidden border border-border">
                  <img
                    src={selectedImage.image_url}
                    alt={selectedImage.prompt}
                    className="w-full max-h-[60vh] object-contain bg-secondary"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-semibold text-foreground text-sm">Prompt</h3>
                  <p className="text-muted-foreground text-sm">{selectedImage.prompt}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Generated on {formatDate(selectedImage.created_at)}
                </p>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    className="flex-1 rounded-xl ios-bounce"
                    onClick={() => {
                      const link = document.createElement('a');
                      link.href = selectedImage.image_url;
                      link.download = `learnx-image-${Date.now()}.png`;
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="destructive"
                    className="rounded-xl ios-bounce"
                    onClick={() => handleDelete(selectedImage.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
};

export default Gallery;