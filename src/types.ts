export type StyleOption = 'Romantic/Minimalism' | 'Urban/Muse' | 'Dreamy/Pastel' | 'Social Media';

export type AspectRatio = '3:4' | '16:9';

export interface SizeOption {
  label: string;
  aspectRatio: AspectRatio;
}

export const STYLE_OPTIONS: StyleOption[] = [
  'Romantic/Minimalism',
  'Urban/Muse',
  'Dreamy/Pastel',
  'Social Media'
];

export const SIZE_OPTIONS: Record<string, SizeOption> = {
  product: { label: 'Product Photos (1200x1600)', aspectRatio: '3:4' },
  hero: { label: 'Hero Banners (1920x1080)', aspectRatio: '16:9' },
  collection: { label: 'Collection Images (600x800)', aspectRatio: '3:4' },
  blog: { label: 'Blog Headers (1200x630)', aspectRatio: '16:9' },
};
