export const BaseEvent = {
    Hidden: 'page:hidden',
    Visible: 'page:visible',
    Ping: 'ping',
} as const;

export type BaseEventMap = {
    [BaseEvent.Hidden]: void;
    [BaseEvent.Visible]: void;
    [BaseEvent.Ping]: { message: string };
};
