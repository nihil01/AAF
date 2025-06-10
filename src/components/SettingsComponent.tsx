import { IonButton, IonButtons, IonHeader, IonToolbar, IonPage, IonTitle, IonContent, IonList, IonItem, IonLabel, IonToggle, IonSelect, IonSelectOption, IonNote, IonIcon, IonItemDivider } from "@ionic/react"
import { useEffect, useState } from "react";
import { PushNotifications } from "@capacitor/push-notifications";
import { moon, sunny, notificationsCircleOutline, languageOutline, logOut, mail, arrowBack } from "ionicons/icons";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from '../context/LanguageContext';
import type { Language } from '../utilities/translations';
import { HttpClient } from "../net/HttpClient";
import { Preferences } from '@capacitor/preferences';

const NOTIFICATION_PREF_KEY = 'notifications_disabled';

export const SettingsComponent = ({ setComponent }: { setComponent: (value: string | null) => void }) => {
  const { isDark, toggleTheme } = useTheme();
  const { currentLanguage, setLanguage, translations } = useLanguage();
  const [notifications, setNotifications] = useState(false);
  const appVersion = '1.0.0';

  useEffect(() => {
    checkNotificationPermission();
  }, []);


  const handleApplicationTheme = () => {
    toggleTheme();
  };

  const checkNotificationPermission = async () => {
    // First check if notifications are disabled in preferences
    const { value: disabled } = await Preferences.get({ key: NOTIFICATION_PREF_KEY });
    if (disabled === 'true') {
      setNotifications(false);
      return;
    }

    // If not disabled in preferences, check system permission
    const permissionStatus = await PushNotifications.checkPermissions();
    setNotifications(permissionStatus.receive === 'granted');
  };

  const handleNotifications = async (state: boolean) => {
    if (state) {
      // Check if notifications were previously disabled
      const { value: disabled } = await Preferences.get({ key: NOTIFICATION_PREF_KEY });
      if (disabled === 'true') {
        // If notifications were previously disabled, don't request permissions
        setNotifications(false);
        return;
      }

      const permissionStatus = await PushNotifications.requestPermissions();
      setNotifications(permissionStatus.receive === 'granted');
    } else {
      // Disable notifications
      await PushNotifications.unregister();
      await PushNotifications.deleteChannel({
        id: 'default'
      });
      // Store the disabled state in preferences
      await Preferences.set({ key: NOTIFICATION_PREF_KEY, value: 'true' });
      setNotifications(false);
    }
  };

  const handleLogout = () => {
    let client = new HttpClient();
    client.logout().then(() => {
      location.href = '/';
    });

  };

  const handleContactAdmin = () => {
    window.location.href = 'mailto:admin@example.com?subject=Support%20Request';
  };

  const handleLanguageChange = async (e: CustomEvent) => {
    const newLang = e.detail.value as Language;
    await setLanguage(newLang);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setComponent(null)}>
              <IonIcon icon={arrowBack}/>
            </IonButton>
          </IonButtons>
          <IonTitle>{translations.common.settingsTitle}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          <IonItem>
            <IonIcon icon={isDark ? sunny : moon}/>
            <IonLabel>{translations.settings.darkMode}</IonLabel>
            <IonToggle slot="end" checked={isDark} onIonChange={handleApplicationTheme} />
          </IonItem>

          <IonItem>
            <IonIcon icon={notificationsCircleOutline}/>
            <IonLabel>{translations.settings.notifications}</IonLabel>
            <IonToggle slot="end" checked={notifications} onIonChange={e => handleNotifications(e.detail.checked)} />
          </IonItem>

          <IonItemDivider style={{ marginTop: '16px', marginBottom: '8px' }}>
            <IonLabel>Account Settings</IonLabel>
          </IonItemDivider>

          <IonItem>
            <IonIcon icon={languageOutline}/>
            <IonLabel>{translations.settings.language}</IonLabel>
            <IonSelect slot="end" value={currentLanguage} placeholder={translations.settings.language} onIonChange={handleLanguageChange}>
              <IonSelectOption value="en">English</IonSelectOption>
              <IonSelectOption value="az">Azərbaycan</IonSelectOption>
              <IonSelectOption value="ru">Русский</IonSelectOption>
            </IonSelect>
          </IonItem>

          <IonItem button onClick={handleContactAdmin}>
            <IonIcon slot="end" icon={mail}/>
            <IonLabel>{translations.settings.contactAdmin}</IonLabel>
          </IonItem>

          <IonItemDivider style={{ marginTop: '16px', marginBottom: '8px' }}>
            <IonLabel>Account Actions</IonLabel>
          </IonItemDivider>

          <IonItem button onClick={handleLogout}>
            <IonLabel color="danger">{translations.settings.logout}</IonLabel>
            <IonIcon slot="end" icon={logOut}/>
          </IonItem>

          <IonItem>
            <IonLabel>{translations.settings.appVersion}</IonLabel>
            <IonNote slot="end">{appVersion}</IonNote>
          </IonItem>
        </IonList>
      </IonContent>
    </IonPage>
  );
};