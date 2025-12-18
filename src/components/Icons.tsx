import React from "react";
import Svg, { Path, Circle, G, Rect } from "react-native-svg";
import { View } from "react-native";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

// Home Icon
export function HomeIcon({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M3 9L12 2L21 9V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V9Z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Path
        d="M9 22V12H15V22"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Profile/User Icon
export function UserIcon({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="8" r="4" stroke={color} strokeWidth={2} fill="none" />
      <Path
        d="M4 20C4 16.134 7.582 13 12 13C16.418 13 20 16.134 20 20"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </Svg>
  );
}

// Settings/Gear Icon
export function SettingsIcon({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle
        cx="12"
        cy="12"
        r="3"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <Path
        d="M12 1V3M12 21V23M23 12H21M3 12H1"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
      <Path
        d="M20.485 3.515L19.071 4.929M4.929 19.071L3.515 20.485M20.485 20.485L19.071 19.071M4.929 4.929L3.515 3.515"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}

// Camera Icon
export function CameraIcon({ size = 24, color = "#999" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <Circle
        cx="12"
        cy="13"
        r="4"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
    </Svg>
  );
}

// Empty State Icon (for no posts)
export function GalleryIcon({ size = 48, color = "#9CA3AF" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="2"
        stroke={color}
        strokeWidth={2}
        fill="none"
      />
      <Circle cx="8.5" cy="8.5" r="1.5" fill={color} />
      <Path
        d="M21 15L16 10L3 21"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Back Arrow Icon
export function BackArrowIcon({ size = 20, color = "#111827" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

// Three Dots Menu Icon
export function ThreeDotsIcon({ size = 24, color = "#6B7280" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Circle cx="12" cy="5" r="2" fill={color} />
      <Circle cx="12" cy="12" r="2" fill={color} />
      <Circle cx="12" cy="19" r="2" fill={color} />
    </Svg>
  );
}
