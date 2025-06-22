import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import {IonApp, setupIonicReact} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { NetworkConnectivityLoader } from './components/loader/NetworkConnectivityLoader.tsx';
import './index.css';

import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';
import { LanguageProvider } from './context/LanguageContext.tsx';

setupIonicReact();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <LanguageProvider>
            <NetworkConnectivityLoader>
                <IonApp>
                    <IonReactRouter>
                        <App />
                    </IonReactRouter>
                </IonApp>
            </NetworkConnectivityLoader>
        </LanguageProvider>
    </ThemeProvider>
);
