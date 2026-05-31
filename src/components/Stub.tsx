import { useRouter } from 'expo-router';
import { Pressable, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from './Icon';
import { C, F } from '@/theme';

/** Temporary placeholder for screens not yet built. */
export function Stub({ title, tab = false }: { title: string; tab?: boolean }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  return (
    <View style={{ flex: 1, backgroundColor: C.bg, paddingTop: insets.top + 10 }}>
      {!tab && (
        <Pressable onPress={() => router.back()} style={{ marginLeft: 16, width: 42, height: 42, borderRadius: 13, backgroundColor: C.card, borderWidth: 1, borderColor: C.border, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="chevL" size={22} color={C.ink} sw={2.2} />
        </Pressable>
      )}
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        <Icon name="mountain" size={34} color={C.borderStrong} sw={1.8} />
        <Text style={{ fontSize: 20, fontFamily: F.xb, color: C.ink }}>{title}</Text>
        <Text style={{ fontSize: 13.5, fontFamily: F.sb, color: C.soft }}>экран в работе</Text>
      </View>
    </View>
  );
}
