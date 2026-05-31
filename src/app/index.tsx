import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { PHOTOS, type PhotoKey } from '@/lib/photos';
import { C, F } from '@/theme';

type Slide = { img: PhotoKey; eyebrow: string; title: string; text: string };
const SLIDES: Slide[] = [
  { img: 'kazbek', eyebrow: 'Северная Осетия · Алания', title: 'Весь регион\nв кармане', text: 'Офлайн-карта, 80+ мест и готовые маршруты по горам Осетии.' },
  { img: 'dzivgis', eyebrow: 'Истории и места', title: 'Не просто точки\nна карте', text: 'Аудиогиды от местных историков и крепости, к которым не возят туристов.' },
  { img: 'tsey', eyebrow: 'Готово к поездке', title: 'Работает\nбез интернета', text: 'Скачайте регион — карта, маршруты и описания будут с вами в любом ущелье.' },
];

export default function Onboarding() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [i, setI] = useState(0);
  const s = SLIDES[i];
  const last = i === SLIDES.length - 1;
  const done = () => router.replace('/home');

  return (
    <View style={{ flex: 1, backgroundColor: '#000' }}>
      <Image source={PHOTOS[s.img]} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" transition={250} />
      <LinearGradient
        colors={['rgba(10,12,10,0.4)', 'rgba(10,12,10,0)', 'rgba(10,12,10,0.55)', 'rgba(8,10,8,0.97)']}
        locations={[0, 0.3, 0.6, 1]}
        style={{ position: 'absolute', width: '100%', height: '100%' }}
      />
      {/* brand + skip */}
      <View style={{ position: 'absolute', top: insets.top + 6, left: 24, right: 24, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <View style={{ width: 34, height: 34, borderRadius: 11, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="mountain" size={20} color="#fff" sw={2.2} />
          </View>
          <Text style={{ color: '#fff', fontFamily: F.xb, fontSize: 16 }}>BROBROGID</Text>
        </View>
        <Pressable onPress={done} hitSlop={10}><Text style={{ color: 'rgba(255,255,255,0.8)', fontFamily: F.b, fontSize: 14 }}>Пропустить</Text></Pressable>
      </View>
      {/* bottom content */}
      <View style={{ position: 'absolute', left: 24, right: 24, bottom: insets.bottom + 28 }}>
        <View style={{ flexDirection: 'row', gap: 6, marginBottom: 20 }}>
          {SLIDES.map((_, j) => (
            <View key={j} style={{ width: j === i ? 22 : 7, height: 7, borderRadius: 999, backgroundColor: j === i ? C.accent : 'rgba(255,255,255,0.4)' }} />
          ))}
        </View>
        <Text style={{ fontSize: 11, fontFamily: F.xb, letterSpacing: 2, textTransform: 'uppercase', color: C.accentLight, marginBottom: 12 }}>{s.eyebrow}</Text>
        <Text style={{ fontSize: 38, fontFamily: F.xb, color: '#fff', lineHeight: 38, letterSpacing: -1, marginBottom: 14 }}>{s.title}</Text>
        <Text style={{ fontSize: 15.5, fontFamily: F.m, lineHeight: 23, color: 'rgba(255,255,255,0.82)', marginBottom: 24, maxWidth: 320 }}>{s.text}</Text>
        <Pressable
          onPress={() => (last ? done() : setI(i + 1))}
          style={{ backgroundColor: C.accent, paddingVertical: 17, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9 }}
        >
          <Text style={{ color: '#fff', fontSize: 16, fontFamily: F.xb }}>{last ? 'Начать' : 'Далее'}</Text>
          <Icon name="arrowR" size={20} color="#fff" sw={2.2} />
        </Pressable>
        <Pressable onPress={() => router.push('/paywall')} style={{ marginTop: 13, alignItems: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 14, fontFamily: F.b }}>Открыть полный гид · 499 ₽</Text>
        </Pressable>
      </View>
    </View>
  );
}
