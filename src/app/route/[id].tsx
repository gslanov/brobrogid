import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { PHOTOS, type PhotoKey } from '@/lib/photos';
import { C, F } from '@/theme';

const POINTS: { photo: PhotoKey; t: string; s: string; slug: string }[] = [
  { photo: 'dzivgis', t: 'Дзивгисская крепость', s: 'Наскальная крепость XIII века', slug: 'dzivgis' },
  { photo: 'rekom', t: 'Святилище Реком', s: 'Древнее аланское капище', slug: 'rekom' },
  { photo: 'midagrabin', t: 'Мидаграбинские водопады', s: 'Высочайшие водопады Европы', slug: 'midagrabin' },
  { photo: 'dargavs', t: 'Город мёртвых Даргавс', s: '99 склепов-усыпальниц', slug: 'dargavs' },
];
const STATS: { icon: IconName; t: string }[] = [
  { icon: 'nav', t: '58 км' }, { icon: 'clock', t: '8 часов' }, { icon: 'mountain', t: 'Средний' },
];

export default function RouteDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 120 }}>
        {/* hero */}
        <View style={{ height: 300 }}>
          <Image source={PHOTOS.fiagdon} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0.5)', C.bg]} locations={[0, 0.35, 0.7, 1]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          <View style={{ position: 'absolute', top: insets.top + 6, left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable onPress={() => router.back()} style={pill}><Icon name="chevL" size={22} color={C.ink} sw={2.2} /></Pressable>
            <Pressable style={pill}><Icon name="heart" size={19} color={C.ink} sw={2} /></Pressable>
          </View>
          <View style={{ position: 'absolute', left: 20, right: 20, bottom: 18 }}>
            <View style={{ alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: C.accent, paddingHorizontal: 11, paddingVertical: 6, borderRadius: 999, marginBottom: 10 }}>
              <Icon name="route" size={13} color="#fff" sw={2.4} />
              <Text style={{ fontSize: 10.5, fontFamily: F.xb, letterSpacing: 1, textTransform: 'uppercase', color: '#fff' }}>Маршрут · 1 день</Text>
            </View>
            <Text style={{ fontSize: 28, fontFamily: F.xb, color: '#fff', letterSpacing: -0.8, lineHeight: 30 }}>Три ущелья за день</Text>
          </View>
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {/* stats */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 18 }}>
            {STATS.map((s) => (
              <View key={s.t} style={{ flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 6 }}>
                <Icon name={s.icon} size={20} color={C.ink} sw={1.9} />
                <Text style={{ fontSize: 12.5, fontFamily: F.xb, color: C.ink }}>{s.t}</Text>
              </View>
            ))}
          </View>
          {/* tabs */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 18 }}>
            {['Места', 'Информация', 'На карте'].map((t, i) => (
              <View key={t} style={{ paddingHorizontal: 15, paddingVertical: 9, borderRadius: 999, backgroundColor: i === 0 ? C.ink : C.card, borderWidth: 1, borderColor: i === 0 ? C.ink : C.border }}>
                <Text style={{ fontSize: 13, fontFamily: F.b, color: i === 0 ? '#fff' : C.ink2 }}>{t}</Text>
              </View>
            ))}
          </View>
          {/* timeline points */}
          <View style={{ position: 'relative' }}>
            <View style={{ position: 'absolute', left: 25, top: 14, bottom: 40, width: 2, backgroundColor: C.borderStrong }} />
            <View style={{ gap: 12 }}>
              {POINTS.map((p, i) => (
                <Pressable key={p.slug} onPress={() => router.push(`/poi/${p.slug}`)} style={{ flexDirection: 'row', gap: 14, alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 13, paddingVertical: 11 }}>
                  <View style={{ width: 28, height: 28, borderRadius: 999, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center', borderWidth: 3, borderColor: C.bg }}>
                    <Text style={{ fontSize: 13, fontFamily: F.xb, color: '#fff' }}>{i + 1}</Text>
                  </View>
                  <Image source={PHOTOS[p.photo]} style={{ width: 54, height: 54, borderRadius: 12 }} contentFit="cover" />
                  <View style={{ flex: 1 }}>
                    <Text style={{ fontSize: 14.5, fontFamily: F.xb, color: C.ink }}>{p.t}</Text>
                    <Text style={{ fontSize: 12, fontFamily: F.sb, color: C.muted, marginTop: 3 }}>{p.s}</Text>
                  </View>
                  <Icon name="chevR" size={18} color={C.soft} sw={2.2} />
                </Pressable>
              ))}
            </View>
          </View>
        </View>
      </ScrollView>
      {/* bottom CTA */}
      <View style={{ position: 'absolute', left: 16, right: 16, bottom: insets.bottom + 14 }}>
        <Pressable style={{ backgroundColor: C.accent, paddingVertical: 17, borderRadius: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 9,
          shadowColor: C.accent, shadowOpacity: 0.4, shadowRadius: 18, shadowOffset: { width: 0, height: 12 }, elevation: 6 }}>
          <Icon name="nav" size={20} color="#fff" sw={2.2} />
          <Text style={{ fontSize: 16, fontFamily: F.xb, color: '#fff' }}>Построить маршрут</Text>
        </Pressable>
      </View>
    </View>
  );
}

const pill = { width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center' as const, justifyContent: 'center' as const };
