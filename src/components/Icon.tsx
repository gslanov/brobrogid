import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'search' | 'sliders' | 'mountain' | 'flag' | 'fork' | 'museum' | 'calendar' | 'bookmark'
  | 'route' | 'arrowR' | 'chevR' | 'chevL' | 'chevDown' | 'heart' | 'compass' | 'pin' | 'user'
  | 'plus' | 'headphones' | 'cheese' | 'drop' | 'x' | 'check' | 'star' | 'clock' | 'nav'
  | 'layers' | 'locate' | 'footsteps' | 'share' | 'camera' | 'ticket' | 'offline' | 'unlock'
  | 'bell' | 'sun' | 'download' | 'settings';

type P = { stroke: string; strokeWidth: number; fill: string; strokeLinecap: 'round'; strokeLinejoin: 'round' };

const ICONS: Record<IconName, (p: P) => React.ReactNode[]> = {
  search: (p) => [<Circle key="0" cx={11} cy={11} r={7} {...p} />, <Path key="1" d="m20 20-3-3" {...p} />],
  sliders: (p) => [<Path key="0" d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h6M14 18h6" {...p} />],
  mountain: (p) => [<Path key="0" d="M2 21L9 7l4 7 3-5 6 12z" {...p} />],
  flag: (p) => [<Path key="0" d="M5 21V4h11l-2 3 2 3H5" {...p} />],
  fork: (p) => [<Path key="0" d="M7 3v8a2 2 0 0 0 2 2v8M5 3v5M9 3v5M16 3c-2 0-2 9 0 9v8" {...p} />],
  museum: (p) => [<Path key="0" d="M3 21h18M5 21v-9M9 21v-9M15 21v-9M19 21v-9M3 12l9-7 9 7" {...p} />],
  calendar: (p) => [<Rect key="0" x={3} y={5} width={18} height={16} rx={2} {...p} />, <Path key="1" d="M3 10h18M8 3v4M16 3v4" {...p} />],
  bookmark: (p) => [<Path key="0" d="M6 4h12v16l-6-4-6 4z" {...p} />],
  route: (p) => [<Circle key="0" cx={6} cy={6} r={2} {...p} />, <Circle key="1" cx={18} cy={18} r={2} {...p} />, <Path key="2" d="M8 6c4 0 4 12 8 12" {...p} />],
  arrowR: (p) => [<Path key="0" d="M5 12h14M13 6l6 6-6 6" {...p} />],
  chevR: (p) => [<Path key="0" d="M9 6l6 6-6 6" {...p} />],
  chevL: (p) => [<Path key="0" d="M15 6l-6 6 6 6" {...p} />],
  chevDown: (p) => [<Path key="0" d="M6 9l6 6 6-6" {...p} />],
  heart: (p) => [<Path key="0" d="M12 21C12 21 5 16 5 10a4 4 0 0 1 7-3 4 4 0 0 1 7 3c0 6-7 11-7 11Z" {...p} />],
  compass: (p) => [<Circle key="0" cx={12} cy={12} r={9} {...p} />, <Path key="1" d="M15.5 8.5l-2 5-5 2 2-5z" {...p} />],
  pin: (p) => [<Path key="0" d="M12 22s-7-8-7-13a7 7 0 0 1 14 0c0 5-7 13-7 13z" {...p} />, <Circle key="1" cx={12} cy={9} r={2.5} {...p} />],
  user: (p) => [<Circle key="0" cx={12} cy={8} r={4} {...p} />, <Path key="1" d="M5 21c0-4 3.5-6 7-6s7 2 7 6" {...p} />],
  plus: (p) => [<Path key="0" d="M12 5v14M5 12h14" {...p} />],
  headphones: (p) => [<Path key="0" d="M4 14v-2a8 8 0 0 1 16 0v2" {...p} />, <Rect key="1" x={3} y={14} width={4} height={6} rx={1.5} {...p} />, <Rect key="2" x={17} y={14} width={4} height={6} rx={1.5} {...p} />],
  cheese: (p) => [<Path key="0" d="M3 17l16-9 2 9z" {...p} />, <Path key="1" d="M3 17h18" {...p} />, <Path key="2" d="M8 14v3" {...p} />, <Path key="3" d="M12 12v5" {...p} />, <Path key="4" d="M16 11v6" {...p} />],
  drop: (p) => [<Path key="0" d="M12 3s6 7 6 12a6 6 0 0 1-12 0c0-5 6-12 6-12z" {...p} />],
  x: (p) => [<Path key="0" d="M6 6l12 12M18 6L6 18" {...p} />],
  check: (p) => [<Path key="0" d="M5 12l5 5 9-11" {...p} />],
  star: (p) => [<Path key="0" d="M12 2l3 7h7l-5 5 2 7-7-4-7 4 2-7-5-5h7z" {...p} />],
  clock: (p) => [<Circle key="0" cx={12} cy={12} r={9} {...p} />, <Path key="1" d="M12 7v5l3 3" {...p} />],
  nav: (p) => [<Path key="0" d="M3 11l18-7-7 18-2.5-7.5z" {...p} />],
  layers: (p) => [<Path key="0" d="M12 3l9 5-9 5-9-5 9-5z" {...p} />, <Path key="1" d="M3 13l9 5 9-5" {...p} />],
  locate: (p) => [<Circle key="0" cx={12} cy={12} r={4} {...p} />, <Path key="1" d="M12 2v3M12 19v3M2 12h3M19 12h3" {...p} />],
  footsteps: (p) => [<Path key="0" d="M7 4c1.5 0 2.5 2 2 4.5S9 13 7.5 13 5 11 5.5 8.5 5.5 4 7 4z" {...p} />, <Path key="1" d="M16 8c1.5 0 2.5 2 2 4.5S17 17 15.5 17 13 15 13.5 12.5 14.5 8 16 8z" {...p} />],
  share: (p) => [<Circle key="0" cx={6} cy={12} r={2.5} {...p} />, <Circle key="1" cx={17} cy={6} r={2.5} {...p} />, <Circle key="2" cx={17} cy={18} r={2.5} {...p} />, <Path key="3" d="M8.2 11l6.6-3.8M8.2 13l6.6 3.8" {...p} />],
  camera: (p) => [<Rect key="0" x={3} y={7} width={18} height={13} rx={2} {...p} />, <Path key="1" d="M9 7V5h6v2" {...p} />, <Circle key="2" cx={12} cy={13.5} r={3.5} {...p} />],
  ticket: (p) => [<Path key="0" d="M4 9a2 2 0 0 0 2-2h12a2 2 0 0 0 2 2 2 2 0 0 0 0 6 2 2 0 0 0-2 2H6a2 2 0 0 0-2-2 2 2 0 0 0 0-6z" {...p} />],
  offline: (p) => [<Path key="0" d="M3 3l18 18M6.3 9.3A8 8 0 0 1 18 9a5 5 0 0 1 2 9.6M8 13a4 4 0 0 0-1 5" {...p} />],
  unlock: (p) => [<Rect key="0" x={5} y={11} width={14} height={9} rx={2} {...p} />, <Path key="1" d="M8 11V8a4 4 0 0 1 7.5-2" {...p} />],
  bell: (p) => [<Path key="0" d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z" {...p} />, <Path key="1" d="M10 20a2 2 0 0 0 4 0" {...p} />],
  sun: (p) => [<Circle key="0" cx={12} cy={12} r={4} {...p} />, <Path key="1" d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1.5 1.5M17.5 17.5L19 19M19 5l-1.5 1.5M6.5 17.5L5 19" {...p} />],
  download: (p) => [<Path key="0" d="M12 4v10m0 0l-4-4m4 4l4-4M5 20h14" {...p} />],
  settings: (p) => [<Circle key="0" cx={12} cy={12} r={3} {...p} />, <Path key="1" d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2" {...p} />],
};

export function Icon({
  name, size = 22, color = '#0A0A0A', sw = 1.9, filled = false,
}: {
  name: IconName; size?: number; color?: string; sw?: number; filled?: boolean;
}) {
  const p: P = {
    stroke: filled ? 'none' : color,
    strokeWidth: filled ? 0 : sw,
    fill: filled ? color : 'none',
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };
  const render = ICONS[name];
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {render ? render(p) : null}
    </Svg>
  );
}
