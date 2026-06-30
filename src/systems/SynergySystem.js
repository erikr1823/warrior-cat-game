import { SYNERGY_DEFINITIONS, getSynergyDefinition } from "../config/SynergyDefinitions.js";

// Tracks which Synergies the player has unlocked this run, decides which are
// currently offerable (requirements met), and holds the short XP damage buff
// used by Magnetized Power.
export class SynergySystem {
  constructor() {
    this.acquired = new Set();
    this.magnetizedBuffTime = 0;
  }

  has(id) {
    return this.acquired.has(id);
  }

  acquireSynergy(id, game) {
    if (this.acquired.has(id)) {
      return;
    }

    this.acquired.add(id);
  }

  ownsWeaponInGroup(game, group) {
    return group.some((weaponId) => game.weaponSystem.weapons.has(weaponId));
  }

  meetsRequirement(game, synergy) {
    const requires = synergy.requires ?? {};
    const weaponGroups = requires.weaponGroups ?? [];
    const passives = requires.passives ?? [];

    for (const group of weaponGroups) {
      if (!this.ownsWeaponInGroup(game, group)) {
        return false;
      }
    }

    for (const passiveId of passives) {
      if (!game.passiveSystem.ownsPassive(passiveId)) {
        return false;
      }
    }

    return true;
  }

  onXPCollected() {
    if (this.has("magnetizedPower")) {
      this.magnetizedBuffTime = 2.5;
    }
  }

  getDamageMultiplier() {
    return this.magnetizedBuffTime > 0 ? 1.18 : 1;
  }

  update(deltaTime) {
    if (this.magnetizedBuffTime > 0) {
      this.magnetizedBuffTime = Math.max(0, this.magnetizedBuffTime - deltaTime);
    }
  }

  getOwnedSynergySummary() {
    return [...this.acquired].map((id) => {
      const definition = getSynergyDefinition(id);
      return {
        id,
        name: definition?.name ?? id,
        color: definition?.color ?? "#7ec8ff",
      };
    });
  }

  getAvailableSynergyChoices(game) {
    return SYNERGY_DEFINITIONS.filter(
      (synergy) => !this.acquired.has(synergy.id) && this.meetsRequirement(game, synergy),
    ).map((synergy) => ({
      type: "synergy",
      synergyId: synergy.id,
      name: synergy.name,
      description: synergy.description,
      color: synergy.color,
      rank: 0,
      maxRank: 1,
    }));
  }
}
