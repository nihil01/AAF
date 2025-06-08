import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, CameraResultType } from '@capacitor/camera';
import CarModifications from './CarModifications';
import * as z from 'zod';
import { useLanguage } from '../context/LanguageContext';
import { HttpClient } from '../net/HttpClient';
import type { VehicleWithMedia } from '../net/HttpClient';
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
  IonSpinner,
  IonBadge
} from '@ionic/react';
import { add, settings, camera, image, arrowBack, create, trash } from 'ionicons/icons';
import './CarComponent.css';

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

interface CarDetails extends Omit<VehicleWithMedia, 'id' | 'uuid'> {
  id: string; // Using string for client-side IDs
  modifications: string; // Adding back modifications as it's not in VehicleWithMedia
  uuid: string;
}

export function CarComponent({ setComponent }: { setComponent: (value: string | null) => void }) {
  const { translations } = useLanguage();
  const [presentToast] = useIonToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const httpClient = new HttpClient();
  const [cars, setCars] = useState<CarDetails[]>([]);
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
        const vehicleData = await httpClient.getVehicleData();
        // Transform the data to include modifications from the backend
        const transformedData: CarDetails[] = vehicleData.map(vehicle => ({
          ...vehicle,
          id: vehicle.id.toString(),
          modifications: vehicle.modifications || '' // Use backend modifications if available
        }));
        setCars(transformedData);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
        // presentToast({
        //   message: translations.carComponent.fetchError || 'Failed to fetch vehicle data',
        //   duration: 2000,
        //   position: 'bottom',
        //   color: 'danger'
        // });
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
      const newCar: CarDetails = {
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
  const handleEdit = (car: CarDetails) => {
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
          <IonTitle>{translations.carComponent.carDetails}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        {isLoading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>{translations.carComponent.loading || 'Loading...'}</p>
          </div>
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

                          <IonButton expand="block" onClick={() => showModificationDialog()}>
                            <IonIcon slot="start" icon={add} />
                            {translations.carComponent.addModification}
                          </IonButton>


                        </IonCol>
                      </IonRow>

                      {/* Photo Upload Button */}
                      <IonButton expand="block" onClick={() => setShowPhotoModal(true)}>
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

                      <IonButton 
                        expand="block" 
                        type="submit" 
                        style={{marginTop: '20px'}}
                        disabled={isSubmitting}
                        onClick={() => onSubmit(form.getValues())}
                      >
                        {isSubmitting ? (
                          <>
                            <IonSpinner name="crescent" style={{ marginRight: '8px' }} />
                            {translations.carComponent.submitting}
                          </>
                        ) : (
                          translations.carComponent.saveCar
                        )}
                      </IonButton>

                    </IonGrid>
                  </form>
                </IonCardContent>
              </IonCard>
            )}

            {/* Display added cars */}
            <div className="cars-grid">
              {cars.map(car => (
                <IonCard key={car.id} className="car-card">
                  {car.photo_urls && car.photo_urls.length > 0 && (
                    <div className="car-image-container">
                      <img src={car.photo_urls[0]} alt={`${car.make} ${car.model}`} />
                      <div className="year-chip">{car.year}</div>
                    </div>
                  )}
                  <IonCardHeader>
                    <IonCardTitle>{car.year} {car.make} {car.model}</IonCardTitle>
                    <div className="car-actions">
                      <IonButton fill="clear" onClick={() => handleEdit(car)}>
                        <IonIcon icon={create} />
                      </IonButton>
                      <IonButton fill="clear" color="danger" onClick={() => handleDelete(car.uuid)}>
                        <IonIcon icon={trash} />
                      </IonButton>
                    </div>
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="specs-grid">
                      <div className="spec-item">
                        <strong>{translations.carComponent.engine}:</strong>
                        <span>{car.engineSpecs}</span>
                      </div>
                      <div className="spec-item">
                        <strong>{translations.carComponent.horsePower}:</strong>
                        <span>{car.horsePower}hp</span>
                      </div>
                      <div className="spec-item">
                        <strong>{translations.carComponent.torque}:</strong>
                        <span>{car.torque}</span>
                      </div>
                      <div className="spec-item">
                        <strong>{translations.carComponent.zeroToHundred}:</strong>
                        <span>{car.zeroToHundred}</span>
                      </div>
                    </div>
                    
                    {car.modifications && car.modifications.length > 0 && (
                      <div className="mods-section">
                        <h4>{translations.carComponent.modifications}</h4>
                        <div className="mods-chips">
                          {JSON.parse(car.modifications).map((mod: string, index: number) => (
                            <IonBadge key={index} color="primary">{mod}</IonBadge>
                          ))}
                        </div>
                      </div>
                    )}

                    {car.story && (
                      <div className="story-section">
                        <h4>{translations.carComponent.story}</h4>
                        <p>{car.story}</p>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
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

