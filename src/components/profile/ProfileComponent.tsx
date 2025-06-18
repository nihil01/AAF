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
    IonToast,
    IonRefresher,
    IonRefresherContent,
    IonButton
} from '@ionic/react';
import type { RefresherEventDetail } from '@ionic/react';
import { useParams } from 'react-router-dom';
import { car, logoInstagram, logoFacebook, logoTwitter, logoLinkedin, globe } from 'ionicons/icons';
import { VehicleCard } from "../vehicles/VehicleCard";
import { useLanguage } from '../../context/LanguageContext';
import type { ProfileData, VehicleWithMedia } from "../../types/profile";
import { HttpClient } from '../../net/HttpClient';
import { CustomLoaderComponent } from '../loader/CustomLoaderComponent';

interface SocialNetwork {
    type: 'instagram' | 'facebook' | 'twitter' | 'linkedin' | 'other';
    value: string;
}

const getSocialIcon = (type: string) => {
    switch (type.toLowerCase()) {
        case 'instagram':
            return logoInstagram;
        case 'facebook':
            return logoFacebook;
        case 'twitter':
            return logoTwitter;
        case 'linkedin':
            return logoLinkedin;
        default:
            return globe;
    }
};

const parseSocialNetworks = (socialNetworks: string): SocialNetwork[] => {
    try {
        return JSON.parse(socialNetworks);
    } catch (error) {
        console.error('Error parsing social networks:', error);
        return [];
    }
};

const httpClient = new HttpClient();

// Mock data for testing
const MOCK_PROFILE_DATA: ProfileData = {
    username: "Brat",
    registered: "2024-01-15T10:30:00Z",
    online: true,
    avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&auto=format&fit=crop",
    about: "Car enthusiast and automotive photographer. Love to share my journey with amazing vehicles. Currently own a collection of performance cars and enjoy track days and car meets.",
    social_networks: JSON.stringify([
        { type: 'instagram', value: 'johndoe_cars' },
        { type: 'facebook', value: 'johndoe.auto' },
        { type: 'twitter', value: 'johndoe_racing' },
        { type: 'linkedin', value: 'john-doe-automotive' }
    ]),
    vehicles: [
        {
            uuid: "1",
            id: 1,
            make: "BMW",
            model: "M3",
            year: 2022,
            engineSpecs: "3.0L Twin-Turbo I6",
            horsePower: 473,
            torque: "550 Nm",
            zeroToHundred: "4.1s",
            story: "A sporty sedan with a legacy of performance and driving pleasure. This M3 has been my dream car for years, and it's even better than I imagined. The handling is precise, the power delivery is smooth, and the sound is intoxicating.",
            modifications: JSON.stringify([
                "Carbon Fiber Spoiler",
                "Performance Exhaust",
                "Lowered Suspension",
                "Stage 2 Tune",
                "Forged Wheels"
            ]),
            created_at: "2024-01-15T10:30:00Z",
            photo_urls: [
                "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format&fit=crop"
            ]
        },
        {
            uuid: "2",
            id: 2,
            make: "Porsche",
            model: "911",
            year: 2021,
            engineSpecs: "3.0L Twin-Turbo Flat-6",
            horsePower: 379,
            torque: "450 Nm",
            zeroToHundred: "4.2s",
            story: "My weekend track warrior. This 911 has been modified for both street and track use. The balance and precision of this car is unmatched. Every drive is an event, and it never fails to put a smile on my face.",
            modifications: JSON.stringify([
                "Sport Suspension",
                "Track Tires",
                "Roll Cage",
                "Carbon Ceramic Brakes",
                "Custom ECU Tune"
            ]),
            created_at: "2024-01-15T10:30:00Z",
            photo_urls: [
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop"
            ]
        },
        {
            uuid: "3",
            id: 3,
            make: "Mercedes-AMG",
            model: "GT",
            year: 2023,
            engineSpecs: "4.0L Biturbo V8",
            horsePower: 577,
            torque: "700 Nm",
            zeroToHundred: "3.2s",
            story: "The perfect blend of luxury and performance. This AMG GT is my daily driver and weekend cruiser. The V8 soundtrack is incredible, and the interior quality is second to none.",
            modifications: JSON.stringify([
                "Performance Exhaust",
                "Carbon Fiber Interior Trim",
                "Custom Wheels",
                "Lowering Springs",
                "Stage 1 Tune"
            ]),
            created_at: "2024-01-15T10:30:00Z",
            photo_urls: [
                "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop"
            ]
        },
        {
            uuid: "4",
            id: 4,
            make: "Audi",
            model: "RS6",
            year: 2022,
            engineSpecs: "4.0L Twin-Turbo V8",
            horsePower: 621,
            torque: "850 Nm",
            zeroToHundred: "3.6s",
            story: "The ultimate family wagon with supercar performance. This RS6 is perfect for daily use while still being able to embarrass most sports cars. The combination of practicality and performance is unmatched.",
            modifications: JSON.stringify([
                "Performance Air Intake",
                "Sport Exhaust System",
                "Carbon Fiber Body Kit",
                "Custom Wheels",
                "ECU Remap"
            ]),
            created_at: "2024-01-15T10:30:00Z",
            photo_urls: [
                "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop",
                "https://images.unsplash.com/photo-1603584173870-7f23fdae1b7a?w=800&auto=format&fit=crop"
            ]
        }
    ]
};

