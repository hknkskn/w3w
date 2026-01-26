export const MODULE_ADDRESS = "0xe532ef18c989fde915229d42dcbecfccd5866bd0b2916e78264a3594bbd0b4aa";

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
    ADMIN: `${MODULE_ADDRESS}::admin`,
    GAME_TREASURY: `${MODULE_ADDRESS}::game_treasury`,
    COIN_TYPE: `${MODULE_ADDRESS}::cred_coin::CRED`,
    SOCIAL: `${MODULE_ADDRESS}::social`,
    ALLIANCE: `${MODULE_ADDRESS}::alliance`,

    // Added for Service Compatibility
    CRED_COIN: `${MODULE_ADDRESS}::cred_coin`,
    COUNTRY: `${MODULE_ADDRESS}::country`,
    POLITICS: `${MODULE_ADDRESS}::politics`,
    TREASURY: `${MODULE_ADDRESS}::treasury`,
} as const;
