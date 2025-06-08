import {
    IonPage,
    IonContent,
    IonToggle,
    IonBackButton,
    IonSpinner,
    IonLabel,
    IonButton
} from "@ionic/react";
import { GoogleMap, type Marker } from "@capacitor/google-maps";
import React, { useEffect, useRef, useState } from "react";
import { registerPlugin } from "@capacitor/core";
import type { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
import {destroy, initialize, sendData, setMessageCallback} from "../net/AppStateConnection.ts";
import {Geolocation} from "@capacitor/geolocation";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from '../context/LanguageContext';

const BackgroundGeolocation: BackgroundGeolocationPlugin = registerPlugin("BackgroundGeolocation");

interface GoogleMapPageProps {
    mapClicked: boolean;
    onMapClick: (clicked: boolean) => void;
}

export const GoogleMapPage: React.FC<GoogleMapPageProps> = ({ mapClicked, onMapClick }) => {
    const { toggleTheme } = useTheme();
    const { translations } = useLanguage();
    const mapRef = useRef<HTMLElement | null>(null);
    const mapInstance = useRef<GoogleMap | null>(null);

    const [isTracking, setIsTracking] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(true);
    const isConnectionInitialized = useRef(false);

    const watcherId = useRef<string>("");
    const userMapMarkersRef = useRef<Record<string, Marker>>({});
    const markerRef = useRef<Marker | null>(null);

    const handleLocationUpdate = async (
        latitude: number,
        longitude: number,
        user: string
    ) => {
        console.log("Updating marker for user:", user);

        const markerData: Marker = {
            coordinate: {
                lat: latitude,
                lng: longitude,
            },
            iconUrl: "../assets/user_icon.png",
            title: user,
            snippet: `${latitude.toFixed(2)} | ${longitude.toFixed(2)}`
        };

        const existingMarker = userMapMarkersRef.current[user];
        if (existingMarker) {
            await mapInstance.current?.removeMarker(existingMarker);
        }

        const newMarker = await mapInstance.current?.addMarker(markerData);
        if (newMarker) {
            userMapMarkersRef.current[user] = newMarker;
        }
    };

    const toggleLocationTracking = async (checked: boolean) => {
        if (checked) {
            initialize();
            setMessageCallback(handleLocationUpdate);

            const id = await BackgroundGeolocation.addWatcher(
                {
                    backgroundMessage: translations.map.locationNeeded,
                    backgroundTitle: translations.map.trackingOn,
                    requestPermissions: true,
                    stale: false,
                    distanceFilter: 50,
                },
                (location, error) => {
                    if (error) {
                        if (error.code === "NOT_AUTHORIZED") {
                            if (window.confirm(translations.map.openSettings)) {
                                BackgroundGeolocation.openSettings();
                            }
                        }
                        console.error(error);
                    }

                    if (!isConnectionInitialized.current) {
                        sendData("init", [location?.latitude, location?.longitude]);
                        isConnectionInitialized.current = true;
                    } else {
                        sendData("broadcast", [location?.latitude, location?.longitude]);
                    }

                    console.log("Current location data: " + JSON.stringify(location));
                }
            );
            watcherId.current = id;
        } else {
            destroy();

            if (watcherId.current) {
                await BackgroundGeolocation.removeWatcher({ id: watcherId.current });
                watcherId.current = "";
            }

            if (isConnectionInitialized.current) {
                isConnectionInitialized.current = false;
            }
        }
        setIsTracking(checked);
    };

    useEffect(() => {
        onMapClick(true);
        return () => onMapClick(false);
    }, []);

    useEffect(() => {
        const getInitialPosition = async () => {
            try {
                const permissionStatus = await Geolocation.requestPermissions();
                if (permissionStatus.location === 'granted') {
                    const position = await Geolocation.getCurrentPosition({
                        timeout: 10000
                    });

                    const cameraConfig = {
                        center: {
                            lat: position.coords.latitude,
                            lng: position.coords.longitude
                        },
                        zoom: 15,
                    };

                    if (mapRef.current) {
                        mapInstance.current = await GoogleMap.create({
                            id: "my-map",
                            element: mapRef.current,
                            apiKey: "XXX",
                            config: cameraConfig,
                        });

                        await mapInstance.current.setCamera(cameraConfig);
                        setIsMapLoading(false);

                        await mapInstance.current.setOnMapClickListener(async (data) => {
                            if (markerRef.current) {
                                await mapInstance.current?.removeMarker(markerRef.current);
                            }

                            const marker = await mapInstance.current?.addMarker({
                                coordinate: {
                                    lat: data.latitude,
                                    lng: data.longitude
                                },
                                title: translations.map.cordsClicked,
                                snippet: `${data.latitude.toFixed(2)} | ${data.longitude.toFixed(2)}`
                            });

                            if (marker) {
                                markerRef.current = marker;
                            }

                            console.log("Cords clicked:", data.latitude, data.longitude);
                        });

                        await mapInstance.current.setOnInfoWindowClickListener(data => {
                            if (data.title !== translations.map.cordsClicked) {
                                sendData("disconnect", [0.0, 0.0]);
                                destroy();
                                location.href = `/profile/${data.title}`;
                            }
                        });
                    }
                } else {
                    console.error(translations.map.locationPermissionDenied);
                }
            } catch (error) {
                console.error("Error getting location:", error);
            }
        };

        getInitialPosition();

        return () => {
            if (mapInstance.current) {
                mapInstance.current.destroy();
            }
            if (watcherId.current) {
                BackgroundGeolocation.removeWatcher({ id: watcherId.current });
            }
        };
    }, [translations]);

    useEffect(() => {
        toggleTheme(true);
        return () => toggleTheme(false);
    }, [toggleTheme]);

    return (
        <IonPage>
            <IonContent>
                <div style={{
                    position: 'absolute',
                    top: '40px',
                    left: '20px',
                    zIndex: 999,
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <IonBackButton text={translations.common.back} defaultHref="/home" />
                </div>

                <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: '20px',
                    zIndex: 999,
                    background: 'rgba(255, 255, 255, 0.8)',
                    padding: '8px',
                    borderRadius: '8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <IonToggle
                        checked={isTracking}
                        onIonChange={e => toggleLocationTracking(e.detail.checked)}
                        style={{
                            '--handle-background': isTracking ? '#4CAF50' : '#ccc',
                            '--background': 'white',
                            '--handle-width': '20px',
                            '--handle-height': '20px'
                        }}
                    />
                    <IonLabel style={{ fontSize: '14px', color: '#333' }}>
                        {isTracking ? translations.map.trackingOn : translations.map.trackingOff}
                    </IonLabel>
                </div>

                {isMapLoading && (
                    <div style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        zIndex: 1000,
                        background: "rgba(255, 255, 255, 0.8)",
                        padding: "20px",
                        borderRadius: "12px"
                    }}>
                        <IonSpinner name="crescent" />
                        <IonLabel>{translations.common.loading}</IonLabel>
                    </div>
                )}

                <capacitor-google-map
                    ref={mapRef}
                    style={{
                        display: "block",
                        position: "absolute",
                        top: 0,
                        left: 0,
                        width: "100%",
                        height: "100%",
                        zIndex: 0,
                    }}
                />
            </IonContent>
        </IonPage>
    );
};