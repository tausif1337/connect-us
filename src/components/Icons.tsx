import React from "react";
import { MaterialCommunityIcons, Feather, AntDesign } from "@expo/vector-icons";
import Svg, { Path } from "react-native-svg";

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}
 
export function HomeIcon({ size = 24, color = "#000" }: IconProps) {
  return <MaterialCommunityIcons name="home" size={size} color={color} />;
}

// Profile/User Icon
export function UserIcon({ size = 24, color = "#000" }: IconProps) {
  return <MaterialCommunityIcons name="account" size={size} color={color} />;
}

// Settings/Gear Icon
export function SettingsIcon({ size = 24, color = "#000" }: IconProps) {
  return <MaterialCommunityIcons name="cog" size={size} color={color} />;
}

// Settings/Gear Icon
export function TrendingIcon({ size = 24, color = "#000" }: IconProps) {
  return <MaterialCommunityIcons name="trending-up" size={size} color={color} />;
}

// Camera Icon
export function CameraIcon({ size = 24, color = "#999" }: IconProps) {
  return <Feather name="camera" size={size} color={color} />;
}

// Gallery/Image Icon (for no posts)
export function GalleryIcon({ size = 48, color = "#9CA3AF" }: IconProps) {
  return <MaterialCommunityIcons name="image-off" size={size} color={color} />;
}

// Back Arrow Icon
export function BackArrowIcon({ size = 20, color = "#111827" }: IconProps) {
  return <MaterialCommunityIcons name="arrow-left" size={size} color={color} />;
}

// Three Dots Menu Icon
export function ThreeDotsIcon({ size = 24, color = "#6B7280" }: IconProps) {
  return (
    <MaterialCommunityIcons name="dots-vertical" size={size} color={color} />
  );
}

// Chat/Message Icon
export function ChatIcon({ size = 24, color = "#000" }: IconProps) {
  return <Feather name="message-circle" size={size} color={color} />;
}

// Heart Icon (for likes)
export function HeartIcon({ size = 24, color = "#000" }: IconProps) {
  return <Feather name="heart" size={size} color={color} />;
}

// Heart Filled Icon (for liked posts)
export function HeartFilledIcon({ size = 24, color = "#EF4444" }: IconProps) {
  return <MaterialCommunityIcons name="heart" size={size} color={color} />;
}

// Comment Icon
export function CommentIcon({ size = 24, color = "#000" }: IconProps) {
  return <Feather name="message-circle" size={size} color={color} />;
}

// Send Icon (for posting comments)
export function SendIcon({ size = 24, color = "#000" }: IconProps) {
  return <Feather name="send" size={size} color={color} />;
}


export function HeartIconBlank({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none"
    >
      <Path
        d="M12.1 18.55L12 18.65L11.89 18.55C7.14 14.24 4 11.39 4 8.5C4 6.5 5.5 5 7.5 5C9.04 5 10.54 6 11.07 7.36H12.93C13.46 6 14.96 5 16.5 5C18.5 5 20 6.5 20 8.5C20 11.39 16.86 14.24 12.1 18.55ZM16.5 3C14.76 3 13.09 3.81 12 5.08C10.91 3.81 9.24 3 7.5 3C4.42 3 2 5.41 2 8.5C2 12.27 5.4 15.36 10.55 20.03L12 21.35L13.45 20.03C18.6 15.36 22 12.27 22 8.5C22 5.41 19.58 3 16.5 3Z"
        fill={color} // Use the prop color here
      />
    </Svg>
  );
}

export function HeartIconFull({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill={color}>
<Path d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z" fill={color}/>
</Svg> 
  );
}

export function MessageIcon({ size = 24, color = "#000" }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
<Path d="M19 3H5C4.20435 3 3.44129 3.31607 2.87868 3.87868C2.31607 4.44129 2 5.20435 2 6V21C2.00031 21.1772 2.04769 21.3511 2.1373 21.504C2.22691 21.6569 2.35553 21.7832 2.51 21.87C2.65946 21.9547 2.82821 21.9995 3 22C3.17948 21.9999 3.35564 21.9516 3.51 21.86L8 19.14C8.16597 19.0412 8.35699 18.9926 8.55 19H19C19.7956 19 20.5587 18.6839 21.1213 18.1213C21.6839 17.5587 22 16.7956 22 16V6C22 5.20435 21.6839 4.44129 21.1213 3.87868C20.5587 3.31607 19.7956 3 19 3ZM8 12C7.80222 12 7.60888 11.9414 7.44443 11.8315C7.27998 11.7216 7.15181 11.5654 7.07612 11.3827C7.00043 11.2 6.98063 10.9989 7.01921 10.8049C7.0578 10.6109 7.15304 10.4327 7.29289 10.2929C7.43275 10.153 7.61093 10.0578 7.80491 10.0192C7.99889 9.98063 8.19996 10.0004 8.38268 10.0761C8.56541 10.1518 8.72159 10.28 8.83147 10.4444C8.94135 10.6089 9 10.8022 9 11C9 11.2652 8.89464 11.5196 8.70711 11.7071C8.51957 11.8946 8.26522 12 8 12ZM12 12C11.8022 12 11.6089 11.9414 11.4444 11.8315C11.28 11.7216 11.1518 11.5654 11.0761 11.3827C11.0004 11.2 10.9806 10.9989 11.0192 10.8049C11.0578 10.6109 11.153 10.4327 11.2929 10.2929C11.4327 10.153 11.6109 10.0578 11.8049 10.0192C11.9989 9.98063 12.2 10.0004 12.3827 10.0761C12.5654 10.1518 12.7216 10.28 12.8315 10.4444C12.9414 10.6089 13 10.8022 13 11C13 11.2652 12.8946 11.5196 12.7071 11.7071C12.5196 11.8946 12.2652 12 12 12ZM16 12C15.8022 12 15.6089 11.9414 15.4444 11.8315C15.28 11.7216 15.1518 11.5654 15.0761 11.3827C15.0004 11.2 14.9806 10.9989 15.0192 10.8049C15.0578 10.6109 15.153 10.4327 15.2929 10.2929C15.4327 10.153 15.6109 10.0578 15.8049 10.0192C15.9989 9.98063 16.2 10.0004 16.3827 10.0761C16.5654 10.1518 16.7216 10.28 16.8315 10.4444C16.9414 10.6089 17 10.8022 17 11C17 11.2652 16.8946 11.5196 16.7071 11.7071C16.5196 11.8946 16.2652 12 16 12Z" fill={color} />
</Svg>

  );
}

export function FlyIcon({ size = 24, color = "#000" }: IconProps) {
  return (
   <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
<Path d="M20.04 2.32301C21.056 1.96801 22.032 2.94401 21.677 3.96001L15.752 20.89C15.367 21.988 13.837 22.05 13.365 20.987L10.506 14.555L14.53 10.53C14.6625 10.3878 14.7346 10.1998 14.7312 10.0055C14.7278 9.81119 14.649 9.62581 14.5116 9.48839C14.3742 9.35098 14.1888 9.27227 13.9945 9.26884C13.8002 9.26541 13.6122 9.33753 13.47 9.47001L9.44501 13.494L3.01301 10.635C1.95001 10.162 2.01301 8.63301 3.11001 8.24801L20.04 2.32301Z" fill={color}/>
</Svg>
  );
}