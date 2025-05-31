import type {AvailableUser, FriendsStruct} from "../net/FriendsStruct.ts";
import {IonList, IonItem, IonLabel, IonButton, useIonAlert} from "@ionic/react";
import {useState} from "react";
import {HttpClient} from "../net/HttpClient.ts";

export const RequestsPage = ({friends}: {friends: FriendsStruct}) => {
    const httpClient = new HttpClient();
    const [presentAlert] = useIonAlert();

    const [awaiting, setAwaiting] = useState<AvailableUser[]>(friends.friendsAwaiting);

    const showAlert = (message: string) => {
        presentAlert({
            header: 'Information',
            message: message,
            buttons: ['OK']
        });
    };

    async function manageFriend(username: string, state: "accept" | "reject") {
        if (!username) return;
        try {
            const response = await httpClient.manageFriend(username, state);
            showAlert(response);
            friends.friendsAwaiting = friends.friendsAwaiting
                .filter(user => user.username !== username);

            setAwaiting(prev => prev.filter(user => user.username !== username));
        } catch (error) {
            showAlert((error as string) || 'Unknown error');
        }
    }

    return (
        <div>
            <IonList>
                {awaiting.length > 0 ? (
                    awaiting.map((friend) => (
                        <IonItem key={friend.username}>
                            <IonLabel>
                                <h2>{friend.username}</h2>
                                <p>Registered: {new Date(friend.registered).toISOString().slice(0, 10)}</p>
                            </IonLabel>
                            <IonButton color="danger" slot="end" onClick={() => manageFriend(friend.username, "reject")}>
                                Dismiss
                            </IonButton>
                            <IonButton color="success" slot="end" onClick={() => {
                                manageFriend(friend.username, "accept");
                                friends.friends.push(friend);
                            }}>
                                Accept
                            </IonButton>
                        </IonItem>
                    ))
                ) : (
                    <IonItem>
                        <IonLabel>No friend requests</IonLabel>
                    </IonItem>
                )}
            </IonList>
        </div>
    );
};
