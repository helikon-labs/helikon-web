export const UIEvent = {
    Layout: {
        Resize: 'ui:layout:resize',
    },
    Theme: {
        Change: 'ui:theme:change',
    },
} as const;

export type UIEventMap = {
    [UIEvent.Layout.Resize]: { width: number; height: number };
    [UIEvent.Theme.Change]: 'dark' | 'light';
};
