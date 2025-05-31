import { IonContent, IonPage } from "@ionic/react";
import { carOutline, peopleOutline, settingsOutline } from 'ionicons/icons';
import GridCard from "../components/GridCard";
import {CarComponent} from "../components/CarComponent";
import { useState } from "react";

export const HomePage = () => {
    const [activeComponent, setActiveComponent] = useState<string | null>(null);

    const renderComponent = () => {
        switch (activeComponent) {
            case 'car':
                return <CarComponent />;
            default:
                return null;
        }
    };

    return (
        <IonPage>
            <IonContent className="nontransparent-content">
                <div style={{ padding: '20px' }}>
                    <h1>Главная</h1>

                    {activeComponent ? (
                        <>
                            <div style={{ marginBottom: '16px' }}>
                                <button onClick={() => setActiveComponent(null)} style={{
                                    background: 'none',
                                    border: '1px solid gray',
                                    padding: '6px 12px',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                }}>← Назад</button>
                            </div>
                            {renderComponent()}
                        </>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            marginTop: '20px'
                        }}>
                            <GridCard title="Моя машина" icon={carOutline} onClick={() => setActiveComponent('car')} />
                            <GridCard title="Друзья" icon={peopleOutline} onClick={() => alert('друзья')} />
                            <GridCard title="Настройки" icon={settingsOutline} onClick={() => alert('настройки')} />
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};
