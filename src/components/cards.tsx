import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { C, F, R } from '@/theme';
import { PHOTOS, type PhotoKey } from '@/lib/photos';
import { Icon, type IconName } from './Icon';

export function Eyebrow({ children, color = C.accent }: { children: string; color?: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 7 }}>
      <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color }} />
      <Text style={{ fontSize: 10.5, fontFamily: F.xb, letterSpacing: 2, textTransform: 'uppercase', color }}>{children}</Text>
    </View>
  );
}

export function Tile({
  photo, label, count, icon, height, onPress, fs = 16, style,
}: {
  photo: PhotoKey; label: string; count?: string; icon: IconName; height: number;
  onPress?: () => void; fs?: number; style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={[{ height, borderRadius: R.tile, overflow: 'hidden', borderWidth: 1, borderColor: C.border }, style]}>
      <Image source={PHOTOS[photo]} style={{ position: 'absolute', width: '100%', height: '100%' }} contentFit="cover" transition={200} />
      <LinearGradient colors={['rgba(0,0,0,0.04)', 'rgba(0,0,0,0.74)']} locations={[0.35, 1]} style={{ position: 'absolute', width: '100%', height: '100%' }} />
      <View style={{ position: 'absolute', top: 10, left: 10, width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.9)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={16} color={C.ink} sw={1.9} />
      </View>
      <View style={{ position: 'absolute', left: 12, right: 12, bottom: 11 }}>
        <Text style={{ fontSize: fs, fontFamily: F.xb, color: '#fff', letterSpacing: -0.2 }}>{label}</Text>
        {count ? <Text style={{ fontSize: 11, fontFamily: F.sb, color: 'rgba(255,255,255,0.82)', marginTop: 2 }}>{count}</Text> : null}
      </View>
    </Pressable>
  );
}

export function RedTall({ height, onPress }: { height: number; onPress?: () => void }) {
  return (
    <Pressable onPress={onPress} style={{ height, borderRadius: R.tile, overflow: 'hidden', padding: 18, justifyContent: 'space-between' }}>
      <LinearGradient colors={[C.accent, '#C2310E', '#E0431A']} locations={[0, 0.6, 1]} style={{ position: 'absolute', width: '100%', height: '100%' }} start={{ x: 0, y: 0 }} end={{ x: 0.4, y: 1 }} />
      <View style={{ width: 44, height: 44, borderRadius: 13, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="mountain" size={24} color="#fff" sw={2.2} />
      </View>
      <View>
        <Text style={{ fontSize: 10.5, fontFamily: F.xb, letterSpacing: 2, textTransform: 'uppercase', color: 'rgba(255,255,255,0.85)', marginBottom: 6 }}>Советует</Text>
        <Text style={{ fontSize: 20, fontFamily: F.xb, color: '#fff', letterSpacing: -0.3, lineHeight: 23 }}>Топ-10 мест{'\n'}на выходные</Text>
        <View style={{ marginTop: 14, alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(255,255,255,0.92)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 999 }}>
          <Text style={{ fontSize: 13, fontFamily: F.xb, color: C.accent }}>Смотреть</Text>
          <Icon name="arrowR" size={16} color={C.accent} sw={2.6} />
        </View>
      </View>
    </Pressable>
  );
}
