import { http, HttpResponse } from 'msw';
import { setupServer } from 'msw/node';

const API_BASE = 'https://api.example.com';

export const handlers = [
  http.get(`${API_BASE}/users/:userId`, ({ params }) => {
    return HttpResponse.json({
      id: params.userId,
      name: 'Ada Lovelace',
      email: 'ada@example.com',
    });
  }),

  http.patch(`${API_BASE}/users/:userId`, async ({ request, params }) => {
    const body = (await request.json()) as { name?: string };
    return HttpResponse.json({
      id: params.userId,
      name: body.name ?? 'Unknown',
      email: 'ada@example.com',
    });
  }),
];

export const server = setupServer(...handlers);
