import React, { useEffect, useRef, useState } from "react";
import { Animated, FlatList, Image, Modal, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FlyIcon, HeartIconBlank, HeartIconFull, MessageIcon } from "../components/Icons";
import { BlurView } from 'expo-blur';
import AsyncStorage from "@react-native-async-storage/async-storage";

const CARD_DATA = [
  {
    id: '1',
    name: "Work Essentials",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_work_essentials-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    views: "20.5K",
    isPremium: true
  },
  {
    id: '2',
    name: "Bags & Wallets",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_bags_wallets-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    views: "15.2K",
    isPremium: false
  },
  {
    id: '3',
    name: "Tech Accessories",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_tech-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    views: "32.1K",
    isPremium: true
  },
  {
    id: '4',
    name: "Office Setup",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_work_essentials-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    views: "10.5K",
    isPremium: false
  },
  {
    id: '5',
    name: "Travel Gear",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_bags_wallets-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    views: "8.9K",
    isPremium: true
  },
  {
    id: '6',
    name: "Gadget Zone",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_tech-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    views: "45K",
    isPremium: true
  },
];

const TRENDING_CARD_DATA = [
  {
    id: '1',
    name: "Work Essentials",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_work_essentials-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    avatar: "https://sm.ign.com/t/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.1200.jpg",
    views: "20.5K",
    isPremium: true,
    storage_key: "@trending_card_1"
  },
  {
    id: '2',
    name: "Bags & Wallets",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_bags_wallets-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    avatar: "https://sm.ign.com/t/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.1200.jpg",
    views: "15.2K",
    isPremium: false,
    storage_key: "@trending_card_2"
  },
  {
    id: '3',
    name: "Tech Accessories",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_tech-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    avatar: "https://sm.ign.com/t/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.1200.jpg",
    views: "32.1K",
    isPremium: true,
    storage_key: "@trending_card_3"
  },
  {
    id: '4',
    name: "Office Setup",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_work_essentials-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    avatar: "https://sm.ign.com/t/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.1200.jpg",
    views: "10.5K",
    isPremium: false,
    storage_key: "@trending_card_4"
  },
  {
    id: '5',
    name: "Travel Gear",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_bags_wallets-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    avatar: "https://sm.ign.com/t/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.1200.jpg",
    views: "8.9K",
    isPremium: true,
    storage_key: "@trending_card_5"
  },
  {
    id: '6',
    name: "Gadget Zone",
    bg: "https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_tech-2.jpeg?tr=cm-pad_resize,v-3,w-3840",
    avatar: "https://sm.ign.com/t/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.1200.jpg",
    views: "45K",
    isPremium: true,
    storage_key: "@trending_card_6"
  },
];

export default function TrendingScreen() {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
     <ScrollView 
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
      >
        <SectionTitle title="Stories" />
        <View className="pl-4 mb-4">
          <FlatList
            data={CARD_DATA}
            horizontal
            showsHorizontalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingHorizontal: 0, gap: 8}}  
            renderItem={({ item }) => (
              <View>  
                <CardBox 
                  isPremium={item.isPremium} 
                  avatarUrl="https://sm.ign.com/t/ign_ap/cover/a/avatar-gen/avatar-generations_hugw.1200.jpg" 
                  name={item.name} 
                  bgImage={item.bg} 
                  viewCount={item.views} 
                />
              </View>
            )}
          />
        </View>

        
        <SectionTitle title="Trending" />
        <View className="px-4 mb-4">
          <FlatList
            data={TRENDING_CARD_DATA}
            keyExtractor={(item) => item?.id}
            contentContainerStyle={{ paddingHorizontal: 0, gap: 8 }}
            scrollEnabled={false}
            renderItem={({item}) => {
              return (
                <View>
                  <TrendingCard 
                    avatarUrl={item.avatar} 
                    name={item.name} 
                    bgImage={'https://images.dailyobjects.com/marche/assets/images/homepage/desktop/shop_by_category_tech-2.jpeg?tr=cm-pad_resize,v-3,w-3840'}  
                    stroage_key="one"
                  />
                </View>
              )
            }}  
            ListEmptyComponent={() => (
              <View>
                <Text>No trending stories</Text>
              </View>
            )}
            showsVerticalScrollIndicator={false}
          />
        </View>
     </ScrollView>
    </SafeAreaView>
  );
}


const SectionTitle = ({title}: {title: string}) => {
  return (
    <View className="mb-2 px-4">
      <Text className="font-medium text-lg text-black">{title}</Text>
    </View>
  )
}

