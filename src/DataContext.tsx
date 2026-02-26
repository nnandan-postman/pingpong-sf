import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from "react";
import type { AppData, Player, Match } from "./types";
import { calculateEloChange } from "./elo";

const GITHUB_PAT = import.meta.env.VITE_GITHUB_PAT as string | undefined;
const REPO_OWNER = "nnandan-postman";
const REPO_NAME = "pingpong-sf";
const DATA_PATH = "data.json";
const BRANCH = "main";
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${DATA_PATH}`;

interface DataContextType {
  data: AppData | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  addPlayer: (name: string) => Promise<void>;
  recordMatch: (
    player1Id: string,
    player2Id: string,
    player1Score: number,
    player2Score: number,
  ) => Promise<void>;
  deletePlayer: (playerId: string) => Promise<void>;
  deleteMatch: (matchId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be inside DataProvider");
  return ctx;
}

function toBase64(str: string): string {
  const bytes = new TextEncoder().encode(str);
  const binStr = Array.from(bytes, (b) => String.fromCodePoint(b)).join("");
  return btoa(binStr);
}

function fromBase64(b64: string): string {
  const clean = b64.replace(/\n/g, "");
  const binStr = atob(clean);
  const bytes = Uint8Array.from(binStr, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

async function fetchData(): Promise<{ data: AppData; sha: string }> {
  const headers: Record<string, string> = {
    Accept: "application/vnd.github.v3+json",
  };
  if (GITHUB_PAT) headers.Authorization = `Bearer ${GITHUB_PAT}`;

  const res = await fetch(`${API_URL}?ref=${BRANCH}&_=${Date.now()}`, {
    headers,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Failed to fetch data: ${res.status}`);
  const json = await res.json();
  const content = JSON.parse(fromBase64(json.content)) as AppData;
  return { data: content, sha: json.sha as string };
}

async function saveData(data: AppData, sha: string): Promise<string> {
  if (!GITHUB_PAT) throw new Error("GitHub PAT not configured — cannot save");

  const content = toBase64(JSON.stringify(data, null, 2));
  const res = await fetch(API_URL, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${GITHUB_PAT}`,
      Accept: "application/vnd.github.v3+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: "Update leaderboard data",
      content,
      sha,
      branch: BRANCH,
    }),
  });

  if (res.status === 409) {
    throw new Error("Conflict — someone else updated at the same time. Please refresh and retry.");
  }
  if (!res.ok) throw new Error(`Failed to save data: ${res.status}`);

  const json = await res.json();
  return json.content.sha as string;
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<AppData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const shaRef = useRef<string>("");

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchData();
      setData(result.data);
      shaRef.current = result.sha;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const persist = useCallback(async (updated: AppData) => {
    const newSha = await saveData(updated, shaRef.current);
    shaRef.current = newSha;
    setData(updated);
  }, []);

  const addPlayer = useCallback(
    async (name: string) => {
      if (!data) return;
      const player: Player = {
        id: generateId(),
        name: name.trim(),
        elo: 1200,
        wins: 0,
        losses: 0,
      };
      await persist({ ...data, players: [...data.players, player] });
    },
    [data, persist],
  );

  const recordMatch = useCallback(
    async (player1Id: string, player2Id: string, player1Score: number, player2Score: number) => {
      if (!data) return;
      const p1 = data.players.find((p) => p.id === player1Id);
      const p2 = data.players.find((p) => p.id === player2Id);
      if (!p1 || !p2) throw new Error("Player not found");

      const [change1, change2] = calculateEloChange(p1.elo, p2.elo, player1Score, player2Score);

      const match: Match = {
        id: generateId(),
        player1Id,
        player2Id,
        player1Score,
        player2Score,
        player1EloChange: change1,
        player2EloChange: change2,
        date: new Date().toISOString(),
      };

      const updatedPlayers = data.players.map((p) => {
        if (p.id === player1Id) {
          return {
            ...p,
            elo: p.elo + change1,
            wins: p.wins + (player1Score > player2Score ? 1 : 0),
            losses: p.losses + (player1Score < player2Score ? 1 : 0),
          };
        }
        if (p.id === player2Id) {
          return {
            ...p,
            elo: p.elo + change2,
            wins: p.wins + (player2Score > player1Score ? 1 : 0),
            losses: p.losses + (player2Score < player1Score ? 1 : 0),
          };
        }
        return p;
      });

      await persist({
        players: updatedPlayers,
        matches: [match, ...data.matches],
      });
    },
    [data, persist],
  );

  const deletePlayer = useCallback(
    async (playerId: string) => {
      if (!data) return;
      await persist({
        players: data.players.filter((p) => p.id !== playerId),
        matches: data.matches.filter(
          (m) => m.player1Id !== playerId && m.player2Id !== playerId,
        ),
      });
    },
    [data, persist],
  );

  const deleteMatch = useCallback(
    async (matchId: string) => {
      if (!data) return;
      const match = data.matches.find((m) => m.id === matchId);
      if (!match) return;

      const updatedPlayers = data.players.map((p) => {
        if (p.id === match.player1Id) {
          return {
            ...p,
            elo: p.elo - match.player1EloChange,
            wins: p.wins - (match.player1Score > match.player2Score ? 1 : 0),
            losses: p.losses - (match.player1Score < match.player2Score ? 1 : 0),
          };
        }
        if (p.id === match.player2Id) {
          return {
            ...p,
            elo: p.elo - match.player2EloChange,
            wins: p.wins - (match.player2Score > match.player1Score ? 1 : 0),
            losses: p.losses - (match.player2Score < match.player1Score ? 1 : 0),
          };
        }
        return p;
      });

      await persist({
        players: updatedPlayers,
        matches: data.matches.filter((m) => m.id !== matchId),
      });
    },
    [data, persist],
  );

  return (
    <DataContext.Provider
      value={{ data, loading, error, refresh, addPlayer, recordMatch, deletePlayer, deleteMatch }}
    >
      {children}
    </DataContext.Provider>
  );
}
