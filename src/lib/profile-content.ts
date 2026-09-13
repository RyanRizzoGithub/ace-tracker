/**
 * Full, verbatim profile content for each Confidence Profile, transcribed from
 * the official reports (© BenFauske.com). Each profile document is organized
 * into the same set of sections; not every document contains every section
 * (e.g. Negotiator has no "Motivation" block, and the 2022 Professional Reports
 * for Friend Maker and Driver have no "Summary"), so fields are optional.
 *
 * Paragraph breaks within a section are preserved as blank lines; the UI splits
 * on them to render separate paragraphs.
 */
export interface ProfileDetails {
  overview?: string;
  topValue?: string;
  idealEnvironment?: string;
  motivation?: string;
  strengths?: string;
  growthAreas?: string;
  summary?: string;
}

/** Ordered section labels for rendering, matching the report layout. */
export const PROFILE_SECTION_ORDER: {
  key: keyof ProfileDetails;
  label: string;
}[] = [
  { key: "overview", label: "Overview" },
  { key: "topValue", label: "Top Value" },
  { key: "idealEnvironment", label: "Ideal Environment" },
  { key: "motivation", label: "Motivation" },
  { key: "strengths", label: "Strengths" },
  { key: "growthAreas", label: "Growth Areas" },
  { key: "summary", label: "Summary" },
];

