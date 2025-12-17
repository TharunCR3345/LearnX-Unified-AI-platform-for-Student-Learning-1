import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { content } = await req.json();
    console.log('Analyzing content for slides, length:', content.length);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('LOVABLE_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are an expert presentation designer who creates clear, visually-oriented slide content. You excel at breaking down complex information into digestible slides with clear titles, bullet points, and speaker notes.'
          },
          {
            role: 'user',
            content: `Analyze the following content and create a professional presentation outline with slides.

Content to analyze:
${content}

For each slide, provide:
1. **Slide Title**: A clear, concise title
2. **Key Points**: 3-5 bullet points (keep each brief - max 10 words)
3. **Visual Suggestion**: What image or diagram would enhance this slide
4. **Speaker Notes**: Brief notes for the presenter

Create 5-8 slides that effectively communicate the main ideas. Format each slide clearly.`
          }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API error:', errorText);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    console.log('Slides generated successfully');

    const slides = data.choices?.[0]?.message?.content || 'Unable to generate slides.';

    return new Response(
      JSON.stringify({ slides }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Error in analyze-text-for-slides function:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});