import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { C, F } from '@/theme';
import { Icon, type IconName } from './Icon';

type Tab = { name: string; label: string; icon: IconName };
const TABS: Tab[] = [
  { name: 'home', label: 'Сегодня', icon: 'compass' },
  { name: 'map', label: 'Карта', icon: 'pin' },
  { name: 'favorites', label: 'Избранное', icon: 'heart' },
  { name: 'profile', label: 'Профиль', icon: 'user' },
];

export function TabBar({ state, navigation }: any) {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const activeName = state?.routes?.[state.index]?.name;

  const go = (name: string) => {
    const route = state.routes.find((r: any) => r.name === name);
    const focused = name === activeName;
    const event = navigation.emit({ type: 'tabPress', target: route?.key, canPreventDefault: true });
    if (!focused && !event?.defaultPrevented) navigation.navigate(name);
  };

  const left = TABS.slice(0, 2);
  const right = TABS.slice(2);

  return (
    <View style={[styles.bar, { paddingBottom: Math.max(insets.bottom, 10), height: 64 + Math.max(insets.bottom, 10) }]}>
      {left.map((t) => <TabBtn key={t.name} t={t} active={activeName === t.name} onPress={() => go(t.name)} />)}

      {/* center red FAB → route planner */}
      <Pressable style={styles.fabWrap} onPress={() => router.push('/route/tri-ushelya')} hitSlop={8}>
        <View style={styles.fab}>
          <Icon name="route" size={26} color="#fff" sw={2} />
        </View>
      </Pressable>

      {right.map((t) => <TabBtn key={t.name} t={t} active={activeName === t.name} onPress={() => go(t.name)} />)}
    </View>
  );
}

function TabBtn({ t, active, onPress }: { t: Tab; active: boolean; onPress: () => void }) {
  const color = active ? C.accent : C.soft;
  return (
    <Pressable style={styles.tab} onPress={onPress} hitSlop={6}>
      <Icon name={t.icon} size={24} color={color} sw={active ? 2.2 : 1.9} filled={active && t.icon === 'heart'} />
      <Text style={{ fontSize: 10.5, color, fontFamily: active ? F.xb : F.sb, marginTop: 4 }}>{t.label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-around',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderTopWidth: 1,
    borderTopColor: C.border,
    paddingTop: 10,
    paddingHorizontal: 8,
  },
  tab: { width: 64, alignItems: 'center', justifyContent: 'flex-start' },
  fabWrap: { width: 64, alignItems: 'center', justifyContent: 'flex-start', marginTop: -6 },
  fab: {
    width: 54, height: 54, borderRadius: 18, backgroundColor: C.accent,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.accent, shadowOpacity: 0.5, shadowRadius: 12, shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
});
