export interface BridgeConfig {
  mainSpan: number;
  sideSpan: number;
  totalSpan: number;
  deckHeight: number;
  deckWidth: number;
  deckThickness: number;
  towerHeight: number;
  towerX: number;
  towerDepth: number;
  towerWidth: number;
  cableSag: number;
  cableRadius: number;
  cableAnchorHeight: number;
  mainCableOffset: number;
  suspenderSpacing: number;
  suspenderRadius: number;
  suspenderTowerClearance: number;
  anchorBlockLength: number;
  anchorBlockWidth: number;
  anchorBlockHeight: number;
}

const mainSpan = 420;
const sideSpan = 120;

export const BRIDGE_CONFIG: BridgeConfig = {
  mainSpan,
  sideSpan,
  totalSpan: mainSpan + sideSpan * 2,
  deckHeight: 18,
  deckWidth: 18,
  deckThickness: 4.2,
  towerHeight: 145,
  towerX: mainSpan * 0.5,
  towerDepth: 12,
  towerWidth: 26,
  cableSag: 52,
  cableRadius: 1.6,
  cableAnchorHeight: 34,
  mainCableOffset: 12,
  suspenderSpacing: 10,
  suspenderRadius: 0.22,
  suspenderTowerClearance: 10,
  anchorBlockLength: 44,
  anchorBlockWidth: 32,
  anchorBlockHeight: 26
};
