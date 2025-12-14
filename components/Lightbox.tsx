import React, { useState, useEffect } from 'react';
import { GalleryImage } from '../types';
import { X, ChevronLeft, ChevronRight, Sparkles, Loader2, Info, Edit3 } from 'lucide-react';
import { analyzeImage } from '../services/geminiService';
import { ImageEditor } from './ImageEditor';

interface LightboxProps {
  image: GalleryImage;
  isOpen: boolean;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
  hasNext: boolean;
  hasPrev: boolean;
  onUpdateImage: (id: string, updates: Partial<GalleryImage>) => void;
}

export const Lightbox: React.FC<LightboxProps> = ({
  image,
  isOpen,
  onClose,
  onNext,
  onPrev,
  hasNext,
  hasPrev,
  onUpdateImage
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showInfo, setShowInfo] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // Reset states when image changes
  useEffect(() => {
    setIsEditing(false);
  }, [image.id]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen || isEditing) return; // Disable Nav keys when editing
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight' && hasNext) onNext();
      if (e.key === 'ArrowLeft' && hasPrev) onPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrev, onClose, onNext, onPrev, isEditing]);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!image.isUserUploaded) {
      alert("AI Analysis is only available for user-uploaded images due to cross-origin security restrictions on demo images.");
      return;
    }
    
    setIsAnalyzing(true);
    try {
      const description = await analyzeImage(image.src);
      onUpdateImage(image.id, { description });
    } catch (error) {
      console.error(error);
      alert("Failed to analyze image.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSaveEdit = (newSrc: string) => {
    onUpdateImage(image.id, { src: newSrc });
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 animate-fade-in p-4">
         <div className="w-full h-full max-w-6xl max-h-[90vh]">
            <ImageEditor 
              src={image.src} 
              onSave={handleSaveEdit} 
              onCancel={() => setIsEditing(false)} 
            />
         </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/98 backdrop-blur-md animate-fade-in">
      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors z-50"
      >
        <X size={24} />
      </button>

      {/* Navigation Buttons */}
      {hasPrev && (
        <button
          onClick={(e) => { e.stopPropagation(); onPrev(); }}
          className="absolute left-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110 z-40 hidden md:block"
        >
          <ChevronLeft size={32} />
        </button>
      )}
      
      {hasNext && (
        <button
          onClick={(e) => { e.stopPropagation(); onNext(); }}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-3 text-white/70 hover:text-white bg-white/10 hover:bg-white/20 rounded-full transition-all hover:scale-110 z-40 hidden md:block"
        >
          <ChevronRight size={32} />
        </button>
      )}

      {/* Main Content */}
      <div className="relative w-full h-full flex flex-col md:flex-row max-w-7xl mx-auto p-4 md:p-8 gap-4">
        
        {/* Image Container */}
        <div className="flex-1 relative flex items-center justify-center min-h-0">
          <img
            src={image.src}
            alt={image.title}
            className="max-h-full max-w-full object-contain rounded-lg shadow-2xl"
          />
        </div>

        {/* Info Sidebar (Desktop) / Bottom Sheet (Mobile) */}
        <div className={`
          w-full md:w-80 lg:w-96 bg-neutral-900/90 backdrop-blur-md border border-neutral-800 rounded-xl p-6 flex flex-col gap-4 transition-all duration-300
          ${showInfo ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-10 hidden'}
        `}>
          <div>
            <div className="flex justify-between items-start mb-2">
              <span className="inline-block px-2 py-1 text-xs font-semibold tracking-wide text-indigo-300 uppercase bg-indigo-500/20 rounded-md">
                {image.category}
              </span>
              <button 
                onClick={() => setIsEditing(true)}
                className="p-2 -mr-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors group relative"
                title="Edit Image"
              >
                <Edit3 size={20} />
                <span className="absolute right-full mr-2 top-1/2 -translate-y-1/2 px-2 py-1 bg-black text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  Edit Image
                </span>
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">{image.title}</h2>
            
            <div className="prose prose-invert prose-sm max-h-60 overflow-y-auto custom-scrollbar">
              {image.description ? (
                <p className="whitespace-pre-line text-neutral-300 leading-relaxed">
                  {image.description}
                </p>
              ) : (
                <p className="text-neutral-500 italic">No description available.</p>
              )}
            </div>
          </div>

          <div className="mt-auto border-t border-neutral-800 pt-4 space-y-3">
             {/* Edit Button for Mobile (Main visible button is small icon above on desktop) */}
             <button
              onClick={() => setIsEditing(true)}
              className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-neutral-800 hover:bg-neutral-700 text-neutral-200 rounded-lg font-medium transition-all"
            >
              <Edit3 size={18} />
              Edit Image
            </button>

            {image.isUserUploaded ? (
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg font-medium transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="animate-spin" size={18} />
                    Analyzing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="group-hover:text-yellow-200 transition-colors" />
                    Ask AI to Describe
                  </>
                )}
              </button>
            ) : (
               <div className="text-xs text-neutral-500 text-center p-2 bg-neutral-800/50 rounded">
                 AI analysis available for uploaded images only.
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};