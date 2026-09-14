import { SignupForm } from './SignupForm';

interface Props {
  searchParams: Promise<{ code?: string }>;
}

export default async function SignupPage({ searchParams }: Props) {
  const { code } = await searchParams;
  return <SignupForm defaultCode={code ?? ''} />;
}
