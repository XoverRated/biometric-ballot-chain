
import { MainLayout } from "@/components/layout/MainLayout";
import { RealTimeElectionResults } from "@/components/common/RealTimeElectionResults";
import { BackupRecoverySystem } from "@/components/common/BackupRecoverySystem";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { 
  Users, 
  Vote, 
  Shield, 
  Activity, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  Database,
  BarChart3,
  Settings
} from "lucide-react";

interface SystemStats {
  totalUsers: number;
  activeVoters: number;
  totalVotes: number;
  activeElections: number;
  systemHealth: 'excellent' | 'good' | 'warning' | 'critical';
  uptime: string;
  lastBackup: Date;
}

interface AuditEvent {
  id: string;
  timestamp: Date;
  userId: string;
  action: string;
  resource: string;
  status: 'success' | 'failure' | 'warning';
}

const AdminDashboardPage = () => {
  const [stats, setStats] = useState<SystemStats>({
    totalUsers: 1247,
    activeVoters: 342,
    totalVotes: 856,
    activeElections: 3,
    systemHealth: 'excellent',
    uptime: '99.98%',
    lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000),
  });

  const [recentEvents, setRecentEvents] = useState<AuditEvent[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      userId: 'user_123',
      action: 'VOTE_CAST',
      resource: 'election_2024',
      status: 'success',
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 12 * 60 * 1000),
      userId: 'user_456',
      action: 'AUTH_SUCCESS',
      resource: 'biometric_auth',
      status: 'success',
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 18 * 60 * 1000),
      userId: 'user_789',
      action: 'AUTH_FAILURE',
      resource: 'facial_recognition',
      status: 'failure',
    },
  ]);

  useEffect(() => {
    // Simulate real-time updates
    const interval = setInterval(() => {
      setStats(prev => ({
        ...prev,
        activeVoters: prev.activeVoters +  Math.floor(Math.random() * 3) - 1,
        totalVotes: prev.totalVotes + Math.floor(Math.random() * 2),
      }));
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const getHealthColor = (health: SystemStats['systemHealth']) => {
    switch (health) {
      case 'excellent':
        return 'bg-green-100 text-green-800';
      case 'good':
        return 'bg-blue-100 text-blue-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-red-100 text-red-800';
    }
  };

  const getStatusIcon = (status: AuditEvent['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failure':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };

  return (
    <MainLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-vote-blue">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            System monitoring, election management, and security oversight
          </p>
        </div>

        {/* System Health Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-vote-blue">{stats.totalUsers.toLocaleString()}</p>
                </div>
                <Users className="h-8 w-8 text-vote-teal" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Voters</p>
                  <p className="text-2xl font-bold text-vote-blue">{stats.activeVoters.toLocaleString()}</p>
                </div>
                <Activity className="h-8 w-8 text-vote-teal" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Votes</p>
                  <p className="text-2xl font-bold text-vote-blue">{stats.totalVotes.toLocaleString()}</p>
                </div>
                <Vote className="h-8 w-8 text-vote-teal" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">System Health</p>
                  <Badge className={getHealthColor(stats.systemHealth)}>
                    {stats.systemHealth.toUpperCase()}
                  </Badge>
                </div>
                <Shield className="h-8 w-8 text-vote-teal" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="elections">Elections</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="backup">Backup</TabsTrigger>
            <TabsTrigger value="audit">Audit Log</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>System Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">System Uptime</span>
                      <span className="font-medium">{stats.uptime}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Active Elections</span>
                      <span className="font-medium">{stats.activeElections}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Last Backup</span>
                      <span className="font-medium">{stats.lastBackup.toLocaleString()}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {recentEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center space-x-3 text-sm">
                        {getStatusIcon(event.status)}
                        <div className="flex-1">
                          <div className="font-medium">{event.action.replace('_', ' ')}</div>
                          <div className="text-gray-500">{event.resource}</div>
                        </div>
                        <div className="text-xs text-gray-400">
                          {event.timestamp.toLocaleTimeString()}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="elections">
            <RealTimeElectionResults electionId="1" isLive={true} />
          </TabsContent>

          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Security Status</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-semibold text-vote-blue mb-3">Authentication Security</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Rate Limiting</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Session Management</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Biometric Verification</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Backup Authentication</span>
                        <Badge className="bg-green-100 text-green-800">Available</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-vote-blue mb-3">System Security</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Audit Logging</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Blockchain Verification</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Data Encryption</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Anti-Spoofing</span>
                        <Badge className="bg-green-100 text-green-800">Active</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="backup">
            <BackupRecoverySystem />
          </TabsContent>

          <TabsContent value="audit" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Audit Log</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentEvents.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(event.status)}
                          <span className="font-medium">{event.action.replace('_', ' ')}</span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {event.timestamp.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-sm text-gray-600">
                        <div><strong>User:</strong> {event.userId}</div>
                        <div><strong>Resource:</strong> {event.resource}</div>
                        <div><strong>Status:</strong> {event.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default AdminDashboardPage;
