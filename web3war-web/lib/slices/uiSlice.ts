import { StateCreator } from 'zustand';
import { GameState } from '../store';
import { getTacticalFeedback, TacticalKey } from '../utils/tactical-feedback';

export type NotificationType = 'alert' | 'confirm' | 'prompt';
export type NotificationSeverity = 'info' | 'warning' | 'error' | 'success';

interface NotificationState {
    id: string;
    type: NotificationType;
    severity: NotificationSeverity;
    title: string;
    message: string;
    inputValue?: string;
    resolve: (value: any) => void;
}

export interface UISlice {
    activeNotification: NotificationState | null;
    idsAlert: (message: string, title?: string, severity?: NotificationSeverity) => Promise<void>;
    idsTacticalAlert: (key: TacticalKey) => Promise<void>;
    idsConfirm: (message: string, title?: string, severity?: NotificationSeverity) => Promise<boolean>;
    idsPrompt: (message: string, defaultValue?: string, title?: string) => Promise<string | null>;
    closeNotification: (value?: any) => void;
    explosionId: number;
    triggerExplosion: () => void;
}

export const createUISlice: StateCreator<GameState, [], [], UISlice> = (set, get) => ({
    activeNotification: null,

    idsAlert: (message, title = 'Notification', severity = 'info') => {
        return new Promise((resolve) => {
            set({
                activeNotification: {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'alert',
                    severity,
                    title,
                    message,
                    resolve,
                },
            });
        });
    },

    idsTacticalAlert: (key) => {
        const { title, message, severity } = getTacticalFeedback(key);
        return get().idsAlert(message, title, severity);
    },

    idsConfirm: (message, title = 'Confirmation', severity = 'warning') => {
        return new Promise((resolve) => {
            set({
                activeNotification: {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'confirm',
                    severity,
                    title,
                    message,
                    resolve,
                },
            });
        });
    },

    idsPrompt: (message, defaultValue = '', title = 'Input Required') => {
        return new Promise((resolve) => {
            set({
                activeNotification: {
                    id: Math.random().toString(36).substr(2, 9),
                    type: 'prompt',
                    severity: 'info',
                    title,
                    message,
                    inputValue: defaultValue,
                    resolve,
                },
            });
        });
    },

    closeNotification: (value = null) => {
        const { activeNotification } = get();
        if (activeNotification) {
            activeNotification.resolve(value);
            set({ activeNotification: null });
        }
    },
    explosionId: 0,
    triggerExplosion: () => {
        set((state) => ({ explosionId: state.explosionId + 1 }));
    },
});
