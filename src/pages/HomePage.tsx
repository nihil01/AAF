import { IonContent, IonPage } from "@ionic/react";
import { carOutline, settingsOutline } from 'ionicons/icons';
import GridCard from "../components/GridCard";
import { CarComponent } from "../components/CarComponent";
import { useState } from "react";
import { SettingsComponent } from "../components/SettingsComponent";
import { useLanguage } from "../context/LanguageContext";

export const HomePage = () => {
    const [activeComponent, setActiveComponent] = useState<string | null>(null);
    const { translations } = useLanguage();

    const renderComponent = (activeComponent: string | null) => {
        switch (activeComponent) {
            case 'car':
                return <CarComponent setComponent={setActiveComponent} />;
            case 'settings':
                return <SettingsComponent setComponent={setActiveComponent} />;
            default:
                return null;
        }
    };

    return (
        <IonPage>
            <IonContent className="nontransparent-content">
                <div style={{ padding: '20px' }}>
                    {activeComponent ? (
                        <div>
                            {renderComponent(activeComponent)}
                        </div>
                    ) : (
                        <div style={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            justifyContent: 'space-between',
                            marginTop: '20px'
                        }}>
                            <GridCard title={translations.homePage.myGarage} icon={carOutline} onClick={() => setActiveComponent('car')} />
                            <GridCard title={translations.homePage.settings} icon={settingsOutline} onClick={() => setActiveComponent('settings')} />
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};
