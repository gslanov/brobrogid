import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/Icon';
import { CATEGORIES, PLACES } from '@/lib/data';
import { PHOTOS } from '@/lib/photos';
import { C, F, R } from '@/theme';

export default function Category() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const cat = CATEGORIES[String(id)] ?? CATEGORIES.kreposti;
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <View style={{ flex: 1, backgroundColor: C.dark }}>
      <StatusBar style="light" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        <View style={{ height: 300 }}>
          <Image source={PHOTOS[cat.hero]} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <LinearGradient colors={['rgba(11,11,13,0.45)', 'rgba(11,11,13,0)', 'rgba(11,11,13,0.55)', C.dark]} locations={[0, 0.3, 0.72, 1]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          <Pressable onPress={() => router.back()} style={{ position: 'absolute', top: insets.top + 6, left: 18, width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="chevL" size={22} color="#fff" sw={2.2} />
          </Pressable>
          <View style={{ position: 'absolute', left: 20, right: 20, bottom: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7, marginBottom: 10 }}>
              <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: C.accent }} />
              <Text style={{ fontSize: 10.5, fontFamily: F.xb, letterSpacing: 2, textTransform: 'uppercase', color: C.accentLight }}>Категория</Text>
            </View>
            <Text style={{ fontSize: 32, fontFamily: F.xb, color: '#fff', letterSpacing: -1, lineHeight: 34 }}>{cat.title}</Text>
            <Text style={{ fontSize: 14, fontFamily: F.sb, color: 'rgba(255,255,255,0.7)', marginTop: 6 }}>{cat.sub}</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 16, paddingTop: 16, gap: 13 }}>
          {cat.places.map((slug) => {
            const p = PLACES[slug];
            if (!p) return null;
            return (
              <Pressable key={slug} onPress={() => router.push(`/poi/${slug}`)} style={{ height: 168, borderRadius: R.tile, overflow: 'hidden' }}>
                <Image source={PHOTOS[p.photo]} style={{ width: '100%', height: '100%' }} contentFit="cover" />
                <LinearGradient colors={['rgba(0,0,0,0.1)', 'rgba(0,0,0,0.8)']} locations={[0.35, 1]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
                <View style={{ position: 'absolute', top: 12, right: 12, flexDirection: 'row', alignItems: 'center', gap: 5, backgroundColor: 'rgba(11,11,13,0.7)', paddingHorizontal: 9, paddingVertical: 5, borderRadius: 999 }}>
                  <Icon name="star" size={13} color={C.warn} filled />
                  <Text style={{ fontSize: 12.5, fontFamily: F.xb, color: '#fff' }}>{p.rating}</Text>
                </View>
                <View style={{ position: 'absolute', left: 15, right: 15, bottom: 14 }}>
                  <Text style={{ fontSize: 19, fontFamily: F.xb, color: '#fff', letterSpacing: -0.3 }}>{p.name}</Text>
                  <Text style={{ fontSize: 12.5, fontFamily: F.sb, color: 'rgba(255,255,255,0.75)', marginTop: 3 }}>{p.cat}</Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}
