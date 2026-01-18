export const MODULE_ADDRESS = "0x4fdc2525b820cc79baf4b4534247b40169d31606f11bd4170e6d2afed365b858";

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
} as const;
