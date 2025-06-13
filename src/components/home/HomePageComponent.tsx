import { IonContent, IonPage } from "@ionic/react";
import { carOutline, settingsOutline, personOutline } from 'ionicons/icons';
import GridCard from "./GridCard";
import { CarComponent } from "../vehicles/CarComponent";
import { useState } from "react";
import { SettingsComponent } from "../settings/SettingsComponent.tsx";
import { useLanguage } from "../../context/LanguageContext.tsx";
import { BioComponent } from "../bio/BioComponent.tsx";

export const HomePage = () => {
    const [activeComponent, setActiveComponent] = useState<string | null>(null);
    const { translations } = useLanguage();

    const renderComponent = (activeComponent: string | null) => {
        switch (activeComponent) {
            case 'car':
                return <CarComponent setComponent={setActiveComponent} />;
            case 'settings':
                return <SettingsComponent setComponent={setActiveComponent} />;
            case 'bio':
                return <BioComponent setComponent={setActiveComponent} />;
            default:
                return null;
        }
    };

    return (
        <IonPage>
            <IonContent className="nontransparent-content">
                <div style={{ padding: '20px' }}>
                    {/* Bio/About Me Card at the top */}
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
                            <GridCard title={"Bio"} icon={personOutline} onClick={() => setActiveComponent('bio')} />
                        </div>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};
