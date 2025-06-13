import React, { useEffect, useState } from "react";
import './ProfilePage.css';
import {
    IonAvatar,
    IonBadge,
    IonCard,
    IonCardContent,
    IonContent,
    IonHeader,
    IonIcon,
    IonPage,
    IonTitle,
    IonToolbar,
    IonSkeletonText,
    IonToast,
    IonRefresher,
    IonRefresherContent
} from '@ionic/react';
import type { RefresherEventDetail } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { star, location, car } from 'ionicons/icons';
import { VehicleCard } from "../vehicles/VehicleCard";
import { useLanguage } from '../../context/LanguageContext';
import type { ProfileData, VehicleWithMedia } from "../../types/profile";


// API Service (mock for now, replace with actual API calls)
const fetchUserProfile = async (username?: string): Promise<ProfileData> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data
    return {
        username: username || 'currentUser',
        registered: '2019',
        vehicles: [
            {
                uuid: '1',
                id: 1,
                make: 'Tesla',
                model: 'Model 3',
                year: 2022,
                engineSpecs: 'Dual Motor AWD',
                horsePower: 450,
                torque: '639 Nm',
                zeroToHundred: '3.3s',
                story: 'A modern electric sedan with great range and performance.',
                modifications: JSON.stringify(['Performance Upgrade', 'Tinted Windows']),
                created_at: '2023-01-01T12:00:00Z',
                photo_urls: [
                    'https://img.heroui.chat/image/car?w=600&h=400&u=1',
                    'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2019_Toyota_Corolla_Icon_Tech_VVT-i_Hybrid_1.8.jpg/960px-2019_Toyota_Corolla_Icon_Tech_VVT-i_Hybrid_1.8.jpg'
                ]
            },
            {
                uuid: '2',
                id: 2,
                make: 'Jeep',
                model: 'Wrangler',
                year: 2020,
                engineSpecs: '3.6L V6',
                horsePower: 285,
                torque: '353 Nm',
                zeroToHundred: '6.8s',
                story: 'A rugged off-road SUV built for adventure.',
                modifications: JSON.stringify(['Lift Kit', 'Off-road Tires']),
                created_at: '2022-06-15T09:30:00Z',
                photo_urls: [
                    'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcK8LuTRihbc5t5dlS6Lw6Q710u02oN80LJw&s'
                ]
            }
        ]
    };
};

// Sub-components
const ProfileHeader: React.FC<{ profile: ProfileData, translations: any }> = ({ profile, translations }) => (
    <div className="ion-padding-bottom ion-margin-bottom ion-border-bottom">
        <div className="ion-flex">
            <IonAvatar className="ion-margin-end">
                <img src={profile.avatar} alt={profile.fullName} />
                <IonBadge color="success" className="avatar-badge" />
            </IonAvatar>
            <div>
                <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.3rem' }}>{profile.fullName}</h2>
               
                <div className="ion-flex ion-align-items-center ion-margin-top">
                    {[...Array(5)].map((_, i) => (
                        <IonIcon 
                            key={i} 
                            icon={star} 
                            color={i < Math.floor(profile.rating) ? "warning" : "medium"} 
                            className="ion-margin-end-xs" 
                        />
                    ))}
                  
                </div>
            </div>
        </div>
    </div>
);

// const ProfileStats: React.FC<{ stats: UserProfile['stats'], translations: any }> = ({ stats, translations }) => (
//     <div className="ion-flex ion-justify-content-around ion-text-center">
//         <div>
//             <p className="ion-text-large ion-font-bold">{stats.trips}</p>
//             <p className="ion-text-small">{translations.profile && translations.profile.trips ? translations.profile.trips : 'Trips'}</p>
//         </div>
//         <div>
//             <p className="ion-text-large ion-font-bold">{stats.vehicles}</p>
//             <p className="ion-text-small">{translations.profile && translations.profile.vehicles ? translations.profile.vehicles : 'Vehicles'}</p>
//         </div>
//         <div>
//             <p className="ion-text-large ion-font-bold">{stats.memberSince}</p>
//             <p className="ion-text-small">{translations.profile && translations.profile.memberSince ? translations.profile.memberSince : 'Member Since'}</p>
//         </div>
//     </div>
// );

// Main Component
export const ProfilePage: React.FC = () => {
    const { userName } = useParams<{ userName?: string }>();
    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { translations } = useLanguage();

    const loadProfile = async () => {
        try {
            setIsLoading(true);
            const data = await fetchUserProfile(userName);
            setProfile(data);
            setError(null);
        } catch (err) {
            setError(translations.carComponent.fetchError || 'Failed to load profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line
    }, [userName]);

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await loadProfile();
        event.detail.complete();
    };

    if (isLoading && !profile) {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonTitle>{translations.common.loading || 'Loading...'}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent>
                    <div className="ion-padding">
                        <IonSkeletonText animated style={{ width: '100%', height: '200px' }} />
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    if (!profile) {
        return null;
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonTitle>{translations.common.profile || 'Profile'}</IonTitle>
                </IonToolbar>
            </IonHeader>
            <IonContent fullscreen scrollY className="ion-padding nontransparent-content">
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <IonCard className="ion-margin-vertical">
                    <IonCardContent>
                        <ProfileHeader profile={profile} translations={translations} />

                        <div className="ion-margin-bottom">
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>{translations.common.information || 'About'}</h3>
                            <p className="ion-text-wrap ion-text-muted">{profile.about}</p>
                        </div>

                        {/* <ProfileStats stats={profile.stats} translations={translations} /> */}
                    </IonCardContent>
                </IonCard>

                <div className="ion-padding-vertical">
                    <h3 className="ion-padding-start">
                        <IonIcon icon={car} className="ion-margin-end" />
                        {'Vehicles'}
                    </h3>
                    {profile.vehicles.map(vehicle => (
                        <VehicleCard
                            vehicle={vehicle}
                        />
                    ))}
                </div>

                <IonToast
                    isOpen={!!error}
                    message={error || ''}
                    duration={3000}
                    position="bottom"
                    color="danger"
                    onDidDismiss={() => setError(null)}
                />
            </IonContent>
        </IonPage>
    );
};