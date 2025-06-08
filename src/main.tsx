import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import {IonApp, setupIonicReact} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router'; // Fixed import
import { ThemeProvider } from './context/ThemeContext';

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

import './index.css';

setupIonicReact();

ReactDOM.createRoot(document.getElementById('root')!).render(
    <ThemeProvider>
        <IonApp>
            <IonReactRouter>
                <App />
            </IonReactRouter>
        </IonApp>
    </ThemeProvider>
);