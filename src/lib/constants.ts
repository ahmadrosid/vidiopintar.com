export const NOTE_COLORS = {
  yellow: "yellow",
  blue: "blue",
  green: "green",
  red: "red",
  purple: "purple",
} as const;

export type NoteColor = typeof NOTE_COLORS[keyof typeof NOTE_COLORS];

export const NOTE_COLOR_OPTIONS: NoteColor[] = [
  NOTE_COLORS.yellow,
  NOTE_COLORS.blue,
  NOTE_COLORS.green,
  NOTE_COLORS.red,
  NOTE_COLORS.purple,
];

// Color dot classes for color picker
export const NOTE_COLOR_DOT_CLASSES: Record<NoteColor, string> = {
  yellow: "bg-yellow-400",
  blue: "bg-blue-400",
  green: "bg-green-400",
  red: "bg-red-400",
  purple: "bg-purple-400",
};

// Color border classes for note borders
export const NOTE_COLOR_BORDER_CLASSES: Record<NoteColor, string> = {
  yellow: "bg-yellow-300 dark:bg-yellow-700",
  blue: "bg-blue-300 dark:bg-blue-700",
  green: "bg-green-300 dark:bg-green-700",
  red: "bg-red-300 dark:bg-red-700",
  purple: "bg-purple-300 dark:bg-purple-700",
};

