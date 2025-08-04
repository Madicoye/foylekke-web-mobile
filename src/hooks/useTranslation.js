import { useLanguage } from '../contexts/LanguageContext';

// Custom hook for translations - now uses LanguageContext
export const useTranslation = () => {
  const { t, tc, formatTimeAgo } = useLanguage();
  return { t, tc, formatTimeAgo };
};

export default useTranslation;