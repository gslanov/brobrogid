import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { PHOTOS } from '@/lib/photos';
import { C, F } from '@/theme';

const FEATS: { icon: IconName; t: string }[] = [
  { icon: 'offline', t: 'Офлайн-карта всей Осетии' },
  { icon: 'pin', t: '80+ мест с описаниями' },
  { icon: 'headphones', t: 'Аудиогиды от местных' },
  { icon: 'route', t: 'Готовые маршруты 1–3 дня' },
  { icon: 'x', t: 'Никакой рекламы' },
];

export default function Paywall() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.card }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: insets.bottom + 28 }}>
        <View style={{ height: 250 }}>
          <Image source={PHOTOS.dargavs} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.25)', 'rgba(0,0,0,0)', C.card]} locations={[0, 0.4, 1]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          <Pressable onPress={() => router.back()} style={{ position: 'absolute', top: insets.top + 8, right: 20, width: 34, height: 34, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="x" size={18} color={C.ink} sw={2.2} />
          </Pressable>
        </View>
        <View style={{ paddingHorizontal: 22, marginTop: -12 }}>
          <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 7, backgroundColor: C.accentSoft, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, marginBottom: 14 }}>
            <Icon name="unlock" size={14} color={C.accentDark} sw={2.2} />
            <Text style={{ fontSize: 11, fontFamily: F.xb, color: C.accentDark }}>Разовая покупка · навсегда</Text>
          </View>
          <Text style={{ fontSize: 29, fontFamily: F.xb, color: C.ink, letterSpacing: -0.8, lineHeight: 31, marginBottom: 8 }}>Гид по Северной Осетии</Text>
          <Text style={{ fontSize: 14.5, fontFamily: F.m, color: C.muted, lineHeight: 21, marginBottom: 22 }}>Купили один раз — остаётся у вас. Работает без интернета в горах.</Text>

          <View style={{ gap: 13, marginBottom: 26 }}>
            {FEATS.map((f) => (
              <View key={f.t} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View style={{ width: 26, height: 26, borderRadius: 8, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name="check" size={15} color={C.accent} sw={2.6} />
                </View>
                <Text style={{ fontSize: 14.5, fontFamily: F.sb, color: C.ink }}>{f.t}</Text>
              </View>
            ))}
          </View>

          <Pressable style={{ backgroundColor: C.accent, paddingVertical: 18, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
            shadowColor: C.accent, shadowOpacity: 0.45, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 5 }}>
            <Text style={{ fontSize: 16.5, fontFamily: F.xb, color: '#fff' }}>Купить гид · 499 ₽</Text>
          </Pressable>
          <Text style={{ textAlign: 'center', marginTop: 16, fontSize: 12, fontFamily: F.sb, color: C.soft }}>Без подписок и скрытых платежей · Restore</Text>
        </View>
      </ScrollView>
    </View>
  );
}
