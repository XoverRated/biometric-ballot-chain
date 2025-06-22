
export interface SecurityCheck {
  name: string;
  status: 'pending' | 'checking' | 'passed' | 'failed';
  description: string;
  icon: React.ReactNode;
}
