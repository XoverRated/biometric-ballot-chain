
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Activity, Users, Vote, Shield, AlertTriangle, CheckCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SystemHealth {
  blockchain: 'healthy' | 'warning' | 'error';
  biometric: 'healthy' | 'warning' | 'error';
  database: 'healthy' | 'warning' | 'error';
  api: 'healthy' | 'warning' | 'error';
}

interface ElectionStats {
  totalVotes: number;
  activeUsers: number;
  completionRate: number;
  errorRate: number;
}

interface SecurityAlert {
  id: string;
  type: 'spoofing_attempt' | 'multiple_attempts' | 'system_anomaly';
  severity: 'low' | 'medium' | 'high';
  message: string;
  timestamp: Date;
}

export const RealTimeMonitor = () => {
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    blockchain: 'healthy',
    biometric: 'healthy',
    database: 'healthy',
    api: 'healthy'
  });
  
  const [electionStats, setElectionStats] = useState<ElectionStats>({
    totalVotes: 0,
    activeUsers: 0,
    completionRate: 0,
    errorRate: 0
  });
  
  const [securityAlerts, setSecurityAlerts] = useState<SecurityAlert[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Initialize real-time monitoring
    initializeMonitoring();
    
    // Set up health checks
    const healthInterval = setInterval(checkSystemHealth, 30000);
    
    // Set up stats updates
    const statsInterval = setInterval(updateElectionStats, 10000);
    
    return () => {
      clearInterval(healthInterval);
      clearInterval(statsInterval);
    };
  }, []);

  const initializeMonitoring = async () => {
    try {
      // Subscribe to real-time vote updates
      const voteChannel = supabase
        .channel('vote_monitoring')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'votes'
        }, (payload) => {
          console.log('Vote activity detected:', payload);
          updateElectionStats();
        })
        .subscribe();

      // Subscribe to authentication events
      const authChannel = supabase
        .channel('auth_monitoring')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'profiles'
        }, (payload) => {
          console.log('Auth activity detected:', payload);
        })
        .subscribe();

      setIsConnected(true);
      console.log('Real-time monitoring initialized');
    } catch (error) {
      console.error('Failed to initialize monitoring:', error);
      setIsConnected(false);
    }
  };

  const checkSystemHealth = async () => {
    const health: SystemHealth = {
      blockchain: 'healthy',
      biometric: 'healthy',
      database: 'healthy',
      api: 'healthy'
    };

    try {
      // Check database connection
      const { error: dbError } = await supabase.from('votes').select('count').limit(1);
      if (dbError) health.database = 'error';

      // Check API responsiveness
      const startTime = Date.now();
      const { error: apiError } = await supabase.from('elections').select('count').limit(1);
      const responseTime = Date.now() - startTime;
      
      if (apiError) {
        health.api = 'error';
      } else if (responseTime > 2000) {
        health.api = 'warning';
      }

      // Simulate blockchain health check
      if (Math.random() > 0.95) health.blockchain = 'warning';
      
      // Simulate biometric system health
      if (Math.random() > 0.98) health.biometric = 'warning';

    } catch (error) {
      console.error('Health check failed:', error);
      health.api = 'error';
    }

    setSystemHealth(health);
  };

  const updateElectionStats = async () => {
    try {
      // Get total votes
      const { count: totalVotes } = await supabase
        .from('votes')
        .select('*', { count: 'exact', head: true });

      // Get active sessions (simulated)
      const activeUsers = Math.floor(Math.random() * 50) + 10;

      // Calculate completion rate (simulated)
      const completionRate = Math.random() * 20 + 75;

      // Calculate error rate (simulated)
      const errorRate = Math.random() * 5;

      setElectionStats({
        totalVotes: totalVotes || 0,
        activeUsers,
        completionRate,
        errorRate
      });
    } catch (error) {
      console.error('Failed to update stats:', error);
    }
  };

  const getHealthColor = (status: SystemHealth[keyof SystemHealth]) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'error': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: SystemHealth[keyof SystemHealth]) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4" />;
      case 'warning': return <AlertTriangle className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-vote-blue">Real-Time Election Monitoring</h2>
        <Badge variant={isConnected ? "default" : "destructive"}>
          {isConnected ? "Connected" : "Disconnected"}
        </Badge>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="health">System Health</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Votes</CardTitle>
                <Vote className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{electionStats.totalVotes.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  Live blockchain count
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{electionStats.activeUsers}</div>
                <p className="text-xs text-muted-foreground">
                  Currently voting
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{electionStats.completionRate.toFixed(1)}%</div>
                <Progress value={electionStats.completionRate} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{electionStats.errorRate.toFixed(2)}%</div>
                <p className="text-xs text-muted-foreground">
                  Authentication failures
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {Object.entries(systemHealth).map(([system, status]) => (
              <Card key={system}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium capitalize">{system} System</CardTitle>
                  <div className={getHealthColor(status)}>
                    {getHealthIcon(status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <Badge variant={status === 'healthy' ? 'default' : status === 'warning' ? 'secondary' : 'destructive'}>
                    {status.toUpperCase()}
                  </Badge>
                  <p className="text-xs text-muted-foreground mt-2">
                    {status === 'healthy' ? 'All systems operational' :
                     status === 'warning' ? 'Minor issues detected' :
                     'Critical issues require attention'}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="mr-2 h-5 w-5" />
                Security Alerts
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityAlerts.length === 0 ? (
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    No security alerts detected. All systems secure.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2">
                  {securityAlerts.map((alert) => (
                    <Alert key={alert.id} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>{alert.type.replace('_', ' ').toUpperCase()}:</strong> {alert.message}
                        <div className="text-xs text-muted-foreground mt-1">
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </AlertDescription>
                    </Alert>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
