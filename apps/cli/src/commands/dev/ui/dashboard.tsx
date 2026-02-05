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

type ViewMode = 'services' | 'combined' | 'infra' | 'rpi' | 'terminal' | 'gemini';

const BRAND_BLUE = '#0ea5e9'; 
const BRAND_GRAY = '#9ca3af';
const BRAND_PURPLE = '#a855f7';
const DARK_GRAY = '#374151';

export const Dashboard: React.FC<Props> = ({ manager }) => {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState<ViewMode>('services');
  const [processes, setProcesses] = useState<ManagedProcess[]>(manager?.getProcesses() || []);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [command, setCommand] = useState('');
  const [geminiCommand, setGeminiCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [geminiOutput, setGeminiOutput] = useState<string[]>([]);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [isGeminiMode, setIsGeminiMode] = useState(false);
  const [filter, setFilter] = useState('');
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [systemMetrics, setSystemMetrics] = useState({
    cpu: 0,
    mem: 0,
    totalMem: os.totalmem(),
    freeMem: os.freemem(),
    load: os.loadavg(),
    uptime: os.uptime(),
  });
  const [terminalSize, setTerminalSize] = useState({ 
    columns: process.stdout.columns || 80, 
    rows: process.stdout.rows || 24 
  });

  useEffect(() => {
    const onResize = () => setTerminalSize({ columns: process.stdout.columns, rows: process.stdout.rows });
    process.stdout.on('resize', onResize);
    return () => { process.stdout.off('resize', onResize); };
  }, []);

  useEffect(() => {
    if (!manager) return;
    const handleUpdate = () => setProcesses([...manager.getProcesses()]);
    manager.on('update', handleUpdate);
    return () => { manager.off('update', handleUpdate); };
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

  const selectedApp = processes[selectedIdx];
  const allCombinedLogs = manager.getCombinedLogs();
  const combinedLogs = useMemo(() => filter 
    ? allCombinedLogs.filter(l => l.message.toLowerCase().includes(filter.toLowerCase()) || l.name.toLowerCase().includes(filter.toLowerCase()))
    : allCombinedLogs, [allCombinedLogs, filter]);

  const mainViewHeight = terminalSize.rows - 3 - 6 - 2;
  const visibleLines = mainViewHeight - 2;

  useInput((input, key) => {
    if (input.startsWith('\x1b[<64')) { setScrollOffset(prev => prev + 3); return; }
    if (input.startsWith('\x1b[<65')) { setScrollOffset(prev => Math.max(0, prev - 3)); return; }

    if (isCommandMode || isFilterMode || isGeminiMode) return;

    if (input === 'q') exit();
    if (input === ':') { setIsCommandMode(true); setScrollOffset(0); }
    if (input === ';') { setIsGeminiMode(true); setScrollOffset(0); }
    if (input === '/') { setIsFilterMode(true); setScrollOffset(0); }

    if (key.tab) {
        const modes: ViewMode[] = ['services', 'combined', 'infra', 'rpi', 'terminal', 'gemini'];
        const currentIdx = modes.indexOf(activeTab);
        const nextIdx = key.shift ? (currentIdx - 1 + modes.length) % modes.length : (currentIdx + 1) % modes.length;
        setActiveTab(modes[nextIdx]);
        setScrollOffset(0);
    }

    if (key.upArrow) {
        if (activeTab === 'services') setSelectedIdx(Math.max(0, selectedIdx - 1));
        else {
            const outputs: Record<string, any[]> = { combined: combinedLogs, terminal: terminalOutput, gemini: geminiOutput };
            const currentLogs = outputs[activeTab] || [];
            const maxScroll = Math.max(0, currentLogs.length - visibleLines);
            setScrollOffset(prev => Math.min(maxScroll, prev + 1));
        }
    }
    if (key.downArrow) {
        if (activeTab === 'services') setSelectedIdx(Math.min(processes.length - 1, selectedIdx + 1));
        else setScrollOffset(prev => Math.max(0, prev - 1));
    }

    if (key.return && activeTab === 'services') {
        const selected = processes[selectedIdx];
        if (selected.status === 'stopped' || selected.status === 'error') manager.startProcess(selected.id);
        else manager.stopProcess(selected.id);
    }

    if (input === 'r' && activeTab === 'services') manager.restartProcess(processes[selectedIdx].id);

    if (input === 'c') {
        if (activeTab === 'services') manager.clearLogs(processes[selectedIdx].id);
        if (activeTab === 'combined') manager.clearLogs('combined');
        if (activeTab === 'terminal') setTerminalOutput([]);
        if (activeTab === 'gemini') setGeminiOutput([]);
        setScrollOffset(0);
    }
  });

  useEffect(() => {
    const outputs: Record<string, any[]> = { 
        services: selectedApp?.logs || [], 
        combined: combinedLogs, 
        terminal: terminalOutput,
        gemini: geminiOutput
    };
    const currentLogs = outputs[activeTab] || [];
    const maxScroll = Math.max(0, currentLogs.length - visibleLines);
    if (scrollOffset > maxScroll) {
        setScrollOffset(maxScroll);
    }
  }, [selectedApp?.logs.length, combinedLogs.length, terminalOutput.length, geminiOutput.length, activeTab, visibleLines]);

  const handleCommandSubmit = (value: string) => {
    if (value === 'exit' || value === 'q' || value === '') { setIsCommandMode(false); setCommand(''); return; }
    setTerminalOutput(prev => [...prev, `> ${value}`]);
    setActiveTab('terminal');
    setScrollOffset(0);
    exec(value, (error, stdout, stderr) => {
        if (stdout) setTerminalOutput(prev => [...prev, ...stdout.trim().split('\n')]);
        if (stderr) setTerminalOutput(prev => [...prev, ...stderr.trim().split('\n').map(l => `ERR: ${l}`)]);
        if (error) setTerminalOutput(prev => [...prev, `FAIL: ${error.message}`]);
        setCommand('');
        setIsCommandMode(false);
    });
  };

  const handleGeminiSubmit = (value: string) => {
    if (value === 'exit' || value === 'q' || value === '') { setIsGeminiMode(false); setGeminiCommand(''); return; }
    setGeminiOutput(prev => [...prev, `👨‍🍳 Gemini > ${value}`]);
    setActiveTab('gemini');
    setScrollOffset(0);
    exec(`gemini "${value}"`, (error, stdout, stderr) => {
        if (stdout) setGeminiOutput(prev => [...prev, ...stdout.trim().split('\n')]);
        if (stderr) setGeminiOutput(prev => [...prev, ...stderr.trim().split('\n').map(l => `[ERR] ${l}`)]);
        if (error) setGeminiOutput(prev => [...prev, `[FAIL] ${error.message}`]);
        setGeminiCommand('');
        setIsGeminiMode(false);
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Text color="#10b981">●</Text>;
      case 'starting': return <Text color="#f59e0b">●</Text>;
      case 'error': return <Text color="#ef4444">●</Text>;
      default: return <Text color="#6b7280">○</Text>;
    }
  };

  const formatMem = (bytes: number) => `${(bytes / 1024 / 1024 / 1024).toFixed(2)} GB`;

  return (
    <Box flexDirection="column" width={terminalSize.columns} height={terminalSize.rows} paddingX={1}>
      {/* Header */}
      <Box height={3} alignItems="center" justifyContent="space-between">
        <Box alignItems="center">
            <Text bold color={BRAND_BLUE}>SOUS</Text>
            <Text color={BRAND_GRAY}>.tools</Text>
            <Box marginLeft={4}>
                {(['services', 'combined', 'infra', 'rpi', 'terminal', 'gemini'] as const).map((t) => (
                    <Box key={t} marginLeft={2}>
                        <Text bold={activeTab === t} color={activeTab === t ? (t === 'gemini' ? BRAND_PURPLE : BRAND_BLUE) : BRAND_GRAY}>
                            {t.replace('-', ' ').toUpperCase()}
                        </Text>
                    </Box>
                ))}
            </Box>
        </Box>
        <Text color="gray">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </Box>

      {/* Body */}
      <Box flexGrow={1}>
        <Box flexDirection="column" width={18} borderStyle="round" borderColor={DARK_GRAY} paddingX={1}>
            <Box marginBottom={1}><Text bold color={BRAND_GRAY}>STATUS</Text></Box>
            {processes.map((p, idx) => (
                <Box key={p.id} justifyContent="space-between">
                    <Text color={(activeTab === 'services' && idx === selectedIdx) ? BRAND_BLUE : (p.type === 'docker' ? '#6366f1' : 'white')} bold={activeTab === 'services' && idx === selectedIdx}>
                        {p.name.slice(0, 10)}
                    </Text>
                    {getStatusIcon(p.status)}
                </Box>
            ))}
        </Box>

        <Box flexDirection="column" flexGrow={1} marginLeft={1} borderStyle="round" borderColor={activeTab === 'services' && selectedApp?.status === 'error' ? BRAND_BLUE : (activeTab === 'gemini' ? BRAND_PURPLE : DARK_GRAY)} paddingX={1}>
            {activeTab === 'services' && (
                <Box flexDirection="column" flexGrow={1}>
                    <Box justifyContent="space-between" marginBottom={1}>
                        <Text bold color={BRAND_BLUE}>LOGS: {selectedApp?.name.toUpperCase()}</Text>
                        <Text color="gray">{selectedApp?.status.toUpperCase()}</Text>
                    </Box>
                    <Box flexDirection="column" flexGrow={1} overflow="hidden">
                        {(selectedApp?.logs || []).slice(
                            Math.max(0, (selectedApp?.logs.length || 0) - visibleLines - scrollOffset), 
                            Math.max(0, (selectedApp?.logs.length || 0) - scrollOffset)
                        ).map((l, i) => (
                            <Text key={i} wrap="truncate-end" color="#d1d5db">{l.message}</Text>
                        ))}
                    </Box>
                </Box>
            )}

            {activeTab === 'combined' && (
                <Box flexDirection="column" flexGrow={1}>
                    <Box justifyContent="space-between" marginBottom={1}>
                        <Text bold color={BRAND_BLUE}>COMBINED STREAM</Text>
                        {isFilterMode ? (
                            <Box><Text color={BRAND_BLUE}>/</Text><TextInput value={filter} onChange={setFilter} onSubmit={() => setIsFilterMode(false)} /></Box>
                        ) : (
                            <Text color="gray" dimColor>{filter ? `Filter: ${filter}` : 'Press [/] to filter'}</Text>
                        )}
                    </Box>
                    <Box flexDirection="column" flexGrow={1} overflow="hidden">
                        {combinedLogs.slice(
                            Math.max(0, combinedLogs.length - visibleLines - scrollOffset), 
                            Math.max(0, combinedLogs.length - scrollOffset)
                        ).map((l, i) => (
                            <Box key={i}>
                                <Text color="gray" dimColor>[{l.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] </Text>
                                <Text color={BRAND_BLUE} bold>{l.name.padEnd(8)} </Text>
                                <Text color={l.level === 'error' ? '#ef4444' : '#d1d5db'}>{l.message}</Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {activeTab === 'terminal' && (
                <Box flexDirection="column" flexGrow={1}>
                    <Box marginBottom={1}><Text bold color={BRAND_BLUE}>TERMINAL OUTPUT</Text></Box>
                    <Box flexDirection="column" flexGrow={1} overflow="hidden">
                        {terminalOutput.slice(
                            Math.max(0, terminalOutput.length - visibleLines - scrollOffset), 
                            Math.max(0, terminalOutput.length - scrollOffset)
                        ).map((line, i) => (
                            <Text key={i} color="#d1d5db">{line}</Text>
                        ))}
                    </Box>
                </Box>
            )}

            {activeTab === 'gemini' && (
                <Box flexDirection="column" flexGrow={1}>
                    <Box marginBottom={1}><Text bold color={BRAND_PURPLE}>GEMINI CLI</Text></Box>
                    <Box flexDirection="column" flexGrow={1} overflow="hidden">
                        {geminiOutput.slice(
                            Math.max(0, geminiOutput.length - visibleLines - scrollOffset), 
                            Math.max(0, geminiOutput.length - scrollOffset)
                        ).map((line, i) => (
                            <Text key={i} color={line.startsWith('👨‍🍳') ? BRAND_PURPLE : "#d1d5db"}>{line}</Text>
                        ))}
                    </Box>
                </Box>
            )}

            {activeTab === 'infra' && (
                <Box flexDirection="column" flexGrow={1}>
                    <Box marginBottom={1}><Text bold color={BRAND_BLUE}>INFRASTRUCTURE DASHBOARD</Text></Box>
                    <Box flexDirection="column" borderStyle="single" borderColor="gray" paddingX={2} paddingY={1}>
                        <Box justifyContent="space-between" marginBottom={1}>
                            <Text bold>System Health</Text>
                            <Box><Text color="#10b981">Live </Text><Spinner type="dots" /></Box>
                        </Box>
                        <Box flexDirection="column">
                            <Box justifyContent="space-between">
                                <Text>CPU Load (1m)</Text>
                                <Text color={systemMetrics.cpu > 2 ? 'yellow' : 'white'}>{systemMetrics.cpu.toFixed(2)}</Text>
                            </Box>
                            <Box justifyContent="space-between">
                                <Text>Memory Usage</Text>
                                <Text>{formatMem(systemMetrics.mem)} / {formatMem(systemMetrics.totalMem)}</Text>
                            </Box>
                            <Box justifyContent="space-between">
                                <Text>Uptime</Text>
                                <Text>{(systemMetrics.uptime / 3600).toFixed(1)} hours</Text>
                            </Box>
                        </Box>
                    </Box>
                    
                    <Box marginTop={1} flexDirection="column">
                        <Text bold>Free-Tier Watcher (Staging/Prod only)</Text>
                        <Box borderStyle="single" borderColor={DARK_GRAY} paddingX={2} paddingY={1}>
                            <Text color="gray">Metrics for staging/production will appear here</Text>
                        </Box>
                    </Box>
                </Box>
            )}

            {activeTab === 'rpi' && (
                <Box flexGrow={1} alignItems="center" justifyContent="center">
                    <Text color="gray">Remote Raspberry Pi: 192.168.1.10 (Online)</Text>
                </Box>
            )}
        </Box>
      </Box>

      {/* Footer */}
      <Box flexDirection="column" height={6}>
        <Box borderStyle="round" borderColor={isCommandMode ? BRAND_BLUE : (isGeminiMode ? BRAND_PURPLE : DARK_GRAY)} paddingX={1} flexGrow={1}>
            <Box justifyContent="space-between">
                <Text bold color={isCommandMode ? BRAND_BLUE : (isGeminiMode ? BRAND_PURPLE : BRAND_GRAY)}>
                    {isGeminiMode ? 'GEMINI' : 'COMMAND'}
                </Text>
                {(isCommandMode || isGeminiMode) && <Text color={isGeminiMode ? BRAND_PURPLE : BRAND_BLUE} italic>PROMPT ACTIVE</Text>}
            </Box>
            <Box flexDirection="column">
                <Box>
                    <Text color={isCommandMode ? BRAND_BLUE : (isGeminiMode ? BRAND_PURPLE : "gray")}>
                        {isGeminiMode ? '  👨‍🍳 > ' : '  $ '}
                    </Text>
                    {isCommandMode && <TextInput value={command} onChange={setCommand} onSubmit={handleCommandSubmit} />}
                    {isGeminiMode && <TextInput value={geminiCommand} onChange={setGeminiCommand} onSubmit={handleGeminiSubmit} />}
                    {!isCommandMode && !isGeminiMode && <Text color={DARK_GRAY}>...</Text>}
                </Box>
            </Box>
        </Box>
        <Box justifyContent="space-between" paddingX={1}>
            <Text color="gray" dimColor>[Tab] View  [↑/↓] Scroll  [Enter] Toggle  [r] Restart  [c] Clear  [/] Filter  [:] Cmd  [;] Gemini  [q] Quit</Text>
        </Box>
      </Box>
    </Box>
  );
};
