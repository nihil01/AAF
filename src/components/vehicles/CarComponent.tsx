import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, CameraResultType } from '@capacitor/camera';
import CarModifications from './CarModifications.ts';
import * as z from 'zod';
import { useLanguage } from '../../context/LanguageContext.tsx';
import { HttpClient } from '../../net/HttpClient.ts';
import { useIonToast } from '@ionic/react';

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
  IonPage,
  IonBadge
} from '@ionic/react';
import { add, settings, camera, image, arrowBack, create, trash } from 'ionicons/icons';
import './CarComponent.css';
import { CustomLoaderComponent } from '../loader/CustomLoaderComponent';
import type { VehicleDetails } from '../../types/profile.ts';
import { VehicleCard } from './VehicleCard.tsx';

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

// Mock data to simulate backend
const MOCK_VEHICLES: VehicleDetails[] = [
  {
    id: '1',
    uuid: '1',
    make: 'Tesla',
    model: 'Model S',
    year: 2022,
    engineSpecs: 'Dual Motor AWD',
    horsePower: 670,
    torque: '850 Nm',
    zeroToHundred: '3.1s',
    story: 'A premium electric sedan with great performance and range.',
    photo_urls: [
      'https://www.google.com/url?sa=i&url=https%3A%2F%2Fleasecar.uk%2Fspecial-offers%2F&psig=AOvVaw1TqtQwkdXMiz9PlmnU8Edi&ust=1749886192436000&source=images&cd=vfe&opi=89978449&ved=0CBEQjRxqFwoTCPjA05bw7Y0DFQAAAAAdAAAAABAE',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a4/2019_Toyota_Corolla_Icon_Tech_VVT-i_Hybrid_1.8.jpg/960px-2019_Toyota_Corolla_Icon_Tech_VVT-i_Hybrid_1.8.jpg'
    ],
    modifications: JSON.stringify(['Performance Upgrade', 'Tinted Windows']),
    created_at: '2023-01-01T12:00:00Z'
  },
  {
    id: '2',
    uuid: '2',
    make: 'BMW',
    model: 'M3',
    year: 2020,
    engineSpecs: '3.0L Twin-Turbo I6',
    horsePower: 473,
    torque: '550 Nm',
    zeroToHundred: '4.1s',
    story: 'A sporty sedan with a legacy of performance and driving pleasure.',
    photo_urls: [
      'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQcK8LuTRihbc5t5dlS6Lw6Q710u02oN80LJw&s'
    ],
    modifications: JSON.stringify(['Carbon Fiber Spoiler']),
    created_at: '2022-06-15T09:30:00Z'
  }
];

export function CarComponent({ setComponent }: { setComponent: (value: string | null) => void }) {
  const { translations } = useLanguage();
  const [presentToast] = useIonToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const httpClient = new HttpClient();
  const [cars, setCars] = useState<VehicleDetails[]>([]);
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
        // Simulate backend delay
        await new Promise(res => setTimeout(res, 500));
        // Use mock data
        setCars(MOCK_VEHICLES);
        // If you want to use backend, comment above and uncomment below:
        // const vehicleData = await httpClient.getVehicleData();
        // const transformedData: VehicleDetails[] = vehicleData.map(vehicle => ({
        //   ...vehicle,
        //   id: vehicle.id.toString(),
        //   modifications: vehicle.modifications || ''
        // }));
        // setCars(transformedData);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
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

      // Create FormData object
      const formData = new FormData();
      
      // Add basic car information
      formData.append('make', data.make);
      formData.append('model', data.model);
      formData.append('year', data.year.toString());
      formData.append('engineSpecs', data.engineSpecs);
      formData.append('horsePower', data.horsePower.toString());
      formData.append('torque', data.torque);
      formData.append('zeroToHundred', data.zeroToHundred);
      formData.append('story', data.story);
      
      
      // Add modifications as JSON string
      formData.append('modifications', JSON.stringify(modifications));

      // Add all photos to FormData
      const photoPromises = photos.map(async (photo) => {
        const response = await fetch(photo);
        const blob = await response.blob();
        return blob;
      });

      // Wait for all photo blobs to be created
      const photoBlobs = await Promise.all(photoPromises);
      
      // Append each photo blob to FormData
      photoBlobs.forEach((blob, index) => {
        formData.append('photos', blob, `car_photo_${Date.now()}_${index}.jpg`);
      });

      // Submit to server (endpoint will be specified later)
      const response = await httpClient.submitVehicleData(formData);

      // Add to local state
      const newCar: VehicleDetails = {
        ...response,
        id: response.id.toString(), // Convert server ID to string
        modifications: JSON.stringify(modifications), // Add modifications from local state
      };

      setCars([...cars, newCar]);
      
      // Show success message
      presentToast({
        message: translations.carComponent.submissionSuccess,
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
      width: 400,
      height: 300,
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
      width: 400,
      height: 300,
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
      await httpClient.deleteVehicle(carId);
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
  const handleEdit = (car: VehicleDetails) => {
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

