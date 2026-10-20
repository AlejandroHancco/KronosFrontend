import { KronosLoader } from './kronos';

interface LoadingSpinnerProps {
  label?: string;
}

const LoadingSpinner = ({ label = 'Cargando…' }: LoadingSpinnerProps) => <KronosLoader size="page" label={label} />;

export default LoadingSpinner;
