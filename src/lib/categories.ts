import {
  Banknote,
  BriefcaseBusiness,
  CalendarHeart,
  Cake,
  Dumbbell,
  GraduationCap,
  House,
  Laptop,
  PartyPopper,
  Plane,
  Sparkles,
  Tag,
  type LucideIcon,
} from "lucide-react";

export type CountdownCategory =
  | "financial"
  | "health"
  | "work"
  | "milestones"
  | "travel"
  | "events"
  | "learning"
  | "home"
  | "relationships"
  | "tech"
  | "fun"
  | "other";

export interface CategoryMeta {
  key: CountdownCategory;
  label: string;
  hint: string;
  icon: LucideIcon;
  emoji: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    key: "financial",
    label: "Financial",
    hint: "Paying off a loan, saving up, next payday, subscription renewal.",
    icon: Banknote,,
  },
  {
    key: "health",
    label: "Health & Fitness",
    hint: "End of a diet or fast, workout challenge, training block, next session.",
    icon: Dumbbell,,
  },
  {
    key: "work",
    label: "Work & Career",
    hint: "Project deadline, product launch, performance review, contract end.",
    icon: BriefcaseBusiness,,
  },
  {
    key: "milestones",
    label: "Milestones",
    hint: "Birthday, anniversary, sobriety streak, years at this job.",
    icon: Cake,,
  },
  {
    key: "travel",
    label: "Travel",
    hint: "Flight departure, trip start, visa expiry, vacation countdown.",
    icon: Plane,,
  },
  {
    key: "events",
    label: "Events",
    hint: "Concert, wedding, conference, holiday, graduation.",
    icon: PartyPopper,,
  },
  {
    key: "learning",
    label: "Learning & Goals",
    hint: "Exam date, course deadline, habit-streak goal, book club meeting.",
    icon: GraduationCap,,
  },
  {
    key: "home",
    label: "Home & Admin",
    hint: "Lease renewal, warranty expiry, appointment, renovation deadline.",
    icon: House,,
  },
  {
    key: "relationships",
    label: "People & Family",
    hint: "Due date, date night, reunion, someone's visit.",
    icon: CalendarHeart,,
  },
  {
    key: "tech",
    label: "Tech & Digital",
    hint: "App launch, domain renewal, software release, beta end date.",
    icon: Laptop,,
  },
  {
    key: "fun",
    label: "Fun & Random",
    hint: "Game release, season finale, inside jokes, New Year.",
    icon: Sparkles,,
  },
  {
    key: "other",
    label: "Other",
    hint: "Anything that doesn't fit a box.",
    icon: Tag,,
  },
];

const BY_KEY = new Map(CATEGORIES.map((c) => [c.key, c]));

/** Old rows have no category — treat them as "other". */
export function categoryMeta(key: string | undefined): CategoryMeta {
  return (key && BY_KEY.get(key as CountdownCategory)) || BY_KEY.get("other")!;
}
