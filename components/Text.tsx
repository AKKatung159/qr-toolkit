import React from 'react';
import { Text as RNText, TextProps } from 'react-native';

/** RN Text with Outfit as the default family. Pass a `font-*` class to pick another weight. */
export function Text({ className = '', ...props }: TextProps & { className?: string }) {
  const font = /\bfont-(body|title|display)/.test(className) ? '' : 'font-body';
  return <RNText className={`${font} ${className}`} {...props} />;
}
