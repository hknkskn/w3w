export const MODULE_ADDRESS = "0xcaf6e8d1bfdf1ab274938b67b4b37b9fb533be505e0c4a380846bf6096d4b0c6";

export const WE3WAR_MODULES = {
    CITIZEN: `${MODULE_ADDRESS}::citizen`,
    BATTLE: `${MODULE_ADDRESS}::battle`,
    MARKETPLACE: `${MODULE_ADDRESS}::marketplace`,
    COMPANY: `${MODULE_ADDRESS}::company`,
    INVENTORY: `${MODULE_ADDRESS}::inventory`,
    TERRITORY: `${MODULE_ADDRESS}::territory`,
    GOVERNANCE: `${MODULE_ADDRESS}::governance`,
    TRAINING: `${MODULE_ADDRESS}::training`,
    MILITARY_UNIT: `${MODULE_ADDRESS}::military_unit`,
    NEWSPAPER: `${MODULE_ADDRESS}::newspaper`,
    COIN_TYPE: `${MODULE_ADDRESS}::cred_coin::CRED`,
} as const;
