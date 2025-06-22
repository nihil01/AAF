import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, CameraResultType } from '@capacitor/camera';
import CarModifications from './CarModifications.ts';
import * as z from 'zod';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { HttpClient } from '../../net/HttpClient.ts';
import { useIonToast } from '@ionic/react';
import type { VehicleWithMedia } from '../../types/profile';

import {
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
  IonGrid,
  IonRow,
  IonCol,
  IonInput,
  IonLabel,
  IonItem,
  IonIcon,
  IonModal,
  IonContent,
  IonList,
  IonListHeader,
  IonTextarea,
  IonImg, IonAlert,
  IonToolbar,
  IonButtons,
  IonTitle,
  IonHeader,
  IonPage
} from '@ionic/react';

import { add, settings, camera, image, arrowBack } from 'ionicons/icons';
import './CarComponent.css';
import { CustomLoaderComponent } from '../loader/CustomLoaderComponent';
// import type { VehicleDetails } from '../../types/profile.ts';
import { VehicleCard } from './VehicleCard.tsx';
import { darkMapStyle } from '../../theme/mapStyles.ts';

const formStyles = {
  item: {
    '--padding-start': '0',
    '--inner-padding-end': '0',
    '--min-height': '70px',
    marginBottom: '8px'
  },
  label: {
    marginBottom: '8px',
    fontSize: '0.9em',
    fontWeight: '500',
    color: 'var(--ion-color-medium)'
  },
  input: {
    '--padding-top': '8px',
    '--padding-bottom': '8px',
    '--padding-start': '16px',
    '--padding-end': '16px',
    '--min-height': '48px',
    fontSize: '1em'
  },
  textarea: {
    '--padding-top': '8px',
    '--padding-bottom': '8px',
    '--padding-start': '16px',
    '--padding-end': '16px',
    '--min-height': '120px',
    fontSize: '1em'
  }
};

const carFormSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  engineSpecs: z.string().min(1, 'Engine specs are required'),
  horsePower: z.number().min(1, 'Horsepower must be greater than 0'),
  torque: z.string().min(1, 'Torque is required'),
  zeroToHundred: z.string().min(1, '0-100 time is required'),
  story: z.string().min(10, 'Story must be at least 10 characters'),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed'),
  modifications: z.array(z.string())
});

type CarFormData = z.infer<typeof carFormSchema>;

// Mock data for testing
// const MOCK_VEHICLES: VehicleWithMedia[] = [
//     {
//         uuid: "1",
//         id: 1,
//         make: "BMW",
//         model: "M3",
//         year: 2022,
//         engineSpecs: "3.0L Twin-Turbo I6",
//         horsePower: 473,
//         torque: "550 Nm",
//         zeroToHundred: "4.1s",
//         story: "A sporty sedan with a legacy of performance and driving pleasure. This M3 has been my dream car for years, and it's even better than I imagined. The handling is precise, the power delivery is smooth, and the sound is intoxicating.",
//         modifications: JSON.stringify([
//             "Carbon Fiber Spoiler",
//             "Performance Exhaust",
//             "Lowered Suspension",
//             "Stage 2 Tune",
//             "Forged Wheels"
//         ]),
//         created_at: "2024-01-15T10:30:00Z",
//         photo_urls: [
//             "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format&fit=crop",
//             "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format&fit=crop",
//             "https://images.unsplash.com/photo-1607853202273-797f1c22a38e?w=800&auto=format&fit=crop"
//         ]
//     },
//     {
//         uuid: "2",
//         id: 2,
//         make: "Porsche",
//         model: "911",
//         year: 2021,
//         engineSpecs: "3.0L Twin-Turbo Flat-6",
//         horsePower: 379,
//         torque: "450 Nm",
//         zeroToHundred: "4.2s",
//         story: "My weekend track warrior. This 911 has been modified for both street and track use. The balance and precision of this car is unmatched. Every drive is an event, and it never fails to put a smile on my face.",
//         modifications: JSON.stringify([
//             "Sport Suspension",
//             "Track Tires",
//             "Roll Cage",
//             "Carbon Ceramic Brakes",
//             "Custom ECU Tune"
//         ]),
//         created_at: "2024-01-15T10:30:00Z",
//         photo_urls: [
//             "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
//             "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop",
//             "https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=800&auto=format&fit=crop"
//         ]
//     },
//     {
//         uuid: "3",
//         id: 3,
//         make: "Mercedes-AMG",
//         model: "GT",
//         year: 2023,
//         engineSpecs: "4.0L Biturbo V8",
//         horsePower: 577,
//         torque: "700 Nm",
//         zeroToHundred: "3.2s",
//         story: "The perfect blend of luxury and performance. This AMG GT is my daily driver and weekend cruiser. The V8 soundtrack is incredible, and the interior quality is second to none.",
//         modifications: JSON.stringify([
//             "Performance Exhaust",
//             "Carbon Fiber Interior Trim",
//             "Custom Wheels",
//             "Lowering Springs",
//             "Stage 1 Tune"
//         ]),
//         created_at: "2024-01-15T10:30:00Z",
//         photo_urls: [
//             "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
//             "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop",
//             "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=800&auto=format&fit=crop"
//         ]
//     }
// ];

