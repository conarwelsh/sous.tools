import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import TextInput from 'ink-text-input';
import { ProcessManager, ManagedProcess } from '../process-manager.service.js';
import { exec } from 'child_process';

interface Props {
  manager: ProcessManager;
}

export const Dashboard: React.FC<Props> = ({ manager }) => {
  const { exit } = useApp();
  const [processes, setProcesses] = useState<ManagedProcess[]>(manager?.getProcesses() || []);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [command, setCommand] = useState('');
  const [terminalOutput, setTerminalOutput] = useState<string[]>(['Ready for commands...']);
  const [isCommandMode, setIsCommandMode] = useState(false);

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
    if (isCommandMode) return;

    if (input === 'q') {
      exit();
    }

    if (input === ':') {
      setIsCommandMode(true);
    }

    if (key.upArrow) {
      setSelectedIdx(Math.max(0, selectedIdx - 1));
    }

    if (key.downArrow) {
      setSelectedIdx(Math.min(processes.length - 1, selectedIdx + 1));
    }

    if (key.return) {
      const selected = processes[selectedIdx];
      if (selected.status === 'stopped' || selected.status === 'error') {
        manager.startProcess(selected.id);
      } else {
        manager.stopProcess(selected.id);
      }
    }

    if (input === 'r') {
        const selected = processes[selectedIdx];
        manager.restartProcess(selected.id);
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
        if (error) setTerminalOutput(prev => [...prev.slice(-4), `FAIL: ${error.message.split('\n')[0]}`]);
    });

    setCommand('');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'running': return <Text color="#10b981">●</Text>; // Green
      case 'starting': return <Text color="#f59e0b">●</Text>; // Amber
      case 'error': return <Text color="#ef4444">●</Text>; // Red
      default: return <Text color="#6b7280">○</Text>; // Gray
    }
  };

  const selectedApp = processes[selectedIdx];

  return (
    <Box flexDirection="column" padding={1} flexGrow={1}>
      {/* Header */}
      <Box borderStyle="double" borderColor="#06b6d4" paddingX={1} justifyContent="space-between">
        <Box>
            <Text bold color="#06b6d4">👨‍🍳 SOUS.TOOLS </Text>
            <Text color="#06b6d4" dimColor>DEVELOPMENT ORCHESTRATOR</Text>
        </Box>
        <Box>
            <Text color="gray">{new Date().toLocaleTimeString()}</Text>
        </Box>
      </Box>

      {/* Main Content Area */}
      <Box flexDirection="row" flexGrow={1} marginTop={1}>
        {/* Sidebar: App List */}
        <Box flexDirection="column" width="30%" borderStyle="round" paddingX={1} borderColor="#374151">
          <Box marginBottom={1}>
            <Text bold color="#9ca3af">SERVICES</Text>
          </Box>
          {processes.map((proc, idx) => (
            <Box key={proc.id} paddingLeft={idx === selectedIdx ? 0 : 2}>
              {idx === selectedIdx && <Text color="#ec4899">❯ </Text>}
              <Box flexGrow={1}>
                <Text color={idx === selectedIdx ? "white" : "gray"}>{proc.name}</Text>
              </Box>
              <Box width={3} justifyContent="flex-end">
                {getStatusIcon(proc.status)}
              </Box>
            </Box>
          ))}
          <Box marginTop={1} borderStyle="single" borderBottom={false} borderLeft={false} borderRight={false} borderColor="#374151" paddingTop={1}>
             <Text dimColor color="gray">Infra: ● Postgres</Text>
             <Text dimColor color="gray">Infra: ● Redis</Text>
          </Box>
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
                    <Text key={i} wrap="truncate-end" color="#d1d5db">{log.trim()}</Text>
                ))
            )}
          </Box>
        </Box>
      </Box>

      {/* Terminal Panel */}
      <Box flexDirection="column" height={8} borderStyle="round" marginTop={0} paddingX={1} borderColor={isCommandMode ? "#ec4899" : "#374151"}>
        <Box justifyContent="space-between">
            <Text bold color={isCommandMode ? "#ec4899" : "#9ca3af"}>COMMAND PANEL</Text>
            {isCommandMode ? (
                <Text color="#ec4899" bold italic> COMMAND MODE ACTIVE </Text>
            ) : (
                <Text color="gray" dimColor> Press [:] to type command </Text>
            )}
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
          <Text color="#06b6d4">[↑/↓]  </Text>
          <Box marginLeft={2}>
            <Text dimColor color="gray">Toggle </Text>
            <Text color="#06b6d4">[Enter]  </Text>
          </Box>
          <Box marginLeft={2}>
            <Text dimColor color="gray">Restart </Text>
            <Text color="#06b6d4">[r]  </Text>
          </Box>
          <Box marginLeft={2}>
            <Text dimColor color="gray">Shell </Text>
            <Text color="#ec4899">[:]  </Text>
          </Box>
        </Box>
        <Box>
          <Text color="#ef4444" bold>[q] QUIT</Text>
        </Box>
      </Box>
    </Box>
  );
};