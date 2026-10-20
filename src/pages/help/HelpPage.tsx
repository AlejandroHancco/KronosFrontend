import { useMemo, useState } from 'react';
import { KronosLayout, KronosPageHeader, KronosCard, KronosInput } from '../../components/kronos';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../../components/ui/accordion';
import { HELP_SECTIONS } from './help-content';

const normalize = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const filterSections = (q: string) => {
  const normalized = normalize(q.trim());
  if (!normalized) return HELP_SECTIONS;
  return HELP_SECTIONS.filter((s) => normalize(`${s.title} ${s.keywords}`).includes(normalized));
};

const HelpPage = () => {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string[]>(['primeros-pasos']);
  const sections = useMemo(() => filterSections(query), [query]);

  const handleQueryChange = (value: string) => {
    setQuery(value);
    const matches = filterSections(value);
    setOpen(value.trim() ? matches.map((s) => s.id) : ['primeros-pasos']);
  };

  return (
    <KronosLayout title="Ayuda" subtitle="Guía de uso de Kronos">
      <KronosPageHeader title="Ayuda" description="Cómo usar Kronos: mediciones, Kronos Watcher, reportes y permisos." />
      <div className="mb-4 max-w-md">
        <KronosInput placeholder="Buscar en la ayuda…" value={query} onChange={(e) => handleQueryChange(e.target.value)} />
      </div>
      <KronosCard className="p-0">
        {sections.length === 0 ? (
          <p className="py-10 text-center text-sm text-muted-foreground">Sin resultados para "{query}".</p>
        ) : (
          <Accordion type="multiple" value={open} onValueChange={setOpen} className="px-4">
            {sections.map((s) => (
              <AccordionItem key={s.id} value={s.id}>
                <AccordionTrigger>{s.title}</AccordionTrigger>
                <AccordionContent>{s.body}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        )}
      </KronosCard>
    </KronosLayout>
  );
};

export default HelpPage;
