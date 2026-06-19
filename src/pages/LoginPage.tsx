import React, { useState } from 'react';
import {
    KronosCard,
} from '../components/kronos';
import StepEmail from './auth/StepEmail';
import StepPassword from './auth/StepPassword';
import StepGoogleOnly from './auth/StepGoogleOnly';
import StepRegister from './auth/StepRegister';

type AuthStep = 'email' | 'password' | 'google-only' | 'register';

const LoginPage: React.FC = () => {
  const [step, setStep] = useState<AuthStep>('email');
  const [email, setEmail] = useState('');

  console.log('Render actual - step:', step);

  const handleNext = (nextEmail: string, nextStep: AuthStep) => {
    console.log('handleNext llamado:', { nextEmail, nextStep });
    setEmail(nextEmail);
    setStep(nextStep);
    console.log('step cambiado a:', nextStep);
  };

  const handleBack = () => {
    setStep('email');
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
            <div className="inline-flex size-12 items-center justify-center rounded-xl bg-primary mb-4 shadow-lg shadow-primary/20">
                <span className="text-xl font-bold text-primary-foreground">K</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">KRONOS</h1>
            <p className="text-sm text-muted-foreground mt-2">Plataforma de Monitoreo Industrial</p>
        </div>

        <KronosCard className="p-8 shadow-xl border-border/50 bg-card/50 backdrop-blur-sm min-h-[400px] flex flex-col justify-center">
          <div className="w-full">
            {step === 'email' && (
              <StepEmail onNext={handleNext} />
            )}
            
            {step === 'password' && (
              <StepPassword 
                email={email} 
                onBack={handleBack} 
              />
            )}
            
            {step === 'google-only' && (
              <StepGoogleOnly 
                email={email} 
                onBack={handleBack} 
              />
            )}
            
            {step === 'register' && (
              <StepRegister 
                email={email} 
                onBack={handleBack} 
              />
            )}
          </div>
        </KronosCard>

        <p className="text-center text-[10px] text-muted-foreground/50 mt-8 uppercase tracking-[0.2em]">
          Smart Concrete © 2026 · Robust Infrastructure
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