const CardBox = ({ isPremium, bgImage, avatarUrl, name, viewCount }: { isPremium: boolean, avatarUrl: string, name: string; bgImage: string; viewCount: string }) => {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (isFullscreen) {
      // 1. Reset progress bar
      progressAnim.setValue(0);
      
      // 2. Animate progress bar to 100% over 3 seconds
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 4000,
        useNativeDriver: false, // width animation doesn't support native driver
      }).start();

      // 3. Auto close after 3 seconds
      const timer = setTimeout(() => {
        setIsFullscreen(false);
      }, 4000);

      return () => clearTimeout(timer);
    }
  }, [isFullscreen]);

  return (
    <View>
      {/* Small Card Body */}
      <TouchableOpacity 
        activeOpacity={0.9} 
        onPress={() => setIsFullscreen(true)}
        className="relative rounded-[8px] w-[130px] h-[180px] overflow-hidden"
      >
        <View className="p-2 flex flex-col justify-between z-[1] h-full">
          {/* card header */}
          <View className="flex flex-row items-center gap-2">
            <View className={`rounded-[20px] ${isPremium ? 'bg-yellow-500' : 'bg-black'}`}>
              <Text className="text-white font-medium px-2 py-1 text-[11px]">{isPremium ? 'Premium' : 'Live'}</Text>
            </View>
            <Text className="text-white font-medium text-[12px]">{viewCount}</Text>
          </View>

          {/* card footer */}
          <View className="flex flex-row items-center gap-2">
            <View className="w-7 h-7 bg-blue-500 rounded-full">
              <Image source={{ uri: avatarUrl }} className="w-full h-full rounded-full" />
            </View>
            <Text className="text-white font-medium text-[12px]" numberOfLines={1}>{name}</Text>
          </View>
        </View>

        <Image source={{ uri: bgImage }} className="absolute top-0 left-0 w-full h-full z-[-2]" />
        <View className="absolute top-0 left-0 w-full h-full bg-black/50 z-[-1]" />
      </TouchableOpacity>

      {/* Fullscreen Modal View */}
      <Modal visible={isFullscreen} transparent={false} animationType="fade">
        <View className="flex-1 bg-black">
          {/* Progress Bar Container */}
          <View className="absolute top-12 left-5 right-5 h-[4px] bg-white/30 rounded-full z-50 overflow-hidden">
            <Animated.View 
              style={{
                height: '100%',
                backgroundColor: 'white',
                width: progressAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0%', '100%']
                })
              }}
            />
          </View>

          {/* Clean Image (No Overlay) */}
          <Image 
            source={{ uri: bgImage }} 
            className="w-full h-full" 
            resizeMode="cover"
          />
          
          {/* Optional: Close Button */}
          <TouchableOpacity 
            onPress={() => setIsFullscreen(false)}
            className="absolute top-16 right-5 bg-black/20 p-2 rounded-full"
          >
            <Text className="text-white font-bold">✕</Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

// trending card
const TrendingCard = ({ bgImage, avatarUrl, name, stroage_key }: any) => {
  return (
    <View>
      
      <View  
        className="relative rounded-[8px] w-full h-[280px] overflow-hidden"
      >
        <View className="p-4 flex flex-col justify-between z-[1] h-full">
          <View className="flex flex-row items-center gap-2">
            <View className="w-12 h-12 bg-blue-500 rounded-full">
              <Image source={{ uri: avatarUrl }} className="w-full h-full rounded-full" />
            </View>
            <View className="flex flex-col">
              <Text className="text-white font-normal text-[18px]" numberOfLines={1}>{name}</Text>
              <Text className="text-white font-normal text-[14px]" numberOfLines={1}>@nisharga_kabir</Text>
            </View>
          </View>
          
         
          <View className="flex flex-row items-center gap-4">
            <LikeButton stroage_key={stroage_key} />

            <TouchableOpacity 
              onPress={() => console.log('hi')}
              activeOpacity={0.8}
              className="rounded-full overflow-hidden" // overflow-hidden is key for rounded blur
            >
            <BlurView 
              intensity={30} // Adjust blur strength (0-100)
              tint="dark"   // 'light', 'dark', or 'default'
              className="flex-row items-center px-3 py-1"
            >
              <MessageIcon size={16} color="white" />
              <Text className="text-white font-medium ml-1 text-[14px]">120K</Text>
            </BlurView>
            </TouchableOpacity>

             <TouchableOpacity 
              onPress={() => console.log('hi')}
              activeOpacity={0.8}
              className="rounded-full overflow-hidden" // overflow-hidden is key for rounded blur
            >
            <BlurView 
              intensity={30} // Adjust blur strength (0-100)
              tint="dark"   // 'light', 'dark', or 'default'
              className="flex-row items-center px-3 py-1"
            >
              <FlyIcon size={16} color="white" />
              <Text className="text-white font-medium ml-1 text-[14px]">120K</Text>
            </BlurView>
            </TouchableOpacity>
          </View>

          
        </View>

        <Image source={{ uri: bgImage }} className="absolute top-0 left-0 w-full h-full z-[-2]" />
        <View className="absolute top-0 left-0 w-full h-full bg-black/20 z-[-1]" /> 
        

      </View>
 
    </View>
  );
};




const LikeButton = ({stroage_key}: {stroage_key: string}) => {
  const [count, setCount] = useState(1);
  const STORAGE_KEY = stroage_key;

  // 1. Load data from Storage when app starts
  useEffect(() => {
    const loadCount = async () => {
      try {
        const savedCount = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedCount !== null) {
          setCount(parseInt(savedCount));
        }
      } catch (e) {
        console.error("Failed to load count", e);
      }
    };
    loadCount();
  }, []);

  // 2. Handle Press: Update State + Save to Storage
  const handlePress = async () => {
    try {
      const newCount = count + 1;
      setCount(newCount);
      await AsyncStorage.setItem(STORAGE_KEY, newCount.toString());
    } catch (e) {
      console.error("Failed to save count", e);
    }
  };

  return (
    <TouchableOpacity 
      onPress={handlePress}
      activeOpacity={0.8}
      className="rounded-full overflow-hidden"
    >
      <BlurView 
        intensity={30} 
        tint="dark"
        className="flex-row items-center px-3 py-1"
      >
        {
          count > 1 ? <HeartIconFull size={16} color="white" /> : <HeartIconBlank size={16} color="white" />
        }
        <Text className="text-white font-medium ml-1 text-[14px]">
          {count}K
        </Text>
      </BlurView>
    </TouchableOpacity>
  );
}