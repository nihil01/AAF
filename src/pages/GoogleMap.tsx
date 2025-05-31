import {
    IonPage,
    IonContent,
    IonToggle,
    IonBackButton,
    IonSpinner
} from "@ionic/react";
import { GoogleMap, type Marker } from "@capacitor/google-maps";
import React, { useEffect, useRef, useState } from "react";
import { registerPlugin } from "@capacitor/core";
import type { BackgroundGeolocationPlugin } from "@capacitor-community/background-geolocation";
import {destroy, initialize, sendData, setMessageCallback} from "../net/AppStateConnection.ts";
import {Geolocation} from "@capacitor/geolocation";

const BackgroundGeolocation: BackgroundGeolocationPlugin = registerPlugin("BackgroundGeolocation");

interface GoogleMapPageProps {
    mapClicked: boolean;
    onMapClick: (clicked: boolean) => void;
}

export const GoogleMapPage: React.FC<GoogleMapPageProps> = ({ mapClicked, onMapClick }) => {
    const mapRef = useRef<HTMLElement | null>(null);
    const mapInstance = useRef<GoogleMap | null>(null);

    const [isTracking, setIsTracking] = useState(false);
    const [isMapLoading, setIsMapLoading] = useState(true);
    const isConnectionInitialized = useRef(false);

    const watcherId = useRef<"">();
    const userMapMarkersRef = useRef<Record<string, Marker>>({});

    const markerRef = useRef<Marker>(null);

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

        // Добавляем новый маркер на карту
        const newMarker = await mapInstance.current?.addMarker(markerData);
        if (newMarker) {
            userMapMarkersRef.current[user] = newMarker;
        }
    };



    const toggleLocationTracking = async (checked: boolean) => {
        if (checked) {

            initialize();
            setMessageCallback(handleLocationUpdate)

            const id = await BackgroundGeolocation.addWatcher(
                {
                    backgroundMessage: "Cancel to prevent battery drain.",
                    backgroundTitle: "Tracking You.",
                    requestPermissions: true,
                    stale: false,
                    distanceFilter: 50,
                },
                (location, error) => {
                    if (error) {
                        if (error.code === "NOT_AUTHORIZED") {
                            if (window.confirm("This app needs your location.\nOpen settings?")) {
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

            //logout
            destroy();

            if (watcherId.current) {
                await BackgroundGeolocation.removeWatcher({ id: watcherId.current });
                watcherId.current = undefined;
            }

            if (isConnectionInitialized.current){
                isConnectionInitialized.current = undefined;
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
                                title: "Cords clicked",
                                snippet: `${data.latitude.toFixed(2)} | ${data.longitude.toFixed(2)}`
                            });

                            if (marker) {
                                markerRef.current = marker;
                            }

                            console.log("Cords clicked:", data.latitude, data.longitude);
                        });

                        await mapInstance.current.setOnInfoWindowClickListener(data => {

                            //go to user's profile
                            if (data.title != "Cords clicked"){
                                sendData("disconnect", [0.0, 0.0])
                                destroy();
                                location.href = `/profile/${data.title}`
                            }
                        });
                    }

                } else {
                    console.error("Location permission not granted");
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
    }, []);


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
                    <IonBackButton text="Back" defaultHref="/home" />
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
                    <span style={{ fontSize: '14px', color: '#333' }}>
                        {isTracking ? 'Tracking On' : 'Tracking Off'}
                    </span>
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