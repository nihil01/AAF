import React from 'react';
import { IonCard, IonCardContent, IonIcon } from '@ionic/react';

interface GridCardProps {
    title: string;
    icon: string;
    onClick: () => void;
}

const GridCard: React.FC<GridCardProps> = ({ title, icon, onClick }) => (
    <IonCard onClick={onClick} style={{
        width: '45%',
        margin: '2.5%',
        textAlign: 'center',
        cursor: 'pointer'
    }}>
        <IonCardContent>
            <IonIcon icon={icon} style={{ fontSize: '32px', marginBottom: '8px' }} />
            <p>{title}</p>
        </IonCardContent>
    </IonCard>
);

export default GridCard;
