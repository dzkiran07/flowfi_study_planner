import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-zinc-50 dark:bg-black">
      <header className="px-6 py-4">
        <nav className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
            FlowFi
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="rounded-full bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Get Started
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-6">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-5xl font-bold tracking-tight text-zinc-900 sm:text-6xl dark:text-zinc-50">
            Streamline Your Workflow
          </h1>
          <p className="mt-6 text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            FlowFi helps you manage your projects efficiently with intuitive tools designed
            for modern teams. Create, collaborate, and deploy with ease.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="rounded-full bg-zinc-900 px-6 py-3 text-base font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="rounded-full border border-zinc-300 px-6 py-3 text-base font-medium text-zinc-700 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-900"
            >
              Sign In
            </Link>
          </div>
        </div>

        <div className="mt-20 w-full max-w-5xl">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3">
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Easy Setup</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Get started in minutes with our intuitive onboarding process.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Team Collaboration</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Work together seamlessly with real-time collaboration features.
              </p>
            </div>
            <div className="rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
              <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">Secure</h3>
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
                Your data is protected with enterprise-grade security.
              </p>
            </div>
          </div>
        </div>
      </main>

      <footer className="px-6 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-zinc-500 dark:text-zinc-500">
          © 2026 FlowFi. All rights reserved.
        </div>
      </footer>
    </div>
  );
}