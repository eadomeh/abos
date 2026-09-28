import test from 'node:test';
import assert from 'node:assert/strict';
import { getAppView } from './app-view.ts';

test('shows loading before auth state is known', () => {
  assert.equal(getAppView({ loading: true, user: null, showAuth: false }), 'loading');
});

test('authenticated users go to the workspace', () => {
  assert.equal(getAppView({ loading: false, user: { id: 'user-1' }, showAuth: true }), 'workspace');
});

test('unauthenticated users can enter the real auth screen', () => {
  assert.equal(getAppView({ loading: false, user: null, showAuth: true }), 'auth');
});

test('unauthenticated visitors see the public landing page', () => {
  assert.equal(getAppView({ loading: false, user: null, showAuth: false }), 'landing');
});
