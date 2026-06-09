interface Props { children: React.ReactNode; }

// Data is now fetched directly in the page via /api/tests/review — no Redux thunk needed.
export default function Layout({ children }: Props) {
  return <div>{children}</div>;
}
