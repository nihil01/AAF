import './App.css'
import {
    IonTabs,
    IonRouterOutlet,
    IonTabBar,
    IonTabButton,
    IonIcon,
    IonLabel,
    useIonAlert
} from '@ionic/react';
import {Route, Redirect, Switch} from 'react-router-dom';
import {home, person, map, compass} from 'ionicons/icons';
import { SharedPreferences } from "./utilities/SharedPreferences.ts";
import { useEffect, useState } from "react";
import Auth from "./components/Auth.tsx";
import {GoogleMapPage} from "./pages/GoogleMap.tsx";
import {ConnectionsPage} from "./pages/ConnectionsPage.tsx";
import {ProfilePage} from "./pages/Profile.tsx";

import {
    PushNotifications, type PushNotificationSchema, type Token,
} from "@capacitor/push-notifications";
import {HttpClient} from "./net/HttpClient.ts";
import {Device} from "@capacitor/device";
import type {CustomNotificationWrapper} from "./notification/CustomNotificationWrapper.ts";
import {HomePage} from "./pages/HomePage.tsx";

export default function App() {
    const [tokenPresented, setTokenPresented] = useState(false);
    const [deviceInfo, setDeviceInfo] = useState<string>('unknown_device');
    const [presentAlert] = useIonAlert();
    const [mapClicked, setMapClicked] = useState(false);

    useEffect(() => {

        const initDeviceInfo = async () => {
            try {
                const result = await Device.getInfo();

                const deviceInfoString = `Name: ${result.name}, Model: ${result.model},
                 Platform: ${result.platform}, OS: ${result.operatingSystem}, OS Version: ${result.osVersion},
                  Manufacturer: ${result.manufacturer}`;

                console.log("DEVICE INFO:", deviceInfoString);
                setDeviceInfo(deviceInfoString ?? 'unknown_device');
            } catch (e) {
                console.warn("Failed to get device ID", e);
            }
        };

        const initPushNotifications = async () => {
            //TODO change its value to false
            const token = await SharedPreferences.getToken('refresh');
            if (!token) {
                setTokenPresented(true);
                return;
            }

            setTokenPresented(true);

            const permissionResult = await PushNotifications.requestPermissions();
            if (permissionResult.receive !== 'granted') {
                presentAlert({
                    header: 'Information',
                    message: 'Push registration failed. You can enable it manually in settings.',
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
                        header: 'Information',
                        message: data,
                        buttons: ['OK']
                    });
                }
            );

            await PushNotifications.addListener('registrationError',
                (error: any) => {
                    presentAlert({
                        header: 'Push Error',
                        message: JSON.stringify(error),
                        buttons: ['OK']
                    });
                }
            );

            await PushNotifications.addListener('pushNotificationReceived',
                (notification: PushNotificationSchema) => {
                    const {body, title} = notification;
                    console.log("Notification " + notification)
                    presentAlert({
                        header: title || 'New Notification',
                        message: body,
                        buttons: ['OK'],
                        cssClass: 'notification-alert'
                    });
                }
            );

            // Method called when tapping on a notification
            await PushNotifications.addListener('pushNotificationActionPerformed',
                (notification: CustomNotificationWrapper) => {
                    location.href = notification.data?.dataLink ?? "/";
                }
            );
        };

        initDeviceInfo().then(initPushNotifications);
    }, []);

    return tokenPresented ? (
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
                        <IonLabel>Home</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="search" href="/connections">
                        <IonIcon icon={compass} />
                        <IonLabel>Connections</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="map" href="/map">
                        <IonIcon icon={map} />
                        <IonLabel>Map</IonLabel>
                    </IonTabButton>
                    <IonTabButton tab="profile" href="/profile">
                        <IonIcon icon={person} />
                        <IonLabel>Profile</IonLabel>
                    </IonTabButton>
                </IonTabBar>
            )}

        </IonTabs>
    ) : (
        <Auth/>
    );
}


