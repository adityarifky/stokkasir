import { LoginForm } from '@/components/auth/login-form';
import Image from 'next/image';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center">
          <Image
            src="/logo.png"
            alt="Logo Aplikasi"
            width={100}
            height={100}
            className="mb-4"
          />
          <h1 className="text-3xl font-bold text-foreground">Selamat Datang Bro!</h1>
          <p className="text-muted-foreground">Monggo Diisi Yang Benar Yaaa</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
