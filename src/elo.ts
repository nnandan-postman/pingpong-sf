const BASE_K = 32;

/**
 * Calculate expected score using standard ELO formula.
 * Returns a value between 0 and 1.
 */
function expectedScore(playerElo: number, opponentElo: number): number {
  return 1 / (1 + Math.pow(10, (opponentElo - playerElo) / 400));
}

/**
 * Margin of Victory multiplier.
 * Uses logarithmic scaling so blowouts matter but don't cause extreme swings.
 * Also includes an autocorrelation adjustment — upsets produce bigger changes.
 */
function movMultiplier(scoreDiff: number, winnerElo: number, loserElo: number): number {
  const logPart = Math.log(Math.abs(scoreDiff) + 1);
  const eloDiff = winnerElo - loserElo;
  const autoCorr = 2.2 / (eloDiff * 0.001 + 2.2);
  return Math.max(0.5, Math.min(logPart * autoCorr, 2.5));
}

/**
 * Calculate ELO changes for both players after a match.
 * Takes into account the score difference (margin of victory).
 *
 * Returns [player1EloChange, player2EloChange].
 */
export function calculateEloChange(
  player1Elo: number,
  player2Elo: number,
  player1Score: number,
  player2Score: number,
): [number, number] {
  const scoreDiff = Math.abs(player1Score - player2Score);
  const p1Won = player1Score > player2Score;

  const winnerElo = p1Won ? player1Elo : player2Elo;
  const loserElo = p1Won ? player2Elo : player1Elo;

  const mov = movMultiplier(scoreDiff, winnerElo, loserElo);
  const K = BASE_K * mov;

  const e1 = expectedScore(player1Elo, player2Elo);
  const actual1 = p1Won ? 1 : 0;

  const change1 = Math.round(K * (actual1 - e1));
  const change2 = -change1;

  return [change1, change2];
}
