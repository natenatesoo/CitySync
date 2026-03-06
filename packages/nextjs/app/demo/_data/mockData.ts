// ─── Types ───────────────────────────────────────────────────────────────────

export type TaskCategory = "Environment" | "Education" | "Community" | "Health" | "Infrastructure";
export type TaskStatus = "open" | "claimed" | "verifying" | "completed" | "rejected";
export type MCEStatus = "Voting" | "Planning" | "Active" | "Closed" | "Rejected";
export type OfferCategory = "Food" | "Fitness" | "Transit" | "Culture" | "Essentials";

export interface Task {
  id: string;
  title: string;
  description: string;
  category: TaskCategory;
  credits: number;      // CITY credits
  voteTokens: number;   // VOTE tokens
  estimatedTime: string;
  location: string;
  slots: number;
  slotsRemaining: number;
  issuerName: string;
  issuerId: string;
  tags: string[];
  mceId?: string;
  isMCE?: boolean;
}

export interface MCEProposal {
  id: string;
  title: string;
  description: string;
  proposerName: string;
  proposedAt: string;
  votingEndsAt: string;
  planningEndsAt?: string;
  status: MCEStatus;
  votesFor: number;
  votesAgainst: number;
  participantCount: number;
  taskCount: number;
  mceCreditsPerTask: number;
  tags: string[];
}

export interface RedemptionOffer {
  id: string;
  redeemerName: string;
  redeemerId: string;
  offerTitle: string;
  description: string;
  costCity: number;
  acceptsMCE: boolean;
  mceOnly: boolean;
  category: OfferCategory;
  emoji: string;
}

export interface CompletedTask {
  taskId: string;
  title: string;
  credits: number;
  voteTokens: number;
  completedAt: string;
  issuerName: string;
  txHash: string;
}

export interface PastRedemption {
  id: string;
  offerTitle: string;
  redeemerName: string;
  costCity: number;
  redeemedAt: string;
  txHash: string;
}

// ─── Issuers ─────────────────────────────────────────────────────────────────

export const MOCK_ISSUERS = [
  { id: "issuer-1", name: "Green Foundation", address: "0x1111...aaaa", tasksIssued: 24, creditsIssued: 1_840 },
  { id: "issuer-2", name: "Metro Coalition", address: "0x2222...bbbb", tasksIssued: 18, creditsIssued: 1_260 },
  { id: "issuer-3", name: "Civic Network", address: "0x3333...cccc", tasksIssued: 31, creditsIssued: 2_480 },
];

// ─── Task Catalog ─────────────────────────────────────────────────────────────

