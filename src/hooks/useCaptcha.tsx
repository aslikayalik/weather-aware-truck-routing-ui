import { useState, useCallback, useEffect } from 'react';
import { useLazyGenerateCaptchaQuery, useValidateCaptchaMutation } from '@services/commonApi';

interface UseCaptchaReturn {
  captchaKey: string;
  captchaValue: string;
  captchaImage: string;
  captchaError: string;
  isLoading: boolean;
  isValidating: boolean;
  setCaptchaKey: (key: string) => void;
  setCaptchaValue: (value: string) => void;
  setCaptchaError: (error: string) => void;
  refreshCaptcha: () => void;
  validateCaptcha: () => Promise<boolean>;
}

export const useCaptcha = (): UseCaptchaReturn => {
  const [captchaKey, setCaptchaKey] = useState('');
  const [captchaValue, setCaptchaValue] = useState('');
  const [captchaError, setCaptchaError] = useState('');

  const [generateCaptcha, { data: captchaData, isLoading }] = useLazyGenerateCaptchaQuery();
  const [validateCaptchaMutation, { isLoading: isValidating }] = useValidateCaptchaMutation();

  useEffect(() => {
    // Generate a captcha on first load
    generateCaptcha();
  }, []);

  useEffect(() => {
    if (captchaData?.key) {
      setCaptchaKey(captchaData.key);
    }
  }, [captchaData]);

  const refreshCaptcha = useCallback(() => {
    setCaptchaValue('');
    setCaptchaError('');
    generateCaptcha();
  }, [generateCaptcha]);

  const validateCaptcha = useCallback(async (): Promise<boolean> => {
    if (!captchaKey || !captchaValue) {
      setCaptchaError('Please enter the security code');
      return false;
    }

    try {
      const result = await validateCaptchaMutation({
        key: captchaKey,
        value: captchaValue,
      }).unwrap();

      if (result.valid) {
        setCaptchaError('');
        return true;
      } else {
        setCaptchaError('The security code is incorrect');
        refreshCaptcha();
        return false;
      }
    } catch (error) {
      console.error('❌ Captcha validation error:', error);
      setCaptchaError('The security code could not be verified');
      refreshCaptcha();
      return false;
    }
  }, [captchaKey, captchaValue, validateCaptchaMutation, refreshCaptcha]);

  const getAbsoluteImageUrl = () => {
    if (!captchaData?.image_url) return '';
    if (captchaData.image_url.startsWith('/')) {
      return `${window.location.origin}${captchaData.image_url}`;
    }
    return captchaData.image_url;
  };

  return {
    captchaKey,
    captchaValue,
    captchaImage: getAbsoluteImageUrl(),
    captchaError,
    isLoading,
    isValidating,
    setCaptchaKey,
    setCaptchaValue,
    setCaptchaError,
    refreshCaptcha,
    validateCaptcha,
  };
};
