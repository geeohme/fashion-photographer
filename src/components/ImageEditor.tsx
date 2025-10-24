import React, { useState, useRef } from 'react';
import { editImage } from '../services/geminiService';
import { Button } from './ui/Button';
import { Card } from './ui/Card';
import { Spinner } from './ui/Spinner';
import { ArrowPathIcon, PhotoIcon, SparklesIcon, ArrowRightIcon } from './ui/Icons';

const ImageEditor: React.FC = () => {
  const [prompt, setPrompt] = useState<string>('Add a retro, vintage film filter.');
  const [originalImage, setOriginalImage] = useState<{ file: File, dataUrl: string } | null>(null);
  const [editedImage, setEditedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setOriginalImage({ file, dataUrl: reader.result as string });
        setEditedImage(null);
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleEdit = async () => {
    if (!originalImage || !prompt) {
      setError('Please upload an image and provide an editing prompt.');
      return;
    }
    setIsLoading(true);
    setError(null);
    setEditedImage(null);
    try {
      const base64Data = originalImage.dataUrl.split(',')[1];
      const mimeType = originalImage.file.type;
      const resultUrl = await editImage(prompt, base64Data, mimeType);
      setEditedImage(resultUrl);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred during editing.');
    } finally {
      setIsLoading(false);
    }
  };

  const triggerFileSelect = () => fileInputRef.current?.click();

  return (
    <div>
      <Card className="mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-2">
                <label htmlFor="edit-prompt" className="block text-sm font-medium text-gray-300 mb-2">
                    Editing Instruction
                </label>
                <input
                    id="edit-prompt"
                    type="text"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="e.g., Change the background to a beach"
                    className="w-full p-3 bg-gray-700 border border-gray-600 rounded-md focus:ring-pink-500 focus:border-pink-500 transition"
                />
            </div>
          <Button onClick={handleEdit} disabled={isLoading || !originalImage} className="w-full justify-center text-lg py-3">
             {isLoading ? <><Spinner/></> : <><SparklesIcon className="w-5 h-5 mr-2" /> Apply Edit</>}
          </Button>
        </div>
      </Card>
      
      {error && <p className="text-red-400 text-center mb-4 p-3 bg-red-900/50 rounded-md">{error}</p>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-300 text-center">Original Image</h3>
          <Card className="aspect-[3/4] flex items-center justify-center">
            {originalImage ? (
              <img src={originalImage.dataUrl} alt="Original" className="max-h-full max-w-full object-contain rounded-lg" />
            ) : (
              <div className="text-center text-gray-500 p-8">
                <PhotoIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p className="font-semibold mb-2">Upload an image to start editing.</p>
                <Button onClick={triggerFileSelect} variant="secondary">Select File</Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                />
              </div>
            )}
          </Card>
           {originalImage && (
             <Button onClick={triggerFileSelect} variant="secondary" className="w-full justify-center">
                <ArrowPathIcon className="w-5 h-5 mr-2" />
                Change Image
            </Button>
           )}
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="text-lg font-semibold text-gray-300 text-center">Edited Image</h3>
          <Card className="aspect-[3/4] flex items-center justify-center">
            {isLoading && <Spinner text="Applying magical edits..." />}
            {editedImage && !isLoading && (
              <img src={editedImage} alt="Edited" className="max-h-full max-w-full object-contain rounded-lg" />
            )}
            {!isLoading && !editedImage && (
              <div className="text-center text-gray-500">
                <ArrowRightIcon className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                <p>Your edited image will appear here.</p>
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
