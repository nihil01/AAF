import { IonButton, IonInput, IonTextarea, IonIcon, IonButtons, IonTitle, IonHeader, IonPage, IonToolbar, IonContent, IonItem, IonLabel } from "@ionic/react";
import { arrowBack, add, trash } from "ionicons/icons";
import React, { useRef, useState } from "react";
import { HttpClient } from "../../net/HttpClient";

const SOCIAL_TYPES = [
  { label: 'Instagram', value: 'instagram' },
  { label: 'Facebook', value: 'facebook' },
];

export interface BioFormData {
  avatar: File | null;
  about: string;
  socials: { type: string; value: string }[];
}

export const BioComponent = ({ setComponent }: { setComponent: (value: string | null) => void }) => {
  const [form, setForm] = useState<BioFormData>({
    avatar: null,
    about: '',
    socials: [],
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Store the actual file
      setForm(f => ({ ...f, avatar: file }));
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAvatarPreview(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialChange = (idx: number, key: 'type' | 'value', value: string) => {
    setForm(f => ({
      ...f,
      socials: f.socials.map((s, i) => i === idx && (s.type !== value || s.value !== value) ? { ...s, [key]: value } : s)
    }));
  };

  const addSocial = () => {
    setForm(f => ({ ...f, socials: [...f.socials, { type: '', value: '' }] }));
  };

  const removeSocial = (idx: number) => {
    setForm(f => ({ ...f, socials: f.socials.filter((_, i) => i !== idx) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      
      
      // Handle avatar file
      if (form.avatar) {
      
        formData.append('avatar', form.avatar);
      }
      
      // Handle about text
      formData.append('about', form.about || '');
      formData.append('social_networks', JSON.stringify(form.socials));
      
      await new HttpClient().updateProfileBio(formData);
      
      // Reset form after successful submission
      setForm({
        avatar: null,
        about: '',
        socials: [],
      });
      setAvatarPreview(null);
      
      setComponent(null); // Close the bio component after successful update
    } catch (error) {
      console.error('Error updating bio:', error);
      // You might want to show an error message to the user here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton onClick={() => setComponent(null)}>
              <IonIcon icon={arrowBack} />
            </IonButton>
          </IonButtons>
          <IonTitle>Bio</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <form onSubmit={handleSubmit} style={{ maxWidth: 500, margin: '32px auto', background: 'var(--ion-card-background, #fff)', borderRadius: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.07)', padding: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center',  gap: 24, marginBottom: 24 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: '#eee', overflow: 'hidden', flexShrink: 0, position: 'relative', cursor: 'pointer' }} onClick={() => fileInputRef.current?.click()}>
              {avatarPreview ? (
                <img src={avatarPreview} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                    <p>Avatar</p>
                    <span style={{ color: '#aaa', fontSize: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>+</span>
                </div>
              )}
              <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
            </div>
          </div>
          <IonItem lines="none">
            <IonLabel position="stacked">About Me</IonLabel>
            <IonTextarea value={form.about} onIonChange={e => setForm(f => ({ ...f, about: e.detail.value || '' }))} autoGrow required />
          </IonItem>
          <div style={{ margin: '24px 0 8px', fontWeight: 500 }}>Social Links</div>
          {form.socials.map((s, idx) => (
            <div key={idx} style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
              <select value={s.type} onChange={e => handleSocialChange(idx, 'type', e.target.value)} style={{ padding: 8, borderRadius: 6, border: '1px solid #ccc' }} required>
                <option value="">Select</option>
                {SOCIAL_TYPES.map(st => <option key={st.value} value={st.value}>{st.label}</option>)}
              </select>
              <IonInput value={s.value} onIonChange={e => handleSocialChange(idx, 'value', e.detail.value || '')} placeholder="Your link or username" required style={{ flex: 1 }} />
              <IonButton color="danger" fill="clear" onClick={() => removeSocial(idx)} type="button"><IonIcon icon={trash} /></IonButton>
            </div>
          ))}
          <IonButton fill="outline" expand="block" onClick={addSocial} type="button" style={{ marginBottom: 24 }}>
            <IonIcon icon={add} slot="start" /> Add Social
          </IonButton>
          <IonButton type="submit" expand="block" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save'}
          </IonButton>
        </form>
      </IonContent>
    </IonPage>
  );
}; 