export const MOCK_TASKS: Task[] = [
  // Environment
  {
    id: "task-1",
    title: "Riverside Trail Cleanup",
    description:
      "Join a team to remove litter and invasive plants from 2km of the riverside trail. Gloves and bags provided. Meet at the Oak Street trailhead.",
    category: "Environment",
    credits: 75,
    voteTokens: 10,
    estimatedTime: "3 hrs",
    location: "Oak Street Trailhead",
    slots: 20,
    slotsRemaining: 7,
    issuerName: "Green Foundation",
    issuerId: "issuer-1",
    tags: ["outdoors", "cleanup", "nature"],
  },
  {
    id: "task-2",
    title: "Community Garden Planting Day",
    description:
      "Help establish raised beds in the Northside Community Garden. Plant seasonal vegetables and install drip irrigation. No experience needed.",
    category: "Environment",
    credits: 60,
    voteTokens: 8,
    estimatedTime: "2.5 hrs",
    location: "Northside Community Garden",
    slots: 15,
    slotsRemaining: 12,
    issuerName: "Green Foundation",
    issuerId: "issuer-1",
    tags: ["gardening", "food", "community"],
  },
  {
    id: "task-3",
    title: "Solar Panel Information Booth",
    description:
      "Staff a booth at the Farmers Market to educate residents about the city's solar co-op program. Training provided the day before.",
    category: "Environment",
    credits: 50,
    voteTokens: 7,
    estimatedTime: "4 hrs",
    location: "Downtown Farmers Market",
    slots: 6,
    slotsRemaining: 3,
    issuerName: "Civic Network",
    issuerId: "issuer-3",
    tags: ["education", "energy", "outreach"],
  },
  // Education
  {
    id: "task-4",
    title: "After-School STEM Mentoring",
    description:
      "Guide middle school students through hands-on robotics and coding projects every Tuesday afternoon. Background check required before first session.",
    category: "Education",
    credits: 90,
    voteTokens: 12,
    estimatedTime: "2 hrs/week",
    location: "Lincoln Middle School",
    slots: 10,
    slotsRemaining: 4,
    issuerName: "Metro Coalition",
    issuerId: "issuer-2",
    tags: ["STEM", "youth", "weekly"],
  },
  {
    id: "task-5",
    title: "Digital Literacy Workshop — Seniors",
    description:
      "Lead a 90-minute workshop on smartphone basics, video calling, and spotting online scams. Materials provided by the library.",
    category: "Education",
    credits: 55,
    voteTokens: 8,
    estimatedTime: "2 hrs",
    location: "Central Library, Room 4B",
    slots: 8,
    slotsRemaining: 8,
    issuerName: "Civic Network",
    issuerId: "issuer-3",
    tags: ["seniors", "digital", "library"],
  },
  // Community
  {
    id: "task-6",
    title: "Neighborhood Block Captain",
    description:
      "Serve as a point of contact for your block — distribute city newsletters, collect feedback, and attend one monthly meeting. 3-month commitment.",
    category: "Community",
    credits: 100,
    voteTokens: 15,
    estimatedTime: "Ongoing (3 mo.)",
    location: "Your neighborhood",
    slots: 40,
    slotsRemaining: 22,
    issuerName: "Metro Coalition",
    issuerId: "issuer-2",
    tags: ["leadership", "ongoing", "civic"],
  },
  {
    id: "task-7",
    title: "Welcome Wagon — New Residents",
    description:
      "Meet and greet new residents moving into your district. Share local resources, transit tips, and community events. Flexible scheduling.",
    category: "Community",
    credits: 40,
    voteTokens: 5,
    estimatedTime: "1.5 hrs",
    location: "Varies",
    slots: 25,
    slotsRemaining: 19,
    issuerName: "Civic Network",
    issuerId: "issuer-3",
    tags: ["outreach", "welcoming", "flexible"],
  },
  // Health
  {
    id: "task-8",
    title: "Community Health Fair Support",
    description:
      "Assist healthcare volunteers at blood pressure and vision screening stations. Help residents navigate available resources and sign up for city programs.",
    category: "Health",
    credits: 65,
    voteTokens: 9,
    estimatedTime: "5 hrs",
    location: "Eastside Recreation Center",
    slots: 18,
    slotsRemaining: 11,
    issuerName: "Green Foundation",
    issuerId: "issuer-1",
    tags: ["health", "screening", "community"],
  },
  // Infrastructure
  {
    id: "task-9",
    title: "Pothole & Sidewalk Reporting",
    description:
      "Walk a pre-assigned city block and photograph all damaged sidewalk panels and potholes using the CitySync app. GPS coordinates auto-attached.",
    category: "Infrastructure",
    credits: 35,
    voteTokens: 5,
    estimatedTime: "1.5 hrs",
    location: "Assigned district",
    slots: 50,
    slotsRemaining: 33,
    issuerName: "Metro Coalition",
    issuerId: "issuer-2",
    tags: ["infrastructure", "mobile", "quick"],
  },
  {
    id: "task-10",
    title: "Stormwater Drain Inspection",
    description:
      "Walk assigned streets before the rainy season begins. Photograph blocked drains and submit a simple form for each. Training takes 20 minutes.",
    category: "Infrastructure",
    credits: 45,
    voteTokens: 6,
    estimatedTime: "2 hrs",
    location: "Westside district",
    slots: 30,
    slotsRemaining: 14,
    issuerName: "Green Foundation",
    issuerId: "issuer-1",
    tags: ["infrastructure", "seasonal", "outdoor"],
  },
  // MCE-linked tasks
  {
    id: "task-mce-1",
    title: "Urban Forest Survey",
    description:
      "Measure tree canopy cover in your quadrant using the provided protocol. Part of the City Tree Canopy MCE — data feeds the 10-year urban forestry plan.",
    category: "Environment",
    credits: 80,
    voteTokens: 12,
    estimatedTime: "3 hrs",
    location: "Your quadrant",
    slots: 100,
    slotsRemaining: 67,
    issuerName: "Green Foundation",
    issuerId: "issuer-1",
    tags: ["trees", "data", "MCE"],
    mceId: "mce-1",
    isMCE: true,
  },
  {
    id: "task-mce-2",
    title: "Compost Bin Distribution",
    description:
      "Pick up pre-packed compost starter kits and deliver to 10 registered households in your zone. Coordinate delivery times via the app.",
    category: "Environment",
    credits: 70,
    voteTokens: 10,
    estimatedTime: "2 hrs",
    location: "Assigned zone",
    slots: 80,
    slotsRemaining: 52,
    issuerName: "Green Foundation",
    issuerId: "issuer-1",
    tags: ["compost", "delivery", "MCE"],
    mceId: "mce-1",
    isMCE: true,
  },
];

