export const MODULE_ADDRESS = "0xfe192a96bea96ec53397f6dbb529463d8371693043f18228ed8e7949ffc32de2";

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

    // Added for Service Compatibility
    CRED_COIN: `${MODULE_ADDRESS}::cred_coin`,
    COUNTRY: `${MODULE_ADDRESS}::country`,
    POLITICS: `${MODULE_ADDRESS}::politics`,
    TREASURY: `${MODULE_ADDRESS}::treasury`,
} as const;
