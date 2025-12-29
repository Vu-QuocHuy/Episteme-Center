import { useState, useEffect } from 'react';
import { getFooterSettingsAPI } from '../services/footer-settings';

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

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load configuration from API
  useEffect(() => {
    const loadSettings = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await getFooterSettingsAPI();
        if (response.data) {
          setFooterSettings(response.data);
        }
      } catch (error) {
        console.error('Error loading footer settings:', error);
        setError('Failed to load footer settings');
        // Keep default values on error
      } finally {
        setLoading(false);
      }
    };

    loadSettings();
  }, []);

  return {
    footerSettings,
    loading,
    error
  };
};
