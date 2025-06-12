// vehicle-card.tsx
import React from 'react';
import {
    IonCard,
    IonCardContent,
    IonIcon,
    IonBadge,
    IonButton
} from '@ionic/react';
import { starOutline } from 'ionicons/icons';

interface VehicleCardProps {
    model: string;
    year: string;
    licensePlate: string;
    image: string;
    rating: number;
    trips: number;
    isAvailable: boolean;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
                                                            model,
                                                            year,
                                                            licensePlate,
                                                            image,
                                                            rating,
                                                            trips,
                                                            isAvailable
                                                        }) => {
    return (
        <IonCard>
            <img src={image} alt={model} style={{width: '100%', height: '200px', objectFit: 'cover'}}/>
            <IonCardContent>
                <div className="ion-justify-content-between ion-align-items-center">
                    <h2>{model} ({year})</h2>
                    <p>{licensePlate}</p>
                    <div className="rating">
                        <IonIcon icon={starOutline} color="warning" />
                        <span>{rating} ({trips} trips)</span>
                    </div>
                    <IonBadge color={isAvailable ? 'success' : 'medium'}>
                        {isAvailable ? 'Available' : 'Unavailable'}
                    </IonBadge>
                    <IonButton fill="clear" size="small">
                        Manage
                    </IonButton>
                </div>
            </IonCardContent>
        </IonCard>
    );
};