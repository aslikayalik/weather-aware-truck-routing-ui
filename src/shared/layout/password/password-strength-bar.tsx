import { useEffect } from 'react';

export interface IPasswordStrengthBarProps {
  password: string;
  onChangeScore?: (score: number) => void;
}

const measureStrength = (p: string): number => {
  let force = 0;
  const regex = /[!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~]/g;
  const flags = {
    lowerLetters: /[a-z]+/.test(p),
    upperLetters: /[A-Z]+/.test(p),
    numbers: /\d+/.test(p),
    symbols: regex.test(p),
  };

  const passedMatches = Object.values(flags).filter((isMatchedFlag: boolean) => !!isMatchedFlag).length;

  force += 2 * p.length + (p.length >= 10 ? 1 : 0);
  force += passedMatches * 10;

  // penalty (short password)
  force = p.length <= 7 ? Math.min(force, 10) : force;

  // penalty (poor variety of characters)
  force = passedMatches === 1 ? Math.min(force, 10) : force;
  force = passedMatches === 2 ? Math.min(force, 20) : force;
  force = passedMatches === 3 ? Math.min(force, 40) : force;

  return force;
};

/**
 * Reports the password's strength score for form validation. It renders nothing:
 * the password rule checklist next to it already shows the user what is missing.
 */
export const PasswordStrengthBar = ({ password, onChangeScore }: IPasswordStrengthBarProps) => {
  useEffect(() => {
    if (onChangeScore) {
      onChangeScore(measureStrength(password));
    }
  }, [password, onChangeScore]);

  return null;
};

export default PasswordStrengthBar;
