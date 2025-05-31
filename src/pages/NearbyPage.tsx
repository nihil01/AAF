import {HttpClient} from "../net/HttpClient.ts";
import {useState} from "react";
import {Geolocation} from "@capacitor/geolocation";
import {useIonAlert} from "@ionic/react";
import {IonList, IonItem, IonAvatar, IonLabel, IonButton, IonProgressBar} from "@ionic/react";

export const NearbyPage = () => {

    let httpClient: HttpClient = new HttpClient();
    const [alert] = useIonAlert()
    const [users, setUsers] = useState<Record<string, {latitude: number, longitude: number}>>();
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [time, setTime] = useState(0);

    const fetchNearbyUsers = () => {

        if (Date.now() < time){
           return alert({
               header: 'Wow! Chill',
               message: 'You can use this feature only once two 2 minutes',
               buttons: ['OK bro']
           })
        }

        setTime(Date.now() + 120000);
        setInitialized(true);
        setLoading(true);
        Geolocation.checkPermissions().then((permission) => {
            if (permission.location === 'granted') {
                Geolocation.getCurrentPosition().then((position) => {
                    console.log("Current position:", position);
                    //fetch
                    httpClient.getNearbyUsers(position.coords.latitude, position.coords.longitude)
                        .then(async (response) => {

                            if (response.ok){

                                let data: Record<string, {latitude: number, longitude: number}> = await response.json()

                                console.log("Nearby users:", JSON.stringify(data));

                                if (data && Object.keys(data).length > 0) {
                                    setUsers(data);
                                } else {
                                    setUsers(undefined);
                                }

                            }else{
                                if (response.status === 429){
                                    return alert({
                                        header: 'Too many requests',
                                        message: 'Please try again later',
                                        buttons: ['OK']
                                    })
                                }
                            }

                            console.log("Nearby users:", response);
                            setLoading(false);
                        });


                });
            }else{
                alert({
                    header: 'Location permission not granted',
                    message: 'Please grant location permission to use this feature',
                    buttons: ['OK']
                })
                setLoading(false);
            }
        });
    }

    return (
        <div>
            {loading && <IonProgressBar type="indeterminate"></IonProgressBar>}
            <IonButton expand="block" onClick={fetchNearbyUsers}>
                Rescan
            </IonButton>
            {!loading && initialized && !users && (
                <div style={{textAlign: 'center', padding: '20px'}}>
                    No one nearby you
                </div>
            )}
            <IonList>
                {users && Object.entries(users).map(([name, _]) => (
                    <IonItem key={name}>
                        <IonAvatar slot="start">
                            <div style={{
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                backgroundColor: '#007AFF',
                                color: 'white',
                                borderRadius: '50%'
                            }}>
                                {name.charAt(0).toUpperCase()}
                            </div>
                        </IonAvatar>
                        <IonLabel>{name}</IonLabel>
                    </IonItem>
                ))}
            </IonList>
        </div>
    )
}