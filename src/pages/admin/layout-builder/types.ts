// ============================================
// LAYOUT BUILDER COMPONENT TYPES
// ============================================

export type ComponentType =
  | 'text'
  | 'image'
  | 'input'
  | 'hero'
  | 'feature-cards'
  | 'statistics'
  | 'course-cards'
  | 'testimonials'
  | 'teacher-cards'
  | 'video'
  | 'faq'
  | 'contact-form'
  | 'gallery'
  | 'pricing-table'
  | 'map';

// ============================================
// HERO SECTION
// ============================================
export interface HeroConfig {
  title: string;
  subtitle: string;
  backgroundImage?: string;
  backgroundColor?: string;
  backgroundOverlay?: boolean;
  overlayOpacity?: number;
  ctaButtons: Array<{
    text: string;
    link: string;
    style: 'contained' | 'outlined';
    color?: 'primary' | 'secondary';
  }>;
  alignment: 'left' | 'center' | 'right';
  height: 'small' | 'medium' | 'large'; // 400px / 600px / 800px
  textColor?: string;
}

// ============================================
// FEATURE CARDS
// ============================================
export interface FeatureCardsConfig {
  title?: string;
  subtitle?: string;
  cards: Array<{
    id: string;
    icon: string; // Material Icon name
    title: string;
    description: string;
    link?: string;
  }>;
  columns: 2 | 3 | 4;
  cardStyle: 'flat' | 'raised' | 'outlined';
  iconColor?: string;
  backgroundColor?: string;
}

// ============================================
// STATISTICS COUNTER
// ============================================
export interface StatisticsConfig {
  stats: Array<{
    id: string;
    number: string; // "10000+" hoặc "95%"
    label: string;
    icon?: string;
    suffix?: string;
  }>;
  backgroundColor?: string;
  textColor?: string;
  columns: 2 | 3 | 4;
  animationEnabled?: boolean;
}

// ============================================
// COURSE CARDS
// ============================================
export interface CourseCardsConfig {
  title?: string;
  subtitle?: string;
  courses: Array<{
    id: string;
    image: string;
    title: string;
    description: string;
    price?: string;
    originalPrice?: string;
    badge?: string;
    ctaText: string;
    ctaLink: string;
  }>;
  layout: 'grid' | 'carousel';
  columns: 2 | 3 | 4;
  showPrice: boolean;
  backgroundColor?: string;
}

// ============================================
// TESTIMONIALS
// ============================================
export interface TestimonialsConfig {
  title?: string;
  subtitle?: string;
  testimonials: Array<{
    id: string;
    avatar?: string;
    name: string;
    role: string;
    content: string;
    rating?: number;
  }>;
  layout: 'slider' | 'grid';
  showRating: boolean;
  autoPlay?: boolean;
  backgroundColor?: string;
}

// ============================================
// TEACHER CARDS
// ============================================
export interface TeacherCardsConfig {
  title?: string;
  subtitle?: string;
  teachers: Array<{
    id: string;
    image: string;
    name: string;
    title: string;
    description: string;
    socialLinks?: {
      facebook?: string;
      linkedin?: string;
      twitter?: string;
    };
  }>;
  columns: 2 | 3 | 4;
  cardStyle: 'modern' | 'classic';
  backgroundColor?: string;
}

// ============================================
// VIDEO PLAYER
// ============================================
export interface VideoConfig {
  videoUrl: string;
  thumbnail?: string;
  title?: string;
  description?: string;
  aspectRatio: '16:9' | '4:3' | '1:1';
  autoPlay?: boolean;
}

// ============================================
// FAQ ACCORDION
// ============================================
export interface FaqConfig {
  title?: string;
  subtitle?: string;
  items: Array<{
    id: string;
    question: string;
    answer: string;
  }>;
  defaultExpanded?: number;
  style: 'outlined' | 'filled';
  backgroundColor?: string;
}

// ============================================
// CONTACT FORM
// ============================================
export interface ContactFormConfig {
  title?: string;
  description?: string;
  fields: Array<'name' | 'email' | 'phone' | 'message'>;
  submitButtonText: string;
  successMessage: string;
  backgroundColor?: string;
}

// ============================================
// GALLERY GRID
// ============================================
export interface GalleryConfig {
  title?: string;
  subtitle?: string;
  images: Array<{
    id: string;
    url: string;
    caption?: string;
    alt: string;
  }>;
  columns: 2 | 3 | 4;
  gap: number;
  enableLightbox: boolean;
  backgroundColor?: string;
}

// ============================================
// PRICING TABLE
// ============================================
export interface PricingTableConfig {
  title?: string;
  subtitle?: string;
  plans: Array<{
    id: string;
    name: string;
    price: string;
    period: string;
    features: string[];
    recommended: boolean;
    ctaText: string;
    ctaLink: string;
  }>;
  columns: 2 | 3;
  backgroundColor?: string;
}

// ============================================
// MAP LOCATION
// ============================================
export interface MapConfig {
  latitude: number;
  longitude: number;
  zoom: number;
  markerTitle: string;
  address: string;
  height: number;
}

// ============================================
// COMPONENT CONFIG UNION TYPE
// ============================================
export type ComponentConfig =
  | { type: 'text'; content: string }
  | { type: 'image'; content: string }
  | { type: 'input'; content: string }
  | { type: 'hero'; config: HeroConfig }
  | { type: 'feature-cards'; config: FeatureCardsConfig }
  | { type: 'statistics'; config: StatisticsConfig }
  | { type: 'course-cards'; config: CourseCardsConfig }
  | { type: 'testimonials'; config: TestimonialsConfig }
  | { type: 'teacher-cards'; config: TeacherCardsConfig }
  | { type: 'video'; config: VideoConfig }
  | { type: 'faq'; config: FaqConfig }
  | { type: 'contact-form'; config: ContactFormConfig }
  | { type: 'gallery'; config: GalleryConfig }
  | { type: 'pricing-table'; config: PricingTableConfig }
  | { type: 'map'; config: MapConfig };

