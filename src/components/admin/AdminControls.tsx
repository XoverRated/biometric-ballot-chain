
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { 
  Settings, 
  Users, 
  Shield, 
  Database, 
  Activity,
  AlertTriangle,
  CheckCircle,
  Play,
  Pause,
  RotateCcw
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { realBlockchainService } from "@/services/realBlockchainService";
import { RealTimeMonitor } from "@/components/monitoring/RealTimeMonitor";

interface ElectionConfig {
  id: string;
  title: string;
  startTime: string;
  endTime: string;
  candidates: string[];
  status: 'draft' | 'active' | 'paused' | 'ended';
}

export const AdminControls = () => {
  const [elections, setElections] = useState<ElectionConfig[]>([]);
  const [newElection, setNewElection] = useState<Partial<ElectionConfig>>({
    title: '',
    startTime: '',
    endTime: '',
    candidates: ['']
  });
  const [isDeploying, setIsDeploying] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadElections();
  }, []);

  const loadElections = async () => {
    // In production, this would load from your database
    const mockElections: ElectionConfig[] = [
      {
        id: '1',
        title: 'Presidential Election 2024',
        startTime: '2024-01-15T09:00',
        endTime: '2024-01-15T18:00',
        candidates: ['John Smith', 'Jane Doe', 'Bob Johnson'],
        status: 'active'
      }
    ];
    setElections(mockElections);
  };

  const handleCreateElection = async () => {
    if (!newElection.title || !newElection.startTime || !newElection.endTime || !newElection.candidates?.length) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsDeploying(true);
    try {
      const electionId = `election_${Date.now()}`;
      const startTime = new Date(newElection.startTime!);
      const endTime = new Date(newElection.endTime!);
      const candidates = newElection.candidates!.filter(c => c.trim());

      // Deploy to blockchain
      const txHash = await realBlockchainService.createElection(
        electionId,
        newElection.title!,
        startTime,
        endTime,
        candidates
      );

      const election: ElectionConfig = {
        id: electionId,
        title: newElection.title!,
        startTime: newElection.startTime!,
        endTime: newElection.endTime!,
        candidates,
        status: 'draft'
      };

      setElections([...elections, election]);
      setNewElection({ title: '', startTime: '', endTime: '', candidates: [''] });

      toast({
        title: "Election Created",
        description: `Election deployed to blockchain: ${txHash}`,
      });
    } catch (error: any) {
      toast({
        title: "Deployment Failed",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setIsDeploying(false);
    }
  };

  const handleElectionControl = async (electionId: string, action: 'start' | 'pause' | 'resume' | 'end') => {
    try {
      // In production, this would call blockchain contract methods
      setElections(elections.map(e => 
        e.id === electionId 
          ? { ...e, status: action === 'start' || action === 'resume' ? 'active' : 
                           action === 'pause' ? 'paused' : 'ended' }
          : e
      ));

      toast({
        title: "Election Updated",
        description: `Election ${action}ed successfully`,
      });
    } catch (error: any) {
      toast({
        title: "Action Failed",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const addCandidate = () => {
    setNewElection({
      ...newElection,
      candidates: [...(newElection.candidates || []), '']
    });
  };

  const updateCandidate = (index: number, value: string) => {
    const candidates = [...(newElection.candidates || [])];
    candidates[index] = value;
    setNewElection({ ...newElection, candidates });
  };

  const removeCandidate = (index: number) => {
    const candidates = newElection.candidates?.filter((_, i) => i !== index) || [];
    setNewElection({ ...newElection, candidates });
  };

  const getStatusBadge = (status: ElectionConfig['status']) => {
    const variants = {
      draft: 'secondary',
      active: 'default',
      paused: 'secondary',
      ended: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status.toUpperCase()}</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-vote-blue">Admin Dashboard</h1>
        <div className="flex space-x-2">
          <Badge variant="outline">Production Mode</Badge>
          <Badge variant="default">Real Blockchain</Badge>
        </div>
      </div>

      <Tabs defaultValue="elections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="elections">Elections</TabsTrigger>
          <TabsTrigger value="monitoring">Real-Time Monitor</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="elections" className="space-y-6">
          {/* Create New Election */}
          <Card>
            <CardHeader>
              <CardTitle>Create New Election</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Election Title</Label>
                  <Input
                    id="title"
                    value={newElection.title || ''}
                    onChange={(e) => setNewElection({ ...newElection, title: e.target.value })}
                    placeholder="Presidential Election 2024"
                  />
                </div>
                <div></div>
                <div>
                  <Label htmlFor="startTime">Start Time</Label>
                  <Input
                    id="startTime"
                    type="datetime-local"
                    value={newElection.startTime || ''}
                    onChange={(e) => setNewElection({ ...newElection, startTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="endTime">End Time</Label>
                  <Input
                    id="endTime"
                    type="datetime-local"
                    value={newElection.endTime || ''}
                    onChange={(e) => setNewElection({ ...newElection, endTime: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Candidates</Label>
                <div className="space-y-2">
                  {newElection.candidates?.map((candidate, index) => (
                    <div key={index} className="flex space-x-2">
                      <Input
                        value={candidate}
                        onChange={(e) => updateCandidate(index, e.target.value)}
                        placeholder={`Candidate ${index + 1}`}
                      />
                      {newElection.candidates!.length > 1 && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeCandidate(index)}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  ))}
                  <Button variant="outline" onClick={addCandidate}>
                    Add Candidate
                  </Button>
                </div>
              </div>

              <Button
                onClick={handleCreateElection}
                disabled={isDeploying}
                className="w-full"
              >
                {isDeploying ? 'Deploying to Blockchain...' : 'Create & Deploy Election'}
              </Button>
            </CardContent>
          </Card>

          {/* Active Elections */}
          <Card>
            <CardHeader>
              <CardTitle>Manage Elections</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {elections.map((election) => (
                  <div key={election.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{election.title}</h3>
                      {getStatusBadge(election.status)}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      <p>Start: {new Date(election.startTime).toLocaleString()}</p>
                      <p>End: {new Date(election.endTime).toLocaleString()}</p>
                      <p>Candidates: {election.candidates.join(', ')}</p>
                    </div>
                    <div className="flex space-x-2">
                      {election.status === 'draft' && (
                        <Button
                          size="sm"
                          onClick={() => handleElectionControl(election.id, 'start')}
                        >
                          <Play className="h-4 w-4 mr-1" />
                          Start
                        </Button>
                      )}
                      {election.status === 'active' && (
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleElectionControl(election.id, 'pause')}
                        >
                          <Pause className="h-4 w-4 mr-1" />
                          Pause
                        </Button>
                      )}
                      {election.status === 'paused' && (
                        <Button
                          size="sm"
                          onClick={() => handleElectionControl(election.id, 'resume')}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Resume
                        </Button>
                      )}
                      {(election.status === 'active' || election.status === 'paused') && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleElectionControl(election.id, 'end')}
                        >
                          End Election
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="monitoring">
          <RealTimeMonitor />
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <Alert>
            <Users className="h-4 w-4" />
            <AlertDescription>
              User management features will be implemented here including account verification,
              role management, and access control.
            </AlertDescription>
          </Alert>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Security management including audit logs, threat detection, and system hardening
              controls will be available here.
            </AlertDescription>
          </Alert>
        </TabsContent>
      </Tabs>
    </div>
  );
};
