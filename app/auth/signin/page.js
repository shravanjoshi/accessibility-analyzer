import AuthForm from '../../components/AuthForm';
import Link from 'next/link';

export default function SignIn() {
  return (
    <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-lg shadow-md p-8 transition-colors duration-200">
      <h1 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
        Sign In
      </h1>
      <AuthForm mode="signin" />
      <p className="text-center mt-6 text-gray-600 dark:text-gray-400">
        Don&apos;t have an account?{' '}
        <Link href="/auth/signup" className="text-blue-600 dark:text-blue-400 hover:underline">
          Sign up here
        </Link>
      </p>
    </div>
  );
}