// ─── MCE Proposals ────────────────────────────────────────────────────────────

const now = new Date();
const inDays = (d: number) => new Date(now.getTime() + d * 86400000).toISOString();
const pastDays = (d: number) => new Date(now.getTime() - d * 86400000).toISOString();

export const MOCK_MCES: MCEProposal[] = [
  {
    id: "mce-1",
    title: "City Tree Canopy Expansion",
    description:
      "A citywide survey and planting initiative to increase urban tree canopy from 18% to 25% over 5 years. Participants collect baseline data, plant saplings, and monitor growth. Outcomes feed directly into the city's climate resilience plan.",
    proposerName: "Green Foundation",
    proposedAt: pastDays(3),
    votingEndsAt: inDays(11),
    status: "Voting",
    votesFor: 1_842,
    votesAgainst: 213,
    participantCount: 0,
    taskCount: 8,
    mceCreditsPerTask: 80,
    tags: ["trees", "climate", "data", "planting"],
  },
  {
    id: "mce-2",
    title: "Neighborhood Composting Network",
    description:
      "Establish a city-wide composting network with 200 community collection points. Volunteers distribute kits, train residents, and maintain collection sites. The program aims to divert 30% of organic waste from landfill.",
    proposerName: "Green Foundation",
    proposedAt: pastDays(7),
    votingEndsAt: inDays(7),
    status: "Planning",
    planningEndsAt: inDays(9),
    votesFor: 3_105,
    votesAgainst: 487,
    participantCount: 148,
    taskCount: 12,
    mceCreditsPerTask: 70,
    tags: ["compost", "waste", "network"],
  },
  {
    id: "mce-3",
    title: "Digital Access for All",
    description:
      "A mass mobilization to provide digital skills training to 5,000 residents over 90 days. Volunteers run workshops at libraries, community centers, and senior homes. Target populations: seniors, recent immigrants, and low-income families.",
    proposerName: "Civic Network",
    proposedAt: pastDays(14),
    votingEndsAt: pastDays(7),
    planningEndsAt: pastDays(5),
    status: "Active",
    votesFor: 4_220,
    votesAgainst: 310,
    participantCount: 312,
    taskCount: 20,
    mceCreditsPerTask: 90,
    tags: ["digital", "literacy", "inclusion"],
  },
  {
    id: "mce-4",
    title: "Pothole Blitz — Spring 2025",
    description:
      "Coordinate a 30-day push to identify and prioritize pothole repairs across all 12 districts. Citizen reporters collect geotagged photos, and the city fast-tracks repair orders. Last year's blitz fixed 2,400 potholes in 28 days.",
    proposerName: "Metro Coalition",
    proposedAt: pastDays(45),
    votingEndsAt: pastDays(31),
    planningEndsAt: pastDays(29),
    status: "Closed",
    votesFor: 6_800,
    votesAgainst: 120,
    participantCount: 892,
    taskCount: 15,
    mceCreditsPerTask: 45,
    tags: ["infrastructure", "repairs", "past"],
  },
];

