export type Zone = 'cl' | 'el' | 'conf' | 'rel' | null;

/**
 * European league zone mapping. Returns the CSS class suffix for the rank's zone
 * (Champions League, Europa League, Conference League, relegation).
 *
 * Only hardcoded for leagues with stable slot allocations. Return null when
 * zones are unknown or ambiguous.
 */
export function getZoneForRank(league: string, rank: number, totalTeams: number): Zone {
  const topCL = 4;
  const topEL = 5;
  const topConf = 6;
  const relStart = totalTeams - 2;

  switch (league) {
    case 'PL':
    case 'PD':
    case 'SA':
    case 'BL1':
    case 'FL1':
      if (rank <= topCL) return 'cl';
      if (rank === topEL) return 'el';
      if (rank === topConf) return 'conf';
      if (rank >= relStart && totalTeams > 0) return 'rel';
      return null;
    default:
      return null;
  }
}
