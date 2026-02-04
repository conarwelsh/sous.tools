import React, { useState, useEffect, useMemo } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { ProcessManager, ManagedProcess } from '../process-manager.service.js';
import { exec } from 'child_process';

interface Props {
  manager: ProcessManager;
}

type ViewMode = 'services' | 'god-view' | 'infra' | 'rpi';

const BRAND_BLUE = '#0ea5e9'; // Azure Blue
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
    const onResize = () => {
      setTerminalSize({ 
        columns: process.stdout.columns, 
        rows: process.stdout.rows 
      });
    };
    process.stdout.on('resize', onResize);
    return () => {
      process.stdout.off('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!manager) return;
    const handleUpdate = () => {
      setProcesses([...manager.getProcesses()]);
    };

    manager.on('update', handleUpdate);
    return () => {
      manager.off('update', handleUpdate);
    };
  }, [manager]);

  useInput((input, key) => {
    if (isCommandMode || isFilterMode) return;

    if (input === 'q') exit();
    if (input === ':') setIsCommandMode(true);
    if (input === '/') { setIsFilterMode(true); setScrollOffset(0); }

    // Navigation
    if (key.tab) {
        const modes: ViewMode[] = ['services', 'god-view', 'infra', 'rpi'] as const;
        const currentIdx = modes.indexOf(activeTab);
        if (key.shift) {
            const nextIdx = (currentIdx - 1 + modes.length) % modes.length;
            setActiveTab(modes[nextIdx]);
        } else {
            const nextIdx = (currentIdx + 1) % modes.length;
            setActiveTab(modes[nextIdx]);
        }
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
    if (value === 'exit' || value === 'q' || value === '') {
        setIsCommandMode(false);
        setCommand('');
        return;
    }
    setTerminalOutput(prev => [...prev.slice(-3), `> ${value}`]);
    exec(value, (error, stdout, stderr) => {
        if (stdout) setTerminalOutput(prev => [...prev.slice(-3), stdout.trim().split('\n')[0]]);
        if (stderr) setTerminalOutput(prev => [...prev.slice(-3), `ERR: ${stderr.trim().split('\n')[0]}`]);
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

  return (
    <Box flexDirection="column" width={terminalSize.columns} height={terminalSize.rows} paddingX={1} paddingY={0}>
      {/* Top Header Section */}
      <Box height={3} alignItems="center" justifyContent="space-between">
        <Box alignItems="center">
            <Text bold color={BRAND_BLUE}>SOUS</Text>
            <Text color={BRAND_GRAY}>.tools</Text>
            <Box marginLeft={4}>
                {(['services', 'god-view', 'infra', 'rpi'] as const).map((t) => (
                    <Box key={t} marginLeft={2}>
                        <Text 
                            bold={activeTab === t} 
                            color={activeTab === t ? BRAND_BLUE : BRAND_GRAY}
                            underline={activeTab === t}
                        >
                            {t.replace('-', ' ').toUpperCase()}
                        </Text>
                    </Box>
                ))}
            </Box>
        </Box>
        <Text color="gray">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </Box>

      {/* Main Body */}
      <Box flexGrow={1}>
        {/* Left Sidebar - Always Visible Traffic Lights */}
        <Box flexDirection="column" width={15} borderStyle="round" borderColor={DARK_GRAY} paddingX={1}>
            <Box marginBottom={1}>
                <Text bold color={BRAND_GRAY}>STATUS</Text>
            </Box>
            {processes.map(p => (
                <Box key={p.id} justifyContent="space-between">
                    <Text color={p.type === 'docker' ? '#6366f1' : 'white'} dimColor={p.type === 'docker'}>{p.name.slice(0, 8)}</Text>
                    {getStatusIcon(p.status)}
                </Box>
            ))}
        </Box>

        {/* Main View Area */}
        <Box flexDirection="column" flexGrow={1} marginLeft={1} borderStyle="round" borderColor={DARK_GRAY} paddingX={1}>
            {activeTab === 'services' && (
                <Box flexDirection="column" flexGrow={1}>
                    <Box justifyContent="space-between" marginBottom={1}>
                        <Text bold color={BRAND_BLUE}>LOGS: {selectedApp?.name.toUpperCase()}</Text>
                        <Text color="gray">{selectedApp?.status.toUpperCase()}</Text>
                    </Box>
                    <Box flexDirection="column" flexGrow={1}>
                        {selectedApp?.logs.slice(-(15 + scrollOffset), selectedApp.logs.length - scrollOffset).map((l, i) => (
                            <Text key={i} wrap="truncate-end" color="#d1d5db">{l.message}</Text>
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
                    <Box flexDirection="column" flexGrow={1}>
                        {godLogs.slice(-(20 + scrollOffset), godLogs.length - scrollOffset).map((l, i) => (
                            <Box key={i}>
                                <Text color="gray" dimColor>[{l.timestamp.toLocaleTimeString([], { hour12: false })}] </Text>
                                <Text color={BRAND_BLUE} bold>{l.name.padEnd(8)} </Text>
                                <Text color={l.level === 'error' ? '#ef4444' : '#d1d5db'}>{l.message}</Text>
                            </Box>
                        ))}
                    </Box>
                </Box>
            )}

            {(activeTab === 'infra' || activeTab === 'rpi') && (
                <Box flexGrow={1} alignItems="center" justifyContent="center">
                    <Text color="gray">Section Under Construction</Text>
                </Box>
            )}
        </Box>
      </Box>

      {/* Bottom Command & Footer */}
      <Box flexDirection="column" height={6} marginTop={0}>
        <Box borderStyle="round" borderColor={isCommandMode ? BRAND_BLUE : DARK_GRAY} paddingX={1} flexGrow={1}>
            <Box justifyContent="space-between">
                <Text bold color={isCommandMode ? BRAND_BLUE : BRAND_GRAY}>COMMAND</Text>
                {isCommandMode && <Text color={BRAND_BLUE} italic>ACTIVE</Text>}
            </Box>
            <Box flexDirection="column" marginTop={0}>
                {terminalOutput.map((line, i) => <Text key={i} color="gray" dimColor>  {line}</Text>)}
                <Box>
                    <Text color={isCommandMode ? BRAND_BLUE : "gray"}>  $ </Text>
                    {isCommandMode ? <TextInput value={command} onChange={setCommand} onSubmit={handleCommandSubmit} /> : <Text color={DARK_GRAY}>...</Text>}
                </Box>
            </Box>
        </Box>
        <Box justifyContent="space-between" paddingX={1}>
            <Text color="gray" dimColor>
                [Tab] Tabs  [Shift+Tab] Back  [↑/↓] Nav/Scroll  [Enter] Start/Stop  [r] Restart  [/] Filter  [:] Cmd  [q] Quit
            </Text>
        </Box>
      </Box>
    </Box>
  );
};
