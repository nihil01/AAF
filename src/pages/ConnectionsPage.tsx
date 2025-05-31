import {
    IonContent,
    IonLabel,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonSkeletonText
} from "@ionic/react";

import {FriendsPage} from "./FriendsPage.tsx";
import {RequestsPage} from "./RequestsPage.tsx";
import {NearbyPage} from "./NearbyPage.tsx";
import {useState, useEffect} from "react";
import {HttpClient} from "../net/HttpClient.ts";
import type {FriendsStruct} from "../net/FriendsStruct.ts";

export const ConnectionsPage = () => {
    const [activeSegment, setActiveSegment] = useState("friends");
    const [isLoading, setIsLoading] = useState(true);
    const [friends, setFriends] = useState({});

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: FriendsStruct = await new HttpClient().getFriends();
                setFriends(response);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setTimeout(() => setIsLoading(false), 1000);
            }
        };

        fetchData();
    }, []);

    const renderSkeleton = () => (
        <div style={{ padding: 20 }}>
            <IonSkeletonText animated style={{ width: '60%', height: '20px', marginBottom: '12px' }} />
            <IonSkeletonText animated style={{ width: '90%', height: '50px', marginBottom: '12px' }} />
            <IonSkeletonText animated style={{ width: '80%', height: '50px', marginBottom: '12px' }} />
        </div>
    );

    const renderActivePage = () => {
        if (isLoading) {
            return renderSkeleton();
        }

        switch (activeSegment) {
            case "friends":
                return <FriendsPage friends={friends}/>;
            case "requests":
                return <RequestsPage friends={friends}/>;
            case "nearby":
                return <NearbyPage/>;
            default:
                return <FriendsPage friends={friends}/>;
        }
    };

    return (
        <IonPage>
            <IonContent className="ion-padding nontransparent-content">
                <IonSegment value={activeSegment} onIonChange={e => setActiveSegment(e.detail.value!)}>
                    <IonSegmentButton value="friends">
                        <IonLabel>My Friends</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="requests">
                        <IonLabel>Requests</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="nearby">
                        <IonLabel>Nearby</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                <div className="ion-margin-top friends-tab">
                    {renderActivePage()}
                </div>
            </IonContent>
        </IonPage>
    );
};
