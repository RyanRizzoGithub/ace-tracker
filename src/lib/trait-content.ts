/**
 * Short descriptions of all 36 Confidence Profile traits.
 *
 * These are ORIGINAL SUMMARIES written for ACE Tracker, based on the meaning of
 * each trait in the Confidence Traits report (© BenFauske.com). They are
 * deliberately not the report's wording. If you hold rights to the original
 * definitions and want them shown verbatim, replace the strings here — every
 * view reads from this one map.
 *
 * - `summary`: what the trait is.
 * - `higher` / `lower`: what a higher or lower score tends to look like. For
 *   AC traits higher is healthier; for OC/UC traits lower is healthier.
 */
export interface TraitContent {
  summary: string;
  higher: string;
  lower: string;
}

export const TRAIT_CONTENT: Record<string, TraitContent> = {
  // Convincer — authentic
  Accomplished: {
    summary: "Turning skill into dependable results by knowing the outcome and planning the steps to reach it.",
    higher: "Clear about goals and hard to knock off course; others come to you for help setting and hitting targets.",
    lower: "Busy but unsure where the work is heading; effort goes into tasks that don't move the real goal.",
  },
  Focused: {
    summary: "Defining a task clearly and holding attention on it until it's finished.",
    higher: "Sets a routine, works through tasks in order, and finishes what's started.",
    lower: "Drawn to new ideas over completing current ones; lots of starts, fewer finished results.",
  },
  Assertive: {
    summary: "Speaking up with confidence in a calm, direct and respectful way.",
    higher: "Knows when to step in and change a conversation's direction, and delivers hard messages respectfully.",
    lower: "Holds back or waits for others to advocate for them; when they do push, it can land as aggressive.",
  },
  // Convincer — over-confidence
  Directive: {
    summary: "Leading by telling: setting the rules and expecting them to be followed.",
    higher: "Believes their way is the best way and resists other approaches, even better ones.",
    lower: "Open to other approaches and more interested in the best answer than in being right.",
  },
  Perfectionistic: {
    summary: "Holding self and others to a flawless standard where anything less counts as failure.",
    higher: "Sees one right way to do things and treats mistakes as unacceptable, for everyone.",
    lower: "Accepts there are many good ways to succeed and treats mistakes as part of learning.",
  },
  Uninfluenceable: {
    summary: "Being hard to move once a view is formed, and rarely taking in feedback.",
    higher: "Accepts feedback from very few people, often assuming critics don't understand.",
    lower: "Welcomes feedback, asks questions about it, and adjusts in response.",
  },
  // Driver — authentic
  Progressive: {
    summary: "Pushing for better ways of working instead of settling for the status quo.",
    higher: "Seeks out improvements, welcomes new ideas that move things forward, and is comfortable being uncomfortable.",
    lower: "Prefers things as they are and spends energy resisting change rather than learning new approaches.",
  },
  Influencing: {
    summary: "Shaping the thinking and decisions of others.",
    higher: "Helps others decide well, gives and takes advice, and uses influence toward good outcomes.",
    lower: "Struggles to get ideas heard or adopted, often because their view isn't landing clearly.",
  },
  Urgent: {
    summary: "Responding to what matters with energy, speed and persistence.",
    higher: "Keeps things moving without waiting for perfection; the person people bring deadlines to.",
    lower: "Prefers a slower pace and may delay decisions to avoid mistakes; deadlines cause stress.",
  },
  // Driver — over-confidence
  Competitive: {
    summary: "Treating situations as contests to be won, often at the expense of relationships.",
    higher: "Puts winning ahead of relationships and sees others mainly as rivals.",
    lower: "Would rather succeed as a team and is just as happy sharing a win.",
  },
  "Over-powering": {
    summary: "Taking over a conversation or situation through sheer force, leaving others unheard.",
    higher: "Dominates discussions, interrupts challengers, and expects the floor.",
    lower: "Makes sure everyone is heard; at the extreme, may hold back useful input to avoid interrupting.",
  },
  Restless: {
    summary: "Finding it hard to settle, with a constant pull toward change or action.",
    higher: "Struggles to slow down or feel content; often sees what's wrong and says so.",
    lower: "Comfortable with a relaxed pace and time to recharge; at the extreme, deadlines may slip.",
  },
  // Negotiator — authentic
  Navigative: {
    summary: "Finding a new route around each obstacle until the goal is reached.",
    higher: "Sees the big picture, anticipates what's coming, and brings others along on the path.",
    lower: "Goes it alone and can be caught off guard when plans change or obstacles appear.",
  },
  Facilitative: {
    summary: "Reading the room and adapting to make work easier for the group.",
    higher: "Acts as an informal leader, guiding discussion toward productive outcomes.",
    lower: "Observes rather than guides, even when holding information that would help.",
  },
  Aligning: {
    summary: "Getting people and teams to believe in and support a shared long-term purpose.",
    higher: "Brings stakeholders on board and rallies the team around a clear direction.",
    lower: "Moves ahead without seeking buy-in; others can come along or not.",
  },
  // Negotiator — over-confidence
  "Consensus-building": {
    summary: "Pressing for complete agreement before anything moves forward.",
    higher: "Spends too long chasing unanimous agreement and can stall progress waiting for it.",
    lower: "Seeks agreement but accepts that the team can disagree and still move on.",
  },
  Political: {
    summary: "Using position or relationships to steer outcomes, sometimes at the cost of candor.",
    higher: "Says what others want to hear to advance an agenda, which erodes trust over time.",
    lower: "Chooses consistency and honesty, even when the truth is unwelcome.",
  },
  Steering: {
    summary: "Cleverly nudging others' opinions toward one's own benefit.",
    higher: "Skilled at moving people to act in ways they otherwise wouldn't; others may grow wary.",
    lower: "Lets people decide on the facts and doesn't bend the truth to persuade.",
  },
  // Inquisitor — authentic
  Clarifying: {
    summary: "Working out what matters and helping others understand it.",
    higher: "Asks the right questions so the path makes sense to them and to everyone else.",
    lower: "Skips details, leaving others to fill gaps and making their lead harder to follow.",
  },
  Contributor: {
    summary: "Adding value to people and to every interaction.",
    higher: "Brings something useful to each conversation and makes sure all voices, including their own, are heard.",
    lower: "Checks out of discussions that don't directly involve them and may leave others missing what they need.",
  },
  Curious: {
    summary: "Wanting to understand things deeply before judging.",
    higher: "Keeps asking and learning until they can decide well, including the tough questions.",
    lower: "Sticks with what's known and can treat questions as stalling.",
  },
  // Inquisitor — under-confidence
  Challenging: {
    summary: "Being demanding and self-critical, holding self and others to very high standards.",
    higher: "Hard on themselves and disappointed when others fall short; may dwell or hold grudges.",
    lower: "Can challenge in the moment but moves on quickly and treats themselves with compassion.",
  },
  Exhaustive: {
    summary: "Raising every concern from every angle, to the point of wearing others out.",
    higher: "Keeps pressing concerns long after others have moved on, often because the issue is personal.",
    lower: "Raises concerns without exhausting the group and takes personal issues offline.",
  },
  Resistant: {
    summary: "Consistently pushing back against change or direction.",
    higher: "Uncomfortable with change and works to slow it, drawing others into the same view.",
    lower: "Knows when to slow down and when to support change, and is open to where it leads.",
  },
  // Friend Maker — authentic
  Connective: {
    summary: "Genuinely getting to know people and helping them feel they belong.",
    higher: "Invests in coworkers as whole people and sees those relationships as what makes teams work.",
    lower: "Keeps things strictly business and sees personal conversation as a distraction.",
  },
  Empathic: {
    summary: "Sensing and understanding how others feel.",
    higher: "Anticipates what people need and helps them feel safe; often the trusted confidant.",
    lower: "Less tuned in to others' emotions and would rather people say exactly what they need.",
  },
  Welcoming: {
    summary: "Creating a warm environment where new people feel accepted.",
    higher: "Makes sure people feel included and that their opinions matter.",
    lower: "Sees warmth as unnecessary at work and steps away from personal conversation.",
  },
  // Friend Maker — under-confidence
  Resentful: {
    summary: "Holding onto ill will after a negative experience with someone.",
    higher: "Remembers slights and lets them shape future dealings; slow to forgive.",
    lower: "Holds people accountable but forgives a genuine apology and doesn't retaliate.",
  },
  Sensitive: {
    summary: "Reacting strongly to small signals, especially feedback.",
    higher: "Takes feedback hard, seeks out people who agree, and discounts feedback from those who don't know them well.",
    lower: "Has a steady sense of self and takes feedback as help to grow.",
  },
  Sacrificing: {
    summary: "Letting others take advantage, including giving up wins that were rightly earned.",
    higher: "Finds it hard to say no or hold boundaries, which can build resentment over time.",
    lower: "Knows when to serve others and when to advocate for themselves.",
  },
  // Peace Keeper — authentic
  Calm: {
    summary: "Staying steady and unruffled, even in chaos.",
    higher: "Creates a relaxed atmosphere and keeps conversations even; people find them easy to talk to.",
    lower: "Always onto the next thing, may stir things up to create action, and can be hard to approach.",
  },
  Harmonious: {
    summary: "Keeping the peace, often by mediating conflict.",
    higher: "Loves when everyone gets along and will set aside personal wants to keep it that way.",
    lower: "May prefer friction over calm and dive into awkward conversations at the wrong moment.",
  },
  Listener: {
    summary: "Giving full attention to understand another person's view.",
    higher: "Listens to understand rather than to respond; people enjoy talking with them.",
    lower: "Focused on being heard, often preparing their reply while the other person talks.",
  },
  // Peace Keeper — under-confidence
  Subtle: {
    summary: "Communicating indirectly, so the point doesn't always land.",
    higher: "Believes the point was made while others are left unsure; criticism can come across as praise.",
    lower: "Knows when to be gentle and when to be plain, and says things clearly with grace.",
  },
  Passive: {
    summary: "Letting things happen without reacting or taking part.",
    higher: "Avoids raising issues and waits for problems to resolve themselves.",
    lower: "Knows when to speak up and prefers to deal with issues as they arise.",
  },
  Echoing: {
    summary: "Mirroring others' views to win approval rather than voicing one's own.",
    higher: "Tells people what they want to hear and shifts position with the audience; their own view is hard to find.",
    lower: "Knows what they stand for, says so respectfully, and changes their mind only when persuaded.",
  },
};

export function traitContent(trait: string): TraitContent | undefined {
  return TRAIT_CONTENT[trait];
}
