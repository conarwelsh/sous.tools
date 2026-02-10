import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { ProcessManager, ManagedProcess } from '../process-manager.service.js';
import { exec } from 'child_process';
import os from 'os';

interface Props {
  manager: ProcessManager;
}

type ViewMode = 'services' | 'combined' | 'infra';

const BRAND_BLUE = '#0ea5e9';
const BRAND_GRAY = '#9ca3af';
const DARK_GRAY = '#374151';

interface HealthStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  latency?: number;
}

export const Dashboard: React.FC<Props> = ({ manager }) => {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState<ViewMode>('services');
  const [processes, setProcesses] = useState<ManagedProcess[]>(
    manager?.getProcesses() || [],
  );
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filter, setFilter] = useState('');
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isResettingDb, setIsResettingDb] = useState(false);
  const [dbResetStatus, setDbResetStatus] = useState<string | null>(null);

  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0,
    mem: 0,
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    load: os.loadavg(),
    uptime: os.uptime(),
  });

  const [healthChecks, setHealthChecks] = useState<HealthStatus[]>([
    { name: 'API (Prod)', url: 'https://api.sous.tools/health', status: 'checking' },
    { name: 'Web (Prod)', url: 'https://sous.tools/health', status: 'checking' },
    { name: 'Docs (Prod)', url: 'https://docs.sous.tools', status: 'checking' },
    { name: 'API (Staging)', url: 'https://staging-api.sous.tools/health', status: 'checking' },
    { name: 'Web (Staging)', url: 'https://staging.sous.tools', status: 'checking' },
  ]);

  const [terminalSize, setTerminalSize] = useState({
    columns: process.stdout.columns || 80,
    rows: process.stdout.rows || 24,
  });

  useEffect(() => {
    const onResize = () =>
      setTerminalSize({
        columns: process.stdout.columns,
        rows: process.stdout.rows,
      });
    process.stdout.on('resize', onResize);
    return () => {
      process.stdout.off('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!manager) return;
    const handleUpdate = () => setProcesses([...manager.getProcesses()]);
    manager.on('update', handleUpdate);
    return () => {
      manager.off('update', handleUpdate);
    };
  }, [manager]);

  // Metrics update loop
  useEffect(() => {
    if (activeTab !== 'infra') return;

    const interval = setInterval(() => {
      setSystemMetrics({
        cpu: os.loadavg()[0],
        mem: os.totalmem() - os.freemem(),
        totalMem: os.totalmem(),
        freeMem: os.freemem(),
        load: os.loadavg(),
        uptime: os.uptime(),
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [activeTab]);

  // Health check loop
  useEffect(() => {
    if (activeTab !== 'infra') return;

    const runChecks = async () => {
      const updated = await Promise.all(
        healthChecks.map(async (check) => {
          const start = Date.now();
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 5000);
            const resp = await fetch(check.url, { signal: controller.signal });
            clearTimeout(timeoutId);
            return {
              ...check,
              status: resp.ok ? 'online' : 'offline',
              latency: Date.now() - start,
            } as HealthStatus;
          } catch (e) {
            return { ...check, status: 'offline', latency: undefined } as HealthStatus;
          }
        }),
      );
      setHealthChecks(updated);
    };

    void runChecks();
    const interval = setInterval(() => void runChecks(), 30000);
    return () => clearInterval(interval);
  }, [activeTab]);

  const selectedApp = processes[selectedIdx];
  const allCombinedLogs = manager.getCombinedLogs();
  const combinedLogs = useMemo(
    () =>
      filter
        ? allCombinedLogs.filter(
            (l) =>
              l.message.toLowerCase().includes(filter.toLowerCase()) ||
              l.name.toLowerCase().includes(filter.toLowerCase()),
          )
        : allCombinedLogs,
    [allCombinedLogs, filter],
  );

  // Adjusted heights after removing footer
  const mainViewHeight = terminalSize.rows - 3 - 2 - 2; 
  const visibleLines = mainViewHeight - 2;

  useInput((input, key) => {
    // Scroll handling
    if (input.startsWith('\x1b[<64')) {
      setScrollOffset((prev) => prev + 3);
      return;
    }
    if (input.startsWith('\x1b[<65')) {
      setScrollOffset((prev) => Math.max(0, prev - 3));
      return;
    }

    if (isFilterMode) return;

    if (input === 'q') exit();
    
    if (input === '/') {
      setIsFilterMode(true);
      setScrollOffset(0);
    }

    if (key.tab) {
      const modes: ViewMode[] = ['services', 'combined', 'infra'];
      const currentIdx = modes.indexOf(activeTab);
      const nextIdx = key.shift
        ? (currentIdx - 1 + modes.length) % modes.length
        : (currentIdx + 1) % modes.length;
      setActiveTab(modes[nextIdx]);
      setScrollOffset(0);
    }

    if (key.upArrow) {
      if (activeTab === 'services')
        setSelectedIdx(Math.max(0, selectedIdx - 1));
      else {
        const currentLogs = activeTab === 'combined' ? combinedLogs : [];
        const maxScroll = Math.max(0, currentLogs.length - visibleLines);
        setScrollOffset((prev) => Math.min(maxScroll, prev + 1));
      }
    }
    if (key.downArrow) {
      if (activeTab === 'services')
        setSelectedIdx(Math.min(processes.length - 1, selectedIdx + 1));
      else setScrollOffset((prev) => Math.max(0, prev - 1));
    }

    if (key.return && activeTab === 'services') {
      const selected = processes[selectedIdx];
      if (selected.status === 'stopped' || selected.status === 'error')
        manager.startProcess(selected.id);
      else manager.stopProcess(selected.id);
    }

    if (input === 'r' && activeTab === 'services')
      manager.restartProcess(processes[selectedIdx].id);

    if (input === 'c') {
      if (activeTab === 'services')
        manager.clearLogs(processes[selectedIdx].id);
      if (activeTab === 'combined') manager.clearLogs('combined');
      setScrollOffset(0);
    }

    // Shortcut: [d] -> DB Reset
    if (input === 'd' && !isResettingDb) {
      setIsResettingDb(true);
      setDbResetStatus('Resetting Database...');
      exec('pnpm sous db reset', (error, stdout, stderr) => {
        setIsResettingDb(false);
        if (error) {
          setDbResetStatus(`Error: ${error.message.slice(0, 40)}`);
        } else {
          setDbResetStatus('Database Reset Complete');
        }
        setTimeout(() => setDbResetStatus(null), 5000);
      });
    }
  });

  useEffect(() => {
    const currentLogs = activeTab === 'combined' ? combinedLogs : (selectedApp?.logs || []);
    const maxScroll = Math.max(0, currentLogs.length - visibleLines);
    if (scrollOffset > maxScroll) {
      setScrollOffset(maxScroll);
    }
  }, [
    selectedApp?.logs.length,
    combinedLogs.length,
    activeTab,
    visibleLines,
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running':
        return <Text color="#10b981">●</Text>;
      case 'starting':
        return (
          <Text color="#f59e0b">
            <Spinner type="dots" />
          </Text>
        );
      case 'error':
        return <Text color="#ef4444">●</Text>;
      default:
        return <Text color="#6b7280">○</Text>;
    }
  };

  const formatMem = (bytes: number) =>
    `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;

  return (
    <Box
      flexDirection="column"
      width={terminalSize.columns}
      height={terminalSize.rows}
      paddingX={1}
    >
      {/* Header */}
      <Box height={3} alignItems="center" justifyContent="space-between">
        <Box alignItems="center">
          <Text bold color={BRAND_BLUE}>
            SOUS
          </Text>
          <Text color={BRAND_GRAY}>.tools</Text>
          <Box marginLeft={4}>
            {(['services', 'combined', 'infra'] as const).map((t) => (
              <Box key={t} marginLeft={2}>
                <Text
                  bold={activeTab === t}
                  color={activeTab === t ? BRAND_BLUE : BRAND_GRAY}
                >
                  {t.toUpperCase()}
                </Text>
              </Box>
            ))}
          </Box>
        </Box>
        <Box alignItems="center">
          {dbResetStatus && (
            <Box marginRight={2}>
              <Text color={dbResetStatus.includes('Error') ? '#ef4444' : '#10b981'}>
                {isResettingDb && <Spinner type="dots" />} {dbResetStatus}
              </Text>
            </Box>
          )}
          <Text color="gray">
            {new Date().toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </Text>
        </Box>
      </Box>

      {/* Body */}
      <Box flexGrow={1}>
        {/* Sidebar */}
        <Box
          flexDirection="column"
          width={18}
          borderStyle="round"
          borderColor={DARK_GRAY}
          paddingX={1}
        >
          <Box marginBottom={1}>
            <Text bold color={BRAND_GRAY}>
              STATUS
            </Text>
          </Box>
          {processes.map((p, idx) => (
            <Box key={p.id} justifyContent="space-between">
              <Text
                color={
                  activeTab === 'services' && idx === selectedIdx
                    ? BRAND_BLUE
                    : p.type === 'docker'
                      ? '#6366f1'
                      : 'white'
                }
                bold={activeTab === 'services' && idx === selectedIdx}
              >
                {p.name.slice(0, 10)}
              </Text>
              {getStatusIcon(p.status)}
            </Box>
          ))}
        </Box>

        {/* Main Content Area */}
        <Box
          flexDirection="column"
          flexGrow={1}
          marginLeft={1}
          borderStyle="round"
          borderColor={DARK_GRAY}
          paddingX={1}
        >
          {activeTab === 'services' && (
            <Box flexDirection="column" flexGrow={1}>
              <Box justifyContent="space-between" marginBottom={1}>
                <Text bold color={BRAND_BLUE}>
                  LOGS: {selectedApp?.name.toUpperCase()}
                </Text>
                <Text color="gray">{selectedApp?.status.toUpperCase()}</Text>
              </Box>
              <Box flexDirection="column" flexGrow={1} overflow="hidden">
                {(selectedApp?.logs || [])
                  .slice(
                    Math.max(
                      0,
                      (selectedApp?.logs.length || 0) -
                        visibleLines -
                        scrollOffset,
                    ),
                    Math.max(0, (selectedApp?.logs.length || 0) - scrollOffset),
                  )
                  .map((l, i) => (
                    <Text key={i} wrap="truncate-end" color="#d1d5db">
                      {l.message}
                    </Text>
                  ))}
              </Box>
            </Box>
          )}

          {activeTab === 'combined' && (
            <Box flexDirection="column" flexGrow={1}>
              <Box justifyContent="space-between" marginBottom={1}>
                <Text bold color={BRAND_BLUE}>
                  COMBINED STREAM
                </Text>
                {isFilterMode ? (
                  <Box>
                    <Text color={BRAND_BLUE}>/</Text>
                    <TextInput
                      value={filter}
                      onChange={setFilter}
                      onSubmit={() => setIsFilterMode(false)}
                    />
                  </Box>
                ) : (
                  <Text color="gray" dimColor>
                    {filter ? `Filter: ${filter}` : 'Press [/] to filter'}
                  </Text>
                )}
              </Box>
              <Box flexDirection="column" flexGrow={1} overflow="hidden">
                {combinedLogs
                  .slice(
                    Math.max(
                      0,
                      combinedLogs.length - visibleLines - scrollOffset,
                    ),
                    Math.max(0, combinedLogs.length - scrollOffset),
                  )
                  .map((l, i) => (
                    <Box key={i}>
                      <Text color="gray" dimColor>
                        [
                        {l.timestamp.toLocaleTimeString([], {
                          hour12: false,
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                        ]{' '}
                      </Text>
                      <Text color={BRAND_BLUE} bold>
                        {l.name.padEnd(8)}{' '}
                      </Text>
                      <Text color={l.level === 'error' ? '#ef4444' : '#d1d5db'}>
                        {l.message}
                      </Text>
                    </Box>
                  ))}
              </Box>
            </Box>
          )}

          {activeTab === 'infra' && (
            <Box flexDirection="column" flexGrow={1}>
              <Box marginBottom={1}>
                <Text bold color={BRAND_BLUE}>
                  INFRASTRUCTURE DASHBOARD
                </Text>
              </Box>
              
              <Box flexDirection="row">
                {/* Local Metrics */}
                <Box
                  flexDirection="column"
                  flexGrow={1}
                  borderStyle="single"
                  borderColor="gray"
                  paddingX={2}
                  paddingY={1}
                  marginRight={1}
                >
                  <Box justifyContent="space-between" marginBottom={1}>
                    <Text bold>Local System</Text>
                    <Box>
                      <Text color="#10b981">Live </Text>
                      <Spinner type="dots" />
                    </Box>
                  </Box>
                  <Box flexDirection="column">
                    <Box justifyContent="space-between">
                      <Text>CPU Load (1m)</Text>
                      <Text color={systemMetrics.cpu > 2 ? 'yellow' : 'white'}>
                        {systemMetrics.cpu.toFixed(2)}
                      </Text>
                    </Box>
                    <Box justifyContent="space-between">
                      <Text>Memory Usage</Text>
                      <Text>
                        {formatMem(systemMetrics.mem)} / {formatMem(systemMetrics.totalMem)}
                      </Text>
                    </Box>
                    <Box justifyContent="space-between">
                      <Text>Uptime</Text>
                      <Text>{(systemMetrics.uptime / 3600).toFixed(1)}h</Text>
                    </Box>
                  </Box>
                </Box>

                {/* Cloud Health */}
                <Box
                  flexDirection="column"
                  flexGrow={1}
                  borderStyle="single"
                  borderColor="gray"
                  paddingX={2}
                  paddingY={1}
                >
                  <Box marginBottom={1}>
                    <Text bold>Cloud Environments</Text>
                  </Box>
                  {healthChecks.map((check) => (
                    <Box key={check.name} justifyContent="space-between">
                      <Text color={BRAND_GRAY}>{check.name}</Text>
                      <Box>
                        {check.latency && <Text color="gray" dimColor>{check.latency}ms </Text>}
                        {check.status === 'online' ? (
                          <Text color="#10b981">●</Text>
                        ) : check.status === 'offline' ? (
                          <Text color="#ef4444">●</Text>
                        ) : (
                          <Spinner type="dots" />
                        )}
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>

              <Box marginTop={1} flexDirection="column" borderStyle="single" borderColor={DARK_GRAY} paddingX={2}>
                 <Text bold color={BRAND_BLUE}>Operations Info</Text>
                 <Text color="gray" dimColor>Deployment targets are managed via Render and Vercel.</Text>
                 <Text color="gray" dimColor>Database: Neon (Postgres) + Upstash (Redis).</Text>
              </Box>
            </Box>
          )}
        </Box>
      </Box>

      {/* Shortcuts Help Area (New simplified footer) */}
      <Box height={2} paddingX={1} justifyContent="space-between">
        <Text color="gray" dimColor>
          [Tab] Switch Tab [↑/↓] Select/Scroll [Enter] Toggle Process [r] Restart [c] Clear [d] DB Reset [q] Quit
        </Text>
        <Text color={BRAND_BLUE} bold>SOUS DEV TOOLS</Text>
      </Box>
    </Box>
  );
};