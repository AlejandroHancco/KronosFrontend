import { useNavigate } from 'react-router-dom';

interface BreadcrumbProps {
  items: Array<{
    label: string;
    path?: string;  // undefined = elemento actual (no clickeable)
  }>;
}

const Breadcrumb = ({ items }: BreadcrumbProps) => {
  const navigate = useNavigate();

  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2 text-sm">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2 text-slate-500">&gt;</span>}
            {item.path ? (
              <button
                onClick={() => navigate(item.path!)}
                className="text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ) : (
              <span className="text-white font-medium">{item.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export default Breadcrumb;
