import { useLanguage } from '../context/LanguageContext';

import {
    IonContent,
    IonLabel,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonSkeletonText
} from "@ionic/react";
import { useState, useEffect } from "react";
import { HttpClient } from "../net/HttpClient.ts";
import type { FriendsStruct } from "../net/FriendsStruct.ts";
import { FriendsPage } from "./FriendsPage.tsx";
import { RequestsPage } from "./RequestsPage.tsx";
import { NearbyPage } from "./NearbyPage.tsx";

export const ConnectionsPage = () => {
    const { translations } = useLanguage();
    const [activeSegment, setActiveSegment] = useState<string>("friends");
    const [isLoading, setIsLoading] = useState(true);
    const [friendsData, setFriendsData] = useState<FriendsStruct>({
        friends: [],
        friendsAwaiting: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response: FriendsStruct = await new HttpClient().getFriends();
                setFriendsData(response);
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
                return <FriendsPage friends={friendsData} />;
            case "requests":
                return <RequestsPage friends={friendsData} />;
            case "nearby":
                return <NearbyPage />;
            default:
                return <FriendsPage friends={friendsData} />;
        }
    };

    return (
        <IonPage>
            <IonContent className="ion-padding nontransparent-content">
                <IonSegment value={activeSegment} onIonChange={e => setActiveSegment(e.detail.value as string)}>
                        <IonSegmentButton value="friends">
                            <IonLabel className="segment-label">{translations.common.myFriends}</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="requests">
                        <IonLabel className="segment-label">{translations.common.requests}</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="nearby">
                        <IonLabel className="segment-label">{translations.common.nearby}</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                <div className="ion-margin-top friends-tab">
                    {renderActivePage()}
                </div>
            </IonContent>
        </IonPage>
    );
};
