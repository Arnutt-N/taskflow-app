// app/login/server-page.tsx
import { auth } from '@/auth';
import { redirect } from 'next/navigation';
import LoginClientPage from './ui';

export default async function LoginServerPage() {
  const session = await auth();
  if (session?.user) {
    redirect('/');
  }

  return <LoginClientPage />;
}
