import { useState, useEffect } from 'react';

export interface FooterSettings {
  companyName: string;
  email: string;
  phone: string;
  address: string;
  facebookUrl?: string;
  youtubeUrl?: string;
  zaloUrl?: string;
  description?: string;
  mapEmbedUrl?: string; // Google Maps embed URL (always shown if provided)
}

export const useFooterSettings = () => {
  // Default configuration
  const [footerSettings, setFooterSettings] = useState<FooterSettings>({
    companyName: 'English Center',
    email: 'contact@englishcenter.com',
    phone: '0123 456 789',
    address: 'Hà Nội, Việt Nam',
    description: 'Trung tâm Anh ngữ chất lượng cao',
    facebookUrl: '',
    youtubeUrl: '',
    zaloUrl: '',
    mapEmbedUrl: ''
  });

  // Load configuration from localStorage
  useEffect(() => {
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('footerSettings');

        if (savedSettings) {
          setFooterSettings(JSON.parse(savedSettings));
        }
      } catch (error) {
        console.error('Error loading footer settings:', error);
      }
    };

    loadSettings();
  }, []);

  // Save configuration to localStorage
  const saveFooterSettings = (settings: FooterSettings) => {
    try {
      localStorage.setItem('footerSettings', JSON.stringify(settings));
      setFooterSettings(settings);
    } catch (error) {
      console.error('Error saving footer settings:', error);
      throw error;
    }
  };

  return {
    footerSettings,
    saveFooterSettings
  };
};
