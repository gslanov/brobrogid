import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/Icon';
import { PLACES } from '@/lib/data';
import { PHOTOS } from '@/lib/photos';
import { C, F, R } from '@/theme';

const ACTIONS: { icon: IconName; t: string }[] = [
  { icon: 'route', t: 'Маршрут' }, { icon: 'camera', t: 'Фото 18' }, { icon: 'flag', t: 'Был тут' },
];

export default function Poi() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const p = PLACES[String(id)] ?? PLACES.dzivgis;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [fav, setFav] = useState(false);

  const info: { icon: IconName; label: string; val: string; accent?: boolean }[] = [
    { icon: 'clock', label: 'Время в пути', val: p.getTo },
    { icon: 'ticket', label: 'Вход', val: p.entry, accent: p.entry === 'Бесплатно' },
    { icon: 'sun', label: 'Лучшее время', val: p.best },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {/* hero */}
        <View style={{ height: 330 }}>
          <Image source={PHOTOS[p.photo]} style={{ width: '100%', height: '100%' }} contentFit="cover" />
          <LinearGradient colors={['rgba(0,0,0,0.35)', 'rgba(0,0,0,0)', 'rgba(0,0,0,0)', C.bg]} locations={[0, 0.3, 0.72, 1]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
          <View style={{ position: 'absolute', top: insets.top + 6, left: 18, right: 18, flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable onPress={() => router.back()} style={roundBtn}><Icon name="chevL" size={22} color={C.ink} sw={2.2} /></Pressable>
            <View style={{ flexDirection: 'row', gap: 9 }}>
              <Pressable style={roundBtn}><Icon name="share" size={19} color={C.ink} sw={1.9} /></Pressable>
              <Pressable onPress={() => setFav((v) => !v)} style={[roundBtn, fav && { backgroundColor: C.accent }]}>
                <Icon name="heart" size={19} color={fav ? '#fff' : C.ink} sw={2} filled={fav} />
              </Pressable>
            </View>
          </View>
          <View style={{ position: 'absolute', bottom: 30, left: 0, right: 0, flexDirection: 'row', justifyContent: 'center', gap: 6 }}>
            {[0, 1, 2, 3, 4].map((i) => (
              <View key={i} style={{ width: i === 0 ? 18 : 6, height: 6, borderRadius: 999, backgroundColor: i === 0 ? '#fff' : 'rgba(255,255,255,0.5)' }} />
            ))}
          </View>
        </View>

        {/* body */}
        <View style={{ paddingHorizontal: 20, marginTop: -4 }}>
          <Text style={{ fontSize: 10.5, fontFamily: F.xb, letterSpacing: 1.5, textTransform: 'uppercase', color: C.accent, marginBottom: 8 }}>{p.cat}</Text>
          <Text style={{ fontSize: 27, fontFamily: F.xb, color: C.ink, letterSpacing: -0.8, lineHeight: 30, marginBottom: 11 }}>{p.name}</Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, marginBottom: 18 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name="star" size={16} color={C.warn} filled />
              <Text style={{ fontSize: 14, fontFamily: F.xb, color: C.ink }}>{p.rating}</Text>
              <Text style={{ fontSize: 14, fontFamily: F.sb, color: C.soft }}>({p.reviews})</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
              <Icon name="pin" size={15} color={C.muted} sw={2} />
              <Text style={{ fontSize: 13.5, fontFamily: F.sb, color: C.muted }}>{p.dist}</Text>
            </View>
          </View>

          {/* actions */}
          <View style={{ flexDirection: 'row', gap: 10, marginBottom: 20 }}>
            {ACTIONS.map((a) => (
              <View key={a.t} style={{ flex: 1, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 14, paddingVertical: 12, alignItems: 'center', gap: 6 }}>
                <Icon name={a.icon} size={21} color={C.ink} sw={1.9} />
                <Text style={{ fontSize: 11.5, fontFamily: F.b, color: C.ink }}>{a.t}</Text>
              </View>
            ))}
          </View>

          {/* tabs */}
          <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
            {['Информация', 'На карте', 'Рядом'].map((t, i) => (
              <View key={t} style={{ paddingHorizontal: 15, paddingVertical: 9, borderRadius: 999, backgroundColor: i === 0 ? C.ink : C.card, borderWidth: 1, borderColor: i === 0 ? C.ink : C.border }}>
                <Text style={{ fontSize: 13, fontFamily: F.b, color: i === 0 ? '#fff' : C.ink2 }}>{t}</Text>
              </View>
            ))}
          </View>

          <Text style={{ fontSize: 14.5, fontFamily: F.m, lineHeight: 23, color: C.ink2, marginBottom: 18 }}>{p.desc}</Text>

          {/* audio guide (premium → paywall) */}
          <Pressable onPress={() => router.push('/paywall')} style={{ backgroundColor: C.ink, borderRadius: 16, paddingHorizontal: 16, paddingVertical: 15, flexDirection: 'row', alignItems: 'center', gap: 13, marginBottom: 18 }}>
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: C.accent, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="headphones" size={22} color="#fff" sw={2} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ fontSize: 15, fontFamily: F.xb, color: '#fff' }}>Аудиогид · 12 мин</Text>
              <Text style={{ fontSize: 12, fontFamily: F.m, color: 'rgba(255,255,255,0.55)', marginTop: 1 }}>Озвучил местный историк</Text>
            </View>
            <Text style={{ fontSize: 13, fontFamily: F.xb, color: C.accentLight }}>Слушать</Text>
          </Pressable>

          {/* info rows */}
          {info.map((r, i) => (
            <View key={r.label} style={{ flexDirection: 'row', alignItems: 'center', gap: 13, paddingVertical: 13, borderBottomWidth: i < info.length - 1 ? 1 : 0, borderBottomColor: C.border }}>
              <View style={{ width: 38, height: 38, borderRadius: 11, backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={r.icon} size={19} color={C.ink} sw={1.9} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 11, fontFamily: F.b, letterSpacing: 0.8, textTransform: 'uppercase', color: C.soft }}>{r.label}</Text>
                <Text style={{ fontSize: 14.5, fontFamily: F.b, color: r.accent ? C.accent : C.ink, marginTop: 1 }}>{r.val}</Text>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const roundBtn = { width: 40, height: 40, borderRadius: 999, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center' as const, justifyContent: 'center' as const };
