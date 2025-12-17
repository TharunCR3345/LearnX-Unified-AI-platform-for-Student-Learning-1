import { useState, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Label } from "@/components/ui/label";
import { AudioLines, Mic, Loader2, Play, Pause, Upload, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Helmet } from "react-helmet-async";

const AudioGenerator = () => {
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get("tab") || "tts";
  const [activeTab, setActiveTab] = useState(initialTab);
  const { toast } = useToast();

  // Text to Speech state
  const [ttsText, setTtsText] = useState("");
  const [rate, setRate] = useState([1]);
  const [pitch, setPitch] = useState([1]);
  const [volume, setVolume] = useState([1]);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Speech to Text state
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [transcription, setTranscription] = useState<string | null>(null);
  const [sttLoading, setSttLoading] = useState(false);

  const handleSpeak = () => {
    if (!ttsText.trim()) {
      toast({ title: "Please enter text to speak", variant: "destructive" });
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(ttsText);
    utterance.rate = rate[0];
    utterance.pitch = pitch[0];
    utterance.volume = volume[0];
    
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => {
      setIsSpeaking(false);
      toast({ title: "Speech synthesis failed", variant: "destructive" });
    };

    speechRef.current = utterance;
    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleStop = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  };

  const handleAudioSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
    }
  };

  const handleTranscribe = async () => {
    if (!audioFile) {
      toast({ title: "Please select an audio file", variant: "destructive" });
      return;
    }

    setSttLoading(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(",")[1];
        const { data, error } = await supabase.functions.invoke("speech-to-text", {
          body: { audio: base64, mimeType: audioFile.type },
        });
        if (error) throw error;
        setTranscription(data.text);
        toast({ title: "Transcription complete!" });
      };
      reader.readAsDataURL(audioFile);
    } catch (error: any) {
      toast({ title: "Failed to transcribe audio", description: error.message, variant: "destructive" });
    } finally {
      setSttLoading(false);
    }
  };

  return (
    <>
      <Helmet>
        <title>Audio - LearnX</title>
        <meta name="description" content="Convert text to speech and transcribe audio to text with AI-powered tools." />
      </Helmet>
      <div className="min-h-screen bg-background">
        <Navbar />

        <main className="relative z-10 container mx-auto px-4 pt-28 pb-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="font-display text-2xl md:text-3xl font-semibold mb-6 text-center animate-fade-in-up opacity-0 tracking-tight">
              Audio Tools
            </h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in-up opacity-0 delay-100">
              <TabsList className="grid grid-cols-2 mb-6 bg-secondary rounded-2xl p-1 max-w-sm mx-auto h-auto">
                <TabsTrigger value="tts" className="rounded-xl py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-ios ios-transition">
                  <AudioLines className="w-4 h-4 mr-2" />
                  Text to Speech
                </TabsTrigger>
                <TabsTrigger value="stt" className="rounded-xl py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-ios ios-transition">
                  <Mic className="w-4 h-4 mr-2" />
                  Speech to Text
                </TabsTrigger>
              </TabsList>

              {/* Text to Speech */}
              <TabsContent value="tts">
                <Card className="bg-card border border-border rounded-2xl p-6 shadow-ios">
                  <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Text to Speech</h2>
                  <Textarea
                    placeholder="Enter text to convert to speech..."
                    value={ttsText}
                    onChange={(e) => setTtsText(e.target.value)}
                    className="min-h-[150px] bg-secondary border-border rounded-xl mb-6 ios-transition focus:ring-2 focus:ring-foreground/20"
                  />

                  <div className="grid gap-5 mb-6">
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Speed: {rate[0].toFixed(1)}x</Label>
                      <Slider value={rate} onValueChange={setRate} min={0.5} max={2} step={0.1} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Pitch: {pitch[0].toFixed(1)}</Label>
                      <Slider value={pitch} onValueChange={setPitch} min={0.5} max={2} step={0.1} className="w-full" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-foreground text-sm">Volume: {Math.round(volume[0] * 100)}%</Label>
                      <Slider value={volume} onValueChange={setVolume} min={0} max={1} step={0.1} className="w-full" />
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleSpeak} className="flex-1 rounded-xl ios-bounce">
                      {isSpeaking ? <Pause className="w-4 h-4 mr-2" /> : <Play className="w-4 h-4 mr-2" />}
                      {isSpeaking ? "Pause" : "Play"}
                    </Button>
                    {isSpeaking && (
                      <Button onClick={handleStop} variant="outline" className="rounded-xl ios-bounce">
                        <Square className="w-4 h-4 mr-2" />
                        Stop
                      </Button>
                    )}
                  </div>
                </Card>
              </TabsContent>

              {/* Speech to Text */}
              <TabsContent value="stt">
                <Card className="bg-card border border-border rounded-2xl p-6 shadow-ios">
                  <h2 className="font-display text-lg font-semibold mb-4 text-foreground">Speech to Text</h2>
                  <div className="border-2 border-dashed border-border rounded-2xl p-8 text-center mb-4 ios-transition hover:border-foreground/30">
                    <input type="file" accept="audio/*" onChange={handleAudioSelect} className="hidden" id="audio-upload" />
                    <label htmlFor="audio-upload" className="cursor-pointer">
                      <div className="text-muted-foreground">
                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        {audioFile ? (
                          <p className="text-foreground font-medium">{audioFile.name}</p>
                        ) : (
                          <p>Click to upload an audio file</p>
                        )}
                        <p className="text-sm mt-1">Supports MP3, WAV, M4A, and more</p>
                      </div>
                    </label>
                  </div>
                  
                  <Button onClick={handleTranscribe} disabled={sttLoading || !audioFile} className="w-full rounded-xl ios-bounce">
                    {sttLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Mic className="w-4 h-4 mr-2" />}
                    Transcribe Audio
                  </Button>

                  {transcription && (
                    <div className="mt-6 p-4 bg-secondary rounded-xl">
                      <h3 className="font-semibold mb-2 text-foreground text-sm">Transcription:</h3>
                      <p className="text-muted-foreground whitespace-pre-wrap text-sm">{transcription}</p>
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

export default AudioGenerator;