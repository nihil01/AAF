import { IonButton, IonButtons, IonHeader, IonToolbar, IonPage, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle, IonSelect, IonSelectOption, IonNote } from "@ionic/react"
import { useEffect, useState } from "react";
import { PushNotifications } from "@capacitor/push-notifications";

export const SettingsComponent = ({ setComponent }: { setComponent: (value: string | null) => void }) =>{
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');
  const [notifications, setNotifications] = useState(false);
  const appVersion = '1.0.0';

  useEffect(() => {
    checkNotificationPermission();
  }, []);


  const checkNotificationPermission = async () => {
    const permissionStatus = await PushNotifications.checkPermissions();
    setNotifications(permissionStatus.receive === 'granted');
  };

  const handleNotifications = async (state: boolean) => {
    if (state) {
      const permissionStatus = await PushNotifications.requestPermissions();
      setNotifications(permissionStatus.receive === 'granted');
    } else {
      await PushNotifications.unregister();
      setNotifications(false);
    }
  };

  const handleLogout = () => {
    // TODO: Implement logout logic
    alert('Logged out!');
  };

  const handleContactAdmin = () => {
    window.location.href = 'mailto:admin@example.com?subject=Support%20Request';
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setComponent(null)}>
              Back
            </IonButton>
          </IonButtons>
          <IonTitle>Settings</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonLabel>Dark Mode</IonLabel>
            <IonToggle checked={darkMode} onIonChange={e => setDarkMode(e.detail.checked)} />
          </IonItem>

          <IonItem>
            <IonLabel>Notifications</IonLabel>
            <IonToggle checked={notifications} onIonChange={e => handleNotifications(e.detail.checked)} />
          </IonItem>

          <IonItem>
            <IonLabel>Language</IonLabel>
            <IonSelect value={language} placeholder="Select Language" onIonChange={e => setLanguage(e.detail.value)}>
              <IonSelectOption value="az">Azerbaijani</IonSelectOption>
              <IonSelectOption value="en">English</IonSelectOption>
              <IonSelectOption value="ru">Russian</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem button onClick={handleContactAdmin}>
            <IonLabel>Contact Admin</IonLabel>
          </IonItem>

          <IonItem button onClick={handleLogout}>
            <IonLabel color="danger">Log Out</IonLabel>
          </IonItem>

          <IonItem>
            <IonLabel>App Version</IonLabel>
            <IonNote slot="end">{appVersion}</IonNote>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  )
}