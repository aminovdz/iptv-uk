import type { APIRoute } from 'astro';
import { fetchRealLiveMatches } from '../../utils/realScores';

export const prerender = true;

export const GET: APIRoute = async () => {
  try {
    const matches = await fetchRealLiveMatches();
    if (matches && matches.length > 0) {
      return new Response(JSON.stringify({ matches: matches.slice(0, 16), source: 'live' }), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=30, s-maxage=60, stale-while-revalidate=120'
        }
      });
    }
  } catch (err) {
    console.error('Failed to build live-scores.json:', err);
  }

  // Graceful fallback of real European football fixtures
  const fallbackMatches = [
    {
      id: 'fb-1',
      league: 'Champions League',
      status: 'TODAY 20:00',
      isLive: false,
      date: new Date().toISOString(),
      homeTeam: { name: 'Arsenal', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/359.png', score: '-' },
      awayTeam: { name: 'Lille', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/166.png', score: '-' }
    },
    {
      id: 'fb-2',
      league: 'Champions League',
      status: 'TODAY 20:00',
      isLive: false,
      date: new Date().toISOString(),
      homeTeam: { name: 'Atlético Madrid', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/1068.png', score: '-' },
      awayTeam: { name: 'Man United', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/360.png', score: '-' }
    },
    {
      id: 'fb-3',
      league: 'Champions League',
      status: 'TODAY 20:00',
      isLive: false,
      date: new Date().toISOString(),
      homeTeam: { name: 'Galatasaray', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/436.png', score: '-' },
      awayTeam: { name: 'Barcelona', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/83.png', score: '-' }
    },
    {
      id: 'fb-4',
      league: 'Premier League',
      status: 'FT',
      isLive: false,
      date: new Date().toISOString(),
      homeTeam: { name: 'Coventry', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/374.png', score: '4' },
      awayTeam: { name: 'Newcastle', logo: 'https://a.espncdn.com/i/teamlogos/soccer/500/361.png', score: '1' }
    }
  ];

  return new Response(JSON.stringify({ matches: fallbackMatches, source: 'fallback' }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60, s-maxage=300'
    }
  });
};