export const PROFILE_DETAILS: Record<string, ProfileDetails> = {
  "peace-keeper": {
    overview: `Your Confidence Profile is Peace Keeper. You are kind and considerate of others. You often choose to make others happy before yourself. You are very aware of what others need and are quick to help. You want others to think well of you and will work hard to make sure you don't disappoint or let others down. You will work hard to serve customers and ensure you are doing the right things at work. You dislike conflict for the sake of conflict. You desire calm and relaxing environments.

You have a tendency to defer to others and their needs. You will struggle at times knowing exactly what you want in life. When you do determine what you want it is sometimes difficult to advocate for yourself. You want others to be happy and are quick to serve. You may become resentful and bitter for those who are too pushy or demanding. You are uncomfortable with high levels of drama and look for ways to avoid stressful situations.`,
    topValue: `Peace Keepers are looking for moments of calm.`,
    idealEnvironment: `You are at your best with low drama and when you genuinely enjoy the people you are working with.`,
    motivation: `You are motivated by things working smoothly. You are typically flexible and willing to support other ideas. You have a high empathy for others and work hard to treat everyone fairly. When you are relaxed you will be most effective. You see the value of people feeling safe and creating a judgement free work environment. You believe too much stress can be counter-productive. Everyone knowing what is expected of them and building a successful routine is ideal.`,
    strengths: `Peace Keepers are kind. They create calm and relaxing environments. They leave room for others to contribute to ideas. They are great listeners and will listen completely without the need to respond.

They can make others feel like they are the most important person in the room. They create calm out of chaos. They will help others slow down and take a breath. They love routine and rhythm and understand the value of planning and being prepared. They will form strong and trusting relationships. They are dependable and loyal. They produce steady results.`,
    growthAreas: `Some areas Peace Keeper may struggle with include advocating for their opinion. Others may take advantage of them. They may become overly excited during stressful situations. It will be hard for them to shake off mistakes. They may struggle blaming themselves or others for problems. They will avoid the conflict and sometimes the conflict is necessary.

They may take their work too seriously and need a large amount of time to complete certain tasks. They may not handle change well and want to stay with the status quo. They will need to understand clearly how life will be better in the future before they buy into the change. They may allow relational issues to linger. They may feel uncomfortable being the center of attention or speaking in public. They know what they don't want, but don't often know what they do want.`,
    summary: `Communicating the appropriate amount of confidence is essential in leadership. Confident leaders build confident employees who build confident clients. Confident clients are the most important asset of any organization.`,
  },

  "friend-maker": {
    overview: `Your Confidence Profile is Friend Maker. You don't like anyone being left behind. You are driven by strong relationships with low conflict. You want everyone to get along. You will work hard to create harmony in any environment, even if that means you will sacrifice your own needs for the needs of the group. You look for opportunities to celebrate others.

When relationships are not working, you will go the extra mile to find out what went wrong and attempt to make it right. You are great at serving customers and will go above and beyond to make sure they are treated well. You are continually looking for common ground with others and will avoid controversial topics if you think they will lead to unnecessary drama.`,
    topValue: `You are looking for moments of genuine connection.`,
    idealEnvironment: `You are at your best when you really enjoy the people you are working with.`,
    motivation: `You are motivated by the ability to form strong bonds at work. You thrive in an environment where everyone helps each other. You work to ensure everyone's contributions are valued and that they feel appreciated for their work. You enjoy serving others and setting clear, logical, and effective strategies to follow. You enjoy knowing your role and what is expected of you and delivering on that every day. You do not like to be pushed or forced to have difficult conversations that are outside your scope of influence. You thrive in environments where everyone gets along.`,
    strengths: `You work to make others feel welcome and included. When you first meet someone, you want to form a connection. You want to be liked and want to demonstrate you like others. You look for common ground and ways to reduce stress and anxiety. You prefer to live in a state of calm. You want people to do things the right way. You believe you should treat people the way they want to be treated. You tend to be more interested in relationships than results. You believe the results will work out as long as the relationships are working.

You look for ways to build rapport with others and you are a great team player. You work hard to ensure the results are achieved. You work great with customers. You have high empathy for others, especially others who are like-minded. You will stick up for the underdog or those who struggle defending themselves. You are quick to encourage others and will often send thank you notes and gifts that demonstrate appreciation.`,
    growthAreas: `You will have a hard time defining what you want and advocating for yourself. You may become agitated when relationships are not working. You may have a low empathy for those who are pushy. You demand respect and you expect others to give it. When people are disrespectful, you will often react negatively. You may not say anything publicly, but you will privately.

Others may have the ability to manipulate you as you can be heavily influenced by opinions. If someone gossips about another person, it will have an impact on your perception. You love people, but also many people annoy you. It is hard for you to calm down once someone has agitated you.`,
  },

  inquisitor: {
    overview: `Your Confidence Profile is Inquisitor. You are curious and like to ask questions. You need to know why something is happening before you will fully support it. You are not afraid to ask the difficult questions, especially if you are responsible for the outcome. You want to be included in the decision-making process and have some ability to sway the end result. You do not do well being told what to do over and over again. You want to contribute.

Once you understand why something is happening and you agree, you will be very loyal and supportive. You will go above and beyond to ensure the result is achieved. If you do not agree with the decision, you will struggle behaving. You may act out and still find ways to alter the decision. The goal is to keep the communication lines open so you can continue to search for better ways.`,
    topValue: `Inquisitors are looking for moments of clarity.`,
    idealEnvironment: `An Inquisitor's ideal environment is where ideas are debated before decisions are made.`,
    motivation: `Once they are on board and enjoy the solution, they will be loyal and support it with a great attitude. They will get excited about it and they will find ways to make the project even more successful. They are comfortable playing a role behind the scenes and will take the stage if needed. They view their questioning as seeking clarity and benefiting everyone involved.`,
    strengths: `Inquisitors will be tenacious at understanding the implications of a decision and will not stop asking until they have a clear understanding. They do not prefer conflict but will address it when necessary. They will be open to other ideas and will flex their plan to the other person's perspective if it makes sense. They will become loyal once they understand and buy in to the solution. They are comfortable sharing their feedback. They are interested in change if it leads to improvements. They are looking for opportunities to learn new skills. They are open to joining critical conversations and like to be involved in the decision-making process. They are willing to ask the awkward question to seek clarity. They understand those who are hard charging as well as those who are uncomfortable with change.

They love to challenge the status quo and find better ways of doing things. They will question almost everything, and most often in a respectful and curious way. They don't ask questions they already know the answer to; they find that disrespectful. They ask questions they genuinely want to know the answers to and will continue to ask until they understand. They will be extremely supportive followers when they understand the game plan and will not feel the need to stand up and take charge. If things are going well, they will follow. If things are not going well, they will challenge.`,
    growthAreas: `If they are not on board with a solution, they may second guess the strategy and appear stubborn. Inquisitors do not respond well to the old parenting technique, "because I said so." They will ask the difficult questions because if they are going to get behind something, they need to know it is legit. They are comfortable in the waiting zone until the correct solution is found. They want to discuss options; they want to visualize how this will work for them and if they can't visualize it working, they will silently boycott or stall progress. If they don't agree with a decision they may argue or withdraw support. They can blame leaders for not disclosing all of the necessary information. They can quit on ideas or projects when they are not working. It may be perceived that they won't move on until they know the answer to the question, "What's in it for me?" They can struggle with relationships because of their continual questioning and challenging.

It may appear they know exactly what they want and are moving toward that direction, but that is often misleading. They are often unclear on their own future. Once they are clear on what they want, they will ask fewer questions and will be ready to get things done. However, when they are not clear they may appear to question everything. They will find many ways to ask the same sorts of questions. They may derail conversations, as they are curious about many things, and will move conversations in directions that may not serve the purpose of the meeting.`,
    summary: `Communicating the appropriate amount of confidence is essential in leadership. Confident leaders build confident employees who build confident clients. Confident clients are the most important asset of any organization.`,
  },

  negotiator: {
    overview: `Your Confidence Profile is Negotiator. You are always looking for a way to get the deal done. You know what you want and yet you are interested in the opinions of others. You believe the best decisions happen when gathering all of the necessary information. You will only overrule others when you can't find a compromise. You are flexible and open to new ideas. You want others to feel included in the process. You will, however, do what is necessary to land on the correct solution.

You have a tendency to defer to your own needs over the needs of others. You have a belief that you know what is best for yourself and others and will be patient with making that belief a reality. You know you need to enter into conflict at times; however, you prefer to build consensus without conflict. You are interested in winning the war and you know you don't need to win every battle to get there.`,
    topValue: `Negotiators are looking for moments of agreement.`,
    idealEnvironment: `A Negotiator's ideal environment balances the need for both results and relationships.`,
    strengths: `You are willing to make sure your needs are eventually met and you are willing to be patient in that effort. You do really well in the toughest situations because you don't overreact to the situation. You are willing to have tough conversations when needed to ensure the project is successful but you will not generate unnecessary drama. You will be assertive when necessary but want others to know that you will also be kind and supportive. You will push an issue only when it is absolutely necessary.

You have a high empathy for the perspective of others and know that together is better. You know that someone needs to make the decision and go but that is after consensus is achieved. You will seek input from many sources to determine the best course of action. You know the result needed and also the relationships needed to pull off the project. You will have strong relationships in the organization.`,
    growthAreas: `It can often take longer than expected to get the results you are looking for. Some members of the team will want you to move faster. You may feel frustrated with how much time you spend gathering support. You may lose clarity and momentum when there is too much group think.

It may be difficult to balance those who believe you are moving too slow with those who believe you are moving too fast. If there are strong dissenting views, you may feel stuck. You may become frustrated with those who refuse to get on board no matter how many conversations you have. Keeping everyone happy can be exhausting. You are in constant tension between results and relationships.

When there are conflicts of interest, you will have a hard time recognizing that situation and having a clear game plan to walk through it. Finding the correct amount of urgency to get the best deal done is your primary goal.`,
    summary: `Communicating the appropriate amount of confidence is essential in leadership. Confident leaders build confident employees who build confident clients. This confidence pipeline is essential for growth.`,
  },

  driver: {
    overview: `Your Confidence Profile is Driver. You believe it is your responsibility to push. You are driven by results and success. You know what it takes and you are willing to have the difficult conversations needed to ensure progress is made. You don't thrive on conflict; however, you know the value of clarifying expectations and holding yourself and others accountable to those expectations.

You have a clear image of what you want and will work hard to ensure others understand the vision. This creates a sense of urgency and momentum when done well. You may have a tendency to increase the tension to the point it is unhealthy. Most people love your energy, just keep in mind that together is better.`,
    topValue: `You are passionate about progress.`,
    idealEnvironment: `You work best in fast-moving and results-oriented environments.`,
    motivation: `You are typically hard-working and diligent. You hit deadlines and often exceed expectations. The downside is, if you don't work on listening and bringing others along, you will reach a professional ceiling. People may see you as a corporate climber without the care and consideration of others. You will do well at leading the tasks but may have trouble creating a shared vision with the team.

You may struggle building strong relationships with people who feel pushed. In order to ensure balanced relationships, you are wise to ask for feedback and act on it. Instead of trusting your own instincts for every decision, you will need input from others. This healthy debate will drive additional individual and team success.`,
    strengths: `You are hard-charging and fast moving. You are results-oriented and love to see things move and grow. You are most interested in personally succeeding. You are driven by large challenges. You are constantly looking for ways to improve and keep things moving. You are willing and comfortable addressing the issues that will stall progress. You anticipate issues before they happen and create an internal game plan to address those issues. You are driven by serving customers and ensuring they have what they need. You understand customers are the lifeblood of success.

You are willing to work hard and put in the effort to be successful. You will ignite situations with energy and ideas for forward progress. You have a clear picture of success and you are willing to listen to other ideas as long as it is furthering the project. You are a great follower when you are completely aligned with the plan of the project. You will build relationships quickly and will set strong expectations for those on the team. When people don't engage, you will start pushing even harder. You know how to increase the pressure to motivate others to perform.`,
    growthAreas: `You often lack patience. You are quick to increase the tension to move things forward even if the stress is unhealthy for some members of the team. You exaggerate the importance of the immediate results. Most people do not live up to your expectations. You struggle with people who don't deliver and you have difficulty listening to and absorbing the other person's point of view. You may become defensive when someone is challenging your ideas. You may set up win/lose debates. You may judge leaders or others who are not keeping up with your pace. You have a hard time slowing down to really understand what others are communicating. You may have difficulty admitting you are wrong or apologizing.

You can struggle with people who are not competent. You understand how relationships work and sometimes will use that information to get what you want. You can be perceived as demanding and not seeing the value of everyone on the team.`,
  },

  convincer: {
    overview: `Your Confidence Profile is Convincer. Your picture of success is clear. You can predict the future and your predictions are often correct. You believe if others would simply listen to your advice and take it, the world would be a better place.

You know you need others to work together, however, you can become frustrated when others don't contribute. You want everyone to take their role seriously and get the work done. When this happens, you have a great deal of intrinsic satisfaction. When this doesn't happen, you have a great deal of frustration. You are comfortable with conflict and will share your frustration until you find an acceptable solution.`,
    topValue: `Convincers are motivated by moments of accomplishment.`,
    idealEnvironment: `The ideal environment for a Convincer is one with clear roles and high competence.`,
    motivation: `The challenge is when other people feel like they have no influence over the Convincer, they will give up. It will not be worth their effort; it is a waste of time. No one lives up to the Convincer's expectations, so they may stop trying. The message or perception is that the Convincer knows how to do every job better than the person doing it.

When the motivations of the Convincer are understood as wanting to help, they will share exciting and global visions. Convincers can provide a compelling plan as well as solutions to get there. They need to work on having regular feedback sessions to ensure others are aligned. These discussions can be contagious, as people are attracted to the urgency and momentum. They will produce extraordinary results quickly, if they master the art of bringing others along.`,
    strengths: `They have a crystal-clear picture of success. They are extremely driven by results and ensuring the organization has unprecedented success. They will feel their role is to convince others to follow. They are open to the criticism of their ideas, but only if provided by someone they view as credible. They respect those who have a high level of competence. They are a great follower when they are brought into the project with a clear and credible plan. They will hit deadlines and serve customers well. They will not accept "no" for an answer. They will continue driving toward a result. They will revisit an issue until the proper solution is achieved. They will work very hard and will spend time away from work thinking about how to solve complicated and difficult problems. They may be viewed as strong and assertive and will do whatever it takes to accomplish the mission.

The customer will be thrilled because they hit the deadlines and expected deliverables. They believe more discussion will simply slow down the process. They want to be trusted to do their jobs and expect others to do the same. If there are issues, they will address them directly and expect it won't happen again. They are direct and will ensure a great result.`,
    growthAreas: `They can struggle forming strong relationships that don't feel transactional. They struggle when they hear things like, "we can't do that." People around them may feel unimportant - like they are only pawns in their game. It may appear that they are more interested in their own agenda than the agenda of others. They may assume others should have the same ambition and will have low empathy when that is not the case. It is difficult for them to admit when they are wrong or apologize. They may win battles but could still be losing the war. They may achieve the results but do not bring others along, so the success may appear self-serving.

They may not notice the relational disconnects and they will continue to push even when they have lost support for the idea. They may believe they have the best solution in the room and no input is needed. They may view brainstorming or collaboration as a waste of time. They may not understand the value of a shared vision for a project. They struggle with the idea of compromise if it weakens the decision. It is hard for them to remember to check in on the status of relationships as much as status of the results. They will win most arguments and may not understand the negative relational impact of that dynamic.

They may not understand the value of relationships. Leaders that believe strong relationships are the foundation of a team will have a major disconnect with Convincers. Ironically, it is very difficult to convince Convincers. They believe they have the correct answers and it is their job to convince others of their plan. They will be open to new ideas if they are backed by facts and credibility but it is difficult for them to fake interest. A Convincer's patience level for perceived incompetence is extremely low. Their lack of patience can be triggered by one incorrect fact or mistake. Once the Convincer writes someone off, they may be viewed as a barrier to getting the work done.`,
    summary: `Communicating the appropriate amount of confidence is essential in leadership. Confident leaders build confident employees who build confident clients. Confident clients are the most important asset of any organization.`,
  },
};

/** Returns the full section content for an archetype key, if present. */
export function profileDetails(key: string): ProfileDetails | undefined {
  return PROFILE_DETAILS[key];
}

/** True when at least one section of content exists for the archetype. */
export function hasProfileDetails(key: string): boolean {
  const d = PROFILE_DETAILS[key];
  return !!d && Object.values(d).some((v) => typeof v === "string" && v.length > 0);
}
