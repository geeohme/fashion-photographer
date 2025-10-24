import { GoogleGenAI, Modality } from "@google/genai";
import type { AspectRatio, StyleOption } from '../types';

const getAiClient = () => {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
        throw new Error("API_KEY environment variable is not set.");
    }
    return new GoogleGenAI({ apiKey });
}

export const generateFashionImage = async (
    prompt: string, 
    style: StyleOption, 
    aspectRatio: AspectRatio,
    referenceImage: { base64: string; mimeType: string } | null
): Promise<string> => {
    try {
        const ai = getAiClient();

        if (referenceImage) {
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
                    const base64ImageBytes: string = part.inlineData.data;
                    const imageMimeType = part.inlineData.mimeType;
                    return `data:${imageMimeType};base64,${base64ImageBytes}`;
                }
            }
            
            throw new Error("Image generation with reference failed, no image data in response.");

        } else {
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
                return `data:image/jpeg;base64,${base64ImageBytes}`;
            } else {
                throw new Error("Image generation failed, no images returned.");
            }
        }
    } catch (error) {
        console.error("Error generating image:", error);
        throw new Error("Failed to generate image. Please check your prompt and API key.");
    }
};


export const editImage = async (
    prompt: string, 
    imageBase64: string, 
    mimeType: string
): Promise<string> => {
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
                const base64ImageBytes: string = part.inlineData.data;
                const imageMimeType = part.inlineData.mimeType;
                return `data:${imageMimeType};base64,${base64ImageBytes}`;
            }
        }
        
        throw new Error("Image editing failed, no image data in response.");

    } catch (error) {
        console.error("Error editing image:", error);
        throw new Error("Failed to edit image. Please check your prompt and uploaded image.");
    }
};