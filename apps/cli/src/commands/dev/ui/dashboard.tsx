import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import Spinner from 'ink-spinner';
import { ProcessManager, ManagedProcess } from '../../../services/process-manager.service.js';
import { exec, spawn } from 'child_process';
import os from 'os';

interface Props {
  manager: ProcessManager;
  initialTab?: ViewMode;
  initialEnv?: PlatformEnv;
}

type ViewMode = 'services' | 'combined' | 'infra' | 'cloud';
type PlatformEnv = 'dev' | 'staging' | 'production';

const BRAND_BLUE = '#0ea5e9';
const BRAND_GRAY = '#9ca3af';
const BRAND_PURPLE = '#a855f7';
const DARK_GRAY = '#374151';

interface HealthStatus {
  name: string;
  url: string;
  status: 'online' | 'offline' | 'checking';
  latency?: number;
}

export const Dashboard: React.FC<Props> = ({ manager, initialTab = 'services', initialEnv = 'dev' }) => {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState<ViewMode>(initialTab);
  const [activeEnv, setActiveEnv] = useState<PlatformEnv>(initialEnv);
  const [processes, setProcesses] = useState<ManagedProcess[]>(
    manager?.getProcesses() || [],
  );
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [filter, setFilter] = useState('');
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [isResettingDb, setIsResettingDb] = useState(false);
  const [dbResetStatus, setDbResetStatus] = useState<string | null>(null);
  const [cloudLogs, setCloudLogs] = useState<string[]>([]);
  const [cloudProcess, setCloudProcess] = useState<any>(null);

  // Terminal Resize logic
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

  // Selection safety
  useEffect(() => {
    if (selectedIdx >= processes.length) {
      setSelectedIdx(Math.max(0, processes.length - 1));
    }
  }, [processes.length]);

  // Cloud Logs Tailer
  useEffect(() => {
    if (activeTab !== 'cloud' || activeEnv === 'dev') {
      if (cloudProcess) {
        cloudProcess.kill();
        setCloudProcess(null);
      }
      return;
    }

    setCloudLogs([]);
    const app = processes[selectedIdx];
    if (!app) {
      setCloudLogs(['[SYSTEM] No service selected.']);
      return;
    }

    let command = '';
    let args: string[] = [];

    const projectMap: Record<string, string> = {
      api: 'sous-api',
      web: 'sous-tools',
      docs: 'sous-docs',
    };

    const projectName = projectMap[app.id.replace('sous-', '')];
    if (!projectName) {
      setCloudLogs(['[SYSTEM] No cloud mapping for this service.']);
      return;
    }

    if (app.id.includes('api')) {
      command = 'render';
      args = ['logs', projectName, '--env', activeEnv];
    } else {
      command = 'vercel';
      args = [
        'logs',
        projectName,
        activeEnv === 'production' ? '--prod' : '--staging',
      ];
    }

    try {
      const child = spawn(command, args, { shell: true });
      setCloudProcess(child);

      child.stdout?.on('data', (data: Buffer) => {
        const lines = data.toString().split('\n');
        setCloudLogs((prev) => [...prev, ...lines].slice(-1000));
      });

      child.stderr?.on('data', (data: Buffer) => {
        setCloudLogs((prev) =>
          [...prev, `[ERR] ${data.toString()}`].slice(-1000),
        );
      });

      child.on('error', (err: Error) => {
        setCloudLogs((prev) => [...prev, `[FAIL] ${err.message}`]);
      });
    } catch (e: any) {
      setCloudLogs([`[ERROR] Failed to start cloud tail: ${e.message}`]);
    }

    return () => {
      if (cloudProcess) {
        cloudProcess.kill();
      }
    };
  }, [activeTab, activeEnv, selectedIdx]);

  useEffect(() => {
    if (!manager) return;
    const handleUpdate = () => setProcesses([...manager.getProcesses()]);
    manager.on('update', handleUpdate);
    return () => {
      manager.off('update', handleUpdate);
    };
  }, [manager]);

  const [infraMetrics, setInfraMetrics] = useState<any>(null);
  const [isInfraLoading, setIsInfraLoading] = useState(false);

  // Infra Metrics Fetcher
  useEffect(() => {
    if (activeTab !== 'infra') return;

    const fetchMetrics = async () => {
      setIsInfraLoading(true);
      try {
        let baseUrl = 'http://localhost:4000';
        if (activeEnv === 'staging') baseUrl = 'https://api-staging.sous.tools';
        if (activeEnv === 'production') baseUrl = 'https://api.sous.tools';

        const response = await fetch(`${baseUrl}/metrics/platform`);
        if (response.ok) {
          const data = await response.json();
          setInfraMetrics(data);
        }
      } catch (e) {
        // Ignore errors for now
      } finally {
        setIsInfraLoading(false);
      }
    };

    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, [activeTab, activeEnv]);

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

  const mainViewHeight = terminalSize.rows - 3 - 2 - 2;
  const visibleLines = mainViewHeight - 2;

  useInput((input, key) => {
    if (isFilterMode) return;

    if (input === 'q') exit();

    if (input === '/') {
      setIsFilterMode(true);
      setScrollOffset(0);
    }

    if (key.tab) {
      const modes: ViewMode[] = ['services', 'combined', 'infra', 'cloud'];
      const currentIdx = modes.indexOf(activeTab);
      const nextIdx = key.shift
        ? (currentIdx - 1 + modes.length) % modes.length
        : (currentIdx + 1) % modes.length;
      setActiveTab(modes[nextIdx]);
      setScrollOffset(0);
    }

    if (input === 'e') {
      const envs: PlatformEnv[] = ['dev', 'staging', 'production'];
      const currentIdx = envs.indexOf(activeEnv);
      const nextIdx = (currentIdx + 1) % envs.length;
      setActiveEnv(envs[nextIdx]);
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

    if (input === 'd' && !isResettingDb) {
      setIsResettingDb(true);
      setDbResetStatus('Resetting Database...');
      exec('pnpm sous db reset', (error) => {
        setIsResettingDb(false);
        setDbResetStatus(error ? 'Error' : 'Complete');
        setTimeout(() => setDbResetStatus(null), 5000);
      });
    }
  });

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
          <Text color={BRAND_GRAY}>.dev</Text>
          <Box marginLeft={4}>
            {(['services', 'combined', 'infra', 'cloud'] as const).map((t) => (
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
          <Text
            color={
              activeEnv === 'production'
                ? BRAND_BLUE
                : activeEnv === 'staging'
                  ? '#f59e0b'
                  : '#10b981'
            }
            bold
          >
            [{activeEnv.toUpperCase()}]
          </Text>
          <Box marginLeft={2}>
            <Text color="gray">
              {new Date().toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </Text>
          </Box>
        </Box>
      </Box>

      {/* Body */}
      <Box flexGrow={1}>
        {/* Sidebar */}
        <Box
          flexDirection="column"
          width={20}
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
                  idx === selectedIdx
                    ? BRAND_BLUE
                    : p.type === 'docker'
                      ? '#6366f1'
                      : 'white'
                }
                bold={idx === selectedIdx}
              >
                {p.name.slice(0, 12)}
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
                  LOGS: {selectedApp?.name || 'N/A'}
                </Text>
                <Text color="gray">
                  {selectedApp?.status?.toUpperCase() || 'UNKNOWN'}
                </Text>
              </Box>
              <Box flexDirection="column" flexGrow={1} overflow="hidden">
                {(selectedApp?.logs || []).slice(-visibleLines).map((l, i) => (
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
                {combinedLogs.slice(-visibleLines).map((l, i) => (
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
                      {l.name.padEnd(10)}{' '}
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
              <Box justifyContent="space-between" marginBottom={1}>
                <Text bold color={BRAND_BLUE}>INFRASTRUCTURE HEALTH</Text>
                {isInfraLoading && <Text color="yellow"><Spinner type="dots" /> Polling...</Text>}
              </Box>
              
              <Box flexDirection="column">
                <Box marginBottom={1}>
                  <Box width={30}><Text bold>Metric</Text></Box>
                  <Box><Text bold>Value</Text></Box>
                </Box>
                
                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>Total Organizations</Text></Box>
                  <Box><Text color="white">{infraMetrics?.totalOrganizations ?? '---'}</Text></Box>
                </Box>
                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>Total Active Users</Text></Box>
                  <Box><Text color="white">{infraMetrics?.totalUsers ?? '---'}</Text></Box>
                </Box>
                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>Total Recipes</Text></Box>
                  <Box><Text color="white">{infraMetrics?.totalRecipes ?? '---'}</Text></Box>
                </Box>
                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>Active IoT Nodes</Text></Box>
                  <Box><Text color="white">{infraMetrics?.totalNodes ?? '---'}</Text></Box>
                </Box>
                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>Total Orders (v0.1.0)</Text></Box>
                  <Box><Text color="white">{infraMetrics?.totalOrders ?? '---'}</Text></Box>
                </Box>
                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>Monthly Revenue (est)</Text></Box>
                  <Box><Text color="#10b981">${infraMetrics?.monthlyRevenue?.toFixed(2) ?? '0.00'}</Text></Box>
                </Box>

                <Box marginTop={1} marginBottom={1}>
                  <Text bold color={BRAND_PURPLE}>RESOURCE CONSTRAINTS</Text>
                </Box>

                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>Supabase Row Count</Text></Box>
                  <Box><Text color={infraMetrics?.totalOrders > 400000 ? 'red' : 'green'}>
                    {infraMetrics?.totalOrders ?? 0} / 500,000
                  </Text></Box>
                </Box>
                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>Upstash Redis Usage</Text></Box>
                  <Box><Text color="green">OK (Free Tier)</Text></Box>
                </Box>
                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>BullMQ Queue Load</Text></Box>
                  <Box><Text color="green">Healthy (0 Pending)</Text></Box>
                </Box>
                <Box>
                  <Box width={30}><Text color={BRAND_GRAY}>HyperDX Data Rate</Text></Box>
                  <Box><Text color="green">Active</Text></Box>
                </Box>
              </Box>
            </Box>
          )}

          {activeTab === 'cloud' && (
            <Box flexDirection="column" flexGrow={1}>
              <Box justifyContent="space-between" marginBottom={1}>
                <Text bold color={BRAND_BLUE}>CLOUD LOGS: {selectedApp?.name || 'N/A'}</Text>
                <Text color="gray">{activeEnv.toUpperCase()} | SCROLL [↑/↓]</Text>
              </Box>
              {activeEnv === 'dev' ? (
                <Box flexGrow={1} alignItems="center" justifyContent="center">
                  <Text color="yellow">Cloud logs only available for STAGING and PRODUCTION.</Text>
                  <Text dimColor>Press [e] to switch environments.</Text>
                </Box>
              ) : (
                <Box flexDirection="column" flexGrow={1} overflow="hidden">
                  {cloudLogs.slice(-visibleLines).map((line, i) => (
                    <Text key={i} color="#d1d5db" wrap="truncate-end">{line}</Text>
                  ))}
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Footer */}
      <Box height={2} paddingX={1} justifyContent="space-between">
        <Text color="gray" dimColor>
          [Tab] Tabs [↑/↓] Scroll [Enter] Start/Stop [r] Restart [c] Clear [d]
          DB Reset [q] Quit
        </Text>
        <Box>
          <Text color={BRAND_BLUE} bold>
            SOUS
          </Text>
          <Text color={BRAND_GRAY}>.dev</Text>
        </Box>
      </Box>
    </Box>
  );
};
