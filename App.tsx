import React, { useState, useCallback } from 'react';
import { generateImage, editImage } from './services/geminiService';
import { downloadImage } from './utils/fileUtils';
import { Header } from './components/Header';
import { ImageDisplay } from './components/ImageDisplay';
import { Controls } from './components/Controls';

const App: React.FC = () => {
  const [generatePrompt, setGeneratePrompt] = useState<string>('');
  const [editPrompt, setEditPrompt] = useState<string>('');
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [originalImageUrl, setOriginalImageUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = useCallback(async () => {
    if (!generatePrompt.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setImageUrl(null);
    setOriginalImageUrl(null);

    try {
      const resultUrl = await generateImage(generatePrompt);
      setImageUrl(resultUrl);
      setOriginalImageUrl(resultUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image generation.');
    } finally {
      setIsLoading(false);
    }
  }, [generatePrompt, isLoading]);

  const handleEdit = useCallback(async () => {
    if (!editPrompt.trim() || !originalImageUrl || isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const resultUrl = await editImage(editPrompt, originalImageUrl);
      setImageUrl(resultUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred during image editing.');
    } finally {
      setIsLoading(false);
    }
  }, [editPrompt, originalImageUrl, isLoading]);

  const handleDownload = useCallback(() => {
    if (imageUrl) {
      downloadImage(imageUrl, `gemini-image-${Date.now()}.png`);
    }
  }, [imageUrl]);
  
  const handleNewImage = useCallback(() => {
    setImageUrl(null);
    setOriginalImageUrl(null);
    setGeneratePrompt('');
    setEditPrompt('');
    setError(null);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-gray-100 font-sans">
      <Header />
      <main className="flex-grow container mx-auto p-4 lg:p-8 flex flex-col lg:flex-row gap-8">
        <div className="lg:w-1/3 flex flex-col space-y-8">
          <Controls
            generatePrompt={generatePrompt}
            setGeneratePrompt={setGeneratePrompt}
            onGenerate={handleGenerate}
            editPrompt={editPrompt}
            setEditPrompt={setEditPrompt}
            onEdit={handleEdit}
            isLoading={isLoading}
            hasImage={!!originalImageUrl}
            onNewImage={handleNewImage}
          />
        </div>
        <div className="lg:w-2/3 flex flex-col">
          <ImageDisplay
            imageUrl={imageUrl}
            isLoading={isLoading}
            error={error}
            onDownload={handleDownload}
          />
        </div>
      </main>
    </div>
  );
};

export default App;