export type Quote = { quote: string; author: string };

// Mixed bag: classic motivational quotes plus a few genuinely goofy ones,
// so the Inspiration card doesn't take itself too seriously every time.
export const QUOTES: Quote[] = [
  { quote: "Success is the sum of small efforts repeated day in and day out.", author: "Robert Collier" },
  { quote: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { quote: "Discipline is choosing between what you want now and what you want most.", author: "Abraham Lincoln" },
  { quote: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { quote: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { quote: "Well done is better than well said.", author: "Benjamin Franklin" },
  { quote: "Focus on being productive instead of busy.", author: "Tim Ferriss" },
  { quote: "The future depends on what you do today.", author: "Mahatma Gandhi" },
  { quote: "A little progress each day adds up to big results.", author: "Satya Nani" },
  { quote: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { quote: "Quit, don't quit. Noodles don't quit, they just get soggy.", author: "Flow-Fi" },
  { quote: "Procrastination is like a credit card: fun until you get the bill.", author: "Christopher Parker" },
  { quote: "I'm not lazy, I'm just on energy-saving mode.", author: "Flow-Fi" },
  { quote: "My bed is a magical place where I suddenly remember everything I forgot to do.", author: "Flow-Fi" },
  { quote: "Coffee: because adulting is hard.", author: "Flow-Fi" },
  { quote: "Study now, cry later. Or study now and skip the crying entirely.", author: "Flow-Fi" },
  { quote: "The Pomodoro technique: because 25 minutes sounds less scary than 'the rest of my life'.", author: "Flow-Fi" },
  { quote: "I put the 'pro' in procrastinate.", author: "Flow-Fi" },
  { quote: "Fake it till you make a to-do list.", author: "Flow-Fi" },
  { quote: "Dream big, nap bigger.", author: "Flow-Fi" },
  { quote: "Either you run the day, or the day runs you.", author: "Jim Rohn" },
  { quote: "Small daily improvements are the key to staggering long-term results.", author: "Robin Sharma" },
];

/** Deterministic-ish pick keyed by an index so callers can rotate predictably. */
export function quoteAt(index: number): Quote {
  return QUOTES[((index % QUOTES.length) + QUOTES.length) % QUOTES.length];
}
