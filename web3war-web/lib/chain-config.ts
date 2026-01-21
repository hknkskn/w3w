export const MODULE_ADDRESS = "0x5b6ef2a1e31fe53dc530d8265c390cc11c105f3b33c9ed995be610401110464d";

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
    COIN_TYPE: `${MODULE_ADDRESS}::cred_coin::CRED`,

    // Added for Service Compatibility
    CRED_COIN: `${MODULE_ADDRESS}::cred_coin`,
    COUNTRY: `${MODULE_ADDRESS}::country`,
    POLITICS: `${MODULE_ADDRESS}::politics`,
    TREASURY: `${MODULE_ADDRESS}::treasury`,
} as const;
