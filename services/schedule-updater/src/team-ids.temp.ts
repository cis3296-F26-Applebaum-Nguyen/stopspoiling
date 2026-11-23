// TEMPORARY: replace with the shared team list from @stopspoiling/shared (#26).
const NAME_TO_ID: Record<string, string> = {
  "atlanta hawks": "nba-atl",
  "boston celtics": "nba-bos",
  "brooklyn nets": "nba-bkn",
  "charlotte hornets": "nba-cha",
  "chicago bulls": "nba-chi",
  "cleveland cavaliers": "nba-cle",
  "dallas mavericks": "nba-dal",
  "denver nuggets": "nba-den",
  "detroit pistons": "nba-det",
  "golden state warriors": "nba-gsw",
  "houston rockets": "nba-hou",
  "indiana pacers": "nba-ind",
  "la clippers": "nba-lac",
  "los angeles clippers": "nba-lac",
  "los angeles lakers": "nba-lal",
  "memphis grizzlies": "nba-mem",
  "miami heat": "nba-mia",
  "milwaukee bucks": "nba-mil",
  "minnesota timberwolves": "nba-min",
  "new orleans pelicans": "nba-nop",
  "new york knicks": "nba-nyk",
  "oklahoma city thunder": "nba-okc",
  "orlando magic": "nba-orl",
  "philadelphia 76ers": "nba-phi",
  "phoenix suns": "nba-phx",
  "portland trail blazers": "nba-por",
  "sacramento kings": "nba-sac",
  "san antonio spurs": "nba-sas",
  "toronto raptors": "nba-tor",
  "utah jazz": "nba-uta",
  "washington wizards": "nba-was",
};

export function teamIdFromName(name: string | null | undefined): string | undefined {
  if (!name) return undefined;
  return NAME_TO_ID[name.trim().toLowerCase()];
}