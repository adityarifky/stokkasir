import { SignupForm } from '@/components/auth/signup-form';
import { Warehouse } from 'lucide-react';

export default function SignupPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
           <div className="mb-4 rounded-full bg-primary/20 p-4 text-primary">
            <Warehouse className="h-12 w-12" />
          </div>
          <h1 className="text-3xl font-bold text-foreground">Create an Account</h1>
          <p className="text-muted-foreground">Join GoldStock Inventory today.</p>
        </div>
        <SignupForm />
      </div>
    </div>
  );
}
