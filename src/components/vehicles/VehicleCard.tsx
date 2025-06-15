import { IonCard, IonCardHeader, IonCardTitle, IonButton, IonCardContent, IonBadge, useIonAlert, IonModal } from "@ionic/react";
import type { VehicleWithMedia } from "../../types/profile";
import { IonIcon } from "@ionic/react";
import { create, trash } from "ionicons/icons";
import { useLanguage } from "../../context/LanguageContext";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useState } from "react";



export const VehicleCard = ({ vehicle, handleDelete, handleEdit }:
     { vehicle: VehicleWithMedia, handleDelete?: (uuid: string) => void,
         handleEdit?: (vehicle: VehicleWithMedia) => void }) => {

    const { translations } = useLanguage();
    const [showImageModal, setShowImageModal] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);

    return (
        <IonCard key={vehicle.id} className="vehicle-vehicled">
              {/* Image Modal */}         
                <IonModal isOpen={showImageModal} onDidDismiss={() => setShowImageModal(false)}>
                  <div
                    style={{
                      width: '100vw',
                      height: '100vh',
                      background: 'rgba(0,0,0,0.95)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <img
                      src={selectedImage || ''}
                      alt="Enlarged"
                      style={{
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        boxShadow: '0 2px 16px rgba(0,0,0,0.5)',
                        background: '#222',
                      }}
                    />
                  </div>
                </IonModal>

                  {vehicle.photo_urls && vehicle.photo_urls.length > 0 && (
                    <Swiper
                      modules={[Pagination]}
                      pagination={{
                        clickable: true,
                        type: 'progressbar',
                      }}
                    >
                      {vehicle.photo_urls.map((photo, index) => (
                        <SwiperSlide key={index}>
                          <div
                            className="vehicle-image-container"
                            onClick={() => { setSelectedImage(photo); setShowImageModal(true); }}
                            style={{ cursor: 'pointer', width: '100%', height: 'auto', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                          >
                            <img
                              src={photo}
                              alt={`${vehicle.make} ${vehicle.model}`}
                              style={{ width: '100%', height: 'auto', display: 'block' }}
                            />
                            <div className="year-chip">{vehicle.year}</div>
                          </div>
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    
                  )}
                  <IonCardHeader>
                    <IonCardTitle>{vehicle.year} {vehicle.make} {vehicle.model}</IonCardTitle>
                    {handleEdit && handleDelete && <div className="vehicle-actions">
                      <IonButton fill="clear" onClick={() => handleEdit(vehicle)}>
                        <IonIcon icon={create} />
                      </IonButton>
                      <IonButton fill="clear" color="danger" onClick={() => handleDelete(vehicle.uuid)}>
                        <IonIcon icon={trash} />
                      </IonButton>
                    </div>}
                  </IonCardHeader>
                  <IonCardContent>
                    <div className="specs-grid">
                      <div className="spec-item">
                        <strong>{translations.carComponent.engine}:</strong>
                        <span>{vehicle.engineSpecs}</span>
                      </div>
                      <div className="spec-item">
                        <strong>{translations.carComponent.horsePower}:</strong>
                        <span>{vehicle.horsePower}hp</span>
                      </div>
                      <div className="spec-item">
                        <strong>{translations.carComponent.torque}:</strong>
                        <span>{vehicle.torque}</span>
                      </div>
                      <div className="spec-item">
                        <strong>{translations.carComponent.zeroToHundred}:</strong>
                        <span>{vehicle.zeroToHundred}</span>
                      </div>
                      <div className="spec-item">
                        <strong>Vehicle added:</strong>
                        <span>{new Date(vehicle.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    
                    {vehicle.modifications && vehicle.modifications.length > 0 && (
                      <div className="mods-section">
                        <h4>{translations.carComponent.modifications}</h4>
                        <div className="mods-chips">
                          {JSON.parse(vehicle.modifications).map((mod: string, index: number) => (
                            <IonBadge key={index} color="primary">{mod}</IonBadge>
                          ))}
                        </div>
                      </div>
                    )}

                    {vehicle.story && (
                      <div className="story-section">
                        <h4>{translations.carComponent.story}</h4>
                        <p>{vehicle.story}</p>
                      </div>
                    )}
                  </IonCardContent>
                </IonCard>
    );
};

