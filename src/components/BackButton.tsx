import { useNavigate } from 'react-router-dom';

const BackButton = () => {
  const navigate = useNavigate();

  return (
    <button
      onClick={() => navigate(-1)}
      className="flex items-center space-x-2 text-slate-400 hover:text-white transition-colors mb-4"
    >
      <span>&larr;</span>
      <span>Volver</span>
    </button>
  );
};

export default BackButton;
