import { GoogleGenAI } from "@google/genai";
import { Coordinates, SearchResult, RestroomPlace, GroundingChunk } from '../types';

// Filter out generic markers that aren't specific businesses
const isGenericRestroomTitle = (title: string): boolean => {
  const genericTerms = [
    'restroom', 'public restroom', 'bathroom', 'public bathroom', 
    'toilet', 'public toilet', 'men\'s room', 'women\'s room', 
    'wc', 'comfort station', 'lavatory', 'mens room', 'womens room',
    'restrooms', 'toilets'
  ];
  const lowerTitle = title.toLowerCase().trim();
  return genericTerms.some(term => lowerTitle === term || lowerTitle === `public ${term}`);
};

export const findRestroomsNearby = async (coords: Coordinates): Promise<SearchResult> => {
  try {
    // Check for API Key immediately
    if (!process.env.API_KEY) {
      throw new Error("MISSING_API_KEY");
    }

    // Initialize client inside the function to ensure process.env is ready and prevent top-level crashes
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const model = 'gemini-2.5-flash';
    
    const prompt = `
      I am currently located at Latitude: ${coords.latitude}, Longitude: ${coords.longitude}.

      Find the ABSOLUTE NEAREST public restrooms or businesses (like cafes, fast food chains, bookstores, public parks, supermarkets) that likely have a restroom.
      
      CRITICAL INSTRUCTIONS: 
      1. STRICTLY limit results to the immediate walking vicinity (within 500-800 meters or a 5-10 minute walk). Do NOT return places that require driving.
      2. Exclude generic markers like "Public Restroom" or "Toilet" unless they are the only options. Specific businesses like "Starbucks", "McDonald's", "City Park", etc. are preferred.
      3. List the closest options first.
      4. If a place is a business (like a restaurant), assume it has a restroom for customers.

      Provide a helpful, friendly summary of the best options found. 
      Format the summary with clear paragraph breaks (blank lines) between different recommendations to make it easy to read. 
      Do not stick all text together.
    `;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        tools: [{ googleMaps: {} }],
        toolConfig: {
          retrievalConfig: {
            latLng: {
              latitude: coords.latitude,
              longitude: coords.longitude
            }
          }
        }
      },
    });

    const text = response.text || "No specific details found.";
    
    // Extract grounding chunks to build our structured list
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks as GroundingChunk[] | undefined;
    const places: RestroomPlace[] = [];

    if (chunks) {
      chunks.forEach((chunk) => {
        if (chunk.maps) {
          // Filter out generic titles if possible
          if (!isGenericRestroomTitle(chunk.maps.title)) {
            places.push({
              title: chunk.maps.title,
              uri: chunk.maps.uri,
              source: 'maps',
              // Note: Review snippets are not reliable addresses, so we omit address here 
              // and let the user rely on the card title + "Get Directions"
            });
          }
        } else if (chunk.web) {
          places.push({
            title: chunk.web.title,
            uri: chunk.web.uri,
            source: 'web'
          });
        }
      });
    }

    // Deduplicate places based on URI
    const uniquePlaces = Array.from(new Map(places.map(item => [item.uri, item])).values());

    return {
      textSummary: text,
      places: uniquePlaces,
    };

  } catch (error: any) {
    console.error("Error fetching restrooms:", error);
    if (error.message === "MISSING_API_KEY") {
        throw new Error("API Key is missing. Please add API_KEY to Vercel Environment Variables.");
    }
    throw error;
  }
};