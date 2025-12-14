import React, { useState, useRef, useEffect } from 'react';
import { Save, X, RotateCcw, Sun, Moon, Droplet, Layers, Aperture, Circle, Sliders, Type } from 'lucide-react';

interface ImageEditorProps {
  src: string;
  onSave: (newSrc: string) => void;
  onCancel: () => void;
}

interface FilterState {
  brightness: number;
  contrast: number;
  saturate: number;
  grayscale: number;
  sepia: number;
  hueRotate: number;
  blur: number;
  vignette: number;
}

const INITIAL_FILTERS: FilterState = {
  brightness: 100,
  contrast: 100,
  saturate: 100,
  grayscale: 0,
  sepia: 0,
  hueRotate: 0,
  blur: 0,
  vignette: 0,
};

export const ImageEditor: React.FC<ImageEditorProps> = ({ src, onSave, onCancel }) => {
  const [filters, setFilters] = useState<FilterState>(INITIAL_FILTERS);
  const [activeTab, setActiveTab] = useState<'adjust' | 'presets'>('adjust');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleFilterChange = (key: keyof FilterState, value: number) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleReset = () => {
    setFilters(INITIAL_FILTERS);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const img = imageRef.current;
    const canvas = canvasRef.current;
    
    if (!img || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match actual image size
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    // Apply CSS filters context
    // Note: ctx.filter is supported in most modern browsers (Chrome/Firefox/Edge)
    const filterString = `
      brightness(${filters.brightness}%) 
      contrast(${filters.contrast}%) 
      saturate(${filters.saturate}%) 
      grayscale(${filters.grayscale}%) 
      sepia(${filters.sepia}%) 
      hue-rotate(${filters.hueRotate}deg) 
      blur(${filters.blur}px)
    `;
    
    ctx.filter = filterString.trim();
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    
    // Apply Vignette manually as ctx.filter doesn't support it directly in the same way
    if (filters.vignette > 0) {
      ctx.filter = 'none'; // Reset filter for overlay
      ctx.globalCompositeOperation = 'source-over';
      const gradient = ctx.createRadialGradient(
        canvas.width / 2, 
        canvas.height / 2, 
        Math.max(canvas.width, canvas.height) * 0.3, // Inner radius 
        canvas.width / 2, 
        canvas.height / 2, 
        Math.max(canvas.width, canvas.height) * 0.8  // Outer radius
      );
      gradient.addColorStop(0, 'rgba(0,0,0,0)');
      gradient.addColorStop(1, `rgba(0,0,0,${filters.vignette / 100})`);
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // Convert to base64
    const newSrc = canvas.toDataURL('image/jpeg', 0.9);
    onSave(newSrc);
    setIsSaving(false);
  };

  const filterControls = [
    { key: 'brightness', label: 'Brightness', icon: Sun, min: 0, max: 200, step: 1 },
    { key: 'contrast', label: 'Contrast', icon: Moon, min: 0, max: 200, step: 1 },
    { key: 'saturate', label: 'Saturation', icon: Droplet, min: 0, max: 200, step: 1 },
    { key: 'hueRotate', label: 'Hue', icon: Layers, min: 0, max: 360, step: 1 },
    { key: 'sepia', label: 'Sepia', icon: Aperture, min: 0, max: 100, step: 1 },
    { key: 'grayscale', label: 'Grayscale', icon: Circle, min: 0, max: 100, step: 1 },
    { key: 'blur', label: 'Blur', icon: Sliders, min: 0, max: 20, step: 0.1 },
    { key: 'vignette', label: 'Vignette', icon: Circle, min: 0, max: 100, step: 1 },
  ];

  return (
    <div className="flex flex-col md:flex-row h-full w-full bg-black text-neutral-100 rounded-xl overflow-hidden animate-fade-in border border-neutral-800">
      {/* Hidden Canvas for processing */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Image Preview Area */}
      <div className="flex-1 relative bg-black flex items-center justify-center p-4 overflow-hidden">
        <div className="relative max-w-full max-h-full shadow-2xl">
           <img
            ref={imageRef}
            src={src}
            alt="Editing preview"
            className="max-w-full max-h-[80vh] object-contain transition-all duration-100"
            style={{
              filter: `
                brightness(${filters.brightness}%) 
                contrast(${filters.contrast}%) 
                saturate(${filters.saturate}%) 
                grayscale(${filters.grayscale}%) 
                sepia(${filters.sepia}%) 
                hue-rotate(${filters.hueRotate}deg) 
                blur(${filters.blur}px)
              `
            }}
          />
          {/* Vignette Overlay for Preview */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(circle, transparent 30%, rgba(0,0,0, ${filters.vignette / 100}) 100%)`
            }}
          />
        </div>
      </div>

      {/* Controls Sidebar */}
      <div className="w-full md:w-80 bg-neutral-900 border-l border-neutral-800 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between">
          <h3 className="font-bold text-lg flex items-center gap-2">
            <Sliders size={20} className="text-indigo-400" />
            Editor
          </h3>
          <button 
            onClick={handleReset}
            className="text-xs text-neutral-400 hover:text-white flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={14} /> Reset
          </button>
        </div>

        {/* Scrollable Controls */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {filterControls.map((control) => {
            const Icon = control.icon;
            return (
              <div key={control.key} className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-neutral-400 uppercase tracking-wide">
                  <span className="flex items-center gap-2">
                    <Icon size={14} /> {control.label}
                  </span>
                  <span>{filters[control.key as keyof FilterState].toFixed(0)}</span>
                </div>
                <input
                  type="range"
                  min={control.min}
                  max={control.max}
                  step={control.step}
                  value={filters[control.key as keyof FilterState]}
                  onChange={(e) => handleFilterChange(control.key as keyof FilterState, parseFloat(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-indigo-500 hover:accent-indigo-400 transition-all"
                />
              </div>
            );
          })}
        </div>

        {/* Actions Footer */}
        <div className="p-4 border-t border-neutral-800 flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 px-4 rounded-lg border border-neutral-700 hover:bg-neutral-800 text-neutral-300 font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="flex-1 py-2.5 px-4 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
          >
            {isSaving ? (
              <span className="animate-pulse">Saving...</span>
            ) : (
              <>
                <Save size={18} /> Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};