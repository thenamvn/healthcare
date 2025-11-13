import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { SymbolWeight } from 'expo-symbols';
import React from 'react';
import { OpaqueColorValue, StyleProp, ViewStyle } from 'react-native';

// Thêm fallback mapping cho các icon thống kê
const ICON_FALLBACK_MAP: Record<string, keyof typeof MaterialIcons.glyphMap> = {
  'house.fill': 'home',
  'paperplane.fill': 'send',
  'chevron.left.forwardslash.chevron.right': 'code',
  'chevron.right': 'chevron-right',
  'chart.bar.fill': 'bar-chart',  // ✅ Thêm fallback cho stats icon
  'person.fill': 'person',
  'settings': 'settings',
};

export function IconSymbol({
  name,
  size = 24,
  color,
  style,
  weight = 'regular',
}: {
  name: string;
  size?: number;
  color: string | OpaqueColorValue;
  style?: StyleProp<ViewStyle>;
  weight?: SymbolWeight;
}) {
  // Luôn dùng MaterialIcons trên web
  const fallbackName = ICON_FALLBACK_MAP[name] || 'help-outline';
  
  return (
    <MaterialIcons
      color={color}
      size={size}
      name={fallbackName}
      style={style}
    />
  );
}