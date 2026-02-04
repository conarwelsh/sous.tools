import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { ProcessManager, ManagedProcess, ManagedLog } from '../process-manager.service.js';
import { exec } from 'child_process';

interface Props {
  manager: ProcessManager;
}

type ViewMode = 'services' | 'god-view' | 'infra' | 'rpi';

const BRAND_BLUE = '#0ea5e9'; 
const BRAND_GRAY = '#9ca3af';
const DARK_GRAY = '#374151';

export const Dashboard: React.FC<Props> = ({ manager }) => {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState<ViewMode>('services');
  const [processes, setProcesses] = useState<ManagedProcess[]>(manager?.getProcesses() || []);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>([]);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [filter, setFilter] = useState('');
  const [isFilterMode, setIsFilterMode] = useState(false);
  const [scrollOffset, setScrollOffset] = useState(0);
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

  useInput((input, key) => {
    // Basic mouse wheel parsing (SGR Mode)
    if (input.startsWith('\x1b[<64')) { setScrollOffset(prev => prev + 3); return; }
    if (input.startsWith('\x1b[<65')) { setScrollOffset(prev => Math.max(0, prev - 3)); return; }

    if (isCommandMode || isFilterMode) return;

    if (input === 'q') exit();
    if (input === ':') { setIsCommandMode(true); setScrollOffset(0); }
    if (input === '/') { setIsFilterMode(true); setScrollOffset(0); }

    if (key.tab) {
        const modes: ViewMode[] = ['services', 'god-view', 'infra', 'rpi'];
        const currentIdx = modes.indexOf(activeTab);
        const nextIdx = key.shift ? (currentIdx - 1 + modes.length) % modes.length : (currentIdx + 1) % modes.length;
        setActiveTab(modes[nextIdx]);
        setScrollOffset(0);
    }

    if (key.upArrow) {
        if (activeTab === 'services') setSelectedIdx(Math.max(0, selectedIdx - 1));
        else setScrollOffset(prev => prev + 1);
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
  });

  const handleCommandSubmit = (value: string) => {
    if (value === 'exit' || value === 'q' || value === '') { setIsCommandMode(false); setCommand(''); return; }
    setTerminalOutput(prev => [...prev.slice(-2), `> ${value}`]);
    exec(value, (error, stdout, stderr) => {
        if (stdout) setTerminalOutput(prev => [...prev.slice(-2), stdout.trim().split('\n')[0].slice(0, 50)]);
        if (stderr) setTerminalOutput(prev => [...prev.slice(-2), `ERR: ${stderr.trim().split('\n')[0].slice(0, 50)}`]);
        setCommand('');
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

  const selectedApp = processes[selectedIdx];
  const allGodLogs = manager.getGodViewLogs();
  const godLogs = useMemo(() => filter 
    ? allGodLogs.filter(l => l.message.toLowerCase().includes(filter.toLowerCase()) || l.name.toLowerCase().includes(filter.toLowerCase()))
    : allGodLogs, [allGodLogs, filter]);

  const mainViewHeight = terminalSize.rows - 3 - 6 - 2;

  return (
    <Box flexDirection="column" width={terminalSize.columns} height={terminalSize.rows} paddingX={1}>
      {/* Header */}
      <Box height={3} alignItems="center" justifyContent="space-between">
        <Box alignItems="center">
            <Text bold color={BRAND_BLUE}>SOUS</Text>
            <Text color={BRAND_GRAY}>.tools</Text>
            <Box marginLeft={4}>
                {(['services', 'god-view', 'infra', 'rpi'] as const).map((t) => (
                    <Box key={t} marginLeft={2}>
                        <Text bold={activeTab === t} color={activeTab === t ? BRAND_BLUE : BRAND_GRAY} underline={activeTab === t}>
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
        {/* Sidebar */}
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

        {/* View */}
        <Box flexDirection="column" flexGrow={1} marginLeft={1} borderStyle="round" borderColor={activeTab === 'services' && selectedApp?.status === 'error' ? BRAND_BLUE : DARK_GRAY} paddingX={1}>
            {activeTab === 'services' && (
                <Box flexDirection="column" flexGrow={1}>
                    <Box justifyContent="space-between" marginBottom={1}>
                        <Text bold color={BRAND_BLUE}>LOGS: {selectedApp?.name.toUpperCase()}</Text>
                        <Text color="gray">{selectedApp?.status.toUpperCase()}</Text>
                    </Box>
                    <Box flexDirection="column" flexGrow={1} overflow="hidden">
                        {selectedApp?.logs.slice(
                            Math.max(0, selectedApp.logs.length - (mainViewHeight - 2) - scrollOffset), 
                            Math.max(0, selectedApp.logs.length - scrollOffset)
                        ).map((l, i) => (
                            <Box key={i}>
                                <Text color="gray" dimColor>[{l.timestamp.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}] </Text>
                                <Text color={l.level === 'error' ? '#ef4444' : '#d1d5db'}>{l.message}</Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {activeTab === 'god-view' && (
                <Box flexDirection="column" flexGrow={1}>
                    <Box justifyContent="space-between" marginBottom={1}>
                        <Text bold color={BRAND_BLUE}>GOD VIEW</Text>
                        {isFilterMode ? (
                            <Box><Text color={BRAND_BLUE}>/</Text><TextInput value={filter} onChange={setFilter} onSubmit={() => setIsFilterMode(false)} /></Box>
                        ) : (
                            <Text color="gray" dimColor>{filter ? `Filter: ${filter}` : 'Press [/] to filter'}</Text>
                        )}
                    </Box>
                    <Box flexDirection="column" flexGrow={1} overflow="hidden">
                        {godLogs.slice(
                            Math.max(0, godLogs.length - (mainViewHeight - 2) - scrollOffset), 
                            Math.max(0, godLogs.length - scrollOffset)
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
        </Box>
      </Box>

      {/* Footer */}
      <Box flexDirection="column" height={6}>
        <Box borderStyle="round" borderColor={isCommandMode ? BRAND_BLUE : DARK_GRAY} paddingX={1} flexGrow={1}>
            <Box justifyContent="space-between">
                <Text bold color={isCommandMode ? BRAND_BLUE : BRAND_GRAY}>COMMAND</Text>
                {isCommandMode && <Text color={BRAND_BLUE} italic>ACTIVE</Text>}
            </Box>
            <Box flexDirection="column">
                {terminalOutput.map((line, i) => <Text key={i} color="gray" dimColor>  {line}</Text>)}
                <Box><Text color={isCommandMode ? BRAND_BLUE : "gray"}>  $ </Text>{isCommandMode ? <TextInput value={command} onChange={setCommand} onSubmit={handleCommandSubmit} /> : <Text color={DARK_GRAY}>...</Text>}</Box>
            </Box>
        </Box>
        <Box justifyContent="space-between" paddingX={1}>
            <Text color="gray" dimColor>[Tab] View  [Shift+Tab] Back  [↑/↓] Nav  [Enter] Toggle  [r] Restart  [/] Filter  [:] Cmd  [q] Quit</Text>
        </Box>
      </Box>
    </Box>
  );
};