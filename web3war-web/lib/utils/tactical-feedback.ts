export type TacticalKey =
    | 'INSUFFICIENT_ENERGY'
    | 'INSUFFICIENT_CREDITS'
    | 'TX_FAILED'
    | 'RANK_LOW'
    | 'STRENGTH_LOW'
    | 'COOLDOWN_ACTIVE'
    | 'NOT_REGISTERED'
    | 'ACCESS_DENIED'
    | 'WAR_DECLARED'
    | 'MISSION_COMPLETE'
    | 'SUPPLY_RESTORED';

export interface TacticalMessage {
    title: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'success';
}

export const TACTICAL_DICTIONARY: Record<TacticalKey, TacticalMessage> = {
    INSUFFICIENT_ENERGY: {
        title: 'Operational Fatigue',
        message: 'Troops exhausted. Operational efficiency compromised. Energy restoration required via field rations.',
        severity: 'warning'
    },
    INSUFFICIENT_CREDITS: {
        title: 'Supply Chain Broken',
        message: 'National bank requisition failed. Insufficient CRED for this directive.',
        severity: 'error'
    },
    TX_FAILED: {
        title: 'Comms Jammed',
        message: 'Blockchain uplink interrupted. Signal lost in electromagnetic interference. Try again, Commander.',
        severity: 'error'
    },
    RANK_LOW: {
        title: 'Restricted Clearance',
        message: 'Military rank inadequate for this directive. XP accumulation required for higher clearance.',
        severity: 'warning'
    },
    STRENGTH_LOW: {
        title: 'Readiness Failure',
        message: 'Physical readiness check failed. Combat strength below required threshold for this mission.',
        severity: 'warning'
    },
    COOLDOWN_ACTIVE: {
        title: 'Systems Overheated',
        message: 'Targeting systems recalibrating. Interval between strikes required for weapon cooling.',
        severity: 'info'
    },
    NOT_REGISTERED: {
        title: 'Invalid ID Tags',
        message: 'Directive rejected: Citizen metadata not found in regional registry. Initialization required.',
        severity: 'error'
    },
    ACCESS_DENIED: {
        title: 'Intel Breach',
        message: 'Unauthorized access detected. Security protocols activated. Request denied.',
        severity: 'error'
    },
    WAR_DECLARED: {
        title: 'Strategic Escalation',
        message: 'War declaration broadcasting to all sectors. Deployment protocols active.',
        severity: 'warning'
    },
    MISSION_COMPLETE: {
        title: 'Mission Objective Reached',
        message: 'Objective secured. Tactical victory confirmed. Awaiting next command.',
        severity: 'success'
    },
    SUPPLY_RESTORED: {
        title: 'Logistics Refilled',
        message: 'Supply drop successful. Combat readiness restored at peak capacity.',
        severity: 'success'
    }
};

export const getTacticalFeedback = (key: TacticalKey): TacticalMessage => {
    return TACTICAL_DICTIONARY[key];
};
