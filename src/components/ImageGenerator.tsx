import React, { useState, useRef } from 'react';
import { generateFashionImage } from '../services/geminiService';
import type { StyleOption } from '../types';
import { STYLE_OPTIONS, SIZE_OPTIONS } from '../types';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { DownloadIcon, ArrowUpTrayIcon, XCircleIcon } from './ui/Icons';

const ImageGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('A 26 year old female Vietnamese model with black hair, sparkling brown eyes wearing a butterfly patterned midi dress, standing in a Parisian street in the afternoon.');
  const [style, setStyle] = useState<StyleOption>(STYLE_OPTIONS[0]);
  const [sizeKey, setSizeKey] = useState<string>(Object.keys(SIZE_OPTIONS)[0]);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<{ file: File, dataUrl: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReferenceImage({ file, dataUrl: reader.result as string });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setReferenceImage(null);
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  const handleGenerate = async () => {
    if (!prompt) {
      setError('Please enter a description for the image.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setGeneratedImage(null);
    try {
      const aspectRatio = SIZE_OPTIONS[sizeKey].aspectRatio;
      const refImagePayload = referenceImage ? {
          base64: referenceImage.dataUrl.split(',')[1],
          mimeType: referenceImage.file.type
      } : null;

      const imageUrl = await generateFashionImage(prompt, style, aspectRatio, refImagePayload);
      setGeneratedImage(imageUrl);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <Card className="flex flex-col gap-6">
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-300 mb-2">
            1. Describe Your Vision
          </label>
          <textarea
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A model in a futuristic silver jacket..."
            className="w-full h-32 p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-pink-500 focus:border-pink-500 transition"
          />
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-3">2. Choose a Style</h3>
          <div className="grid grid-cols-2 gap-3">
            {STYLE_OPTIONS.map((styleOption) => (
              <button
                key={styleOption}
                onClick={() => setStyle(styleOption)}
                className={`px-4 py-2 text-sm rounded-md transition-all duration-200 border-2 ${
                  style === styleOption
                    ? 'bg-pink-500 border-pink-500 text-white font-semibold'
                    : 'bg-gray-700 border-gray-600 hover:border-pink-400'
                }`}
              >
                {styleOption}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label htmlFor="size" className={`block text-sm font-medium text-gray-300 mb-2 transition-colors ${!!referenceImage ? 'text-gray-500' : ''}`}>
            3. Select Image Size
          </label>
          <select
            id="size"
            value={sizeKey}
            onChange={(e) => setSizeKey(e.target.value)}
            disabled={!!referenceImage}
            className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-pink-500 focus:border-pink-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {Object.entries(SIZE_OPTIONS).map(([key, { label }]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
           {referenceImage && <p className="text-xs text-gray-400 mt-2">Image size is determined by the reference image's aspect ratio.</p>}
        </div>
        
        <div>
          <h3 className="text-sm font-medium text-gray-300 mb-2">4. (Optional) Use a Character Reference</h3>
           <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
          />
          {referenceImage ? (
              <div className="relative group w-full max-w-sm mx-auto rounded-lg overflow-hidden border-2 border-gray-600">
                  <img src={referenceImage.dataUrl} alt="Reference" className="w-full h-full object-contain" />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-60 transition-all flex items-center justify-center">
                      <button
                          onClick={handleRemoveImage}
                          className="bg-red-600 text-white p-2 rounded-full hover:bg-red-700 transition-all opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100"
                          aria-label="Remove reference image"
                      >
                          <XCircleIcon className="w-6 h-6" />
                      </button>
                  </div>
              </div>
          ) : (
              <button
                  onClick={triggerFileSelect}
                  className="w-full h-32 border-2 border-dashed border-gray-600 rounded-lg flex flex-col items-center justify-center text-gray-400 hover:bg-gray-700/50 hover:border-pink-500 transition-all"
              >
                  <ArrowUpTrayIcon className="w-8 h-8 mb-2 text-gray-500" />
                  <span className="font-semibold">Upload Image</span>
                  <span className="text-xs">For character reference</span>
              </button>
          )}
        </div>
        
        <Button onClick={handleGenerate} disabled={isLoading} className="w-full justify-center text-lg py-3 mt-4">
          {isLoading ? 'Generating...' : 'Generate Image'}
        </Button>
      </Card>

      <Card className="flex items-center justify-center min-h-[400px] lg:min-h-0">
        {isLoading && <Spinner text="Conjuring up your masterpiece... this may take a moment." />}
        {error && <p className="text-red-400 text-center">{error}</p>}
        {generatedImage && !isLoading && (
          <div className="w-full h-full relative group">
            <img src={generatedImage} alt="Generated fashion" className="w-full h-full object-contain rounded-lg" />
            <a
              href={generatedImage}
              download="fashion-photograph.jpg"
              className="absolute bottom-4 right-4 bg-black bg-opacity-60 text-white p-3 rounded-full hover:bg-opacity-80 transition-opacity duration-300 opacity-0 group-hover:opacity-100"
              aria-label="Download image"
            >
              <DownloadIcon className="w-6 h-6" />
            </a>
          </div>
        )}
        {!isLoading && !error && !generatedImage && (
          <div className="text-center text-gray-500">
            <p className="text-lg font-medium">Your generated image will appear here.</p>
            <p className="text-sm">Fill out the details and click "Generate".</p>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ImageGenerator;
