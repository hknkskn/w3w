import React from 'react';

declare global {
    namespace JSX {
        interface IntrinsicElements {
            'model-viewer': ModelViewerJSX;
        }
    }

    namespace React {
        namespace JSX {
            interface IntrinsicElements {
                'model-viewer': ModelViewerJSX;
            }
        }
    }
}

interface ModelViewerJSX extends React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> {
    src?: string;
    alt?: string;
    poster?: string;
    loading?: 'auto' | 'lazy' | 'eager';
    reveal?: 'auto' | 'interaction' | 'manual';
    'camera-controls'?: boolean;
    'auto-rotate'?: boolean;
    'camera-orbit'?: string;
    'field-of-view'?: string;
    'camera-target'?: string;
    'shadow-intensity'?: string;
    'environment-image'?: string;
    exposure?: string;
    ar?: boolean;
    'ar-modes'?: string;
    'ar-scale'?: string;
    'ar-placement'?: string;
    [key: string]: any;
}

export { };
