import { GoogleGenAI, Modality } from "@google/genai";

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
const ai = GEMINI_API_KEY ? new GoogleGenAI({ apiKey: GEMINI_API_KEY }) : null;

export const getInsightsFromGemini = async (): Promise<string> => {
    const prompt = `
      You are Brainy the Owl, a fun and wise character who helps kids and parents understand screen time.
      Provide one short, friendly, and memorable tip about the potential damage of too much screen time, playing too many games, or watching junk on YouTube.
      - The message should be easy for a child to understand.
      - Start with a fun greeting like "Hoo-hoo!" or "Guess what!".
      - Keep it to a single sentence or two.
      - Do not use markdown or lists.
      - Be encouraging, not scary.
      - Do not include a preamble or a conclusion.
    `;

    try {
        if (!ai) {
          return "Hoo-hoo! Little breaks from screens help your eyes and brain feel great!";
        }
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });

        // SDK returns an object with a text() method in recent versions
        // Fallback to string if not available
        // @ts-ignore
        return typeof response.text === 'function' ? response.text() : (response.text || "Hoo-hoo! Remember to take screen breaks!");
    } catch (error) {
        console.error("Error calling Gemini API:", error);
        throw new Error("Failed to get insights from Gemini API.");
    }
};

export const generateSpeech = async (text: string): Promise<string | null> => {
    try {
        if (!ai) return null;
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text }] }],
            config: {
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                      // Using 'Kore' for a friendly, kiddy voice
                      prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        return base64Audio || null;
    } catch (error) {
        console.error("Error calling Gemini TTS API:", error);
        return null;
    }
};