export const MODULE_ADDRESS = "0x1d1e94af4bdb824f3d9e2f7aad72cf76b42f95a341ee384c876ba4976e3b27fe";

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
} as const;
