import { LoginForm } from '@/components/auth/login-form';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <img
            src="/Desain tanpa judul (2).png"
            alt="Logo Aplikasi"
            width={300}
            height={150}
            className="mb-4"
          />
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
