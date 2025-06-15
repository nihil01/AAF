import { IonCard, IonCardContent, IonCardHeader } from "@ionic/react";
import './CustomLoader.css';
import { useLanguage } from '../../context/LanguageContext.tsx';

interface CustomLoaderProps {
    showOverlay?: boolean;
}

//custom loader component
export const CustomLoaderComponent: React.FC<CustomLoaderProps> = ({ showOverlay = true }) => {
    const { translations } = useLanguage();
    
    const loaderContent = (
        <IonCard className="custom-loader-card">
            <IonCardHeader>
                {translations.carComponent.loading || 'Loading...'}
            </IonCardHeader>
            <IonCardContent>
                <svg 
                    className="custom-loader-svg"
                    version="1.1" 
                    id="圖層_1" 
                    xmlns="http://www.w3.org/2000/svg" 
                    x="0" 
                    y="0" 
                    viewBox="0 0 100 100" 
                    xmlSpace="preserve"
                >
                    <path d="M81.2 46c-.5-3.9-1.7-7.5-3.4-10.8-4.4-8.3-12.5-14.4-22.1-16.2-1.8-.3-3.7-.5-5.7-.5s-3.8.2-5.7.5c-9.4 1.7-17.4 7.7-21.9 15.8-1.8 3.3-3 6.9-3.6 10.8-.2 1.4-.3 2.9-.3 4.4 0 8.2 3.1 15.7 8.3 21.3 2.6 2.8 5.6 5.1 9 6.8 4.3 2.2 9.1 3.4 14.2 3.4 4.7 0 9.1-1 13.1-2.8 3.5-1.6 6.6-3.8 9.3-6.5 5.6-5.7 9.1-13.5 9.1-22.2 0-1.3-.1-2.7-.3-4zm-11.1-8.2L62 40.4c-1.5.5-3 .2-4.3-.7-1.3-.9-2-2.3-2-3.9v-8.7c6 1.6 11.2 5.5 14.4 10.7zm-24.3 9.6c-.4 1.3-1.8 2-3.2 1.6-1.3-.4-2-1.8-1.6-3.2.4-1.3 1.8-2 3.2-1.6 1.3.5 2 1.9 1.6 3.2zm-2.3 5.3c.8-1.1 2.4-1.4 3.5-.6 1.1.8 1.4 2.4.6 3.5-.8 1.1-2.4 1.4-3.5.6-1.2-.8-1.5-2.4-.6-3.5zm4-10.4c0-1.4 1.1-2.5 2.5-2.5s2.5 1.1 2.5 2.5-1.1 2.5-2.5 2.5-2.5-1.1-2.5-2.5zm4.3 10.3c1.1-.8 2.7-.6 3.5.6.8 1.1.6 2.7-.6 3.5-1.1.8-2.7.6-3.5-.6-.7-1.2-.5-2.7.6-3.5zm1.9-4.6c-.4-1.3.3-2.7 1.6-3.2 1.3-.4 2.7.3 3.2 1.6.4 1.3-.3 2.7-1.6 3.2s-2.7-.3-3.2-1.6zm-9.4-20.8v8.2c0 1.5-.7 3-2 3.9-1.3.9-2.8 1.2-4.3.7l-7.9-2.6c3.3-5 8.3-8.7 14.2-10.2zM26.5 50c0-.6 0-1.3.1-1.9l7.5 2.4c1.5.5 2.6 1.6 3.1 3.1s.2 3-.7 4.3l-4.9 6.7c-3.2-4-5.1-9.1-5.1-14.6zM50 73.5c-3.3 0-6.5-.7-9.4-2l4.8-6.6c.9-1.3 2.3-2 3.9-2 1.5 0 3 .7 3.9 2l5.1 7c-2.6 1.1-5.4 1.6-8.3 1.6zm17.6-7.9l-5-6.9c-.9-1.3-1.2-2.8-.7-4.3s1.6-2.6 3.1-3.1l8.5-2.8v1.4c0 6.1-2.2 11.5-5.9 15.7z" fill="#c2c2c2"/>
                    <path d="M50 10c-22.1 0-40 17.9-40 40s17.9 40 40 40 40-17.9 40-40-17.9-40-40-40zm0 67.5c-15.2 0-27.5-12.3-27.5-27.5S34.8 22.5 50 22.5 77.5 34.8 77.5 50 65.2 77.5 50 77.5z" fill="#333"/>
                </svg>
            </IonCardContent>
        </IonCard>
    );

    if (!showOverlay) {
        return loaderContent;
    }

    return (
        <div className="custom-loader-overlay">
            {loaderContent}
        </div>
    );
};


