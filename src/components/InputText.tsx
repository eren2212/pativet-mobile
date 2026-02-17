import React, { useState } from 'react';
import {
    View,
    TextInput,
    TextInputProps,
    TouchableOpacity,
    Text,
} from 'react-native';
import Animated, {
    useSharedValue,
    useAnimatedStyle,
    withSpring,
    withTiming,
    interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import COLORS from '@/theme/color';
import { AppText } from './AppText';

export interface InputTextProps extends TextInputProps {
    /** Left icon name from Ionicons */
    leftIcon?: keyof typeof Ionicons.glyphMap;
    /** Right icon name from Ionicons */
    rightIcon?: keyof typeof Ionicons.glyphMap;
    /** Callback when right icon is pressed */
    onRightIconPress?: () => void;
    /** Label text above input */
    label?: string;
    /** Error message to display */
    error?: string;
    /** Container class name */
    containerClassName?: string;
    /** Input class name */
    inputClassName?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export default function InputText({
    leftIcon,
    rightIcon,
    onRightIconPress,
    label,
    error,
    containerClassName = '',
    inputClassName = '',
    onFocus,
    onBlur,
    ...textInputProps
}: InputTextProps) {
    const [isFocused, setIsFocused] = useState(false);

    // Animated values
    const focusProgress = useSharedValue(0);
    const borderColorProgress = useSharedValue(0);

    // Handle focus
    const handleFocus = (e: any) => {
        setIsFocused(true);
        focusProgress.value = withSpring(1, {
            damping: 15,
            stiffness: 150,
        });
        borderColorProgress.value = withTiming(1, { duration: 200 });
        onFocus?.(e);
    };

    // Handle blur
    const handleBlur = (e: any) => {
        setIsFocused(false);
        focusProgress.value = withSpring(0, {
            damping: 15,
            stiffness: 150,
        });
        borderColorProgress.value = withTiming(0, { duration: 200 });
        onBlur?.(e);
    };

    // Animated container style
    const animatedContainerStyle = useAnimatedStyle(() => {
        const borderColor = error
            ? '#EF4444' // red-500
            : interpolateColor(
                borderColorProgress.value,
                [0, 1],
                [COLORS.quaternary, COLORS.cute] // gray-200 to blue-500
            );

        const shadowOpacity = error ? 0.15 : focusProgress.value * 0.08;
        const scale = 1 + focusProgress.value * 0.005;

        return {
            borderColor,
            transform: [{ scale }],
            shadowColor: error ? '#EF4444' : '#3B82F6',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity,
            shadowRadius: 8,
            elevation: focusProgress.value * 4,
        };
    });

    // Animated icon style
    const animatedLeftIconStyle = useAnimatedStyle(() => {
        const scale = 1 + focusProgress.value * 0.1;
        return {
            transform: [{ scale }],
        };
    });

    const iconColor = error ? COLORS.error : isFocused ? COLORS.cute : COLORS.tertiary;

    return (
        <View className={`mb-4 ${containerClassName}`}>
            {/* Label */}
            {label && (
                <AppText
                    className={`mb-2 text-sm font-medium ${error ? COLORS.error : isFocused ? COLORS.cute : COLORS.tertiary
                        }`}
                >
                    {label}
                </AppText>
            )}

            {/* Input Container */}
            <AnimatedView
                style={animatedContainerStyle}
                className={`flex-row items-center bg-white border-2 rounded-xl px-4 py-3 ${error ? COLORS.error : ''
                    }`}
            >
                {/* Left Icon */}
                {leftIcon && (
                    <Animated.View style={animatedLeftIconStyle} className="ml-3">
                        <Ionicons name={leftIcon} size={20} color={iconColor} />
                    </Animated.View>
                )}

                {/* Text Input */}
                <TextInput
                    style={{ minHeight: 40, paddingVertical: 0 }}
                    className={`flex-1 text-base text-gray-800 font-ozel-regular ${leftIcon ? 'ml-3' : ''} ${rightIcon ? 'mr-6' : ''
                        } ${inputClassName}`}
                    placeholderTextColor={COLORS.tertiary}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                    {...textInputProps}
                />

                {/* Right Icon/Button */}
                {rightIcon && (
                    <TouchableOpacity
                        onPress={onRightIconPress}
                        activeOpacity={0.7}
                        className="p-1"
                    >
                        <Ionicons name={rightIcon} size={20} color={iconColor} />
                    </TouchableOpacity>
                )}
            </AnimatedView>

            {/* Error Message */}
            {error && (
                <Animated.View
                    entering={undefined}
                    className="mt-1.5 flex-row items-center"
                >
                    <Ionicons name="alert-circle" size={14} color={COLORS.error} />
                    <Text className="ml-1 text-xs text-error">{error}</Text>
                </Animated.View>
            )}
        </View>
    );
}
