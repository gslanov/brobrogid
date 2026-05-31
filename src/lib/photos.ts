// Bundled Ossetia photos (Wikimedia CC/PD) — keyed for require() so they ship offline.
export const PHOTOS = {
  kazbek: require('../../assets/photos/kazbek.jpg'),
  tsey: require('../../assets/photos/tsey.jpg'),
  dargavs: require('../../assets/photos/dargavs.jpg'),
  dzivgis: require('../../assets/photos/dzivgis.jpg'),
  midagrabin: require('../../assets/photos/midagrabin.jpg'),
  fiagdon: require('../../assets/photos/fiagdon.jpg'),
  karmadon: require('../../assets/photos/karmadon.jpg'),
  rekom: require('../../assets/photos/rekom.jpg'),
  pies: require('../../assets/photos/pies.jpg'),
  vgd: require('../../assets/photos/vgd.jpg'),
  tsmyti: require('../../assets/photos/tsmyti.jpg'),
  cheese: require('../../assets/photos/osetian-cheese.jpg'),
} as const;

export type PhotoKey = keyof typeof PHOTOS;