// API Service
const fetchUserProfile = async (username?: string): Promise<ProfileData> => {
    try {
        // Comment out real backend call
        // return await httpClient.getProfileData(username || '');
        
        // Use mock data instead
        console.log("Using mock profile data");
        // Simulate network delay
        await new Promise(resolve => setTimeout(resolve, 500));
        return MOCK_PROFILE_DATA;
    } catch (error) {
        console.error('Error fetching profile:', error);
        throw new Error('Failed to fetch profile data');
    }
};

// Mock function to simulate online status changes
let mockOnlineStatus = true;
export const toggleMockOnlineStatus = () => {
    mockOnlineStatus = !mockOnlineStatus;
    MOCK_PROFILE_DATA.online = mockOnlineStatus;
    return mockOnlineStatus;
};

// Sub-components
const ProfileHeader: React.FC<{ profile: ProfileData, translations: any }> = ({ profile, translations }) => {
    const socialNetworks = parseSocialNetworks(profile.social_networks);

    return (
        <div className="ion-padding-bottom ion-margin-bottom ion-border-bottom">
            <div className="ion-flex">
                <IonAvatar className="ion-margin-end" style={{ position: 'relative' }}>
                    <img src={profile.avatar.length > 0 ? profile.avatar : "https://aaf-app.s3.eu-central-1.amazonaws.com/default-avatar.png"} alt={profile.username} />
                    <IonBadge 
                        color={profile.online ? "success" : "danger"} 
                        className="avatar-badge"
                        title={profile.online ? "Online" : "Offline"}
                    />
                </IonAvatar>
                <div>
                    <h2 style={{ margin: 0, fontWeight: 'bold', fontSize: '1.3rem' }}>
                        {profile.username}
                        <span style={{ 
                            fontSize: '0.9rem', 
                            marginLeft: '8px', 
                            color: profile.online ? 'var(--ion-color-success)' : 'var(--ion-color-danger)',
                            fontWeight: 'normal'
                        }}>
                            {profile.online ? '• Online' : '• Offline'}
                        </span>
                    </h2>
                    <p className="ion-text-muted">{translations.profile?.memberSince || 'Member since'} {new Date(profile.registered).toLocaleDateString()}</p>
                    <div className="ion-flex ion-align-items-center ion-margin-top">
                        {socialNetworks.length > 0 && (
                            <div className="ion-flex ion-align-items-center">
                                {socialNetworks.map((social, index) => (
                                    <IonButton
                                        key={`${social.type}-${index}`}
                                        fill="clear"
                                        size="small"
                                        className="ion-margin-end"
                                        
                                        href={
                                            social.type === 'instagram' ? `https://www.instagram.com/${social.value}` : 
                                            social.type === 'facebook' ? `https://www.facebook.com/${social.value}` : 
                                            social.type === 'twitter' ? `https://www.twitter.com/${social.value}` : 
                                            social.type === 'linkedin' ? `https://www.linkedin.com/in/${social.value}` : ''
                                        }
                                        target="_blank"
                                        rel="noopener noreferrer"
                                    >
                                        <IonIcon 
                                            icon={getSocialIcon(social.type)} 
                                            color={social.type === 'instagram' ? 'instagram' : 
                                                   social.type === 'facebook' ? 'facebook' : 
                                                   social.type === 'twitter' ? 'twitter' : 
                                                   social.type === 'linkedin' ? 'linkedin' : ''}
                                        />
                                    </IonButton>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

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

            // Validate vehicles - if backend returns null or empty array, or if vehicles are invalid
            if (!data.vehicles || !Array.isArray(data.vehicles) || data.vehicles.length === 0) {
                data.vehicles = [];
            } else {
                // Filter out any invalid vehicles (those missing required fields)
                data.vehicles = data.vehicles.filter(vehicle => 
                    vehicle && 
                    typeof vehicle === 'object' && 
                    vehicle.make && 
                    vehicle.model 
                );
                
            }

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
                        <IonTitle>{translations.common.profile || 'Profile'}</IonTitle>
                    </IonToolbar>
                </IonHeader>
                <IonContent fullscreen>
                    <CustomLoaderComponent showOverlay={true} />
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

                        <p>{profile.vehicles && profile.vehicles.length > 0 ? `Vehicle count: ${profile.vehicles.length}` : 'No vehicles'}</p>
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