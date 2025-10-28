import React, { useState, useEffect } from 'react';
import { useBannerConfig } from '../../../hooks/useBannerConfig';
import WelcomeAdPopup from '../../../components/features/advertisement/WelcomeAdPopup';
import { getHomePopupAPI } from '../../../services/advertisements';
import { Advertisement } from '../../../types';

const HomeWelcomeAdPopup: React.FC = () => {
  const { popupConfig } = useBannerConfig();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [showPopup, setShowPopup] = useState(false);

  // Fetch advertisements
  useEffect(() => {
    const fetchAdvertisements = async () => {
      try {
        const response = await getHomePopupAPI();
        if (response.data?.data) {
          // API trả về object đơn lẻ, wrap thành array
          const popupAds = [response.data.data] as any;
          setAdvertisements(popupAds);
        }
      } catch (error) {
        console.error('Error fetching popup advertisements:', error);
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
