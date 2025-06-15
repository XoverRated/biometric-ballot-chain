
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';

export const handlers = [
  // Mock Supabase auth endpoints
  http.post('*/auth/v1/token', () => {
    return HttpResponse.json({
      access_token: 'mock-access-token',
      refresh_token: 'mock-refresh-token',
      user: {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: {
          full_name: 'Test User',
          face_embedding: new Array(128).fill(0.5),
        },
      },
    });
  }),

  // Mock elections API
  http.get('*/rest/v1/elections', () => {
    return HttpResponse.json([
      {
        id: 'election-1',
        title: 'Test Election',
        description: 'A test election',
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 86400000).toISOString(),
        is_active: true,
      },
    ]);
  }),

  // Mock candidates API
  http.get('*/rest/v1/candidates', () => {
    return HttpResponse.json([
      {
        id: 'candidate-1',
        name: 'John Doe',
        party: 'Test Party',
        position: 'President',
        election_id: 'election-1',
      },
    ]);
  }),

  // Mock votes API
  http.post('*/rest/v1/votes', () => {
    return HttpResponse.json({
      id: 'vote-1',
      verification_code: 'test-verification-code',
      blockchain_hash: '0x123456789',
      block_number: 123,
    });
  }),
];

export const server = setupServer(...handlers);
