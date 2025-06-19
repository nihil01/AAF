import {
    IonList,
    IonItem,
    IonAvatar,
    IonLabel,
    IonSearchbar,
    IonButton,
    useIonAlert,
    IonIcon
} from '@ionic/react';
import { useState, useEffect, useRef } from 'react';
import { HttpClient } from "../../net/HttpClient.ts";
import type { AvailableUser, FriendsStruct } from "../../net/FriendsStruct.ts";
import { chatbox, trash, close } from 'ionicons/icons';
import ChatComponent from '../chat/ChatComponent.tsx';

export const FriendsPage = ({ friends }: { friends: FriendsStruct }) => {
    const [searchText, setSearchText] = useState('');
    const [filteredFriends, setFilteredFriends] = useState<AvailableUser[]>([]);

    const [friendUsername, setFriendUsername] = useState<string | null>(null);
    const [friendID, setFriendID] = useState<number | null>(null);

    const timeoutRef = useRef<NodeJS.Timeout>(null);
    const [presentAlert] = useIonAlert();
    const httpClient = new HttpClient();

    const showAlert = (message: string) => {
        presentAlert({
            header: 'Information',
            message: message,
            buttons: ['OK']
        });
    };

    async function removeFriend(username: string) {
        if (!username) return;
        let response;
        try {
            console.log(123)
            response = await httpClient.removeFriend(username);
            showAlert(response);
            setFilteredFriends(filteredFriends.filter(value => value.username !== username));
            console.log(response)

        } catch (error) {
            showAlert(error as string || response as string);
        }
    }

    async function addFriend(username: string) {
        if (!username) return;
        let response;

        try {
            response = await httpClient.addFriend(username);
            showAlert(response);
        } catch (error) {
            showAlert(error as string || response as string);
        }
    }

    useEffect(() => {

        if (searchText.length >= 3) {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);

            timeoutRef.current = setTimeout(async () => {
                try {
                    const data: AvailableUser[] = await httpClient.getUsersByName(searchText.toLowerCase());
                    if (data.length > 0) {
                        setFilteredFriends(data);
                    }
                } catch (error) {
                    console.error('Error searching for users:', error);
                }
            }, 2000);
        } else {
            setFilteredFriends(friends.friends);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [searchText]);

    const renderFriend = (friend: AvailableUser) => (
        <IonItem key={friend.username}>
            <IonAvatar slot="start">
                <div style={{
                    backgroundColor: `hsl(${Math.random() * 360}, 70%, 90%)`,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9333ea',
                    fontSize: '1.125rem',
                    fontWeight: '500'
                }}>
                    {friend.username.charAt(0)}
                </div>
            </IonAvatar>
            <IonLabel>
                <h2>{friend.username}</h2>
                <p>{new Date(friend.registered).toISOString().slice(0, 10)}</p>
            </IonLabel>
            <IonButton slot="end" color="primary" onClick={() => {
                setFriendUsername(friend.username);
                setFriendID(friend.id);
            }}>
                <IonIcon icon={chatbox} />
            </IonButton>
            <IonButton slot="end" color="danger" onClick={() => removeFriend(friend.username)}>
                <IonIcon icon={trash} />
            </IonButton>
        </IonItem>
    );

    const renderAvailableUser = (user: AvailableUser) => (
        <IonItem key={user.username}>
            <IonAvatar slot="start">
                <div style={{
                    backgroundColor: `hsl(${Math.random() * 360}, 70%, 90%)`,
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#9333ea',
                    fontSize: '1.125rem',
                    fontWeight: '500'
                }}>
                    {user.username.charAt(0)}
                </div>
            </IonAvatar>
            <IonLabel>
                <h2>{user.username}</h2>
                <p>Registered: {new Date(user.registered).toISOString().slice(0, 10)}</p>
            </IonLabel>
            <IonButton slot="end" color="primary" onClick={() => addFriend(user.username)}>
                Add Friend
            </IonButton>
        </IonItem>
    );

    return (
        <>
            <IonSearchbar
                value={searchText}
                onIonChange={e => setSearchText(e.detail.value!)}
                placeholder="Search for users"
            />
            <IonList>
                {filteredFriends && filteredFriends.length > 0 ?
                    searchText.length >= 3
                        ? filteredFriends.map(renderAvailableUser)
                        : filteredFriends.map(renderFriend)
                    : "No friends"}
            </IonList>
            {friendUsername && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ position: 'relative', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
                        <IonButton style={{ position: 'absolute', top: 8, right: 8, zIndex: 10 }} fill="clear" color="medium" onClick={() => setOpenChatUser(null)}>
                            <IonIcon icon={close} />
                        </IonButton>
                        <ChatComponent userName={friendUsername} userID={friendID}/>
                    </div>
                </div>
            )}
        </>
    );
};
