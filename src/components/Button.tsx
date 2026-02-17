import React from 'react';
import { TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { AppText } from './AppText';
import { Ionicons } from '@expo/vector-icons';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'google';
  loading?: boolean;
  disabled?: boolean;
  icon?: keyof typeof Ionicons.glyphMap;
  className?: string;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  className = ''
}: ButtonProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return 'bg-cute';
      case 'secondary':
        return 'bg-card border-2 border-quaternary';
      case 'google':
        return 'bg-card border-2 border-quaternary';
      default:
        return 'bg-tint';
    }
  };

  const getTextColor = () => {
    switch (variant) {
      case 'primary':
        return 'text-white';
      case 'secondary':
      case 'google':
        return 'text-primary';
      default:
        return 'text-white';
    }
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`w-full rounded-2xl py-4 px-6 ${getVariantStyles()} ${disabled ? 'opacity-50' : ''
        } ${className}`}
      activeOpacity={0.7}
    >
      <View className="flex-row items-center justify-center">
        {loading ? (
          <ActivityIndicator color={variant === 'primary' ? '#FFFFFF' : '#2C0FBD'} />
        ) : (
          <>
            {icon && (
              <Ionicons
                name={icon}
                size={20}
                color={variant === 'primary' ? '#FFFFFF' : '#2C0FBD'}
                style={{ marginRight: 8 }}
              />
            )}
            <AppText
              className={`text-base font-bold ${getTextColor()}`}
            >
              {title}
            </AppText>
          </>
        )}
      </View>
    </TouchableOpacity>
  );
}
