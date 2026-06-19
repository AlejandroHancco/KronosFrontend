import React from 'react';
import { ArrowLeft, Info } from 'lucide-react';
import GoogleSignInButton from '../../components/auth/GoogleSignInButton';

interface StepGoogleOnlyProps {
  email: string;
  onBack: () => void;
}

const StepGoogleOnly: React.FC<StepGoogleOnlyProps> = ({ email, onBack }) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="inline-flex size-12 items-center justify-center rounded-full bg-blue-500/10">
          <Info className="text-blue-500" size={24} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold">Cuenta de Google requerida</h3>
          <p className="text-sm text-muted-foreground">
            La cuenta <span className="text-foreground font-medium">{email}</span> está asociada a Google. Por favor, utiliza el botón de abajo para acceder.
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <GoogleSignInButton />
        
        <button
          onClick={onBack}
          className="w-full text-sm text-muted-foreground hover:text-foreground flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft size={14} />
          Volver
        </button>
      </div>
    </div>
  );
};

export default StepGoogleOnly;