// ─── Redemption Offers ────────────────────────────────────────────────────────

export const MOCK_OFFERS: RedemptionOffer[] = [
  {
    id: "offer-1",
    redeemerName: "Corner Market",
    redeemerId: "redeemer-1",
    offerTitle: "10% Off Grocery Basket",
    description: "10% discount on any grocery purchase up to $50. Valid once per week per citizen.",
    costCity: 30,
    acceptsMCE: true,
    mceOnly: false,
    category: "Essentials",
    emoji: "🛒",
  },
  {
    id: "offer-2",
    redeemerName: "District Gym",
    redeemerId: "redeemer-2",
    offerTitle: "One-Week Gym Pass",
    description: "Full access to all facilities — pool, weights, group classes — for 7 days.",
    costCity: 50,
    acceptsMCE: true,
    mceOnly: false,
    category: "Fitness",
    emoji: "🏋️",
  },
  {
    id: "offer-3",
    redeemerName: "City Transit",
    redeemerId: "redeemer-3",
    offerTitle: "Transit Day Pass",
    description: "Unlimited rides on all bus and metro lines for one full day.",
    costCity: 20,
    acceptsMCE: false,
    mceOnly: false,
    category: "Transit",
    emoji: "🚌",
  },
  {
    id: "offer-4",
    redeemerName: "Community Arts Center",
    redeemerId: "redeemer-4",
    offerTitle: "Free Workshop Entry",
    description: "One free entry to any drop-in workshop: ceramics, painting, printmaking, or digital art.",
    costCity: 40,
    acceptsMCE: true,
    mceOnly: false,
    category: "Culture",
    emoji: "🎨",
  },
  {
    id: "offer-5",
    redeemerName: "Local Kitchen",
    redeemerId: "redeemer-5",
    offerTitle: "Meal Voucher ($12 value)",
    description: "Redeemable for any item or combination up to $12 at Local Kitchen — breakfast or lunch menu.",
    costCity: 35,
    acceptsMCE: false,
    mceOnly: false,
    category: "Food",
    emoji: "🍱",
  },
  {
    id: "offer-6",
    redeemerName: "District Gym",
    redeemerId: "redeemer-2",
    offerTitle: "MCE Champion: Monthly Membership",
    description: "Full month gym membership reserved for verified MCE participants. Celebrate your civic contribution.",
    costCity: 120,
    acceptsMCE: true,
    mceOnly: true,
    category: "Fitness",
    emoji: "🏆",
  },
  {
    id: "offer-7",
    redeemerName: "Community Arts Center",
    redeemerId: "redeemer-4",
    offerTitle: "MCE Art Commission",
    description: "Request a personalized 4×6 print from a local artist commemorating your MCE participation.",
    costCity: 80,
    acceptsMCE: true,
    mceOnly: true,
    category: "Culture",
    emoji: "🖼️",
  },
];

// ─── Fake wallet addresses ────────────────────────────────────────────────────

export const FAKE_WALLETS = {
  participant: "0xA3f9...82dE",
  issuer: "0xB7c1...44aF",
  redeemer: "0xD2e5...91bC",
};

// ─── Starting balances ────────────────────────────────────────────────────────

export const STARTING_BALANCES = {
  participant: { city: 0, vote: 0, mce: 0 },
  issuer: { city: 0, vote: 0, mce: 0 },
  redeemer: { city: 0, vote: 0, mce: 0 },
};

// ─── Issuer dashboard stats ───────────────────────────────────────────────────

export const ISSUER_STATS = {
  totalTasksIssued: 0,
  totalCreditsIssued: 0,
  completionRate: 0,
  pendingVerifications: 0,
};

// ─── Redeemer catalog (managed by redeemer) ───────────────────────────────────

export const REDEEMER_DEFAULT_OFFERS = MOCK_OFFERS.filter(o => o.redeemerId === "redeemer-1");
