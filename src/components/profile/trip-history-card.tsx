// trip-history-card.tsx
import React from 'react';
import {
    IonCard,
    IonCardContent,
    IonText,
    IonBadge
} from '@ionic/react';

interface TripHistoryCardProps {
    date: string;
    vehicle: string;
    renter: string;
    duration: string;
    amount?: string;
    status?: string;
}

export const TripHistoryCard: React.FC<TripHistoryCardProps> = ({
                                                                    date,
                                                                    vehicle,
                                                                    renter,
                                                                    duration,
                                                                    amount,
                                                                    status
                                                                }) => {
    return (
        <IonCard>
            <IonCardContent>
                <div className="ion-justify-content-between ion-align-items-center">
                    <IonText color="medium">
                        <p>{date}</p>
                    </IonText>
                    <h3>{vehicle}</h3>
                    <p>Rented by: {renter}</p>
                    <div className="trip-details">
                        <p>Duration: {duration}</p>
                        {amount && <p>Amount: {amount}</p>}
                        {status && (
                            <IonBadge color={status === 'completed' ? 'success' : 'medium'}>
                                {status}
                            </IonBadge>
                        )}
                    </div>
                </div>
            </IonCardContent>
        </IonCard>
    );
};