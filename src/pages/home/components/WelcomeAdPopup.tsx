import React, { useState, useEffect } from 'react';
import { useBannerConfig } from '../../../hooks/useBannerConfig';
import WelcomeAdPopup from '../../../components/advertisement/WelcomeAdPopup';
import { getAdvertisementsAPI } from '../../../services/api';
import { Advertisement } from '../../../types';

const HomeWelcomeAdPopup: React.FC = () => {
  const { popupConfig } = useBannerConfig();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  // Fetch advertisements
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await getAdvertisementsAPI({ page: 1, limit: 100 });
        if (response.data?.data?.result) {
          const popupAds = response.data.data.result.filter(ad =>
            ad.isActive && (ad as any).displayType === 'popup'
          );
          setAdvertisements(popupAds);
        }
      } catch (error) {
        console.error('Error fetching advertisements:', error);
      }
    };

    fetchAdvertisements();
  }, []);

  // Show popup after delay
  useEffect(() => {
    if (popupConfig.isActive && advertisements.length > 0 && popupConfig.showOnFirstVisit) {
      const hasVisited = localStorage.getItem('hasVisitedHomepage');

      if (!hasVisited) {
        const timer = setTimeout(() => {
          setShowPopup(true);
          localStorage.setItem('hasVisitedHomepage', 'true');
        }, popupConfig.showDelay);

        return () => clearTimeout(timer);
      }
    }
  }, [popupConfig, advertisements]);

  if (!popupConfig.isActive || advertisements.length === 0) {
    return null;
  }

  return (
    <WelcomeAdPopup
      open={showPopup}
      onClose={() => setShowPopup(false)}
      ads={advertisements}
      width={popupConfig.width}
      height={popupConfig.height}
    />
  );
};

export default HomeWelcomeAdPopup;
