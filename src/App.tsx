import {
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    useIonAlert,
    IonApp
} from '@ionic/react';
import {Route, Redirect, Switch} from 'react-router-dom';
import {home, person, map, compass} from 'ionicons/icons';
import { SharedPreferences } from "./utilities/SharedPreferences.ts";
import { useEffect, useState } from "react";
import Auth from "./components/auth/AuthComponent.tsx";
import {GoogleMapPage} from "./components/googleMap/GoogleMapComponent.tsx";
import {ConnectionsPage} from "./components/connections/ConnectionsComponent.tsx";
import {ProfilePage} from "./components/profile/ProfileComponent.tsx";
import { useLanguage } from './context/LanguageContext.tsx';
import { SplashScreen } from '@capacitor/splash-screen';
import { App as CapApp } from '@capacitor/app';
import Onboarding from './components/onboarding/OnboardingComponent.tsx';
import { OnboardingPreferences } from './utilities/OnboardingPreferences.ts';
import './components/onboarding/onboarding.css';

import {
    PushNotifications, type PushNotificationSchema, type Token,
} from "@capacitor/push-notifications";
import {HttpClient} from "./net/HttpClient.ts";
import {Device} from "@capacitor/device";
import type {CustomNotificationWrapper} from "./notification/CustomNotificationWrapper.ts";
import {HomePage} from "./components/home/HomePageComponent.tsx";
import { ThemeProvider } from './context/ThemeContext.tsx';
import { LanguageProvider } from './context/LanguageContext.tsx';

const AppContent: React.FC = () => {
    const [tokenPresented, setTokenPresented] = useState(true);
    const [deviceInfo, setDeviceInfo] = useState<string>('unknown_device');
    const [presentAlert] = useIonAlert();
    const [mapClicked, setMapClicked] = useState(false);
    const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);
    const { translations } = useLanguage();
    const httpClient = new HttpClient();

    useEffect(() => {
        let appStateListener: any;

        const initializeApp = async () => {
            try {
                // Hide splash screen when app is ready
                await SplashScreen.hide();
                
                // Check if onboarding should be shown
                const hasSeenOnboarding = await OnboardingPreferences.isOnboardingShown();
                setShowOnboarding(!hasSeenOnboarding);

                // Get device info
                const result = await Device.getInfo();
                const deviceInfoString = `Name: ${result.name}, Model: ${result.model},
                    Platform: ${result.platform}, OS: ${result.operatingSystem}, OS Version: ${result.osVersion},
                    Manufacturer: ${result.manufacturer}`;
                console.log("DEVICE INFO:", deviceInfoString);
                setDeviceInfo(deviceInfoString ?? 'unknown_device');

                // Set user as online when app starts
                if (tokenPresented) {
                    try {
                        await httpClient.setUserOnline();
                    } catch (error) {
                        console.error('Error setting user online:', error);
                    }
                }

                // Initialize push notifications
                await initPushNotifications();

                // Set up app state listener
                appStateListener = await CapApp.addListener('appStateChange', async ({ isActive }) => {
                    console.log('App state changed. Is active:', isActive);
                    if (!isActive && tokenPresented) {
                        try {
                            // Set user as offline when app goes to background or is closed
                            await httpClient.setUserOffline();
                        } catch (error) {
                            console.error('Error setting user offline:', error);
                        }
                    } else if (isActive && tokenPresented) {
                        try {
                            // Set user as online when app comes back to foreground
                            await httpClient.setUserOnline();
                        } catch (error) {
                            console.error('Error setting user online:', error);
                        }
                    }
                });
            } catch (error) {
                console.error('Error initializing app:', error);
                // Hide splash screen even if there's an error
                await SplashScreen.hide();
            }
        };

        initializeApp();

        return () => {
            if (appStateListener) {
                appStateListener.remove();
            }
            // Set user as offline when component unmounts (app is closed)
            if (tokenPresented) {
                httpClient.setUserOffline().catch(error => {
                    console.error('Error setting user offline on unmount:', error);
                });
            }
        };
    }, [tokenPresented]);

    const initPushNotifications = async () => {
        const token = await SharedPreferences.getToken('refresh');
        if (!token) {
            //TODO: Remove this; DEBUG
            setTokenPresented(false);
            return;
        }

        setTokenPresented(true);

        const permissionResult = await PushNotifications.requestPermissions();
        if (permissionResult.receive !== 'granted') {
            presentAlert({
                header: translations.common.error,
                message: translations.settings.notifications,
                buttons: ['OK']
            });
            return;
        }

        await PushNotifications.register();

        await PushNotifications.addListener('registration',
            async (token: Token) => {
                console.log("Push Token:", token.value);
                console.log("Using Device ID:", deviceInfo);

                const httpClient = new HttpClient();
                const data = await httpClient.sendFirebaseToken(token?.value, deviceInfo);

                console.log("Token sent!");
                presentAlert({
                    header: translations.common.error,
                    message: data,
                    buttons: ['OK']
                });
            }
        );

        await PushNotifications.addListener('registrationError',
            (error: any) => {
                presentAlert({
                    header: translations.common.error,
                    message: JSON.stringify(error),
                    buttons: ['OK']
                });
            }
        );

        await PushNotifications.addListener('pushNotificationReceived',
            (notification: PushNotificationSchema) => {
                const {body, title} = notification;
                console.log("Notification " + notification);
                presentAlert({
                    header: title || translations.settings.notifications,
                    message: body,
                    buttons: ['OK'],
                    cssClass: 'notification-alert'
                });
            }
        );

        await PushNotifications.addListener('pushNotificationActionPerformed',
            (notification: CustomNotificationWrapper) => {
                location.href = notification.data?.dataLink ?? "/";
            }
        );
    };

    if (showOnboarding === null) {
        return null;
    }

    if (showOnboarding) {
        return <Onboarding />;
    }

    if (!tokenPresented) {
        return <Auth />;
    }

    return (
        <IonApp>
            <IonTabs>
                <IonRouterOutlet>
                    <Switch>
                        <Route exact path="/home" component={HomePage}/>
                        <Route exact path="/connections" component={ConnectionsPage}/>
                        <Route exact path="/profile/:userName?" component={ProfilePage}/>
                        <Route exact path="/map"
                               render={(props) =>
                                   <GoogleMapPage {...props}
                                      mapClicked={mapClicked}
                                      onMapClick={(clicked) => setMapClicked(clicked)} />} />
                        <Route path="*" render={() => <Redirect to="/home"/>}/>
                    </Switch>
                    <Route exact path="/" component={HomePage}/>
                </IonRouterOutlet>

                {!mapClicked && (
                    <IonTabBar slot="bottom">
                        <IonTabButton tab="home" href="/home">
                            <IonIcon icon={home} />
                            <IonLabel>{translations.common.home}</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="search" href="/connections">
                            <IonIcon icon={compass} />
                            <IonLabel>{translations.common.connections}</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="map" href="/map">
                            <IonIcon icon={map} />
                            <IonLabel>{translations.common.map}</IonLabel>
                        </IonTabButton>
                        <IonTabButton tab="profile" href="/profile">
                            <IonIcon icon={person} />
                            <IonLabel>{translations.common.profile}</IonLabel>
                        </IonTabButton>
                    </IonTabBar>
                )}
            </IonTabs>
        </IonApp>
    );
};

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <LanguageProvider>
                <AppContent />
            </LanguageProvider>
        </ThemeProvider>
    );
};

export default App;
