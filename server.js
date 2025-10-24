import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'dist')));

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }
    return new GoogleGenAI({ apiKey });
}

app.post('/api/generate', async (req, res) => {
    const { prompt, style, aspectRatio, referenceImage } = req.body;
    
    if (!prompt || !style) {
        return res.status(400).json({ error: 'Prompt and style are required.' });
    }

    try {
        const ai = getAiClient();

        if (referenceImage) {
            if(!referenceImage.base64 || !referenceImage.mimeType) {
                 return res.status(400).json({ error: 'Reference image must include base64 data and mimeType.' });
            }
            // Use Gemini 2.5 Flash Image for character consistency
            const fullPrompt = `A high-end, realistic fashion photograph of the person in the image. Style: ${style}. Subject: ${prompt}. Maintain the person's facial features and identity from the provided image.`;
            
            const imagePart = {
                inlineData: {
                    data: referenceImage.base64,
                    mimeType: referenceImage.mimeType,
                },
            };
    
            const textPart = {
                text: fullPrompt,
            };
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash-image',
                contents: {
                  parts: [imagePart, textPart],
                },
                config: {
                    responseModalities: [Modality.IMAGE],
                },
            });
            
            for (const part of response.candidates[0].content.parts) {
                if (part.inlineData) {
                    const base64ImageBytes = part.inlineData.data;
                    const imageMimeType = part.inlineData.mimeType;
                    return res.json({ imageUrl: `data:${imageMimeType};base64,${base64ImageBytes}` });
                }
            }
            throw new Error("Image generation with reference failed, no image data in response.");

        } else {
            if (!aspectRatio) {
                 return res.status(400).json({ error: 'AspectRatio is required for text-to-image generation.' });
            }
            // Use Imagen for high-quality generation from text
            const fullPrompt = `A high-end, realistic fashion photograph. Style: ${style}. Subject: ${prompt}.`;
            
            const response = await ai.models.generateImages({
                model: 'imagen-4.0-generate-001',
                prompt: fullPrompt,
                config: {
                  numberOfImages: 1,
                  outputMimeType: 'image/jpeg',
                  aspectRatio: aspectRatio,
                },
            });
    
            if (response.generatedImages && response.generatedImages.length > 0) {
                const base64ImageBytes = response.generatedImages[0].image.imageBytes;
                return res.json({ imageUrl: `data:image/jpeg;base64,${base64ImageBytes}` });
            } else {
                throw new Error("Image generation failed, no images returned.");
            }
        }
    } catch (error) {
        console.error("Error in /api/generate:", error);
        res.status(500).json({ error: error.message || "Failed to generate image." });
    }
});

app.post('/api/edit', async (req, res) => {
    const { prompt, imageBase64, mimeType } = req.body;

    if (!prompt || !imageBase64 || !mimeType) {
        return res.status(400).json({ error: 'Prompt, imageBase64, and mimeType are required.' });
    }

    try {
        const ai = getAiClient();
        
        const imagePart = {
            inlineData: {
                data: imageBase64,
                mimeType: mimeType,
            },
        };

        const textPart = {
            text: prompt,
        };
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash-image',
            contents: {
              parts: [imagePart, textPart],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });
        
        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                const base64ImageBytes = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return res.json({ imageUrl: `data:${imageMimeType};base64,${base64ImageBytes}` });
            }
        }
        
        throw new Error("Image editing failed, no image data in response.");

    } catch (error) {
        console.error("Error in /api/edit:", error);
        res.status(500).json({ error: error.message || "Failed to edit image." });
    }
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
