// src/utils/realScores.ts
// Real-time sports fixture aggregator for Premier League, Champions League, Europa League & La Liga
// Uses ESPN's public endpoints with full CORS & high-definition club crests

export interface MatchFeed {
  id: string;
  league: string;
  status: string;
  isLive: boolean;
  date: string;
  homeTeam: {
    name: string;
    logo: string;
    score: string;
  };
  awayTeam: {
    name: string;
    logo: string;
    score: string;
  };
}

export const LEAGUES_CONFIG = [
  { code: 'eng.1', name: 'Premier League' },
  { code: 'uefa.champions', name: 'Champions League' },
  { code: 'uefa.europa', name: 'Europa League' },
  { code: 'esp.1', name: 'La Liga' }
];

export async function fetchRealLiveMatches(): Promise<MatchFeed[]> {
  const allMatches: MatchFeed[] = [];

  for (const l of LEAGUES_CONFIG) {
    try {
      const response = await fetch(`https://site.api.espn.com/apis/site/v2/sports/soccer/${l.code}/scoreboard`, {
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(4000)
      });

      if (!response.ok) continue;
      const data = await response.json();
      const events: any[] = data.events || [];

      for (const evt of events) {
        const comp = evt.competitions?.[0];
        const home = comp?.competitors?.find((c: any) => c.homeAway === 'home');
        const away = comp?.competitors?.find((c: any) => c.homeAway === 'away');
        if (!home || !away) continue;

        const state = evt.status?.type?.state;
        const isLive = state === 'in';
        const isPost = state === 'post';

        let status = evt.status?.type?.shortDetail || 'UPCOMING';
        if (isLive) {
          const clock = evt.status?.displayClock ? `${evt.status.displayClock}'` : 'LIVE';
          status = `LIVE ${clock}`;
        } else if (isPost) {
          status = 'FT';
        } else {
          const d = new Date(evt.date);
          const timeStr = d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
          const today = new Date();
          const isToday = d.toDateString() === today.toDateString();
          status = isToday ? `TODAY ${timeStr}` : d.toLocaleDateString('en-GB', { weekday: 'short', hour: '2-digit', minute: '2-digit' });
        }

        allMatches.push({
          id: String(evt.id),
          league: l.name,
          status,
          isLive,
          date: evt.date,
          homeTeam: {
            name: home.team?.shortDisplayName || home.team?.name || 'Home',
            logo: home.team?.logo || 'https://a.espncdn.com/i/teamlogos/default-team-logo-500.png',
            score: (isLive || isPost) && home.score !== undefined ? String(home.score) : '-'
          },
          awayTeam: {
            name: away.team?.shortDisplayName || away.team?.name || 'Away',
            logo: away.team?.logo || 'https://a.espncdn.com/i/teamlogos/default-team-logo-500.png',
            score: (isLive || isPost) && away.score !== undefined ? String(away.score) : '-'
          }
        });
      }
    } catch (err) {
      // Graceful error logging
      console.warn(`ESPN fetch failed for ${l.code}:`, err);
    }
  }

  // Sort matches: Live first, then scheduled by date ascending, then completed
  allMatches.sort((a, b) => {
    if (a.isLive && !b.isLive) return -1;
    if (!a.isLive && b.isLive) return 1;
    const isAPost = a.status === 'FT';
    const isBPost = b.status === 'FT';
    if (!isAPost && isBPost) return -1;
    if (isAPost && !isBPost) return 1;
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  return allMatches;
}
