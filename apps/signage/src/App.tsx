import { useState, useEffect } from 'react';
import { PairingView } from './components/PairingView';
import { ActiveView } from './components/ActiveView';
import { io } from 'socket.io-client';
import { localConfig } from '@sous/config';
import { logger } from '@sous/logger';

type State = 'idle' | 'pairing' | 'active';

function App() {
  const [state, setState] = useState<State>('idle');
  const [pairingCode, setPairingCode] = useState('');
  const [hardwareId, setHardwareId] = useState<string | null>(null);
  const [assignment, setAssignment] = useState<any>(null);

  useEffect(() => {
    // 1. Initialize Hardware ID
    let hid = localStorage.getItem('sous_hardware_id');
    if (!hid) {
      hid = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      localStorage.setItem('sous_hardware_id', hid);
    }
    setHardwareId(hid);

    // 2. Initialize Socket.io
    const apiUrl = localConfig.api.url || 'http://localhost:4000';
    const s = io(apiUrl, {
      auth: { hardwareId: hid },
    });

    s.on('connect', () => {
      logger.info('Connected to Realtime Gateway');
    });

    s.on('presentation:update', (data) => {
      logger.info('Received presentation update', data);
      setAssignment(data);
      setState('active');
    });

    s.on('pairing:success', (data) => {
      logger.info('Pairing successful', data);
      localStorage.setItem('sous_org_id', data.organizationId);
      localStorage.setItem('sous_location_id', data.locationId);
      setState('active');
      // The gateway will automatically push the assignment on re-connection 
      // or we can just wait for it to be pushed.
    });

    return () => {
      s.disconnect();
    };
  }, []);

  useEffect(() => {
    if (!hardwareId || state !== 'idle') return;

    // Check if already paired
    const checkPairing = async () => {
      try {
        const apiUrl = localConfig.api.url || 'http://localhost:4000';
        const res = await fetch(`${apiUrl}/hardware/pairing-code`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hardwareId, type: 'signage' }),
        });
        
        if (res.ok) {
          const data = await res.json();
          setPairingCode(data.code);
          setState('pairing');
        }
      } catch (e) {
        logger.error('Failed to fetch pairing code', e as any);
      }
    };

    checkPairing();
  }, [hardwareId, state]);

  if (state === 'pairing') return <PairingView code={pairingCode} />;
  if (state === 'active') return <ActiveView assignment={assignment} />;

  return (
    <div className="flex items-center justify-center min-h-screen bg-black">
      <p className="text-white">Initializing...</p>
    </div>
  );
}

export default App;