import React, { useState, useEffect } from 'react';
import { useBannerConfig } from '../../../hooks/useBannerConfig';
import WelcomeAdPopup from '../../../components/features/advertisement/WelcomeAdPopup';
import { getHomePopupAPI } from '../../../services/advertisements';
import { Advertisement } from '../../../types';
import ClassRegistrationModal from '../../../components/features/home/ClassRegistrationModal';

const HomeWelcomeAdPopup: React.FC = () => {
  const { popupConfig } = useBannerConfig();
  const [advertisements, setAdvertisements] = useState<Advertisement[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClassId, setSelectedClassId] = useState<string | null>(null);
  const [selectedClassName, setSelectedClassName] = useState<string>('');

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

    // Show popup after delay - hiển thị mỗi khi vào trang chủ
  useEffect(() => {
    if (popupConfig.isActive && advertisements.length > 0) {
      const timer = setTimeout(() => {
        setShowPopup(true);
      }, popupConfig.showDelay);

      return () => clearTimeout(timer);
    }
  }, [popupConfig, advertisements]);

    if (!popupConfig.isActive || advertisements.length === 0) {
    return null;
  }

  const handleRegisterClick = (classId: string | null, className: string) => {
    setSelectedClassId(classId);
    setSelectedClassName(className);
    setModalOpen(true);
    setShowPopup(false); // Đóng popup khi mở modal đăng ký
  };

  return (
    <>
    <WelcomeAdPopup
      open={showPopup}
      onClose={() => setShowPopup(false)}
      ads={advertisements}
      width={popupConfig.width}
      height={popupConfig.height}
        onRegisterClick={handleRegisterClick}
      />
      <ClassRegistrationModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        classId={selectedClassId}
        className={selectedClassName}
      />
    </>
  );
};

export default HomeWelcomeAdPopup;
