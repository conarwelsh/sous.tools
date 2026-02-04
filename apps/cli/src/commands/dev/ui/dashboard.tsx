import React, { useState, useEffect } from 'react';
import { Box, Text, useInput, useApp } from 'ink';
import { ProcessManager, ManagedProcess } from '../process-manager.service';

interface Props {
  manager: ProcessManager;
}

export const Dashboard: React.FC<Props> = ({ manager }) => {
  const { exit } = useApp();
  const [processes, setProcesses] = useState<ManagedProcess[]>(manager.getProcesses());
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [activeLogs, setActiveLogs] = useState<string>('Select an app to view logs...');

  useEffect(() => {
    const handleUpdate = () => {
      setProcesses([...manager.getProcesses()]);
    };

    manager.on('update', handleUpdate);
    return () => {
      manager.off('update', handleUpdate);
    };
  }, [manager]);

  useInput((input, key) => {
    if (input === 'q') {
      exit();
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
  });

  const selectedApp = processes[selectedIdx];

  return (
    <Box flexDirection="column" padding={1}>
      <Box borderStyle="single" paddingX={1} marginBottom={1}>
        <Text bold color="cyan">SOUS.TOOLS DEV ORCHESTRATOR</Text>
      </Box>

      <Box flexDirection="row">
        {/* Sidebar */}
        <Box flexDirection="column" width="30%" borderStyle="round" paddingX={1}>
          <Text underline>Applications</Text>
          {processes.map((proc, idx) => (
            <Box key={proc.id}>
              <Text color={idx === selectedIdx ? 'cyan' : undefined}>
                {idx === selectedIdx ? '> ' : '  '}
                {proc.name} 
                <Text color={
                  proc.status === 'running' ? 'green' : 
                  proc.status === 'starting' ? 'yellow' : 
                  proc.status === 'error' ? 'red' : 'gray'
                }> ({proc.status})</Text>
              </Text>
            </Box>
          ))}
        </Box>

        {/* Log Area */}
        <Box flexDirection="column" width="70%" borderStyle="round" paddingX={1} marginLeft={1}>
          <Text underline>Logs: {selectedApp.name}</Text>
          <Box height={10} flexDirection="column">
            {selectedApp.logs.slice(-10).map((log, i) => (
              <Text key={i} wrap="truncate">{log.trim()}</Text>
            ))}
          </Box>
        </Box>
      </Box>

      <Box marginTop={1}>
        <Text dimColor>
          [↑/↓] Navigate  [Enter] Start/Stop  [q] Quit
        </Text>
      </Box>
    </Box>
  );
};
