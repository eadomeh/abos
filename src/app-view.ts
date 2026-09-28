export type AppView = 'loading' | 'workspace' | 'auth' | 'landing';

export function getAppView({
  loading,
  user,
  showAuth,
}: {
  loading: boolean;
  user: unknown;
  showAuth: boolean;
}): AppView {
  if (loading) return 'loading';
  if (user) return 'workspace';
  if (showAuth) return 'auth';
  return 'landing';
}
