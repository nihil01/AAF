import React, { useState } from "react";
import {
    IonContent,
    IonPage,
    IonButton,
    IonInput,
    IonLabel,
    IonSegment,
    IonSegmentButton,
    IonItem,
    IonList,
    IonGrid,
    IonRow,
    IonCol,
    IonIcon,
    IonText,
    IonAlert,
    IonLoading,
    useIonAlert
} from '@ionic/react';

import { logoApple, logoGoogle } from "ionicons/icons";
import { HttpClient } from "../net/HttpClient.ts";
import { loginWithGoogle } from "../firebase/Oauth2.ts";

const Auth: React.FC = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [username, setUsername] = useState("");
    const [otp, setOtp] = useState("");

    const [confirmPassword, setConfirmPassword] = useState("");
    const [activeSegment, setActiveSegment] = useState("login");
    const [errorMessage, setErrorMessage] = useState("");

    const [showErrorAlert, setShowErrorAlert] = useState(false);
    const [showOtpAlert, setShowOtpAlert] = useState(false);
    const [showResetAlert, setShowResetAlert] = useState(false);
    const [showResetOtpAlert, setShowResetOtpAlert] = useState(false);
    const [showNewPasswordAlert, setShowNewPasswordAlert] = useState(false);

    const [loading, setLoading] = useState(false);

    const httpClient = new HttpClient();
    const [presentAlert] = useIonAlert();

    const validatePassword = (password: string) => {
        if (password.length < 8) {
            return "Password must be at least 8 characters long";
        }
        if (!/[A-Z]/.test(password)) {
            return "Password must contain at least one uppercase letter";
        }
        if (!/[0-9]/.test(password)) {
            return "Password must contain at least one number";
        }
        return "";
    };


    const oauth2 = async (provider: string) =>{
        if (provider === "google") {
            await loginWithGoogle((errorMsg?: string) => {
                if (errorMsg) {
                    presentAlert({
                        header: 'Authentication Error',
                        message: errorMsg,
                        buttons: ['OK']
                    });
                }
            });
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMessage("");

        if (activeSegment === "signup") {
            const passwordError = validatePassword(password);
            if (passwordError) {
                setErrorMessage(passwordError);
                setShowErrorAlert(true);
                return;
            }

            if (password !== confirmPassword) {
                setErrorMessage("Passwords do not match");
                setShowErrorAlert(true);
                return;
            }

            httpClient.authenticate({
                type: "register",
                email,
                username,
                password,
            }).then(r => {
                console.log(r)
                if (r.success && r.registered === "EMAIL_AWAITING") {
                    console.log("AWAITING BRO")
                    setShowOtpAlert(true); // Correct way to trigger alert
                } else if (!r.success) {
                    setErrorMessage("Unsuccessful registration !");
                    setShowErrorAlert(true);
                }
            });
            return;
        }

        httpClient.authenticate({
            type: "login",
            email,
            password,
        }).then(r => {
            if (r.success) {
                console.log("Logged in successfully");
                window.location.href = "/";
            } else {
                setErrorMessage("Unsuccessful login !");
                setShowErrorAlert(true);
            }
        });
    };

    return (
        <IonPage>
            <IonContent className="ion-padding nontransparent-content">
                <div className="ion-text-center ion-padding">
                    <h1>CarMeeter</h1>
                    <p>Connect with car enthusiasts</p>
                </div>

                <IonSegment value={activeSegment} onIonChange={e => setActiveSegment(e.detail.value as string)}>
                    <IonSegmentButton value="login">
                        <IonLabel>Login</IonLabel>
                    </IonSegmentButton>
                    <IonSegmentButton value="signup">
                        <IonLabel>Sign up</IonLabel>
                    </IonSegmentButton>
                </IonSegment>

                {errorMessage && (
                    <div className="ion-text-center ion-padding">
                        <IonText color="danger">{errorMessage}</IonText>
                    </div>
                )}

                {activeSegment === "login" && (
                    <form onSubmit={handleSubmit}>
                        <IonList>
                            <IonItem>
                                <IonLabel position="floating" style={{ fontSize: 10 }}>Email</IonLabel>
                                <IonInput
                                    type="email"
                                    value={email}
                                    onIonChange={e => setEmail(e.detail.value!)}
                                    required
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel position="floating" style={{ fontSize: 10 }}>Password</IonLabel>
                                <IonInput
                                    type="password"
                                    value={password}
                                    onIonChange={e => setPassword(e.detail.value!)}
                                    required
                                />
                            </IonItem>

                            <div className="ion-text-center ion-padding">
                                <IonText color="primary" style={{cursor: 'pointer'}} onClick={() => setShowResetAlert(true)}>
                                    Forgot Password?
                                </IonText>
                            </div>
                        </IonList>

                        <div className="ion-padding">
                            <IonButton expand="block" type="submit">
                                Login
                            </IonButton>
                        </div>

                        <div className="ion-text-center ion-padding">
                            <IonLabel>Or continue with</IonLabel>
                        </div>

                        <IonGrid>
                            <IonRow>
                                <IonCol>
                                    <IonButton expand="block" fill="outline" onClick={() => oauth2("google")}>
                                        <IonIcon icon={logoGoogle} />
                                    </IonButton>
                                </IonCol>
                                <IonCol>
                                    <IonButton expand="block" fill="outline">
                                        <IonIcon icon={logoApple} />
                                    </IonButton>
                                </IonCol>
                            </IonRow>
                        </IonGrid>
                    </form>
                )}

                {activeSegment === "signup" && (
                    <form onSubmit={handleSubmit}>
                        <IonList>
                            <IonItem>
                                <IonLabel position="floating" style={{ fontSize: 10 }}>Email</IonLabel>
                                <IonInput
                                    type="email"
                                    value={email}
                                    onIonChange={e => setEmail(e.detail.value!)}
                                    required
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel position="floating" style={{ fontSize: 10 }}>Username</IonLabel>
                                <IonInput
                                    type="text"
                                    value={username}
                                    onIonChange={e =>
                                        setUsername((e.detail.value!).toLowerCase())}
                                    required
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel position="floating" style={{ fontSize: 10 }}>Password</IonLabel>
                                <IonInput
                                    type="password"
                                    value={password}
                                    onIonChange={e => setPassword(e.detail.value!)}
                                    required
                                />
                            </IonItem>

                            <IonItem>
                                <IonLabel position="floating" style={{ fontSize: 10 }}>Confirm Password</IonLabel>
                                <IonInput
                                    type="password"
                                    value={confirmPassword}
                                    onIonChange={e => setConfirmPassword(e.detail.value!)}
                                    required
                                />
                            </IonItem>
                        </IonList>

                        <div className="ion-padding">
                            <IonButton expand="block" type="submit">
                                Sign up
                            </IonButton>
                        </div>
                    </form>
                )}

                {/* OTP Alert */}
                <IonAlert
                    isOpen={showOtpAlert}
                    onDidDismiss={() => setShowOtpAlert(false)}
                    header={'Enter OTP'}
                    inputs={[
                        {
                            name: 'otp',
                            type: 'number',
                            placeholder: 'Enter OTP sent to your email'
                        }
                    ]}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel'
                        },
                        {
                            text: 'Verify',
                            handler: (data) => {
                                setOtp(data.otp);

                                httpClient.authenticate({
                                    type: "register",
                                    email,
                                    username,
                                    password,
                                    code: data.otp
                                }).then(r => {
                                    if (r.success && r.registered === null) {
                                        setErrorMessage("Invalid OTP code !");
                                        setShowErrorAlert(true);
                                    } else {
                                        console.log("Registered successfully !");
                                        window.location.href = "/";
                                    }
                                });
                            }
                        }
                    ]}
                />

                {/* Reset Password Email Alert */}
                <IonAlert
                    isOpen={showResetAlert}
                    onDidDismiss={() => setShowResetAlert(false)}
                    header={'Reset Password'}
                    inputs={[
                        {
                            name: 'email',
                            type: 'email',
                            placeholder: 'Enter your email'
                        }
                    ]}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel'
                        },
                        {
                            text: 'Send OTP',
                            id: 'open-loading',
                            handler: async (data) => {
                                setLoading(true);
                                setEmail(data.email)

                                const info = await httpClient.requestPasswordRecovery(data.email);
                                if (!info.success){
                                    setErrorMessage("Email not found!");
                                }else{
                                    setShowResetOtpAlert(true);
                                }

                                setLoading(false);
                            }
                        }
                    ]}
                />

                <IonLoading
                    isOpen={loading}
                    animated={true}
                    message={'Loading... Wait please'}
                />

                {/* Reset Password OTP Alert */}
                <IonAlert
                    isOpen={showResetOtpAlert}
                    onDidDismiss={() => setShowResetOtpAlert(false)}
                    header={'Enter Reset Code'}
                    inputs={[
                        {
                            name: 'otp',
                            type: 'number',
                            placeholder: 'Enter OTP from email'
                        }
                    ]}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel'
                        },
                        {
                            text: 'Verify',
                            handler: async (data) => {
                                const currentEmail = email;
                                setOtp(data.otp);

                                httpClient.recoverPassword(currentEmail, data.otp, "").then(value => {
                                    if (value["OTP-APPROVED"]){
                                        setShowNewPasswordAlert(true);
                                    } else {
                                        setErrorMessage("Invalid OTP code!");
                                        setShowErrorAlert(true);
                                    }
                                });
                            }

                        }
                    ]}
                />

                {/* New Password Alert */}
                <IonAlert
                    isOpen={showNewPasswordAlert}
                    onDidDismiss={() => setShowNewPasswordAlert(false)}
                    header={'Set New Password'}
                    inputs={[
                        {
                            name: 'newPassword',
                            type: 'password',
                            placeholder: 'Enter new password'
                        },
                        {
                            name: 'confirmPassword',
                            type: 'password',
                            placeholder: 'Confirm new password'
                        }
                    ]}
                    buttons={[
                        {
                            text: 'Cancel',
                            role: 'cancel'
                        },
                        {
                            text: 'Update Password',
                            handler: (data) => {
                                const otpVal = otp;
                                if (data.newPassword !== data.confirmPassword) {
                                    setErrorMessage("Passwords do not match!");
                                    setShowErrorAlert(true);
                                    return;
                                }

                                const passwordError = validatePassword(data.newPassword);
                                if (passwordError) {
                                    setErrorMessage(passwordError);
                                    setShowErrorAlert(true);
                                    return;
                                }

                                httpClient.recoverPassword(email, otpVal, data.newPassword)
                                    .then(value => {
                                    if (value["PASSWORD-RESET-APPROVED"]){
                                        setErrorMessage("Password reset successfully!");
                                        setShowErrorAlert(true);

                                        //clear data
                                        setOtp("");
                                        setEmail("");
                                        setPassword("");
                                        setConfirmPassword("");

                                    }
                                })
                            }
                        }
                    ]}
                />

                {/* Error Alert */}
                <IonAlert
                    isOpen={showErrorAlert}
                    onDidDismiss={() => setShowErrorAlert(false)}
                    header={'Error'}
                    message={errorMessage}
                    buttons={['OK']}
                />
            </IonContent>
        </IonPage>
    );
};

export default Auth;