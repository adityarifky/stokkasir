"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { Loader2 } from "lucide-react";


const formSchema = z.object({
  email: z.string().email({ message: "Alamat email tidak valid." }),
  password: z.string().min(6, { message: "Kata sandi minimal harus 6 karakter." }),
});

export function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signUp(values.email, values.password);
      router.push("/dashboard");
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Gagal Mendaftar",
        description: "Tidak dapat membuat akun. Silakan coba lagi.",
      });
      setIsLoading(false);
    }
  }

  return (
     <Card className="w-full">
      <CardHeader>
        <CardTitle>Daftar</CardTitle>
        <CardDescription>Masukkan detail Anda untuk membuat akun baru.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="nama@contoh.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Buat Akun
            </Button>
          </form>
        </Form>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2">
         <div className="text-sm text-muted-foreground">
          Sudah punya akun?{" "}
          <Link href="/" className="text-primary hover:underline">
            Masuk
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

// Dummy Card components to make this file self-contained
const Card = ({ className, children }: { className?: string, children: React.ReactNode }) => <div className={`rounded-lg border bg-card text-card-foreground shadow-sm ${className}`}>{children}</div>;
const CardHeader = ({ children }: { children: React.ReactNode }) => <div className="flex flex-col space-y-1.5 p-6">{children}</div>;
const CardTitle = ({ children }: { children: React.ReactNode }) => <h3 className="text-2xl font-semibold leading-none tracking-tight">{children}</h3>;
const CardDescription = ({ children }: { children: React.ReactNode }) => <p className="text-sm text-muted-foreground">{children}</p>;
const CardContent = ({ children }: { children: React.ReactNode }) => <div className="p-6 pt-0">{children}</div>;
const CardFooter = ({ className, children }: { className?: string, children: React.ReactNode }) => <div className={`flex items-center p-6 pt-0 ${className}`}>{children}</div>;
