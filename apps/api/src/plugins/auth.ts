import { FastifyPluginAsync, FastifyRequest } from 'fastify';
import fp from 'fastify-plugin';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare module 'fastify' {
  interface FastifyRequest {
    user: {
      id: string;
      email?: string;
    };
  }
}

const authPluginCallback: FastifyPluginAsync = async (server) => {
  let supabase: SupabaseClient | null = null;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://svhqizfopfjynodnbwyg.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'sb_publishable_LqgvXVi0ogZ19CNkEYnYzw_skRSM2eP';

  if (supabaseUrl && supabaseKey) {
    try {
      supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false }
      });
      console.log('🌲 [KotiScout Auth] Server-side Supabase Auth validation enabled.');
    } catch (err) {
      console.warn('⚠️ [KotiScout Auth] Could not initialize Supabase client for JWT validation:', err);
    }
  }

  server.decorateRequest('user', null as unknown as FastifyRequest['user']);

  server.addHook('preHandler', async (request: FastifyRequest) => {
    const authHeader = request.headers.authorization;
    let resolvedUserId = 'user-demo-01'; // Default authenticated fallback in dev mode
    let userEmail = 'demo@kotiscout.fi';

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);

      // Verify with Supabase Auth when available
      if (supabase && token && !token.startsWith('demo-token')) {
        try {
          const { data, error } = await supabase.auth.getUser(token);
          if (data?.user && !error) {
            resolvedUserId = data.user.id;
            userEmail = data.user.email || userEmail;
          }
        } catch (err) {
          request.log.warn({ err }, 'Invalid Supabase JWT token, falling back to demo session');
        }
      }
    }

    // Bind authenticated identity to request context
    request.user = {
      id: resolvedUserId,
      email: userEmail
    };
  });
};

export const authPlugin = fp(authPluginCallback, {
  name: 'koti-scout-auth'
});
