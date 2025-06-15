import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { logger, LogLevel, LogEntry } from "@/utils/logger";
import { Download, Trash2, Filter } from "lucide-react";

export const LogViewer = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [filterLevel, setFilterLevel] = useState<LogLevel | 'all'>('all');

  useEffect(() => {
    const updateLogs = () => {
      const allLogs = logger.getLogs();
      setLogs(allLogs);
    };

    updateLogs();
    const interval = setInterval(updateLogs, 1000);
    
    return () => clearInterval(interval);
  }, []);

  const filteredLogs = filterLevel === 'all' 
    ? logs 
    : logs.filter(log => log.level === filterLevel);

  const handleExportLogs = () => {
    const logData = logger.exportLogs();
    const blob = new Blob([logData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `biometric-logs-${new Date().toISOString()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  const getLevelColor = (level: LogLevel): "default" | "destructive" | "secondary" | "outline" => {
    switch (level) {
      case LogLevel.ERROR: return 'destructive';
      case LogLevel.WARN: return 'outline';
      case LogLevel.INFO: return 'default';
      case LogLevel.DEBUG: return 'secondary';
      default: return 'default';
    }
  };

  return (
    <Card className="w-full h-96">
      <CardHeader className="pb-4">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg">System Logs</CardTitle>
          <div className="flex gap-2">
            <select 
              value={filterLevel} 
              onChange={(e) => setFilterLevel(e.target.value as LogLevel | 'all')}
              className="px-2 py-1 border rounded"
            >
              <option value="all">All Levels</option>
              <option value={LogLevel.ERROR}>Errors</option>
              <option value={LogLevel.WARN}>Warnings</option>
              <option value={LogLevel.INFO}>Info</option>
              <option value={LogLevel.DEBUG}>Debug</option>
            </select>
            <Button variant="outline" size="sm" onClick={handleExportLogs}>
              <Download className="h-4 w-4 mr-1" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleClearLogs}>
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredLogs.length} of {logs.length} log entries
        </div>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
          <div className="space-y-2">
            {filteredLogs.slice(-50).reverse().map((log, index) => (
              <div key={index} className="border-l-2 border-gray-200 pl-3 py-2">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getLevelColor(log.level)} className="text-xs">
                    {log.level.toUpperCase()}
                  </Badge>
                  <span className="font-mono text-xs text-gray-500">
                    {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                  <span className="text-sm font-medium text-blue-600">
                    [{log.component}]
                  </span>
                </div>
                <div className="text-sm">{log.message}</div>
                {log.data && (
                  <details className="mt-1">
                    <summary className="text-xs text-gray-500 cursor-pointer">
                      View data
                    </summary>
                    <pre className="text-xs bg-gray-50 p-2 mt-1 rounded overflow-x-auto">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  </details>
                )}
                {log.error && (
                  <div className="mt-1 text-xs text-red-600 font-mono">
                    {log.error.name}: {log.error.message}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
