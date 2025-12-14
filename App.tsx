import React, { useState, useCallback, useMemo } from 'react';
import { Category, GalleryImage } from './types';
import { FilterBar } from './components/FilterBar';
import { Lightbox } from './components/Lightbox';
import { Upload, Image as ImageIcon, Search, Folder } from 'lucide-react';

// Initial Demo Data
const INITIAL_IMAGES: GalleryImage[] = [
  { id: '1', category: 'Nature', title: 'Misty Mountains', src: 'https://picsum.photos/id/1018/800/600', description: 'A serene view of misty mountains touching the clouds.' },
  { id: '2', category: 'Nature', title: 'Forest Path', src: 'https://picsum.photos/id/1015/800/1200', description: 'A winding path through a lush green forest.' }, // Vertical
  { id: '3', category: 'Architecture', title: 'Modern Bridge', src: 'https://picsum.photos/id/1023/800/600' },
  { id: '4', category: 'Architecture', title: 'Classic Building', src: 'https://picsum.photos/id/1026/800/800' }, // Square
  { id: '5', category: 'Tech', title: 'Workspace Setup', src: 'https://picsum.photos/id/1/800/600' },
  { id: '6', category: 'Tech', title: 'Camera Lens', src: 'https://picsum.photos/id/250/800/600' },
  { id: '7', category: 'People', title: 'Portrait Smile', src: 'https://picsum.photos/id/64/800/600' },
  { id: '8', category: 'People', title: 'City Walk', src: 'https://picsum.photos/id/338/800/600' },
  { id: '9', category: 'Nature', title: 'Ocean Waves', src: 'https://picsum.photos/id/1035/800/600' },
  { id: '10', category: 'Architecture', title: 'Spiral Staircase', src: 'https://picsum.photos/id/450/800/1200' },
  { id: '11', category: 'Tech', title: 'Old Computer', src: 'https://picsum.photos/id/96/800/600' },
  { id: '12', category: 'Nature', title: 'Autumn Leaves', src: 'https://picsum.photos/id/106/800/600' },
];

const CATEGORIES: Category[] = ['All', 'Nature', 'Architecture', 'People', 'Tech', 'Uploads'];

export default function App() {
  const [images, setImages] = useState<GalleryImage[]>(INITIAL_IMAGES);
  const [currentCategory, setCurrentCategory] = useState<Category>('All');
  const [lightboxImageId, setLightboxImageId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Calculate counts per category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    images.forEach(img => {
      counts[img.category] = (counts[img.category] || 0) + 1;
    });
    return counts;
  }, [images]);

  // Filter Logic
  const filteredImages = useMemo(() => {
    let result = images;

    if (currentCategory !== 'All') {
      result = result.filter(img => img.category === currentCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(img => 
        img.title.toLowerCase().includes(q) || 
        img.category.toLowerCase().includes(q) ||
        (img.description && img.description.toLowerCase().includes(q))
      );
    }

    return result;
  }, [images, currentCategory, searchQuery]);

  // File Upload Handler
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      const newImage: GalleryImage = {
        id: Date.now().toString(),
        src: base64String,
        category: 'Uploads',
        title: file.name.split('.')[0],
        isUserUploaded: true,
        description: 'Uploaded by user. Click "Ask AI" to analyze.',
      };
      setImages(prev => [newImage, ...prev]);
      setCurrentCategory('Uploads');
    };
    reader.readAsDataURL(file);
  };

  // Lightbox Navigation
  const currentImageIndex = filteredImages.findIndex(img => img.id === lightboxImageId);
  const currentImage = filteredImages[currentImageIndex];

  const handleNext = useCallback(() => {
    if (currentImageIndex < filteredImages.length - 1) {
      setLightboxImageId(filteredImages[currentImageIndex + 1].id);
    }
  }, [currentImageIndex, filteredImages]);

  const handlePrev = useCallback(() => {
    if (currentImageIndex > 0) {
      setLightboxImageId(filteredImages[currentImageIndex - 1].id);
    }
  }, [currentImageIndex, filteredImages]);

  const updateImage = (id: string, updates: Partial<GalleryImage>) => {
    setImages(prev => prev.map(img => img.id === id ? { ...img, ...updates } : img));
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 selection:bg-indigo-500 selection:text-white">
      
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-black/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <ImageIcon className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-500">
              Lumina
            </h1>
          </div>

          <div className="flex items-center gap-4">
             {/* Search */}
             <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input 
                type="text" 
                placeholder="Search images..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-neutral-900 border border-neutral-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 w-64 transition-all text-neutral-200 placeholder-neutral-600"
              />
            </div>

            {/* Upload Button */}
            <label className="flex items-center gap-2 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-neutral-200 rounded-full cursor-pointer transition-all hover:ring-2 ring-indigo-500/50 border border-neutral-800">
              <Upload size={18} />
              <span className="text-sm font-medium hidden sm:inline">Upload</span>
              <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
            </label>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-28 pb-12 max-w-7xl mx-auto px-4">
        
        {/* Filters */}
        <div className="sticky top-20 z-30 pt-4 pb-2 bg-black/90 backdrop-blur-sm -mx-4 px-4 mb-4">
            <FilterBar 
              categories={CATEGORIES} 
              activeCategory={currentCategory} 
              onSelect={setCurrentCategory} 
            />
            
            {/* Mobile Search (visible only on small screens) */}
             <div className="relative md:hidden mb-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500" size={16} />
              <input 
                type="text" 
                placeholder="Search images..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-neutral-900 border border-neutral-800 rounded-full pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-indigo-500 text-neutral-200"
              />
            </div>
        </div>

        {/* Gallery Grid */}
        {filteredImages.length === 0 ? (
          <div className="text-center py-20 text-neutral-500">
            <p className="text-lg">No images found.</p>
            <p className="text-sm">Try adjusting filters or uploading your own.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-max">
            {filteredImages.map((img, index) => {
              const count = categoryCounts[img.category] || 0;
              return (
              <div 
                key={img.id}
                onClick={() => setLightboxImageId(img.id)}
                className="group relative cursor-zoom-in rounded-xl overflow-hidden bg-neutral-900 border border-neutral-800 shadow-xl hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {/* Image Aspect Ratio Wrapper */}
                <div className="aspect-[4/3] overflow-hidden">
                  <img 
                    src={img.src} 
                    alt={img.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                  <span className="text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                    {img.category}
                  </span>
                  <h3 className="text-white font-semibold text-lg translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-100">
                    {img.title}
                  </h3>
                  <div className="flex items-center gap-2 text-neutral-400 text-xs mt-2 translate-y-2 group-hover:translate-y-0 transition-transform duration-300 delay-150">
                    <Folder size={14} />
                    <span>{count} {count === 1 ? 'image' : 'images'} in folder</span>
                  </div>
                </div>
              </div>
            );
            })}
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      {currentImage && (
        <Lightbox
          image={currentImage}
          isOpen={!!currentImage}
          onClose={() => setLightboxImageId(null)}
          onNext={handleNext}
          onPrev={handlePrev}
          hasNext={currentImageIndex < filteredImages.length - 1}
          hasPrev={currentImageIndex > 0}
          onUpdateImage={updateImage}
        />
      )}
    </div>
  );
}