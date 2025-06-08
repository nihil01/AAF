import React, { useState } from 'react';
import '../theme/onboarding.css';
import {
    IonContent,
    IonPage,
    IonButton,
    IonText,
    IonIcon
} from '@ionic/react';
import { useLanguage } from '../context/LanguageContext';
import { OnboardingPreferences } from '../utilities/OnboardingPreferences';
import { 
    carOutline, 
    mapOutline, 
    peopleOutline, 
    notificationsOutline 
} from 'ionicons/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
// import 'swiper/css';
// import 'swiper/css/pagination';
// import 'swiper/css/navigation';

// const slideOpts = {
//     initialSlide: 0,
//     speed: 400
// };

const Onboarding: React.FC = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const { translations } = useLanguage();

    const slides = [
        {
            icon: carOutline,
            title: translations.onboarding?.findCars || 'Find Cars',
            description: translations.onboarding?.findCarsDesc || 'Discover and connect with car owners in your area'
        },
        {
            icon: mapOutline,
            title: translations.onboarding?.mapView || 'Map View',
            description: translations.onboarding?.mapViewDesc || 'View available cars on an interactive map'
        },
        {
            icon: peopleOutline,
            title: translations.onboarding?.connections || 'Connections',
            description: translations.onboarding?.connectionsDesc || 'Build your network of car owners and enthusiasts'
        },
        {
            icon: notificationsOutline,
            title: translations.onboarding?.notifications || 'Stay Updated',
            description: translations.onboarding?.notificationsDesc || 'Get real-time notifications about new opportunities'
        }
    ];

    const handleSlideChange = (swiper: any) => {
        setCurrentSlide(swiper.activeIndex);
    };

    const handleFinish = async () => {
        await OnboardingPreferences.setOnboardingShown();
        location.href = '/home';
    };

    return (
        <IonPage>
            <IonContent fullscreen className="ion-padding">
                <Swiper
                    modules={[Pagination]}
                    pagination={{
                        clickable: true,
                        type: 'bullets',
                        bulletClass: 'swiper-pagination-bullet',
                        bulletActiveClass: 'swiper-pagination-bullet-active'
                    }}
                    onSlideChange={handleSlideChange}
                    className="onboarding-swiper"
                    style={{ height: '100%' }}
                >
                    {slides.map((slide, index) => (
                        <SwiperSlide key={index} style={{ height: '100%' }}>
                            <div className="slide-content">
                                <IonIcon 
                                    icon={slide.icon} 
                                    className="slide-icon"
                                    style={{ fontSize: '120px', color: 'var(--ion-color-primary)' }}
                                />
                                <IonText>
                                    <h2 className="slide-title">{slide.title}</h2>
                                </IonText>
                                <IonText>
                                    <p className="slide-description">{slide.description}</p>
                                </IonText>
                            </div>
                        </SwiperSlide>
                    ))}
                </Swiper>

                <div className="slide-controls">
                    {currentSlide === slides.length - 1 ? (
                        <IonButton 
                            expand="block" 
                            onClick={handleFinish}
                            className="finish-button"
                        >
                            {translations.onboarding?.getStarted || 'Get Started'}
                        </IonButton>
                    ) : (
                        <IonButton 
                            expand="block" 
                            onClick={() => location.href = '/home'}
                            fill="outline"
                        >
                            {translations.onboarding?.skip || 'Skip'}
                        </IonButton>
                    )}
                </div>
            </IonContent>
        </IonPage>
    );
};

export default Onboarding; 