import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { ProcessManager, ManagedProcess, ManagedLog } from '../process-manager.service.js';
import { exec } from 'child_process';
import { Tabs, Tab } from 'ink-tab';

interface Props {
  manager: ProcessManager;
}

type ViewMode = 'services' | 'god-view' | 'infra' | 'rpi';

export const Dashboard: React.FC<Props> = ({ manager }) => {
  const { exit } = useApp();
  const [activeTab, setActiveTab] = useState<ViewMode>('services');
  const [processes, setProcesses] = useState<ManagedProcess[]>(manager?.getProcesses() || []);
  const [selectedProcIdx, setSelectedIdx] = useState(0);
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Ready for commands...']);
  const [isCommandMode, setIsCommandMode] = useState(false);
  const [filter, setFilter] = useState('');
  const [isFilterMode, setIsFilterMode] = useState(false);

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

  // Enable mouse support
  useEffect(() => {
    process.stdout.write('\x1b[?1000h'); // Enable mouse reporting
    process.stdout.write('\x1b[?1006h'); // SGR mode
    return () => {
        process.stdout.write('\x1b[?1000l');
        process.stdout.write('\x1b[?1006l');
    };
  }, []);

  useInput((input, key) => {
    if (isCommandMode || isFilterMode) return;

    if (input === 'q') {
      exit();
    }

    if (input === ':') {
      setIsCommandMode(true);
    }

    if (input === '/') {
        setIsFilterMode(true);
    }

    if (key.tab) {
        const modes: ViewMode[] = ['services', 'god-view', 'infra', 'rpi'];
        const nextIdx = (modes.indexOf(activeTab) + 1) % modes.length;
        setActiveTab(modes[nextIdx]);
    }

    // Service Navigation
    if (activeTab === 'services') {
        if (key.upArrow) setSelectedIdx(Math.max(0, selectedProcIdx - 1));
        if (key.downArrow) setSelectedIdx(Math.min(processes.length - 1, selectedProcIdx + 1));
        if (key.return) {
            const selected = processes[selectedProcIdx];
            if (selected.status === 'stopped' || selected.status === 'error') manager.startProcess(selected.id);
            else manager.stopProcess(selected.id);
        }
        if (input === 'r') manager.restartProcess(processes[selectedProcIdx].id);
    }
  });

  const handleCommandSubmit = (value: string) => {
    if (value === 'exit' || value === 'q' || value === '') {
        setIsCommandMode(false);
        setCommand('');
        return;
    }

    setTerminalOutput(prev => [...prev.slice(-4), `> ${value}`]);
    exec(value, (error, stdout, stderr) => {
        if (stdout) setTerminalOutput(prev => [...prev.slice(-4), stdout.trim().split('\n')[0]]);
        if (stderr) setTerminalOutput(prev => [...prev.slice(-4), `ERR: ${stderr.trim().split('\n')[0]}`]);
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

  const renderServices = () => {
    const selectedApp = processes[selectedProcIdx];
    return (
        <Box flexDirection="row" flexGrow={1}>
            {/* Sidebar: App List */}
            <Box flexDirection="column" width="30%" borderStyle="round" paddingX={1} borderColor="#374151">
                <Box marginBottom={1}>
                    <Text bold color="#9ca3af">SERVICES</Text>
                </Box>
                {processes.map((proc, idx) => (
                    <Box key={proc.id} paddingLeft={idx === selectedProcIdx ? 0 : 2}>
                        {idx === selectedProcIdx && <Text color="#ec4899">❯ </Text>}
                        <Box flexGrow={1}>
                            <Text color={idx === selectedProcIdx ? "white" : "gray"}>{proc.name}</Text>
                        </Box>
                        <Box width={3} justifyContent="flex-end">
                            {getStatusIcon(proc.status)}
                        </Box>
                    </Box>
                ))}
            </Box>

            {/* Log Viewer */}
            <Box flexDirection="column" flexGrow={1} borderStyle="round" paddingX={1} marginLeft={1} borderColor="#374151">
                <Box marginBottom={1} justifyContent="space-between">
                    <Text bold color="#9ca3af">LOGS: {selectedApp?.name.toUpperCase()}</Text>
                    <Box>
                        <Text color="gray">[</Text>
                        <Text color={selectedApp?.status === 'running' ? "#10b981" : "gray"}>{selectedApp?.status.toUpperCase()}</Text>
                        <Text color="gray">]</Text>
                    </Box>
                </Box>
                <Box flexDirection="column" flexGrow={1}>
                    {selectedApp?.logs.length === 0 ? (
                        <Text color="gray" italic>Waiting for logs...</Text>
                    ) : (
                        selectedApp?.logs.slice(-18).map((log, i) => (
                            <Text key={i} wrap="truncate-end" color="#d1d5db">{log.message}</Text>
                        ))
                    )}
                </Box>
            </Box>
        </Box>
    );
  };

  const renderGodView = () => {
    const allLogs = manager.getGodViewLogs();
    const filteredLogs = filter 
        ? allLogs.filter(l => l.message.toLowerCase().includes(filter.toLowerCase()) || l.name.toLowerCase().includes(filter.toLowerCase()))
        : allLogs;

    return (
        <Box flexDirection="column" flexGrow={1} borderStyle="round" paddingX={1} borderColor="#374151">
            <Box marginBottom={1} justifyContent="space-between">
                <Text bold color="#9ca3af">GOD VIEW - AGGREGATED STREAM</Text>
                {isFilterMode ? (
                    <Box>
                        <Text color="#ec4899">FILTER: </Text>
                        <TextInput value={filter} onChange={setFilter} onSubmit={() => setIsFilterMode(false)} />
                    </Box>
                ) : (
                    <Text color="gray" dimColor>{filter ? `Filtering: ${filter}` : 'Press [/] to filter'}</Text>
                )}
            </Box>
            <Box flexDirection="column" flexGrow={1}>
                {filteredLogs.slice(-25).map((log, i) => (
                    <Box key={i}>
                        <Text color="gray" dimColor>[{log.timestamp.toLocaleTimeString()}] </Text>
                        <Text color="#06b6d4" bold>{log.name.padEnd(10)} </Text>
                        <Text color={log.level === 'error' ? '#ef4444' : '#d1d5db'}>{log.message}</Text>
                    </Box>
                ))}
            </Box>
        </Box>
    );
  };

  return (
    <Box flexDirection="column" padding={1} flexGrow={1}>
      {/* Header & Tabs */}
      <Box borderStyle="double" borderColor="#06b6d4" paddingX={1} justifyContent="space-between">
        <Box>
            <Text bold color="#06b6d4">👨‍🍳 SOUS.TOOLS </Text>
            <Box marginLeft={2}>
                <Tabs onChange={(v) => setActiveTab(v as ViewMode)}>
                    <Tab name="services">Services</Tab>
                    <Tab name="god-view">God View</Tab>
                    <Tab name="infra">Infra</Tab>
                    <Tab name="rpi">RPi</Tab>
                </Tabs>
            </Box>
        </Box>
        <Box>
            <Text color="gray">{new Date().toLocaleTimeString()}</Text>
        </Box>
      </Box>

      {/* Main Content */}
      <Box flexGrow={1} marginTop={1}>
        {activeTab === 'services' && renderServices()}
        {activeTab === 'god-view' && renderGodView()}
        {activeTab === 'infra' && (
            <Box flexGrow={1} borderStyle="round" borderColor="#374151" padding={1} alignItems="center" justifyContent="center">
                <Text color="gray">Docker Infrastructure Management - Coming Soon</Text>
            </Box>
        )}
        {activeTab === 'rpi' && (
            <Box flexGrow={1} borderStyle="round" borderColor="#374151" padding={1} alignItems="center" justifyContent="center">
                <Text color="gray">Remote RPi Nodes - Coming Soon</Text>
            </Box>
        )}
      </Box>

      {/* Terminal Panel */}
      <Box flexDirection="column" height={8} borderStyle="round" marginTop={0} paddingX={1} borderColor={isCommandMode ? "#ec4899" : "#374151"}>
        <Box justifyContent="space-between">
            <Text bold color={isCommandMode ? "#ec4899" : "#9ca3af"}>COMMAND PANEL</Text>
            {isCommandMode && <Text color="#ec4899" bold italic> COMMAND MODE ACTIVE </Text>}
        </Box>
        <Box flexDirection="column" flexGrow={1} marginTop={1}>
          {terminalOutput.map((line, i) => (
            <Text key={i} color="gray" dimColor>  {line}</Text>
          ))}
          <Box marginTop={1}>
            <Text color={isCommandMode ? "#ec4899" : "gray"}>  $ </Text>
            {isCommandMode ? (
                <TextInput value={command} onChange={setCommand} onSubmit={handleCommandSubmit} />
            ) : (
                <Text color="#374151">...</Text>
            )}
          </Box>
        </Box>
      </Box>

      {/* Footer / Shortcuts */}
      <Box marginTop={0} justifyContent="space-between" paddingX={1}>
        <Box>
          <Text dimColor color="gray">Navigate </Text>
          <Text color="#06b6d4">[↑/↓] </Text>
          <Box marginLeft={2}>
            <Text dimColor color="gray">View </Text>
            <Text color="#06b6d4">[Tab] </Text>
          </Box>
          <Box marginLeft={2}>
            <Text dimColor color="gray">Toggle </Text>
            <Text color="#06b6d4">[Enter] </Text>
          </Box>
          <Box marginLeft={2}>
            <Text dimColor color="gray">Search </Text>
            <Text color="#06b6d4">[/] </Text>
          </Box>
          <Box marginLeft={2}>
            <Text dimColor color="gray">Shell </Text>
            <Text color="#ec4899">[:] </Text>
          </Box>
        </Box>
        <Box>
          <Text color="#ef4444" bold>[q] QUIT</Text>
        </Box>
      </Box>
    </Box>
  );
};