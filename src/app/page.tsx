
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import * as React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { signInWithEmailAndPassword } from 'firebase/auth';
import Link from 'next/link';

import { createSessionCookie, getUserData } from '@/app/actions';
import { auth } from '@/lib/firebase';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { InstaCraftLogo } from '@/components/icons';

const formSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

type FormValues = z.infer<typeof formSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = React.useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;
      
      const userData = await getUserData(user.uid);

      if (!userData) {
        // This can sometimes happen due to a slight delay in Firestore replication after signup.
        // We'll treat it as a recoverable error.
        throw new Error("User data not found. If you just signed up, please try again in a moment.");
      }

      // Create session cookie regardless of role/status first
      const idToken = await user.getIdToken();
      const sessionResult = await createSessionCookie(idToken);

      if (!sessionResult.success) {
        throw new Error(sessionResult.error || "Could not create session.");
      }
      
      // Now, perform redirection based on role and status
      if (userData.role === 'admin') {
         toast({ title: 'Admin Login Successful', description: "Welcome back, admin!" });
         router.push('/admin/dashboard');
         router.refresh(); // Ensure the page reloads to apply middleware logic
         return; 
      }
      
      if (userData.approvalStatus === 'approved') {
        toast({ title: 'Login Successful', description: "Welcome back!" });
        router.push('/craft');
        router.refresh();
      } else if (userData.approvalStatus === 'pending') {
         toast({
          variant: 'default',
          title: 'Login Pending',
          description: 'Your account is awaiting admin approval.',
        });
        await auth.signOut(); // Sign out user, they can't use the app yet
      } else { // 'denied' or other status
        toast({
          variant: 'destructive',
          title: 'Login Failed',
          description: 'Your account access has been denied.',
        });
        await auth.signOut();
      }

    } catch (error: any) {
      console.error(error);
      let message = 'An unexpected error occurred.';
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
        message = 'Invalid email or password.';
      } else if (error.message) {
        message = error.message;
      }
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: message,
      });
      form.setError('root', { type: 'manual', message });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex items-center">
            <InstaCraftLogo className="h-8 w-8 mr-2 text-primary" />
            <h1 className="text-2xl font-bold font-headline">InstaCraft</h1>
          </div>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>Enter your credentials to access your account.</CardDescription>
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
                      <Input placeholder="name@example.com" {...field} />
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
              {form.formState.errors.root && (
                <p className="text-sm font-medium text-destructive">
                  {form.formState.errors.root.message}
                </p>
              )}
               <Button type="submit" className="w-full" disabled={loading}>
                {loading ? <Loader2 className="animate-spin" /> : 'Sign In'}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
            <p className="text-xs text-muted-foreground">
              Don't have an account?{' '}
              <Link href="/register" className="underline hover:text-primary">
                Sign up
              </Link>
            </p>
        </CardFooter>
      </Card>
    </div>
  );
}
