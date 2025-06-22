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
import { useState, useEffect } from 'react';
import { HttpClient } from "../../net/HttpClient.ts";
import type { AvailableUser, FriendsStruct } from "../../net/FriendsStruct.ts";
import { chatbox, trash, close } from 'ionicons/icons';
import ChatComponent from '../chat/ChatComponent.tsx';
import { SharedPreferences } from '../../utilities/SharedPreferences.ts';

export const FriendsPage = ({ friends }: { friends: FriendsStruct }) => {
    const [searchText, setSearchText] = useState('');
    const [filteredFriends, setFilteredFriends] = useState<AvailableUser[]>([]);

    const [friendUsername, setFriendUsername] = useState<string | null>(null);
    const [friendID, setFriendID] = useState<number | null>(null);

    const [openChatUser, setOpenChatUser] = useState<boolean>(false);
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
            response = await httpClient.removeFriend(username);
            showAlert(response);
            setFilteredFriends(filteredFriends.filter(value => value.username !== username));
            console.log(response)

        } catch (error) {
            showAlert(error as string || response as string);
        }
    }

    async function addFriend(username: string) {
        let response;

        try {
            response = await httpClient.addFriend(username);
            showAlert(response);
        } catch (error) {
            showAlert(error as string || response as string);
        }

    }


    async function searchUser(searchUsername: string) {
        if (!searchUsername) return;
        searchUsername = searchUsername.trim();
        const data = await SharedPreferences.getUserData();
        if (!data) return;

        const { username } = data;

        if (searchUsername.length >= 3 && searchUsername !== username) {
            const data: AvailableUser[] = await httpClient.getUsersByName(searchUsername.toLowerCase());
            if (data.length > 0) {
                setFilteredFriends(data);
            }
        }else{
            presentAlert({
                header: 'Information',
                message: 'Username must be at least 3 characters long and different from your own username',
                buttons: ['OK']
            });
        }

    }   

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
                    {friend.avatar ? <img src={friend.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : friend.username.charAt(0)}
                </div>
            </IonAvatar>
            <IonLabel>
                <a href={`/profile/${friend.username}`} style={{textDecoration: 'none', color: 'black'}}>{friend.username}</a>
                <p>{new Date(friend.registered).toISOString().slice(0, 10)}</p>
            </IonLabel>
            <IonButton slot="end" color="primary" onClick={() => {
                setFriendUsername(friend.username);
                setFriendID(friend.id);
                setOpenChatUser(true);
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
                    {user.avatar ? <img src={user.avatar} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : user.username.charAt(0)}
                </div>
            </IonAvatar>
            <IonLabel>
            <a href={`/profile/${user.username}`} style={{textDecoration: 'none', color: 'black'}}>{user.username}</a>
            <p>Registered: {new Date(user.registered).toISOString().slice(0, 10)}</p>
            </IonLabel>
            <IonButton slot="end" color="primary" onClick={() => addFriend(user.username)}>
                Add Friend
            </IonButton>
        </IonItem>
    );

    useEffect(() => {
        if (searchText.length === 0) {
            setFilteredFriends([]);
        }
    }, [searchText]);

    return (
        <>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
            <IonSearchbar
                value={searchText}
                onIonChange={e => setSearchText(e.detail.value!)}
                placeholder="Search for users"
            />
                <IonButton onClick={() => searchUser(searchText)}>Search</IonButton>
            </div>
            <IonList>
                {filteredFriends && filteredFriends.length > 0 ?
                    filteredFriends.map(renderAvailableUser)
                    : friends.friends.length > 0 ? 
                    friends.friends.map(renderFriend) : "No friends"}
            </IonList>
            {openChatUser && (
                <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
                    <div style={{ position: 'relative', background: '#fff', borderRadius: 12, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', width: '90%', maxWidth: '500px', height: '80%', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '8px', borderBottom: '1px solid #eee' }}>
                            <IonButton 
                                fill="clear" 
                                color="medium" 
                                onClick={() => setOpenChatUser(false)}
                            >
                                <IonIcon icon={close} />
                            </IonButton>
                        </div>
                        <div style={{ flex: 1, overflow: 'hidden' }}>
                            <ChatComponent userName={friendUsername} userID={friendID} setChatOpen={setOpenChatUser}/>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