export function CarComponent({ setComponent }: { setComponent: (value: string | null) => void }) {
  const { translations } = useLanguage();
  const [presentToast] = useIonToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const httpClient = new HttpClient();
  const [cars, setCars] = useState<VehicleWithMedia[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [modifications, setModifications] = useState<string[]>([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [showPhotoAlert, setShowPhotoAlert] = useState(false);

  const [showModificationsModal, setShowModificationsModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedModification, setSelectedModification] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicleData = async () => {
      try {
        setIsLoading(true);
        // Comment out real backend call
        const vehicleData = await httpClient.getVehicleData();
        const transformedData: VehicleWithMedia[] = vehicleData.map(vehicle => ({
            ...vehicle,
            modifications: vehicle.modifications || ''
        }));
        setCars(transformedData);

        // // Use mock data instead
        // console.log("Using mock vehicle data");
        // // Simulate network delay
        // await new Promise(resolve => setTimeout(resolve, 800));
        // setCars(MOCK_VEHICLES);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
        presentToast({
          message: translations.carComponent.fetchError || 'Failed to load vehicles',
          duration: 2000,
          position: 'bottom',
          color: 'danger'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicleData();
  }, []);

  const showSavesPictures = () => {
    return (
      <IonList>
        {photos.map((path, index) => (
          <IonItem key={index}>
            <IonImg src={path} />
          </IonItem>
        ))}
      </IonList>
    );
  }

  const form = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: '',
      model: '',
      year: new Date().getFullYear(),
      engineSpecs: '',
      horsePower: 0,
      torque: '',
      zeroToHundred: '',
      story: '',
    },
  });

  const onSubmit = async (data: CarFormData) => {
    try {
      setIsSubmitting(true);

      // Comment out real backend submission
      const formData = new FormData();

      formData.append('make', data.make);
      formData.append('model', data.model);
      formData.append('year', data.year.toString());
      formData.append('engineSpecs', data.engineSpecs);
      formData.append('horsePower', data.horsePower.toString());
      formData.append('torque', data.torque);
      formData.append('zeroToHundred', data.zeroToHundred);
      formData.append('story', data.story);
      formData.append('modifications', JSON.stringify(modifications));


      // ... existing formData code ...
      const response = await httpClient.submitVehicleData(formData);

      // Mock submission
      // console.log("Using mock submission");
      // await new Promise(resolve => setTimeout(resolve, 1000));

      // // Create mock response
      // const mockResponse: VehicleWithMedia = {
      //   uuid: Date.now().toString(),
      //   id: MOCK_VEHICLES.length + 1,
      //   make: data.make,
      //   model: data.model,
      //   year: data.year,
      //   engineSpecs: data.engineSpecs,
      //   horsePower: data.horsePower,
      //   torque: data.torque,
      //   zeroToHundred: data.zeroToHundred,
      //   story: data.story,
      //   modifications: JSON.stringify(modifications),
      //   created_at: new Date().toISOString(),
      //   photo_urls: photos.length > 0 ? photos : [
      //     "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&auto=format&fit=crop"
      //   ]
      // };

      // Add to local state
      setCars([...cars, response]);
      
      // Show success message
      presentToast({
        message: translations.carComponent.submissionSuccess || "Vehicle added successfully!",
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });

      // Reset form
      form.reset();
      setPhotos([]);
      setModifications([]);
      setShowForm(false);
    } catch (error) {
      console.error('Error submitting car data:', error);
      presentToast({
        message: error instanceof Error ? error.message : translations.carComponent.submissionError,
        duration: 3000,
        position: 'bottom',
        color: 'danger'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCamera = async () => {
    // Camera implementation here
    setShowPhotoModal(false);

    if (photos.length >= 5) {
      setShowPhotoAlert(true);
      setShowPhotoModal(false);
      return;
    }

    const image = await Camera.getPhoto({
      quality: 100,
      width: 300,
      height: 400,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });

    if (image && image.webPath) {
      setPhotos([...photos, image.webPath]);
    }

  };

  const handleFileSystem = async () => {
    // File system implementation here
    setShowPhotoModal(false);

    const { photos } = await Camera.pickImages({
      width: 300,
      height: 400,
      quality: 100
    });

    if (photos) {
      setPhotos([
        ...photos
          .map((photo) => photo.webPath)
          .filter((webPath): webPath is string => typeof webPath === 'string')
      ]);
    }

  };

  const showModificationDialog = () => {
    setShowModificationsModal(true);
  };

  // Add delete handler
  const handleDelete = async (carId: string) => {
    try {
      // Comment out real backend deletion
      await httpClient.deleteVehicle(carId);
      
      // Mock deletion
      // console.log("Using mock deletion");
      // await new Promise(resolve => setTimeout(resolve, 500));
      
      setCars(cars.filter(car => car.uuid !== carId));
      presentToast({
        message: translations.carComponent.deleteCarSuccess || 'Vehicle deleted successfully',
        duration: 2000,
        position: 'bottom',
        color: 'success'
      });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      presentToast({
        message: translations.carComponent.deleteCarError || 'Failed to delete vehicle',
        duration: 2000,
        position: 'bottom',
        color: 'danger'
      });
    }
  };

  // Add edit handler
  const handleEdit = (car: VehicleWithMedia) => {
    setShowForm(true);
    form.reset({
      make: car.make,
      model: car.model,
      year: car.year,
      engineSpecs: car.engineSpecs,
      horsePower: car.horsePower,
      torque: car.torque,
      zeroToHundred: car.zeroToHundred,
      story: car.story,
      photos: car.photo_urls || [],
      modifications: JSON.parse(car.modifications || '[]')
    });
    setPhotos(car.photo_urls || []);
    setModifications(JSON.parse(car.modifications || '[]'));
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setComponent(null)}>
              <IonIcon slot="start" icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>{translations.carComponent.carDetails || "Vehicle Details"}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {isLoading ? (
          <CustomLoaderComponent />
        ) : (
          <>
            {/* Add Car Button */}
            {!showForm && (
              <div className="add-car-button">
                <IonButton expand="block" onClick={() => setShowForm(true)}>
                  <IonIcon slot="start" icon={add} />
                  {translations.carComponent.addYourPrideAndJoy}
                </IonButton>
              </div>
            )}

            <IonAlert
              isOpen={showPhotoAlert}
              onDidDismiss={() => setShowPhotoAlert(false)}
              header={translations.carComponent.maximumPhotosReached}
              message={translations.carComponent.maximumPhotosMessage}
              buttons={[translations.carComponent.ok]}
            />

            {/* Car Form */}
            {showForm && (
              <IonCard>
                <IonCardHeader>
                  <IonCardTitle style={{fontFamily: 'Arial, sans-serif', fontWeight: 'bold'}}>
                    <IonIcon icon={settings} />
                    <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '1.1em'}}>
                      {translations.carComponent.addYourCar}
                    </IonLabel>
                  </IonCardTitle>
                </IonCardHeader>

                <IonCardContent>
                  <form onSubmit={form.handleSubmit(onSubmit)}>
                    <IonGrid>
                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem style={formStyles.item}>
                            <IonLabel position="stacked" style={formStyles.label}>
                              {translations.carComponent.make}
                            </IonLabel>
                            <IonInput 
                              style={formStyles.input}
                              {...form.register('make')} 
                              placeholder={translations.carComponent.makePlaceholder} 
                            />
                          </IonItem>
                        </IonCol>

                        <IonCol size="12" sizeMd="6">
                          <IonItem style={formStyles.item}>
                            <IonLabel position="stacked" style={formStyles.label}>
                              {translations.carComponent.model}
                            </IonLabel>
                            <IonInput 
                              style={formStyles.input}
                              {...form.register('model')} 
                              placeholder={translations.carComponent.modelPlaceholder} 
                            />
                          </IonItem>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol size="12" sizeMd="6">
                          <IonItem style={formStyles.item}>
                            <IonLabel position="stacked" style={formStyles.label}>
                              {translations.carComponent.year}
                            </IonLabel>
                            <IonInput 
                              type="number" 
                              style={formStyles.input}
                              {...form.register('year', { valueAsNumber: true })} 
                            />
                          </IonItem>
                        </IonCol>

                        <IonCol size="12" sizeMd="6">
                          <IonItem style={formStyles.item}>
                            <IonLabel position="stacked" style={formStyles.label}>
                              {translations.carComponent.engineSpecs}
                            </IonLabel>
                            <IonInput 
                              style={formStyles.input}
                              {...form.register('engineSpecs')} 
                              placeholder={translations.carComponent.engineSpecsPlaceholder} 
                            />
                          </IonItem>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol size="12" sizeMd="4">
                          <IonItem style={formStyles.item}>
                            <IonLabel position="stacked" style={formStyles.label}>
                              {translations.carComponent.horsePower}
                            </IonLabel>
                            <IonInput 
                              type="number" 
                              style={formStyles.input}
                              {...form.register('horsePower', { valueAsNumber: true })} 
                            />
                          </IonItem>
                        </IonCol>

                        <IonCol size="12" sizeMd="4">
                          <IonItem style={formStyles.item}>
                            <IonLabel position="stacked" style={formStyles.label}>
                              {translations.carComponent.torque}
                            </IonLabel>
                            <IonInput 
                              style={formStyles.input}
                              {...form.register('torque')} 
                              placeholder={translations.carComponent.torquePlaceholder} 
                            />
                          </IonItem>
                        </IonCol>

                        <IonCol size="12" sizeMd="4">
                          <IonItem style={formStyles.item}>
                            <IonLabel position="stacked" style={formStyles.label}>
                              {translations.carComponent.zeroToHundred}
                            </IonLabel>
                            <IonInput 
                              style={formStyles.input}
                              {...form.register('zeroToHundred')} 
                              placeholder={translations.carComponent.zeroToHundredPlaceholder} 
                            />
                          </IonItem>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol size="12">
                          <IonItem style={formStyles.item}>
                            <IonLabel position="stacked" style={formStyles.label}>
                              {translations.carComponent.carStory}
                            </IonLabel>
                            <IonTextarea 
                              style={formStyles.textarea}
                              {...form.register('story')} 
                              placeholder={translations.carComponent.carStoryPlaceholder} 
                            />
                          </IonItem>
                        </IonCol>
                      </IonRow>

                      <IonRow>
                        <IonCol size="12">
                          
                        <IonList>
                          {
                            modifications.length > 0 ? modifications.map((mod, index) => (
                              <IonItem key={index}>
                                <IonLabel style={{fontSize: '0.8em'}}>{mod}</IonLabel>
                              </IonItem>
                            )): <IonItem>{translations.carComponent.noModifications}</IonItem>
                          }
                          </IonList>

                          <IonButton expand="block" disabled={isSubmitting} onClick={() => showModificationDialog()}>
                            <IonIcon slot="start" icon={add} />
                            {translations.carComponent.addModification}
                          </IonButton>


                        </IonCol>
                      </IonRow>

                      {/* Photo Upload Button */}
                      <IonButton disabled={isSubmitting} expand="block" onClick={() => setShowPhotoModal(true)}>
                        <IonIcon slot="start" icon={camera} />
                        {translations.carComponent.addPhotos}
                      </IonButton>

                      {/* Photo Upload Modal */}
                      <IonModal isOpen={showPhotoModal} onDidDismiss={() => setShowPhotoModal(false)}>
                        <IonContent>
                          <IonList>
                            <IonListHeader>{translations.carComponent.choosePhotoSource}</IonListHeader>
                            <IonItem button onClick={handleCamera}>
                              <IonIcon slot="start" icon={camera} />
                              {translations.carComponent.takePhoto}
                            </IonItem>
                            <IonItem button onClick={handleFileSystem}>
                              <IonIcon slot="start" icon={image} />
                              {translations.carComponent.chooseFromFiles}
                            </IonItem>
                          </IonList>
                          <IonButton expand="block" onClick={() => setShowPhotoModal(false)}>
                            {translations.carComponent.cancel}
                          </IonButton>
                        </IonContent>
                      </IonModal>

                      {/* Display added photos */}
                      {photos.length > 0 && (showSavesPictures())}


                      {isSubmitting && (
                          <>
                            <CustomLoaderComponent />
                          </>
                      )}

                      <IonButton 
                        expand="block" 
                        type="submit" 
                        style={{marginTop: '20px'}}
                        disabled={isSubmitting}
                        onClick={() => onSubmit(form.getValues())}
                      >
                          {translations.carComponent.saveCar}
                      </IonButton>

                    </IonGrid>
                  </form>
                </IonCardContent>
              </IonCard>
            )}

            {/* Display added cars */}
            <div className="cars-grid">
              {cars.map(car => (
                <VehicleCard key={car.id} vehicle={car} handleDelete={handleDelete} handleEdit={handleEdit} />
              ))}
            </div>

            {/* Modification Modal */}
            <IonModal isOpen={showModificationsModal} onDidDismiss={() => {
              setShowModificationsModal(false);
              setSelectedCategory(null);
              setSelectedModification(null);
            }}>
              <IonHeader>
                <IonToolbar>
                  <IonTitle>{translations.carComponent.selectModification}</IonTitle>
                  <IonButtons slot="end">
                    <IonButton onClick={() => setShowModificationsModal(false)}>
                      {translations.carComponent.cancel}
                    </IonButton>
                  </IonButtons>
                </IonToolbar>
              </IonHeader>
              <IonContent>
                {!selectedCategory ? (
                  <IonList>
                    <IonListHeader>{translations.carComponent.chooseCategory}</IonListHeader>
                    {CarModifications.getModifications().map((cat) => (
                      <IonItem button key={cat} onClick={() => setSelectedCategory(cat)}>
                        <IonLabel>{cat}</IonLabel>
                      </IonItem>
                    ))}
                  </IonList>
                ) : (
                  <>
                    <IonList>
                      <IonListHeader>{selectedCategory}</IonListHeader>
                      {CarModifications.getChosenModification(selectedCategory).map((mod) => (
                        <IonItem button key={mod} onClick={() => setSelectedModification(mod)}>
                          <IonLabel>{mod}</IonLabel>
                        </IonItem>
                      ))}
                    </IonList>
                    <IonButton expand="block" onClick={() => setSelectedCategory(null)} style={{marginTop: 10}}>
                      {translations.carComponent.backToCategories}
                    </IonButton>
                  </>
                )}
                {selectedModification && (
                  <IonButton expand="block" color="success" style={{marginTop: 20}}
                    onClick={() => {
                      if (!modifications.includes(selectedModification)) {
                        setModifications([...modifications, selectedModification]);
                      }
                      setShowModificationsModal(false);
                      setSelectedCategory(null);
                      setSelectedModification(null);
                    }}
                  >
                    {translations.carComponent.addToModifications} "{selectedModification}"
                  </IonButton>
                )}
              </IonContent>
            </IonModal>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}

