import type { Persona } from '@/store';

// The SkillOS library ships inside the app and is seeded additively so it never
// overwrites a persona/article the user has edited. Bump SKILL_LIBRARY_VERSION
// whenever content changes to trigger a re-seed of new items.
export const SKILL_LIBRARY_VERSION = 1;

export interface SkillSeedArticle {
  id: string;
  title: string;
  content: string;
  tags: string[];
}

export interface SkillLibraryEntry {
  persona: Persona;
  articles: SkillSeedArticle[];
}

export const SKILLOS_LIBRARY: SkillLibraryEntry[] = [
  // =====================================================================
  // 1. DIGITAL GROWTH STRATEGIST
  // =====================================================================
  {
    persona: {
      id: 'nexus-digital-growth-strategist',
      name: '🚀 Digital Growth Strategist',
      category: 'Digital Growth',
      knowledgeTags: ['digital', 'growth', 'strategy', 'funnel', 'kpi', 'journey', 'channel', 'roadmap', 'analytics', 'experiments'],
      instructions:
        'You are NEXUS, a senior Digital Growth Strategist. You design integrated digital strategies that connect channels to measurable business outcomes.\n\nWORKFLOW: Always reason in this order — (1) business objective, (2) target audience, (3) customer journey, (4) channel strategy, (5) technology enablement, (6) measurement, (7) optimization. Start by diagnosing the client\'s current digital maturity, then map the journey from awareness to retention, then allocate channels by evidence rather than habit.\n\nOUTPUT CONTRACT: Deliver an executive summary, current-state analysis, strategic recommendation, 90-day execution roadmap, channel investment model, KPI hierarchy, technology recommendations, growth experiments, risks, and assumptions. Label every assumption explicitly and separate verified facts from recommendations.\n\nGUARDRAILS: Never fabricate performance data or metrics. Do not recommend spending increases without tying them to a measurable KPI. Flag platform or channel claims that require current verification. Protect confidential client data. Require approval before any publishing or deployment action.\n\nKPIs: Prefer retention, conversion rate, CAC, ROAS, and incremental business impact over vanity metrics like likes or impressions.'
    },
    articles: [
      {
        id: 'skill-digital-maturity-model',
        title: 'Digital Maturity Assessment Framework',
        content:
          'A digital maturity assessment scores a business across five levels to find the highest-leverage growth actions.\n\nLEVELS\n- Level 1 Initial: no strategy, ad-hoc channels, no measurement.\n- Level 2 Developing: basic website and social presence, inconsistent publishing, manual reporting.\n- Level 3 Defined: documented strategy, cross-channel coordination, KPI dashboard exists.\n- Level 4 Managed: data-driven optimization, automation, attribution, clear ownership.\n- Level 5 Optimizing: predictive analytics, experimentation culture, customer-centric operating model.\n\nASSESSMENT DIMENSIONS\n1. Strategy and governance\n2. Audience and customer data\n3. Channels and content\n4. Technology and automation\n5. Measurement and analytics\n6. Skills and ways of working\n\nHOW TO USE\nScore each dimension 1-5. Calculate the average. The lowest dimension is the primary constraint — that is where the 90-day roadmap must focus first. Always pair each gap with a KPI that will prove improvement.',
        tags: ['digital', 'growth', 'strategy', 'maturity', 'audit']
      },
      {
        id: 'skill-digital-journey-map',
        title: 'Customer Journey Mapping Guide',
        content:
          'A journey map shows every step a customer takes from first awareness to repeat purchase, revealing where prospects drop off and where to invest.\n\nJOURNEY STAGES\n1. Awareness — customer discovers the brand (ads, search, social, word of mouth).\n2. Consideration — customer evaluates options (site, reviews, content, comparisons).\n3. Decision — customer chooses and purchases (pricing, trust signals, checkout).\n4. Retention — customer stays and buys again (onboarding, support, loyalty).\n5. Advocacy — customer refers others (reviews, referrals, community).\n\nBUILDING THE MAP\n- For each stage list: customer actions, touchpoints, questions, emotions, pain points, and drop-off causes.\n- Identify the "critical few" moments that most influence revenue.\n- Mark which touchpoints are owned, earned, or paid.\n\nOUTPUT\n- A one-page journey map per key persona.\n- A list of the top 3 friction points per stage.\n- A prioritized action list connecting each fix to a business metric.',
        tags: ['digital', 'growth', 'journey', 'funnel', 'audience']
      },
      {
        id: 'skill-digital-funnel-channels',
        title: 'Acquisition Funnel & Channel Strategy',
        content:
          'Channel strategy allocates effort and budget across channels based on where the target audience is and what each channel is best at.\n\nFUNNEL LAYERS\n- Top of funnel (Awareness): reach and attention — organic social, TikTok, YouTube, display, PR.\n- Middle of funnel (Consideration): education and trust — SEO, content, email nurture, retargeting.\n- Bottom of funnel (Conversion): capture demand — paid search, landing pages, direct sales.\n\nCHANNEL SELECTION CRITERIA\n1. Where does the audience actually spend time?\n2. What is the intent level at this touchpoint?\n3. What is the expected CAC and LTV per channel?\n4. Can we measure and attribute it?\n5. What content assets does the channel require?\n\nRULE OF THUMB\nDo not spread thin. Pick 2-3 core channels that match the audience, run them properly, and expand only after data supports it. Every channel must be tied to a KPI and a budget cap.',
        tags: ['digital', 'growth', 'funnel', 'channel', 'strategy']
      },
      {
        id: 'skill-digital-kpi-framework',
        title: 'KPI Framework & Measurement Hierarchy',
        content:
          'A KPI hierarchy connects daily activities to business outcomes so every team member knows which lever they own.\n\nTOP LEVEL (business)\n- Revenue, gross margin, customer lifetime value (LTV), market share.\n\nMIDDLE LEVEL (growth)\n- Customer acquisition cost (CAC), conversion rate, retention rate, ROAS, monthly recurring revenue.\n\nLOWER LEVEL (channel and activity)\n- Traffic, CTR, CPC, engagement rate, cost per lead, cost per install, open rate, signups.\n\nRULES FOR GOOD KPIs\n1. Each KPI must be actionable — someone can influence it this week.\n2. Define the denominator and time window precisely (e.g., 7-day ROAS).\n3. Distinguish output metrics (vanity) from outcome metrics (money and behavior).\n4. Set a target and a review cadence.\n\nDASHBOARD SPEC\n- Executive view: 5-7 outcome metrics.\n- Team view: channel metrics with trend and target.\n- Review rhythm: weekly tactical, monthly strategic, quarterly planning.',
        tags: ['digital', 'growth', 'kpi', 'analytics', 'measurement']
      },
      {
        id: 'skill-digital-90day-roadmap',
        title: '90-Day Execution Roadmap Template',
        content:
          'A 90-day roadmap turns strategy into sequenced action with owners, timelines, and success metrics.\n\nSTRUCTURE\n- Days 1-30 (Foundation): fix the highest-priority gaps from the audit, set up measurement, launch quick wins.\n- Days 31-60 (Acceleration): scale what worked, launch new campaigns, build content engines.\n- Days 61-90 (Optimization): analyze results, double down on winners, kill losers, plan next quarter.\n\nEVERY WORKSTREAM INCLUDES\n- Objective and the KPI it moves\n- Owner and stakeholders\n- Milestones with dates\n- Budget/resources required\n- Risks and dependencies\n\nRULES\n- Maximum 3-5 major initiatives per 90 days; anything more dilutes focus.\n- Each initiative must be reversible — you can stop it without sunk cost.\n- Review the roadmap every 2 weeks against real data, not opinion.\n\nDELIVERABLE: a one-page roadmap table (Initiative | KPI | Owner | Milestones | Status) that leadership can review in under five minutes.',
        tags: ['digital', 'growth', 'roadmap', 'execution', 'planning']
      },
      {
        id: 'skill-digital-channel-investment',
        title: 'Channel Investment & Budget Prioritization',
        content:
          'Budget prioritization allocates spend to channels with the best expected contribution to revenue, not the most activity.\n\nMETHOD\n1. List every channel and its current spend, cost per acquisition (CPA), and volume.\n2. Estimate capacity — how much more volume each channel can absorb at current efficiency.\n3. Rank by a score combining: expected ROAS, volume ceiling, and strategic fit.\n4. Allocate budget to the top-ranked channels first, then rebalance as data arrives.\n\nPAYBACK FRAMEWORK\n- Test 10-15% of budget on experiments.\n- Scale spend only when a channel clears the target CPA/ROAS for two consecutive cycles.\n- Kill channels that miss targets after a defined testing window.\n\nGUARDRAILS\n- Never cut a channel to zero without keeping a minimum presence for brand continuity.\n- Document assumptions and revisit quarterly.\n- Track budget against plan weekly to avoid overspend on unproven channels.',
        tags: ['digital', 'growth', 'budget', 'channel', 'investment']
      },
      {
        id: 'skill-digital-experiments',
        title: 'Growth Experiment Design',
        content:
          'Experimentation turns growth from guesswork into a pipeline of tested improvements.\n\nEXPERIMENT FRAMEWORK\n1. Idea — sourced from data, user feedback, or competitor analysis.\n2. Hypothesis — "If we do X, then Y will happen, because Z."\n3. Design — one variable, defined audience, clear success metric, enough sample size.\n4. Run — short, controlled, with a pre-decided duration.\n5. Learn — record the result, the confidence, and the decision (ship, iterate, kill).\n\nEXPERIMENT TYPES BY CONFIDENCE\n- Low cost / high learning: copy tests, content angle tests, landing page variants.\n- Medium cost: offer tests, targeting changes, pricing pages.\n- High cost / high impact: product changes, new channel pilots, redesigns.\n\nPRACTICES\n- Run a standing experiment backlog with owner and status per item.\n- Batch changes so results can be attributed.\n- Write every experiment down, including failures — negative results are data.\n- Review monthly and feed wins back into the roadmap.',
        tags: ['digital', 'growth', 'experiments', 'testing', 'optimization']
      }
    ]
  },

  // =====================================================================
  // 2. CONTENT INTELLIGENCE STRATEGIST
  // =====================================================================
  {
    persona: {
      id: 'nexus-content-intelligence-strategist',
      name: '✍️ Content Intelligence Strategist',
      category: 'Content',
      knowledgeTags: ['content', 'content-strategy', 'editorial', 'calendar', 'copy', 'localization', 'brand-voice', 'repurposing', 'email', 'funnel'],
      instructions:
        'You are NEXUS, a senior Content Intelligence Strategist. You transform business objectives into strategic, channel-ready content that moves audiences through the funnel.\n\nWORKFLOW: Define the audience and objective first, then choose the funnel stage (awareness, consideration, conversion, retention), then the format and channel, then craft the message and CTA. Every content item must answer: who is it for, what is the objective, which funnel stage, and what action should the reader take.\n\nOUTPUT CONTRACT: Deliver content strategy, monthly editorial calendar, campaign messaging framework, article and blog briefs, social post packages, email sequences, video scripts, and a repurposing matrix. For Cambodia, support Khmer-English localization while preserving brand voice.\n\nGUARDRAILS: Avoid generic AI language and clichés. Never claim facts, figures, or statistics without verification. Keep separate content for awareness, consideration, conversion, and retention rather than blending them. Maintain the client\'s brand voice and terminology consistently. Protect confidential client information.'
    },
    articles: [
      {
        id: 'skill-content-pillar-strategy',
        title: 'Content Pillar Strategy',
        content:
          'Content pillars organize all of a brand\'s content around a few core themes so the audience sees consistent expertise instead of random posts.\n\nWHAT A PILLAR IS\nA pillar is a broad theme that serves the business objective and maps to a target audience need. Example pillars for a travel booking platform: Plan a Trip, Travel Smarter, Money on Travel, Local Insights.\n\nBUILDING PILLARS\n1. List the business objectives (bookings, leads, authority).\n2. List audience questions and jobs-to-be-done.\n3. Group them into 3-5 pillars.\n4. For each pillar define: goal, tone, formats, key topics, and the funnel stages it serves.\n\nPER-PILLAR RULES\n- 60% content that helps the audience, 30% that proves expertise, 10% promotional.\n- Every pillar needs a coverage plan so topics are not repeated to death.\n- Pillars are reviewed quarterly against performance data.',
        tags: ['content', 'content-strategy', 'pillar', 'planning']
      },
      {
        id: 'skill-content-editorial-calendar',
        title: 'Editorial Calendar Planning',
        content:
          'An editorial calendar schedules content across channels so publishing is consistent and aligned to campaigns.\n\nFIELDS PER ITEM\n- Date and time, channel, pillar, topic, format, funnel stage, owner, status, CTA, and the KPI it serves.\n\nBALANCE\n- Mix 60/30/10 across pillar themes, formats, and content purpose.\n- Plan 4 weeks out, refine weekly, and leave slots for timely/reactive content.\n- Align content to business moments: launches, campaigns, holidays, and sales seasons.\n\nCADENCE GUIDELINE\n- Quality over volume. Better to publish 3 strong pieces than 7 weak ones.\n- Batch production: plan in advance, then create in batches, then schedule.\n- Review monthly: which content types actually moved the KPI? Cut the rest.\n\nDELIVERABLE: a calendar table (Date | Channel | Pillar | Title | Stage | Owner | CTA | KPI) plus a weekly review ritual.',
        tags: ['content', 'editorial', 'calendar', 'planning']
      },
      {
        id: 'skill-content-funnel-matrix',
        title: 'Funnel-Stage Content Matrix',
        content:
          'Different funnel stages need different content. Mixing them confuses the audience and kills conversion.\n\nAWARENESS — reach and attention\n- Short social posts, TikTok/Reels/Shorts, explainer videos, PR, trends.\n- Goal: stop the scroll, plant the brand. No hard sell.\n\nCONSIDERATION — education and trust\n- Blog articles, guides, case studies, webinars, comparison pages, email nurture.\n- Goal: answer objections, build credibility, earn the click.\n\nCONVERSION — decision\n- Landing pages, product pages, offers, testimonials, demos, checkout messaging.\n- Goal: overcome final objections, drive the action.\n\nRETENTION — loyalty\n- Onboarding emails, usage tips, community content, loyalty offers, win-back.\n- Goal: repeat purchase and advocacy.\n\nRULES\n- Every asset states its funnel stage and CTA explicitly.\n- Create one hero asset per stage per campaign and repurpose the rest.\n- Measure each asset by the metric of its stage, not a single vanity metric.',
        tags: ['content', 'funnel', 'marketing', 'strategy']
      },
      {
        id: 'skill-content-repurposing',
        title: 'Content Repurposing Matrix',
        content:
          'Repurposing multiplies the reach of one strong asset across channels without new production costs.\n\nHERO ASSET FIRST\n- Write the long-form piece once (guide, article, video).\n\nREPURPOSING MAP\n- Article -> 5-8 social posts, LinkedIn carousel, newsletter section.\n- Video -> 6-12 short clips (TikTok/Reels/Shorts), GIF moments, quote cards.\n- Webinar -> blog summary, slide deck, clip highlights, ebook.\n- Data report -> infographics, charts as posts, press release, case study.\n\nRULES\n- Never copy-paste the same caption across platforms — adapt tone and format.\n- Strip context for short-form: one idea, one hook, one CTA.\n- Track which repurposed formats outperform so the next hero is chosen by data.\n\nBENEFIT: one hour of hero production can yield a week of channel content.',
        tags: ['content', 'repurposing', 'distribution', 'social']
      },
      {
        id: 'skill-content-localization',
        title: 'Khmer-English Localization Rules',
        content:
          'Localizing for Cambodia means translating meaning and culture, not just words.\n\nTRANSLATION RULES\n- Keep brand voice and terminology consistent between Khmer and English.\n- Translate idioms and puns rather than literal — literal Khmer translations of English humor often miss.\n- Preserve proper nouns, product names, and legal terms in their official form.\n- Numbers, dates, currency (USD/Riel), and addresses must follow local conventions.\n\nCULTURAL RULES\n- Respect tone: polite, respectful register is expected in customer-facing Khmer.\n- Use local examples, landmarks, pricing realities, and payment habits (Bakong, ABA, Wing).\n- Mind religious and cultural sensitivities in imagery and messaging.\n\nPROCESS\n- Write for one language first, then adapt, not machine-translate.\n- Get a native speaker review for key pages and campaigns.\n- Keep a bilingual glossary per client to lock terminology.',
        tags: ['content', 'localization', 'khmer', 'cambodia', 'translation']
      },
      {
        id: 'skill-content-brand-voice',
        title: 'Brand Voice & Tone Enforcement',
        content:
          'Brand voice is the personality of the writing; tone is how that personality shifts by context.\n\nDEFINING VOICE\n- 3-4 voice traits (e.g., clear, confident, warm, expert).\n- One-line description of the personality.\n- Words to always use, words to avoid.\n- Examples: how the brand says hello, handles a complaint, describes itself.\n\nENFORCING VOICE\n- Create a short voice guide per client.\n- Check every draft against the traits — does it sound like this brand or like every brand?\n- Adjust tone by channel: support = empathetic, social = lighter, finance = precise.\n\nRED FLAGS OF GENERIC CONTENT\n- "Unlock your potential", "game-changer", "seamless experience", em-dash stacking, buzzword salads.\n- Rewrite toward concrete, specific language the target customer actually uses.',
        tags: ['content', 'brand-voice', 'copy', 'tone']
      },
      {
        id: 'skill-content-copy-rules',
        title: 'High-Converting Copy Rules',
        content:
          'Copy converts when it is specific, benefit-led, and gives one clear action.\n\nHEADLINES\n- Lead with the benefit or the reader\'s problem, not the product name.\n- Use numbers and specifics: "Cut setup time by 40%" beats "Save time".\n\nBODY\n- Write to one reader ("you").\n- One idea per paragraph. Short sentences.\n- Show, don\'t claim: evidence, examples, and proof points.\n- Address the main objection explicitly.\n\nCTA\n- One CTA per piece, phrased as the benefit: "Get your free audit" not "Submit".\n\nAVOID\n- Clichés and empty adjectives (revolutionary, ultimate, world-class).\n- Vagueness without proof.\n- Multiple competing CTAs.\n\nCHECK BEFORE PUBLISHING: audience, objective, funnel stage, single CTA, proof for every claim.',
        tags: ['content', 'copy', 'cta', 'conversion']
      }
    ]
  },

  // =====================================================================
  // 3. SOCIAL MEDIA GROWTH OPERATOR
  // =====================================================================
  {
    persona: {
      id: 'nexus-social-media-growth-operator',
      name: '📱 Social Media Growth Operator',
      category: 'Social Media',
      knowledgeTags: ['social', 'social-media', 'facebook', 'instagram', 'tiktok', 'linkedin', 'telegram', 'youtube', 'paid-social', 'community', 'influencer', 'creative-testing'],
      instructions:
        'You are NEXUS, a senior Social Media Growth Operator. You plan and optimize organic social, paid social, and community growth across Facebook, Instagram, TikTok, LinkedIn, Telegram, and YouTube.\n\nWORKFLOW: Start from the business objective and audience, choose platforms by where the audience actually spends time, then plan organic content and paid structure together so they reinforce each other, define creative testing, and close with measurement and reporting.\n\nOUTPUT CONTRACT: Deliver platform strategy, monthly content calendar, campaign architecture (campaign, ad set, ad level), audience segmentation matrix, A/B creative testing plan, creative briefs, community management guidelines, reporting dashboard specification, and optimization recommendations.\n\nMANDATORY METRICS: Report reach and frequency, engagement rate, CTR, CPC, CPA, conversion rate, ROAS, and retention or repeat-purchase behavior. Connect every social activity to incremental business impact, not just vanity engagement.\n\nGUARDRAILS: Do not fabricate engagement or performance numbers. Do not recommend paid spend without a targeting rationale and a defined KPI. Flag any platform policy risks, such as restricted industries or targeting limitations.'
    },
    articles: [
      {
        id: 'skill-social-platform-strategy',
        title: 'Platform Strategy: Facebook, Instagram, TikTok, LinkedIn, Telegram, YouTube',
        content:
          'Choose platforms by where the audience spends time and what each platform is best at — not by where the brand "should" be.\n\nPLATFORM PROFILES\n- Facebook: broad reach, local communities, groups, Marketplace; strong for Cambodia B2C and local business.\n- Instagram: visual brand, Stories, Reels, shopping; good for lifestyle and product aesthetics.\n- TikTok: discovery engine for younger audiences; short-form entertainment and trend participation.\n- LinkedIn: B2B, professional authority, decision-makers, company updates.\n- Telegram: owned channel, high engagement, broadcast, mini-apps and communities.\n- YouTube: searchable long-form, tutorials, reviews, brand authority.\n\nSELECTION PROCESS\n1. Define the audience and their platform behavior.\n2. Match each platform to a specific objective (awareness, engagement, conversion, retention).\n3. Define the minimum cadence and format per platform.\n4. Start with 2-3 platforms done well rather than six done poorly.\n\nOUTPUT: a platform strategy table (Platform | Audience | Objective | Format | Cadence | Owner | KPI).',
        tags: ['social', 'social-media', 'platform', 'strategy', 'facebook', 'tiktok']
      },
      {
        id: 'skill-social-content-calendar',
        title: 'Social Content Calendar & Cadence',
        content:
          'A social calendar keeps publishing consistent and aligned with campaigns.\n\nPER-PLATFORM CADENCE GUIDELINES\n- Facebook: 3-5 posts/week + community engagement daily.\n- Instagram: feed 3-4/week + Stories daily + Reels 3-5/week.\n- TikTok: 4-7 videos/week for growth accounts.\n- LinkedIn: 3-5 posts/week professional insight.\n- Telegram: daily value + special broadcasts for offers.\n\nCALENDAR FIELDS\n- Date/time, platform, pillar, format, caption, asset, link, CTA, funnel stage, owner, status.\n\nCONTENT MIX RULE\n- 60% value, 30% proof/expertise, 10% promotion.\n- Batch-create weekly; never publish without a hook that earns the first 3 seconds.\n\nRULES\n- Localize hooks to each platform\'s culture.\n- Review weekly which post types outperform and shift the mix accordingly.',
        tags: ['social', 'content', 'calendar', 'planning', 'social-media']
      },
      {
        id: 'skill-social-paid-structure',
        title: 'Paid Social Structure: Campaign, Ad Set, Ad',
        content:
          'Paid social works best with a clean account structure so budgets, testing, and learning are controlled.\n\nTHREE-LEVEL STRUCTURE\n1. CAMPAIGN — one objective per campaign (awareness, traffic, engagement, leads, conversions, sales). Do not mix objectives.\n2. AD SET — one audience, one placement set, one budget. Each ad set is a targeting and budget unit.\n3. AD — the creative. Each ad set holds 2-4 ads for creative testing.\n\nGOOD PRACTICE\n- Use CBO (campaign budget optimization) or clearly separate ad-set budgets by priority.\n- Start with broad audiences and let targeting data narrow them.\n- Test one variable at a time: audience, creative, or placement — never all three at once.\n- Respect platform learning phases before judging results.\n\nRULES\n- Every campaign defines its KPI and target CPA/ROAS before launch.\n- Kill losers fast, scale winners gradually (no more than 20-30% budget increase at a time).',
        tags: ['social', 'paid-social', 'ads', 'facebook-ads', 'structure']
      },
      {
        id: 'skill-social-creative-testing',
        title: 'Creative Testing & A/B Framework',
        content:
          'Creative testing improves performance faster than most targeting tweaks.\n\nWHAT TO TEST FIRST\n1. Hook (first 3 seconds / first line).\n2. Format (static vs video vs UGC vs carousel).\n3. Angle (problem, benefit, social proof, price).\n4. CTA wording.\n\nHOW TO RUN A TEST\n- Isolate one variable at a time.\n- Use 3-5 creative variants per ad set with a shared audience and budget.\n- Give the test a defined duration and minimum spend before judging.\n- Compare against the control, not against an arbitrary benchmark.\n\nFREQUENCY PRINCIPLE\n- Refresh creatives before ad fatigue sets in (rising frequency + falling CTR is the signal).\n- Keep a creative pipeline so new variants are always ready.\n\nOUTPUT: a testing matrix (Test | Variable | Variants | Duration | Metric | Result | Decision).',
        tags: ['social', 'creative-testing', 'ab-testing', 'ads', 'optimization']
      },
      {
        id: 'skill-social-audience-matrix',
        title: 'Audience Segmentation Matrix',
        content:
          'Segmentation defines who sees which message so budgets are not wasted on the wrong people.\n\nBUILD A SEGMENT\n1. Demographics: age, location, language.\n2. Behaviors: past buyers, engagers, website visitors, app users.\n3. Interests: categories, pages followed, content engaged.\n4. Lookalikes: modeled audiences from a seed (customers, engagers).\n\nSEGMENT-BY-OFFER MATRIX\n- New audiences: awareness and problem-focused creative.\n- Engagers: retargeting with proof and authority content.\n- Visitors/abandoners: conversion-focused offers and reminders.\n- Customers: upsell, retention, and loyalty content.\n\nRULES\n- Exclude buyers from acquisition campaigns.\n- Keep high-intent segments small and precise.\n- Document each segment\'s size, expected CPA, and the creative matched to it.',
        tags: ['social', 'audience', 'targeting', 'segmentation']
      },
      {
        id: 'skill-social-community',
        title: 'Community Management & Growth Tactics',
        content:
          'Community turns followers into advocates and reduces reliance on paid reach.\n\nDAILY PRACTICE\n- Reply speed matters: answer comments and DMs within hours.\n- End conversations with a next step or question to keep engagement going.\n- Encourage user-generated content: ask for stories, reviews, and photos.\n\nGROWTH TACTICS\n- Comment on and engage with adjacent accounts in the niche.\n- Run polls, Q&As, and challenges to boost reach.\n- Collaborate with micro-influencers and local creators for trust.\n- Use Telegram channels/groups as the owned community hub.\n\nMEASUREMENT\n- Response time, response rate, sentiment, repeat engagers, UGC volume.\n- Track community metrics separate from media metrics.\n\nGUARDRAILS\n- Never buy fake followers or engagement — it destroys reach and trust.\n- Handle complaints publicly with empathy, then move to DM for resolution.',
        tags: ['social', 'community', 'engagement', 'growth', 'influencer']
      },
      {
        id: 'skill-social-reporting-metrics',
        title: 'Social Reporting: Mandatory Metrics',
        content:
          'Report the metrics that prove business impact, with a clear narrative, not a wall of numbers.\n\nCORE METRICS\n- Reach and frequency\n- Engagement rate\n- Click-through rate (CTR)\n- Cost per click (CPC)\n- Cost per acquisition (CPA)\n- Conversion rate\n- Return on ad spend (ROAS)\n- Retention or repeat-purchase behavior\n\nSTRUCTURE OF A REPORT\n1. Executive summary: what happened and why it matters.\n2. Performance vs target for each KPI.\n3. What changed (campaigns, creatives, budget shifts).\n4. Insights: what the data explains.\n5. Recommendations for next period.\n6. Appendix with raw numbers.\n\nRULES\n- Always compare to targets and prior periods, not just absolute numbers.\n- Connect social numbers to business impact where possible (leads, sales, LTV).\n- Flag anomalies and ask "why" rather than just reporting the number.',
        tags: ['social', 'metrics', 'reporting', 'kpi', 'analytics']
      }
    ]
  },

  // =====================================================================
  // 4. CREATIVE CAMPAIGN DIRECTOR
  // =====================================================================
  {
    persona: {
      id: 'nexus-creative-campaign-director',
      name: '🎨 Creative Campaign Director',
      category: 'Creatives',
      knowledgeTags: ['creative', 'campaign', 'ad-copy', 'key-visual', 'storyboard', 'ugc', 'image-prompt', 'video-prompt', 'brand-qa', 'testing'],
      instructions:
        'You are NEXUS, a senior Creative Campaign Director. You convert campaign strategy into production-ready visual and multimedia concepts.\n\nWORKFLOW: Start from a single-minded proposition, develop creative territories, define the key visual and hook, then produce ad copy, storyboards, and AI image and video generation prompts, and close with brand QA and a testing matrix.\n\nCREATIVE OUTPUT CONTRACT: Every creative must define audience, insight, single-minded proposition, hook, visual idea, message hierarchy, CTA, platform, format, and success metric.\n\nOUTPUT CONTRACT: Deliver creative territories, key visual descriptions, headlines and CTAs, production briefs, image generation prompts, video generation prompts, shot lists, aspect-ratio variants for each platform, and a creative testing matrix.\n\nGUARDRAILS: Keep brand identity and tone consistent across all adaptations. Do not produce misleading claims or false testimonials. For AI-generated visuals, flag legal or rights concerns such as likeness or trademark. Prefer original concepts over generic stock-looking AI output.'
    },
    articles: [
      {
        id: 'skill-creative-territories',
        title: 'Creative Territories & Campaign Concepting',
        content:
          'A creative territory is a broad, on-brand direction that a campaign can explore across executions.\n\nDEVELOPING TERRITORIES\n1. Start from the single-minded proposition (one core idea the campaign stands for).\n2. Generate 3-4 territories, each a distinct emotional or rational angle.\n3. Name each territory and describe its mood, tone, visual world, and the audience emotion it triggers.\n\nEXAMPLE\n- Proposition: "Travel booking without hidden fees."\n- Territory A: Radical Honesty (transparent pricing, receipts).\n- Territory B: Stress-Free Escape (relaxation, no surprises).\n- Territory C: Smart Money (savings, best value).\n\nSELECTION\n- Choose the territory that best fits the audience insight and is distinctive from competitors.\n- Validate against the creative output contract before production.\n\nOUTPUT: a territory board (Territory | Mood | Key visual direction | Tone | Risk | Fit).',
        tags: ['creative', 'campaign', 'concepting', 'strategy']
      },
      {
        id: 'skill-creative-key-visual',
        title: 'Key Visual Development',
        content:
          'The key visual is the single image that anchors a campaign and is adapted across all placements.\n\nELEMENTS\n- Central subject (product, person, scene)\n- Visual idea (the metaphor or moment)\n- Color and lighting direction\n- Composition and negative space for copy\n- Logo and branding placement\n\nQUALITY BAR\n- Distinctive: not generic stock photography.\n- On-brand: matches voice, palette, and tone.\n- Legible: works small on mobile feeds and large on billboards.\n- Adaptable: can crop to 1:1, 9:16, 16:9, 4:5.\n\nPROCESS\n1. Write a detailed description of the visual idea.\n2. Generate references and AI image drafts.\n3. Review against the output contract and brand guide.\n4. Lock the master visual, then produce aspect variants.',
        tags: ['creative', 'key-visual', 'design', 'campaign']
      },
      {
        id: 'skill-creative-ad-copy',
        title: 'Ad Copy & CTA Formula',
        content:
          'Ad copy earns attention with the hook and earns the click with clarity.\n\nSTRUCTURE\n1. HOOK (first line / first 3 seconds): a specific promise, a bold fact, a relatable problem, or curiosity.\n2. BODY: the benefit, the proof, and the objection answer in 2-4 short lines.\n3. CTA: one action phrased as benefit ("Get your free audit" not "Click here").\n\nHOOK FORMULAS\n- Outcome promise: "Lose the fee, keep the trip."\n- Specific number: "Our clients save 40% on setup."\n- Counterintuitive: "Your competitor is paying your marketing bill."\n- Question to the reader: "Still tracking sales in a spreadsheet?"\n\nRULES\n- Write for one reader. One idea per ad.\n- Be specific and concrete; avoid empty adjectives.\n- Match the platform\'s format and length.\n- Never make claims you cannot prove.',
        tags: ['creative', 'ad-copy', 'cta', 'headlines', 'copy']
      },
      {
        id: 'skill-creative-video-ugc',
        title: 'Video Storyboard & UGC Scripts',
        content:
          'Video works when it earns the first 3 seconds and tells one clear story.\n\nSTORYBOARD STRUCTURE (15-60s)\n1. Hook (0-3s): stop the scroll.\n2. Setup (3-10s): context and the problem.\n3. Turn (10-40s): the solution or proof in action.\n4. CTA (last 3s): one clear action.\n\nUGC SCRIPTS\n- Write like a real person talks, not a brand.\n- Open with a result or a confession, not a logo.\n- Use handheld framing, natural lighting, authentic pacing.\n- Include a shot list: opening close-up, context wide, product moment, CTA card.\n\nFORMATS\n- 9:16 for Reels/TikTok/Shorts, 1:1 for feed, 16:9 for YouTube/pre-roll.\n- Add captions for sound-off viewing — most social video is watched muted.\n\nOUTPUT: script with timings + shot list per scene + caption text + platform variants.',
        tags: ['creative', 'video', 'storyboard', 'ugc', 'scripts']
      },
      {
        id: 'skill-creative-image-prompts',
        title: 'AI Image Generation Prompts',
        content:
          'AI image prompts produce usable creative when they specify subject, scene, style, and technical quality.\n\nPROMPT STRUCTURE\n1. Subject: what is in the frame and what they are doing.\n2. Scene: setting, lighting, time of day, environment.\n3. Style: photography/video/camera angle/lens, or illustration style.\n4. Quality: resolution, detail, focus, aspect ratio, negative prompts.\n\nEXAMPLE\n"Professional photograph of a young Cambodian family checking travel plans on a phone at a modern airport lounge, warm golden hour light, shallow depth of field, 85mm lens, ultra-detailed, 4k, vertical 9:16."\n\nNEGATIVE PROMPTS TO AVOID\n- Distorted hands/fingers, extra limbs, warped text, watermark, low resolution.\n- Generic: remove "stock photo" look by adding specific details.\n\nRULES\n- Keep brand colors and visual identity in mind.\n- Iterate: generate variants, combine best parts, upscale.\n- Flag rights concerns: real people\'s likeness, trademarks, logos, and copyrighted characters.\n- Generate per platform aspect ratio (1:1, 9:16, 4:5, 16:9).',
        tags: ['creative', 'image-prompt', 'ai', 'generation']
      },
      {
        id: 'skill-creative-video-prompts',
        title: 'AI Video Generation Prompts',
        content:
          'AI video tools need movement and continuity described explicitly to avoid static or broken output.\n\nPROMPT STRUCTURE\n1. Subject and action: who, what they do, and the motion.\n2. Camera: movement (pan, zoom, dolly, handheld), angle, shot size.\n3. Scene and lighting.\n4. Duration and style.\n5. Negative prompts: warping, morphing, extra limbs.\n\nEXAMPLE\n"Slow cinematic dolly-in on a smiling barista pouring latte art at a modern Phnom Penh cafe, soft window light, shallow depth of field, 24fps, subtle motion, 9:16."\n\nRULES\n- Describe ONE primary motion to reduce glitches.\n- Specify the end frame so it ends cleanly.\n- Generate 2-3s test clips before committing to longer shots.\n- Keep text overlays minimal — AI video struggles with accurate text.\n- Check audio and lipsync needs separately; do not rely on generated speech.\n\nOUTPUT: prompt + duration + aspect ratio + reference still per scene.',
        tags: ['creative', 'video-prompt', 'ai', 'generation']
      },
      {
        id: 'skill-creative-output-contract',
        title: 'Creative Output Contract & Brand QA',
        content:
          'Every creative must pass a standard QA review before it ships.\n\nTHE 10-POINT CONTRACT\n1. Audience — who is this for?\n2. Insight — what truth does it tap into?\n3. Single-minded proposition — one core idea.\n4. Hook — does it earn attention in 3 seconds?\n5. Visual idea — is the visual concept clear?\n6. Message hierarchy — most important message first.\n7. CTA — one clear action.\n8. Platform — is it formatted for the placement?\n9. Format — correct ratio, length, and specs.\n10. Success metric — how will this be measured?\n\nBRAND QA CHECKLIST\n- Logo, colors, and typography match the brand guide.\n- Tone matches brand voice.\n- Claims are provable; no false testimonials.\n- Legible at small sizes and with sound off.\n\nPROCESS: review every creative against the contract before production and again before publishing.',
        tags: ['creative', 'output', 'qa', 'brand-qa', 'checklist']
      }
    ]
  },

  // =====================================================================
  // 5. SEO GROWTH ENGINE
  // =====================================================================
  {
    persona: {
      id: 'nexus-seo-growth-engine',
      name: '🔍 SEO Growth Engine',
      category: 'SEO',
      knowledgeTags: ['seo', 'keyword', 'technical-seo', 'on-page', 'schema', 'local-seo', 'content-gap', 'internal-link', 'link-building', 'international-seo'],
      instructions:
        'You are NEXUS, a senior SEO Growth Engine strategist. You improve search visibility, qualified traffic, and conversion performance through technical, on-page, content, and authority work.\n\nWORKFLOW: Audit first (technical, content, and off-page), then map search intent to keywords and pages, then close content gaps, then optimize on-page and internal linking, then build authority, and finally measure and report.\n\nOUTPUT CONTRACT: Deliver a prioritized SEO audit and issue register, keyword universe, keyword-to-page map, content briefs, schema recommendations, internal-link plan, local and international SEO recommendations, a 90-day SEO roadmap, and a measurement framework.\n\nPRIORITIZATION FORMULA: SEO priority = (Business value x Search opportunity x Conversion relevance) / Implementation difficulty. Score actions and sort by this ratio; resolve the highest-priority items first.\n\nGUARDRAILS: Do not guarantee rankings. Do not recommend black-hat tactics, keyword stuffing, or fake backlinks. Verify competitor performance claims with evidence. Keep content useful to humans first and search engines second.'
    },
    articles: [
      {
        id: 'skill-seo-technical-audit',
        title: 'Technical SEO Audit Checklist',
        content:
          'A technical audit finds the issues that block crawling, indexing, and ranking.\n\nCHECKLIST\n1. Crawlability: robots.txt, XML sitemap, crawl errors, no orphan pages.\n2. Indexability: canonical tags, noindex misuse, pagination handling.\n3. Site speed: Core Web Vitals — LCP, INP, CLS; image and JS optimization.\n4. Mobile: responsive layout, tap targets, viewport.\n5. HTTPS and security: valid certificate, no mixed content.\n6. Structured data: schema present and valid.\n7. Duplicate content: near-duplicate pages, thin content.\n8. Internal linking: crawl depth, broken links, anchor text.\n9. International: hreflang if multi-region, correct URL structure.\n10. Analytics: tracking and Search Console verification working.\n\nPRIORITIZING ISSUES\n- Rank each issue by: pages affected, impact on traffic, and effort to fix.\n- Fix blocking issues (noindex on money pages, crawl errors) before optimizations.\n\nOUTPUT: an issue register (Issue | Pages affected | Impact | Effort | Priority | Owner | Status).',
        tags: ['seo', 'technical-seo', 'audit', 'checklist']
      },
      {
        id: 'skill-seo-keyword-research',
        title: 'Keyword Research & Intent Mapping',
        content:
          'Keyword research finds the search terms that match real business opportunities.\n\nPROCESS\n1. List seed topics from products, services, and audience questions.\n2. Expand with tools, autocomplete, related searches, and competitor terms.\n3. Classify intent: informational, commercial, transactional, navigational.\n4. Filter by relevance to the business, not just volume.\n5. Map each keyword to a page (or a new page to build).\n\nINTENT MATTERS\n- Informational: blog and guides.\n- Commercial: comparison, "best", reviews.\n- Transactional: product, booking, price, buy.\n- Match the page type to the intent — do not rank a sales page for an informational query.\n\nOUTPUT: a keyword universe grouped by topic with columns (Keyword | Intent | Volume | Difficulty | Page target | Priority).',
        tags: ['seo', 'keyword', 'research', 'intent']
      },
      {
        id: 'skill-seo-content-gap',
        title: 'Content Gap Analysis',
        content:
          'Gap analysis finds keywords competitors rank for that you do not cover, and weaknesses in existing pages.\n\nMETHOD\n1. Pull your ranking keywords and pages.\n2. Pull competitor keyword coverage for the same topics.\n3. Find: keywords you rank for (protect), keywords competitors rank for that you miss (opportunity), and keywords nobody covers well (quick win).\n4. Also compare content depth: where competitors cover a topic more thoroughly.\n\nOUTPUT\n- Opportunity map: gap keywords grouped by topic with estimated difficulty.\n- Page improvement list: existing pages to expand or refresh.\n- New content briefs for the highest-priority gaps.\n\nRULE\n- Prioritize gaps with business value and reasonable difficulty, not the biggest volume.\n- Apply the SEO prioritization formula to sort the list.',
        tags: ['seo', 'content-gap', 'content', 'competitor-analysis']
      },
      {
        id: 'skill-seo-onpage-internal',
        title: 'On-Page Optimization & Internal Linking',
        content:
          'On-page optimization aligns each page with its target keyword and the searcher\'s intent.\n\nON-PAGE CHECKLIST\n- Title tag: keyword near the front, compelling, under ~60 characters.\n- Meta description: persuasive, includes CTA, under ~155 characters.\n- H1: one per page, matches intent, contains the keyword naturally.\n- Headings (H2/H3): scannable structure.\n- Content: answer the query fully, use the keyword naturally, avoid stuffing.\n- URL: short, readable, keyword-rich.\n- Images: descriptive alt text, compressed.\n- Internal links: link to related pages with descriptive anchors.\n\nINTERNAL LINKING\n- Build hub-and-spoke: pillar pages linking to supporting posts and back.\n- Ensure money pages get internal links from high-traffic content.\n- Fix broken links and redirects.\n\nOUTPUT: a per-page optimization checklist and an internal-link map.',
        tags: ['seo', 'on-page', 'internal-link', 'optimization']
      },
      {
        id: 'skill-seo-schema',
        title: 'Schema Markup Recommendations',
        content:
          'Structured data (schema.org) helps search engines understand a page and unlocks rich results.\n\nHIGH-VALUE TYPES\n- Organization and LocalBusiness: NAP consistency.\n- Product and Offer: price, availability, reviews.\n- FAQ and HowTo: rich snippets (use only if the content truly matches).\n- Article and BlogPosting: author and date.\n- Breadcrumb: navigation clarity.\n- Event, Review, Video: as relevant.\n\nRULES\n- Only mark up content that is actually on the page — no fake markup.\n- Validate with Google\'s Rich Results Test.\n- Keep Organization/LocalBusiness consistent with the entity the brand is building (ties into AEO).\n\nOUTPUT: a schema recommendation table (Page | Type | Fields | Priority).',
        tags: ['seo', 'schema', 'structured-data', 'rich-results']
      },
      {
        id: 'skill-seo-local-international',
        title: 'Local & International SEO (incl. Cambodia)',
        content:
          'Local SEO wins nearby customers; international SEO handles multiple languages and regions.\n\nLOCAL SEO\n- Claim and fully fill Google Business Profile (name, address, phone, hours, photos).\n- Keep NAP (name, address, phone) identical everywhere.\n- Collect and respond to reviews consistently.\n- Build local citations on directories used in the market.\n- Create local landing pages (city/service pages).\n\nINTERNATIONAL SEO\n- Use hreflang for multi-language versions (e.g., en and km).\n- Choose clean URL structure: subdirectory (/kh) vs subdomain.\n- Translate for meaning and local search behavior, not machine translation.\n\nCAMBOIDA NOTE\n- Register on local directories and platforms people actually use.\n- Khmer-language content should match how Cambodians search (often mixed Khmer/English).\n\nOUTPUT: a local citation list + international URL/hreflang plan.',
        tags: ['seo', 'local-seo', 'international-seo', 'cambodia', 'khmer']
      },
      {
        id: 'skill-seo-prioritization',
        title: 'SEO Prioritization Formula',
        content:
          'Not all SEO work is equal. Score every action to find the highest return for the effort.\n\nFORMULA\nSEO priority = (Business value x Search opportunity x Conversion relevance) / Implementation difficulty\n\nSCORE EACH FACTOR 1-5\n- Business value: how much this helps revenue or strategy.\n- Search opportunity: realistic traffic potential given volume and difficulty.\n- Conversion relevance: how likely the traffic converts.\n- Implementation difficulty: effort and risk (higher = lower priority).\n\nEXAMPLE\n- Fixing a broken noindex on a money page: value 5 x opportunity 5 x conversion 5 / difficulty 2 = 62.5 -> do first.\n- New blog post on a low-value topic: value 2 x opportunity 3 x conversion 2 / difficulty 2 = 6 -> defer.\n\nRULES\n- Recompute quarterly as data changes.\n- Always pair priorities with a KPI and a measurement date.\n- Group small quick wins and schedule larger projects by dependency.',
        tags: ['seo', 'prioritization', 'roadmap', 'kpi']
      }
    ]
  },

  // =====================================================================
  // 6. AEO & AI VISIBILITY STRATEGIST
  // =====================================================================
  {
    persona: {
      id: 'nexus-aeo-visibility-strategist',
      name: '🤖 AEO & AI Visibility Strategist',
      category: 'AI',
      knowledgeTags: ['aeo', 'ai-visibility', 'ai-overviews', 'answer-engine', 'entity', 'citation', 'brand-authority', 'voice-search', 'perplexity', 'chatgpt', 'gemini'],
      instructions:
        'You are NEXUS, a senior AEO and AI Visibility strategist. You help brands get accurately mentioned, cited, and recommended by AI answer engines like Google AI Overviews, Gemini, ChatGPT, Claude, Perplexity, and Copilot.\n\nCORE PRINCIPLE: SEO builds discoverability; AEO improves extractability, credibility, and citation probability. Work on both together.\n\nWORKFLOW: Define the commercial objective, research the high-value AI prompts and questions for the brand, review entity clarity and brand authority, assess answer-ready content, check structured data and technical accessibility, map third-party citation opportunities, and create a 30/60/90-day visibility roadmap with measurement.\n\nOUTPUT CONTRACT: Deliver an AI visibility audit, prompt universe, entity gap analysis, citation opportunity map, answer-ready content briefs, source diversification strategy, brand mention roadmap, and an AI referral measurement plan.\n\nGUARDRAILS: Never guarantee inclusion in an AI answer. Separate verified facts from recommendations. Do not recommend artificial mentions, fake reviews, or deceptive citations. Do not treat AEO as a replacement for SEO. Require evidence before making competitor-performance claims.'
    },
    articles: [
      {
        id: 'skill-aeo-overview',
        title: 'What Is AEO & How AI Answer Engines Work',
        content:
          'Answer Engine Optimization (AEO) increases the probability that AI systems mention, cite, and recommend a brand.\n\nHOW AI ANSWERS FORM\n- AI systems (Google AI Overviews, Gemini, ChatGPT, Claude, Perplexity, Copilot) synthesize answers from multiple sources.\n- They prefer sources that are: clear, structured, credible, frequently cited, and authoritative for the entity.\n- They are more likely to cite content that answers the question directly and is corroborated across sources.\n\nAEO VS SEO\n- SEO: get ranked in organic results (discoverability).\n- AEO: get extracted and cited inside AI-generated answers (extractability, credibility, citation probability).\n- They work together. SEO gives you the presence; AEO makes you the source AI chooses.\n\nWHAT TO OPTIMIZE\n- Question-led content, entity clarity, structured data, authoritative mentions, and consistent facts across the web.\n\nKEY RULE\n- You cannot guarantee inclusion in an AI answer. The goal is to maximize the probability by being the most credible, clear, and cited source.',
        tags: ['aeo', 'ai-visibility', 'ai-overviews', 'answer-engine']
      },
      {
        id: 'skill-aeo-prompt-universe',
        title: 'AI Prompt & Query Research',
        content:
          'The prompt universe is the set of AI questions and prompts your audience actually asks about your brand and category.\n\nBUILDING THE PROMPT UNIVERSE\n1. Gather real questions: customer support, sales conversations, forum questions, and people-also-ask.\n2. Add category prompts: "best", "alternatives to", "how does X work", "X vs Y".\n3. Add brand prompts: "is [brand] good", "how much does [brand] cost", "[brand] review".\n4. Organize by: category, intent, difficulty, and the answer source that currently wins.\n\nOUTPUT\n- A categorized prompt list with current winning sources.\n- For each high-value prompt: the ideal answer structure AI should find about you.\n\nUSE\n- Drives answer-ready content briefs.\n- Identifies entity and credibility gaps.\n- Guides which third-party sources you need to win.\n\nRULE: prioritize prompts tied to revenue and conversion intent, not just curiosity.',
        tags: ['aeo', 'prompt', 'query-research', 'content']
      },
      {
        id: 'skill-aeo-entity',
        title: 'Entity & Brand Authority Building',
        content:
          'AI engines connect facts to entities. A clear, consistent entity makes you easier to know, trust, and cite.\n\nENTITY CLARITY\n- Consistent brand name, description, and logo everywhere.\n- Complete structured data: Organization, LocalBusiness, Person, Product.\n- One authoritative profile (website) that AI uses as the canonical source.\n- Consistent NAP and facts across all platforms.\n\nAUTHORITY SIGNALS\n- An "About" page with a plain-language description of who you are and what you do.\n- Founded date, location, leadership, and contact details stated clearly.\n- Recognition, certifications, press mentions, and awards.\n\nBUILDING\n1. Audit where the entity is inconsistent or missing.\n2. Fix the canonical website first.\n3. Standardize facts across directories and social profiles.\n4. Add corroborating content: interviews, case studies, guest posts.\n\nOUTPUT: an entity gap analysis and a consistency checklist.',
        tags: ['aeo', 'entity', 'brand-authority', 'structured-data']
      },
      {
        id: 'skill-aeo-citation',
        title: 'Citation Readiness & Answer-Ready Content',
        content:
          'Answer-ready content is structured so AI can extract a clean, factual answer from it.\n\nANSWER-READY PATTERNS\n- State the answer in the first sentence or a clearly labeled section.\n- Use question headings (H2/H3) matching how people ask.\n- Provide concise definitions, then expand.\n- Include facts, figures, and dates with sources.\n- Use tables and lists for scannable data.\n\nCITATION READINESS\n- Facts must be consistent across your site, profiles, and press.\n- Attribute claims and avoid vague superlatives.\n- Add structured data matching the content (FAQ, Product, HowTo, Organization).\n\nSTRUCTURE EXAMPLE\nH2: "What does [brand] do?"\nParagraph: one clear sentence answer, then detail.\nH2: "How much does [brand] cost?"\nParagraph: concrete pricing statement.\n\nOUTPUT: answer-ready content briefs with the exact Q&A structure for each high-value prompt.',
        tags: ['aeo', 'citation', 'content', 'answer-ready']
      },
      {
        id: 'skill-aeo-thirdparty',
        title: 'Third-Party Mentions & Source Diversification',
        content:
          'AI engines prefer corroborated facts. Being cited on multiple independent, credible sources raises your probability of inclusion.\n\nSOURCE TYPES\n- Press and news: earned coverage on credible outlets.\n- Industry directories and review platforms.\n- Guest content and expert interviews.\n- Community forums and Q&A platforms where experts answer.\n- Academic, government, or partner pages when relevant.\n\nSTRATEGY\n1. Identify the 10-15 sources most trusted in your category.\n2. Prioritize ones where you can realistically earn a mention.\n3. Create shareable proof points: data, case studies, expert commentary.\n4. Pitch and build relationships consistently, not transactionally.\n\nETHICS RULE\n- No artificial mentions, paid link farms, fake reviews, or deceptive citations — they damage the entity and risk penalties.\n\nOUTPUT: a citation opportunity map and a source diversification roadmap.',
        tags: ['aeo', 'mentions', 'third-party', 'authority', 'pr']
      },
      {
        id: 'skill-aeo-audit',
        title: 'AI Visibility Audit Process',
        content:
          'The AI visibility audit scores how likely the brand is to be mentioned, cited, and recommended by AI engines.\n\nAUDIT STEPS\n1. Prompt test: run the brand\'s high-value prompts across AI engines and record which sources are cited.\n2. Entity check: is the brand entity clear and consistent?\n3. Content check: is the answer-ready content present and well-structured?\n4. Technical check: structured data, crawlability, and accessibility.\n5. Authority check: who else mentions the brand and how consistently?\n6. Competitor check: who is cited for your prompts and why.\n7. Score each dimension and rank gaps by the prioritization formula.\n\nOUTPUT\n- A maturity score per dimension.\n- A prioritized gap list with recommended actions.\n- A 30/60/90-day visibility roadmap.\n\nRULE: re-run the audit quarterly; AI behavior and rankings change.',
        tags: ['aeo', 'audit', 'measurement', 'roadmap']
      },
      {
        id: 'skill-aeo-measurement',
        title: 'Measuring AI Referral Traffic',
        content:
          'You can measure AI visibility even though AI answers do not always link.\n\nMEASUREMENT CHANNELS\n- Referral traffic from AI sources in analytics (identify by hostname or campaign tags).\n- Brand and category prompt answer tracking: manually or with tools, record which prompts mention you.\n- Share of voice vs competitors in AI answers.\n- Brand search volume trends (impressions of "brand + review").\n\nMETRICS\n- Number of prompts answered with your brand cited.\n- AI referral sessions, conversions, and revenue.\n- Citation win rate: prompts where you are cited vs total target prompts.\n- Entity consistency score.\n\nREPORTING\n- Track monthly and compare to baseline.\n- Link AI visibility changes to content and authority actions taken.\n\nOUTPUT: an AI visibility dashboard with prompt coverage, citation win rate, and AI referral impact.',
        tags: ['aeo', 'measurement', 'kpi', 'analytics', 'reporting']
      }
    ]
  }
];
