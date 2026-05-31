import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Eyebrow, RedTall, Tile } from '@/components/cards';
import { Icon, type IconName } from '@/components/Icon';
import { PHOTOS, type PhotoKey } from '@/lib/photos';
import { C, F, R } from '@/theme';

const GAP = 11;
const TALL = 120 * 2 + GAP; // two-row tile height

const NICHE: { photo: PhotoKey; title: string; sub: string; icon: IconName; cat: string }[] = [
  { photo: 'cheese', title: 'Сыроварни', sub: 'Горный сыр у мастеров', icon: 'cheese', cat: 'eda' },
  { photo: 'karmadon', title: 'Минеральные источники', sub: 'Тёплые нарзаны', icon: 'drop', cat: 'priroda' },
  { photo: 'tsmyti', title: 'Башни-усыпальницы', sub: 'Родовые некрополи', icon: 'flag', cat: 'kreposti' },
  { photo: 'fiagdon', title: 'Горные курорты', sub: 'Фиагдон, Цей', icon: 'mountain', cat: 'priroda' },
];
const AFISHA = [
  { d: '29', t: 'Концерт «Хор Алан»', m: 'Филармония · сегодня 19:00' },
  { d: '31', t: 'Фестиваль осетинского пирога', m: 'Центр Владикавказа · 12:00' },
  { d: '02', t: 'Восхождение к Реком', m: 'Цейское ущелье · сбор 07:00' },
];

export default function Home() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const cat = (id: string) => router.push(`/category/${id}`);

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingTop: insets.top + 6, paddingBottom: 130 }}>
        {/* header */}
        <View style={{ paddingHorizontal: 16, paddingBottom: 14, flexDirection: 'row', gap: 9 }}>
          <Pressable onPress={() => router.push('/search')} style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 9, backgroundColor: C.card, borderRadius: 14, paddingHorizontal: 15, paddingVertical: 13, borderWidth: 1, borderColor: C.border }}>
            <Icon name="search" size={20} color={C.ink} sw={2} />
            <Text style={{ fontSize: 14.5, fontFamily: F.sb, color: C.muted }}>Поиск по Осетии</Text>
          </Pressable>
          <View style={{ width: 48, height: 48, borderRadius: 14, backgroundColor: C.ink, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="sliders" size={21} color="#fff" sw={2} />
          </View>
        </View>

        {/* bento mosaic: two aligned columns */}
        <View style={{ paddingHorizontal: 16, flexDirection: 'row', gap: GAP }}>
          {/* left column */}
          <View style={{ flex: 1, gap: GAP }}>
            <Tile photo="midagrabin" label="Природа" count="32 места" icon="mountain" height={TALL} fs={19} onPress={() => cat('priroda')} />
            <Tile photo="pies" label="Где поесть" count="22" icon="fork" height={120} onPress={() => cat('eda')} />
            <Tile photo="rekom" label="Святилища" count="7" icon="museum" height={120} onPress={() => cat('kreposti')} />
            <Tile photo="fiagdon" label="Где жить" count="40" icon="bookmark" height={120} onPress={() => cat('priroda')} />
          </View>
          {/* right column */}
          <View style={{ flex: 1, gap: GAP }}>
            <Tile photo="vgd" label="Афиша" count="12" icon="calendar" height={120} onPress={() => cat('kreposti')} />
            <Tile photo="dzivgis" label="Крепости" count="14" icon="flag" height={120} onPress={() => cat('kreposti')} />
            <RedTall height={TALL} onPress={() => router.push('/route/tri-ushelya')} />
            <Tile photo="karmadon" label="Маршруты" count="25" icon="route" height={120} onPress={() => router.push('/route/tri-ushelya')} />
          </View>
        </View>

        {/* Необычное в Осетии */}
        <View style={{ paddingHorizontal: 16, paddingTop: 26, paddingBottom: 6, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
          <Eyebrow>Необычное в Осетии</Eyebrow>
          <Icon name="chevR" size={18} color={C.soft} sw={2.2} />
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 8, gap: 12 }}>
          {NICHE.map((n) => (
            <Pressable key={n.title} onPress={() => cat(n.cat)} style={{ width: 158, borderRadius: R.tile, overflow: 'hidden', borderWidth: 1, borderColor: C.border, backgroundColor: C.card }}>
              <View style={{ height: 106 }}>
                <Image source={PHOTOS[n.photo]} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={200} />
                <View style={{ position: 'absolute', top: 9, left: 9, width: 26, height: 26, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.92)', alignItems: 'center', justifyContent: 'center' }}>
                  <Icon name={n.icon} size={15} color={C.ink} sw={1.9} />
                </View>
              </View>
              <View style={{ paddingHorizontal: 13, paddingTop: 11, paddingBottom: 13 }}>
                <Text style={{ fontSize: 14.5, fontFamily: F.xb, color: C.ink }}>{n.title}</Text>
                <Text style={{ fontSize: 11.5, fontFamily: F.sb, color: C.muted, marginTop: 4 }}>{n.sub}</Text>
              </View>
            </Pressable>
          ))}
        </ScrollView>

        {/* Сейчас в Осетии — афиша */}
        <View style={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 6 }}>
          <Eyebrow>Сейчас в Осетии</Eyebrow>
        </View>
        <View style={{ paddingHorizontal: 16, gap: 10 }}>
          {AFISHA.map((e) => (
            <Pressable key={e.t} onPress={() => cat('kreposti')} style={{ flexDirection: 'row', gap: 13, alignItems: 'center', backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12 }}>
              <View style={{ width: 48, alignItems: 'center', backgroundColor: C.ink, borderRadius: 12, paddingVertical: 9 }}>
                <Text style={{ fontSize: 19, fontFamily: F.xb, color: '#fff', lineHeight: 20 }}>{e.d}</Text>
                <Text style={{ fontSize: 9, fontFamily: F.xb, letterSpacing: 1.4, color: C.accentLight, marginTop: 3 }}>МАЙ</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 14.5, fontFamily: F.xb, color: C.ink }}>{e.t}</Text>
                <Text style={{ fontSize: 12, fontFamily: F.sb, color: C.muted, marginTop: 3 }}>{e.m}</Text>
              </View>
              <Icon name="chevR" size={18} color={C.soft} sw={2.2} />
            </Pressable>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}
