import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Network } from "@capacitor/network";
import { 
  IonLoading, 
  IonContent, 
  IonPage, 
  IonIcon, 
  IonText
} from "@ionic/react";
import { wifiOutline } from "ionicons/icons";
import { useLanguage } from '../../context/LanguageContext';

interface NetworkConnectivityLoaderProps {
  children: ReactNode;
}

export const NetworkConnectivityLoader = ({
  children,
}: NetworkConnectivityLoaderProps) => {
  const [isOnline, setIsOnline] = useState(true);
  const { translations } = useLanguage();

  useEffect(() => {
    const checkNetworkStatus = async () => {
      try {
        const status = await Network.getStatus();
        setIsOnline(status.connected);
        console.log("Initial Network Status:", status.connected ? "Online" : "Offline");
      } catch (error) {
        console.error("Error checking network status:", error);
        setIsOnline(false);
      }
    };

    const setupNetworkListener = async () => {
      try {
        
        await Network.addListener("networkStatusChange", (status) => {
          console.log("Network status changed:", status.connected ? "Online" : "Offline");
          setIsOnline(status.connected);
        });
        
      } catch (error) {
        console.error("Error setting up network listener:", error);
        return null;
      }
    };


    const initialize = async () => {
      await checkNetworkStatus();
      await setupNetworkListener();
    };

    initialize();

    return () => {
      Network.removeAllListeners();
    };
  }, []);


  if (!isOnline) {
    return (
      <IonPage>
        <IonContent className="ion-padding">
          <div className="flex flex-col items-center justify-center min-h-screen text-center">
            <div className="max-w-md w-full">
              {/* Network Icon */}
              <div className="mb-8">
                <IonIcon 
                  icon={wifiOutline} 
                  className="text-6xl text-danger"
                  style={{ fontSize: '4rem' }}
                />
              </div>

              {/* Title */}
              <IonText color="dark">
                <h1 className="text-2xl font-bold mb-4">
                  {translations.network.noConnection}
                </h1>
              </IonText>

              {/* Description */}
              <IonText color="medium">
                <p className="text-base mb-8">
                  {translations.network.checkConnection}
                </p>
              </IonText>

              {/* Status Info */}
              <IonText color="medium">
                <p className="text-xs">
                  {translations.network.status}: {isOnline ? 
                    translations.network.online : 
                    translations.network.offline
                  }
                </p>
              </IonText>
            </div>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return <>{children}</>;
};