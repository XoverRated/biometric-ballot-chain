
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  DatabaseIcon, 
  DownloadIcon, 
  Uploa dIcon, 
  ShieldCheckIcon, 
  AlertTriangleIcon,
  CheckCircleIcon,
  ClockIcon 
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface BackupInfo {
  id: string;
  timestamp: Date;
  size: string;
  type: 'automatic' | 'manual';
  status: 'completed' | 'in_progress' | 'failed';
  description: string;
}

export const BackupRecoverySystem = () => {
  const [backups, setBackups] = useState<BackupInfo[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      size: '145 MB',
      type: 'automatic',
      status: 'completed',
      description: 'Daily automatic backup',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      size: '142 MB',
      type: 'automatic',
      status: 'completed',
      description: 'Daily automatic backup',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // 3 days ago
      size: '138 MB',
      type: 'manual',
      status: 'completed',
      description: 'Pre-election backup',
    },
  ]);
  
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const { toast } = useToast();

  const createManualBackup = async () => {
    setIsCreatingBackup(true);
    
    try {
      // Simulate backup creation
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const newBackup: BackupInfo = {
        id: Date.now().toString(),
        timestamp: new Date(),
        size: '147 MB',
        type: 'manual',
        status: 'completed',
        description: 'Manual backup created by admin',
      };
      
      setBackups(prev => [newBackup, ...prev]);
      
      toast({
        title: "Backup Created Successfully",
        description: "Manual backup has been created and stored securely.",
      });
    } catch (error) {
      toast({
        title: "Backup Failed",
        description: "Failed to create backup. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const downloadBackup = async (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    toast({
      title: "Download Started",
      description: `Downloading backup from ${backup.timestamp.toLocaleString()}`,
    });

    // Simulate download
    setTimeout(() => {
      toast({
        title: "Download Complete",
        description: "Backup file has been downloaded successfully.",
      });
    }, 2000);
  };

  const restoreFromBackup = async (backupId: string) => {
    const backup = backups.find(b => b.id === backupId);
    if (!backup) return;

    const confirmed = window.confirm(
      `Are you sure you want to restore from backup created on ${backup.timestamp.toLocaleString()}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setIsRestoring(true);

    try {
      // Simulate restoration process
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      toast({
        title: "Restoration Complete",
        description: `System has been restored from backup created on ${backup.timestamp.toLocaleString()}`,
      });
    } catch (error) {
      toast({
        title: "Restoration Failed",
        description: "Failed to restore from backup. Please contact support.",
        variant: "destructive",
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const getStatusIcon = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-4 w-4 text-green-500" />;
      case 'in_progress':
        return <ClockIcon className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <AlertTriangleIcon className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: BackupInfo['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <DatabaseIcon className="h-5 w-5 text-vote-blue" />
            <span>Backup & Recovery System</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="mb-6">
            <ShieldCheckIcon className="h-4 w-4" />
            <AlertDescription>
              Automated backups are created every 6 hours. Manual backups can be created before critical operations.
              All backups are encrypted and stored securely with 30-day retention.
            </AlertDescription>
          </Alert>

          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Button
              onClick={createManualBackup}
              disabled={isCreatingBackup || isRestoring}
              className="bg-vote-blue hover:bg-vote-teal"
            >
              <DatabaseIcon className="mr-2 h-4 w-4" />
              {isCreatingBackup ? 'Creating Backup...' : 'Create Manual Backup'}
            </Button>
            
            <Button
              variant="outline"
              disabled={isRestoring}
            >
              <UploadIcon className="mr-2 h-4 w-4" />
              Upload Backup File
            </Button>
          </div>

          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Available Backups</h3>
            
            {backups.map((backup) => (
              <div key={backup.id} className="border rounded-lg p-4 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(backup.status)}
                    <div>
                      <div className="font-medium">
                        {backup.timestamp.toLocaleString()}
                      </div>
                      <div className="text-sm text-gray-600">
                        {backup.description} • {backup.size}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Badge className={getStatusColor(backup.status)}>
                      {backup.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline">
                      {backup.type}
                    </Badge>
                  </div>
                </div>
                
                {backup.status === 'completed' && (
                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => downloadBackup(backup.id)}
                    >
                      <DownloadIcon className="mr-2 h-3 w-3" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => restoreFromBackup(backup.id)}
                      disabled={isRestoring}
                      className="text-orange-600 border-orange-300 hover:bg-orange-50"
                    >
                      <DatabaseIcon className="mr-2 h-3 w-3" />
                      {isRestoring ? 'Restoring...' : 'Restore'}
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
