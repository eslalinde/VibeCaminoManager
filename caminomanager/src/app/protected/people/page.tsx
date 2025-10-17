'use client';

import { useState } from 'react';
import { EntityPage } from '@/components/crud';
import { MarriageModal } from '@/components/crud/MarriageModal';
import { personConfig } from '@/config/entities';
import { Button } from '@/components/ui/button';

export default function PeoplePage() {
  const [marriageModalOpen, setMarriageModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleMarriageSuccess = () => {
    // Trigger a refresh of the people list
    setRefreshTrigger(prev => prev + 1);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-4 flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestión de Personas</h1>
        <Button 
          onClick={() => setMarriageModalOpen(true)}
          className="bg-green-600 hover:bg-green-700"
        >
          Crear Matrimonio
        </Button>
      </div>
      
      <EntityPage 
        key={refreshTrigger} // This will force a re-render when refreshTrigger changes
        config={personConfig} 
        pageSize={10} 
      />
      
      <MarriageModal
        open={marriageModalOpen}
        onClose={() => setMarriageModalOpen(false)}
        onSuccess={handleMarriageSuccess}
      />
    </div>
  );
}
