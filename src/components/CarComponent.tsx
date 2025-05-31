import {useState} from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Camera, CameraResultType } from '@capacitor/camera';
import * as z from 'zod';
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
  IonImg, IonAlert
} from '@ionic/react';
import { car, add, flash, settings, calendar, camera, image } from 'ionicons/icons';
import './CarComponent.css';

const carFormSchema = z.object({
  make: z.string().min(1, 'Make is required'),
  model: z.string().min(1, 'Model is required'),
  year: z.number().min(1900).max(new Date().getFullYear() + 1),
  engineSpecs: z.string().min(1, 'Engine specs are required'),
  horsePower: z.number().min(1, 'Horsepower must be greater than 0'),
  torque: z.string().min(1, 'Torque is required'),
  zeroToSixty: z.string().min(1, '0-60 time is required'),
  story: z.string().min(10, 'Story must be at least 10 characters'),
  photos: z.array(z.string()).max(5, 'Maximum 5 photos allowed')
});

type CarFormData = z.infer<typeof carFormSchema>;

interface CarDetails extends CarFormData {
  id: string;
  modifications: string[];
  photos: string[];
}

export function CarComponent() {
  const [cars, setCars] = useState<CarDetails[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [modifications, setModifications] = useState<string[]>([]);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [newModification, setNewModification] = useState('');
  const [showPhotoAlert, setShowPhotoAlert] = useState(false);


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
      zeroToSixty: '',
      story: '',
    },
  });

  const onSubmit = (data: CarFormData) => {
    const newCar: CarDetails = {
      ...data,
      id: Date.now().toString(),
      modifications,
      photos,
    };

    setCars([...cars, newCar]);
    form.reset();
    setPhotos([]);
    setModifications([]);
    setShowForm(false);
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
      quality: 90,
      width: 400,
      height: 300,
      allowEditing: false,
      resultType: CameraResultType.Uri,
    });

    if (image) {
      setPhotos([...photos, image.webPath]);
    }

  };

  const handleFileSystem = async () => {
    // File system implementation here
    setShowPhotoModal(false);

    const { photos } = await Camera.pickImages({
      width: 400,
      height: 300
    });

    if (photos) {
      setPhotos([...photos.map((photo) => photo.webPath)]);
    }

  };

  const addModification = () => {
    if (newModification.trim()) {
      setModifications([...modifications, newModification.trim()]);
      setNewModification('');
    }
  };

  return (
    <div className="container">
      {/* Header */}
      <div className="header">
        <p>Showcase your automotive passion</p>
      </div>

      {/* Add Car Button */}
      {!showForm && (
        <div className="add-car-button">
          <IonButton expand="block" onClick={() => setShowForm(true)}>
            <IonIcon slot="start" icon={add} />
            Add Your Pride & Joy
          </IonButton>
        </div>
      )}

      <IonAlert
          isOpen={showPhotoAlert}
          onDidDismiss={() => setShowPhotoAlert(false)}
          header={'Maximum Photos Reached'}
          message={'You can only add up to 5 photos.'}
          buttons={['OK']}
      />

      {/* Car Form */}
      {showForm && (
        <IonCard>
          <IonCardHeader>
            <IonCardTitle style={{fontFamily: 'Arial, sans-serif', fontWeight: 'bold'}}>
              <IonIcon icon={settings} />
              Add Your Car
            </IonCardTitle>
          </IonCardHeader>

          <IonCardContent>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <IonGrid>
                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '0.8em'}}>Make</IonLabel>
                      <IonInput style={{fontFamily: 'Arial, sans-serif'}} {...form.register('make')} placeholder="Ferrari, Lamborghini, BMW..." />
                    </IonItem>
                  </IonCol>

                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '0.8em'}}>Model</IonLabel>
                      <IonInput style={{fontFamily: 'Arial, sans-serif'}} {...form.register('model')} placeholder="F40, Aventador, M3..." />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '0.8em'}}>Year</IonLabel>
                      <IonInput type="number" style={{fontFamily: 'Arial, sans-serif'}} {...form.register('year', { valueAsNumber: true })} />
                    </IonItem>
                  </IonCol>

                  <IonCol size="12" sizeMd="6">
                    <IonItem>
                      <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '0.8em'}}>Engine Specs</IonLabel>
                      <IonInput style={{fontFamily: 'Arial, sans-serif'}} {...form.register('engineSpecs')} placeholder="V8, 4.0L Twin-Turbo..." />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12" sizeMd="4">
                    <IonItem>
                      <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '0.8em'}}>Horsepower</IonLabel>
                      <IonInput type="number" style={{fontFamily: 'Arial, sans-serif'}} {...form.register('horsePower', { valueAsNumber: true })} />
                    </IonItem>
                  </IonCol>

                  <IonCol size="12" sizeMd="4">
                    <IonItem>
                      <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '0.8em'}}>Torque</IonLabel>
                      <IonInput style={{fontFamily: 'Arial, sans-serif'}} {...form.register('torque')} placeholder="500 lb-ft" />
                    </IonItem>
                  </IonCol>

                  <IonCol size="12" sizeMd="4">
                    <IonItem>
                      <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '0.8em'}}>0-60 Time</IonLabel>
                      <IonInput style={{fontFamily: 'Arial, sans-serif'}} {...form.register('zeroToSixty')} placeholder="3.2s" />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12">
                    <IonItem>
                      <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '0.8em'}}>Your Car's Story</IonLabel>
                      <IonTextarea style={{fontFamily: 'Arial, sans-serif'}} {...form.register('story')} placeholder="Tell us about your car..." />
                    </IonItem>
                  </IonCol>
                </IonRow>

                <IonRow>
                  <IonCol size="12">
                    <IonItem>
                      <IonLabel position="floating" style={{fontFamily: 'Arial, sans-serif', fontSize: '0.8em'}}>Modifications</IonLabel>
                      <IonInput
                        value={newModification}
                        onIonChange={e => setNewModification(e.detail.value || '')}
                        placeholder="Add modification..."
                        style={{fontFamily: 'Arial, sans-serif'}}
                      />
                    </IonItem>
                    <IonButton expand="block" onClick={addModification}>
                      <IonIcon slot="start" icon={add} />
                      Add Modification
                    </IonButton>
                    {modifications.map((mod, index) => (
                      <IonItem key={index}>
                        <IonLabel style={{fontSize: '0.8em'}}>{mod}</IonLabel>
                      </IonItem>
                    ))}
                  </IonCol>
                </IonRow>

                {/* Photo Upload Button */}
                <IonButton expand="block" onClick={() => setShowPhotoModal(true)}>
                  <IonIcon slot="start" icon={camera} />
                  Add Photos
                </IonButton>

                {/* Photo Upload Modal */}
                <IonModal isOpen={showPhotoModal} onDidDismiss={() => setShowPhotoModal(false)}>
                  <IonContent>
                    <IonList>
                      <IonListHeader>Choose Photo Source</IonListHeader>
                      <IonItem button onClick={handleCamera}>
                        <IonIcon slot="start" icon={camera} />
                        Take Photo
                      </IonItem>
                      <IonItem button onClick={handleFileSystem}>
                        <IonIcon slot="start" icon={image} />
                        Choose from Files
                      </IonItem>
                    </IonList>
                    <IonButton expand="block" onClick={() => setShowPhotoModal(false)}>
                      Cancel
                    </IonButton>
                  </IonContent>
                </IonModal>

                {/* Display added photos */}
                {photos.length > 0 && (showSavesPictures())}

                <IonButton expand="block" type="submit" style={{marginTop: '20px'}}>
                  Save Car
                </IonButton>

              </IonGrid>
            </form>
          </IonCardContent>
        </IonCard>
      )}

      {/* Display added cars */}
      {cars.map(car => (
        <IonCard key={car.id}>
          <IonCardHeader>
            <IonCardTitle>{car.year} {car.make} {car.model}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <p><strong>Engine:</strong> {car.engineSpecs}</p>
            <p><strong>Performance:</strong> {car.horsePower}hp, {car.torque} torque, 0-60 in {car.zeroToSixty}</p>
            <p><strong>Story:</strong> {car.story}</p>
            {car.modifications.length > 0 && (
              <>
                <p><strong>Modifications:</strong></p>
                <ul>
                  {car.modifications.map((mod, index) => (
                    <li key={index}>{mod}</li>
                  ))}
                </ul>
              </>
            )}
          </IonCardContent>
        </IonCard>
      ))}
    </div>
  );
}

