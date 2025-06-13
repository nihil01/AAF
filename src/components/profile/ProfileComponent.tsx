import React from "react";
import './ProfilePage.css';
import {
    IonAvatar,
    IonBadge,
    IonButton,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonSegment,
    IonSegmentButton,
    IonTitle,
    IonToolbar
} from '@ionic/react';
import { useParams } from 'react-router-dom';
import { star, location, add } from 'ionicons/icons';
import { VehicleCard } from "./VehicleCard.tsx";
import { TripHistoryCard } from "./trip-history-card.tsx";
import { CustomLoaderComponent } from '../loader/CustomLoaderComponent';

export const ProfilePage: React.FC = () => {
    // Get userId from URL params
    const { userName } = useParams<{ userName?: string }>();
    const isOwnProfile = !userName;

    const [isLoading, setIsLoading] = React.useState(false);
    const [selectedTab, setSelectedTab] = React.useState("vehicles");

    const handleEditProfile = () => {
        setIsLoading(true);
        setTimeout(() => setIsLoading(false), 1000);
    };

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{isOwnProfile ? 'My Profile' : `${userName}'s Profile`}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen scrollY className="ion-padding nontransparent-content">

                {/* Profile Card */}
                <IonCard className="ion-margin-vertical">
                    <IonCardContent>
                        <div className="ion-padding-bottom ion-margin-bottom ion-border-bottom">
                            <div className="ion-flex ion-justify-content-between ion-align-items-start">
                                <div className="ion-flex">
                                    <IonAvatar className="ion-margin-end">
                                        <img src="https://img.heroui.chat/image/avatar?w=200&h=200&u=1" alt="profile" />
                                        <IonBadge color="success" className="avatar-badge"></IonBadge>
                                    </IonAvatar>
                                    <div>
                                        <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.3rem' }}>Alex Johnson</h2>
                                        <p className="ion-text-muted ion-margin-vertical">
                                            <IonIcon icon={location} className="ion-margin-end" />
                                            San Francisco, CA
                                        </p>
                                        <div className="ion-flex ion-align-items-center ion-margin-top">
                                            {[1, 2, 3, 4, 5].map((s) => (
                                                <IonIcon key={s} icon={star} color="warning" className="ion-margin-end-xs" />
                                            ))}
                                            <span className="ion-text-small ion-text-muted">4.9 (128)</span>
                                        </div>
                                    </div>
                                </div>
                                {isOwnProfile && (
                                    <IonButton size="small" fill="outline" onClick={handleEditProfile}>
                                        {isLoading ? <CustomLoaderComponent /> : 'Edit'}
                                    </IonButton>
                                )}
                            </div>
                        </div>

                        <div className="ion-margin-bottom">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>About</h3>
                            <p className="ion-text-wrap ion-text-muted">
                                Car enthusiast and frequent traveler. I take great care of my vehicles and expect the same from others. Clean driving record for 10+ years.
                            </p>
                        </div>

                        <div className="ion-flex ion-justify-content-around ion-text-center">
                            <div>
                                <p className="ion-text-large ion-font-bold">42</p>
                                <p className="ion-text-small">Trips</p>
                            </div>
                            <div>
                                <p className="ion-text-large ion-font-bold">3</p>
                                <p className="ion-text-small">Vehicles</p>
                            </div>
                            <div>
                                <p className="ion-text-large ion-font-bold">2019</p>
                                <p className="ion-text-small">Member Since</p>
                            </div>
                        </div>
                    </IonCardContent>
                </IonCard>

                {/* Segment Tabs */}
                <IonSegment value={selectedTab} onIonChange={e => setSelectedTab(e.detail.value!)}>
                    <IonSegmentButton value="vehicles">
                        {isOwnProfile ? 'My Vehicles' : 'Vehicles'}
                    </IonSegmentButton>
                    <IonSegmentButton value="history">
                        Trip History
                    </IonSegmentButton>
                    {isOwnProfile && (
                        <IonSegmentButton value="settings">
                            Settings
                        </IonSegmentButton>
                    )}
                </IonSegment>

                {/* Tab Content */}
                <div className="ion-padding-vertical">
                    {selectedTab === "vehicles" && (
                        <>
                            <VehicleCard
                                model="Tesla Model 3"
                                year="2022"
                                licensePlate="CA-ECO123"
                                image="https://img.heroui.chat/image/car?w=600&h=400&u=1"
                                rating={4.9}
                                trips={28}
                                isAvailable={true}
                            />
                            <VehicleCard
                                model="Jeep Wrangler"
                                year="2020"
                                licensePlate="CA-ADV456"
                                image="https://img.heroui.chat/image/car?w=600&h=400&u=2"
                                rating={4.7}
                                trips={14}
                                isAvailable={true}
                            />
                            {isOwnProfile && (
                                <IonButton
                                    expand="block"
                                    fill="outline"
                                    className="ion-margin-top"
                                >
                                    <IonIcon slot="start" icon={add} />
                                    Add New Vehicle
                                </IonButton>
                            )}
                        </>
                    )}

                    {selectedTab === "history" && (
                        <>
                            <TripHistoryCard
                                date="May 15, 2023"
                                vehicle="Tesla Model 3"
                                renter="Michael Smith"
                                duration="3 days"
                                amount="$210"
                                status="completed"
                            />
                            <TripHistoryCard
                                date="Apr 28, 2023"
                                vehicle="Jeep Wrangler"
                                renter="Sarah Johnson"
                                duration="2 days"
                                amount="$180"
                                status="completed"
                            />
                            <TripHistoryCard
                                date="Apr 10, 2023"
                                vehicle="Tesla Model 3"
                                renter="David Wilson"
                                duration="1 day"
                                amount="$100"
                            />
                        </>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};