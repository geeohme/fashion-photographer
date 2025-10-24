import type { AspectRatio, StyleOption } from '../types';

export const generateFashionImage = async (
    prompt: string, 
    style: StyleOption, 
    aspectRatio: AspectRatio,
    referenceImage: { base64: string; mimeType: string } | null
): Promise<string> => {
    const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, style, aspectRatio, referenceImage }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.imageUrl;
};


export const editImage = async (
    prompt: string, 
    imageBase64: string, 
    mimeType: string
): Promise<string> => {
    const response = await fetch('/api/edit', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, imageBase64, mimeType }),
    });

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'An unknown error occurred.' }));
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return data.imageUrl;
};
