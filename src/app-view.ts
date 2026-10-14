export type AppView = 'loading' | 'workspace' | 'auth' | 'landing';

export function getAppView({
  loading,
  user,
  showAuth,
  forceAuth = false,
}: {
  loading: boolean;
  user: unknown;
  showAuth: boolean;
  forceAuth?: boolean;
}): AppView {
  if (loading) return 'loading';
  if (forceAuth) return 'auth';
  if (user) return 'workspace';
  if (showAuth) return 'auth';
  return 'landing';
}
