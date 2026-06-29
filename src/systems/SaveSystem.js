import { META_UPGRADE_DEFINITIONS } from "../config/MetaUpgradeDefinitions.js";
import { DEFAULT_CHARACTER_ID, isValidCharacterId } from "../config/CharacterDefinitions.js";

const STORAGE_KEY = "lanternfallSaveV1";
const LEGACY_STORAGE_KEY = "warriorCatSaveV1";

function createDefaultMetaUpgrades() {
  const levels = {};

  for (const upgrade of META_UPGRADE_DEFINITIONS) {
    levels[upgrade.id] = 0;
  }

  return levels;
}

export function createDefaultSaveData() {
  return {
    totalCoins: 0,
    selectedCharacter: DEFAULT_CHARACTER_ID,
    metaUpgrades: createDefaultMetaUpgrades(),
    settings: {
      muted: false,
    },
  };
}

export class SaveSystem {
  load() {
    try {
      const raw =
        localStorage.getItem(STORAGE_KEY) ?? localStorage.getItem(LEGACY_STORAGE_KEY);

      if (!raw) {
        return createDefaultSaveData();
      }

      const parsed = JSON.parse(raw);
      return normalizeSaveData(parsed);
    } catch {
      return createDefaultSaveData();
    }
  }

  save(saveData) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(normalizeSaveData(saveData)));
  }

  reset() {
    localStorage.removeItem(STORAGE_KEY);
    return createDefaultSaveData();
  }
}

function normalizeSaveData(saveData) {
  const defaults = createDefaultSaveData();

  return {
    totalCoins: Number.isFinite(saveData?.totalCoins) ? Math.max(0, saveData.totalCoins) : 0,
    selectedCharacter: isValidCharacterId(saveData?.selectedCharacter)
      ? saveData.selectedCharacter
      : DEFAULT_CHARACTER_ID,
    metaUpgrades: {
      ...defaults.metaUpgrades,
      ...(saveData?.metaUpgrades ?? {}),
    },
    settings: {
      ...defaults.settings,
      ...(saveData?.settings ?? {}),
      muted: Boolean(saveData?.settings?.muted),
    },
  };
}
