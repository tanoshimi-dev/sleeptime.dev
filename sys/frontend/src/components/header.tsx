interface HeaderProps {
  user: {
    name?: string;
    email?: string;
    picture?: string;
  };
}

export function Header({ user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-6 dark:border-zinc-800 dark:bg-zinc-950">
      <h1 className="text-lg font-semibold tracking-tight">
        Sleeptime Portal
      </h1>
      <div className="flex items-center gap-4">
        <span className="text-sm text-zinc-600 dark:text-zinc-400">
          {user.name || user.email}
        </span>
        <a
          href="/auth/logout"
          className="rounded-md bg-zinc-100 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:hover:bg-zinc-700"
        >
          Logout
        </a>
      </div>
    </header>
  );
}
