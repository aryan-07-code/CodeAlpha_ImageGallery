export type Category = 'All' | 'Nature' | 'Architecture' | 'People' | 'Tech' | 'Uploads';

export interface GalleryImage {
  id: string;
  src: string;
  category: Category;
  title: string;
  description?: string; // AI generated description
  isUserUploaded?: boolean;
}

export interface FilterProps {
  currentCategory: Category;
  onSelectCategory: (category: Category) => void;
}
