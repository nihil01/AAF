import {
    IonPage,
    IonContent,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonBackButton,
    IonButtons,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardTitle,
    IonGrid,
    IonRow,
    IonCol,
    IonImg,
    IonChip,
    IonLabel,
    IonRefresher,
    IonRefresherContent
} from '@ionic/react';
import type { RefresherEventDetail } from '@ionic/react';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { HttpClient } from '../net/HttpClient';
import type { ProfileData, Vehicle } from '../types/profile';
import { useLanguage } from '../context/LanguageContext';
import { CustomLoaderComponent } from '../components/loader/CustomLoaderComponent';

// Define the profile translations type
interface ProfileTranslations {
    memberSince: string;
    vehicles: string;
    engineSpecs: string;
    horsePower: string;
    torque: string;
    zeroToHundred: string;
    story: string;
    modifications: string;
}

const ProfilePage: React.FC = () => {
    const { username } = useParams<{ username: string }>();
    const { translations } = useLanguage();
    const profileTranslations = translations.profile as unknown as ProfileTranslations;
    const [profileData, setProfileData] = useState<ProfileData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const httpClient = new HttpClient();

    const fetchProfileData = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await httpClient.getProfileData(username);
            setProfileData(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load profile');
            console.error('Error fetching profile:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfileData();
    }, [username]);

    const handleRefresh = async (event: CustomEvent<RefresherEventDetail>) => {
        await fetchProfileData();
        event.detail.complete();
    };

    const parseModifications = (modificationsStr: string): string[] => {
        try {
            return JSON.parse(modificationsStr);
        } catch {
            return [];
        }
    };

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
            });
        } catch {
            return dateString;
        }
    };

    if (loading) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <CustomLoaderComponent />
                </IonContent>
            </IonPage>
        );
    }

    if (error) {
        return (
            <IonPage>
                <IonContent className="ion-padding">
                    <div className="error-message">
                        {error}
                    </div>
                </IonContent>
            </IonPage>
        );
    }

    return (
        <IonPage>
            <IonHeader>
                <IonToolbar>
                    <IonButtons slot="start">
                        <IonBackButton defaultHref="/home" text={translations.common.back} />
                    </IonButtons>
                    <IonTitle>{profileData?.username}</IonTitle>
                </IonToolbar>
            </IonHeader>

            <IonContent>
                <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
                    <IonRefresherContent />
                </IonRefresher>

                <div className="ion-padding">
                    <IonCard>
                        <IonCardHeader>
                            <IonCardTitle>{profileTranslations.memberSince}</IonCardTitle>
                        </IonCardHeader>
                        <IonCardContent>
                            {formatDate(profileData?.registered || '')}
                        </IonCardContent>
                    </IonCard>

                    <h2 className="ion-padding-top">{profileTranslations.vehicles}</h2>
                    {profileData?.vehicles.map((vehicle: Vehicle, index: number) => (
                        <IonCard key={index}>
                            <IonGrid>
                                <IonRow>
                                    {vehicle.photourls.filter(url => url).map((url, photoIndex) => (
                                        <IonCol size="6" key={photoIndex}>
                                            <IonImg 
                                                src={url || ''} 
                                                alt={`${vehicle.make} ${vehicle.model}`}
                                                className="vehicle-image"
                                            />
                                        </IonCol>
                                    ))}
                                </IonRow>
                            </IonGrid>
                            <IonCardHeader>
                                <IonCardTitle>
                                    {vehicle.year} {vehicle.make} {vehicle.model}
                                </IonCardTitle>
                            </IonCardHeader>
                            <IonCardContent>
                                <div className="vehicle-specs">
                                    <p><strong>{profileTranslations.engineSpecs}:</strong> {vehicle.engineSpecs}</p>
                                    <p><strong>{profileTranslations.horsePower}:</strong> {vehicle.horsePower} HP</p>
                                    <p><strong>{profileTranslations.torque}:</strong> {vehicle.torque} Nm</p>
                                    <p><strong>{profileTranslations.zeroToHundred}:</strong> {vehicle.zeroToHundred}s</p>
                                    <p><strong>{profileTranslations.story}:</strong> {vehicle.story}</p>
                                    
                                    {parseModifications(vehicle.modifications).length > 0 && (
                                        <div className="modifications">
                                            <strong>{profileTranslations.modifications}:</strong>
                                            <div className="modification-chips">
                                                {parseModifications(vehicle.modifications).map((mod, modIndex) => (
                                                    <IonChip key={modIndex}>
                                                        <IonLabel>{mod}</IonLabel>
                                                    </IonChip>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </IonCardContent>
                        </IonCard>
                    ))}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default ProfilePage; 