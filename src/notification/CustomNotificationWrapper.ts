import type {ActionPerformed} from "@capacitor/push-notifications";

export interface CustomNotificationWrapper extends ActionPerformed{
    data?: {
        title: string;
        body: string;
        id: number;
        collapseId: string;
        dataLink: string;
    }
}