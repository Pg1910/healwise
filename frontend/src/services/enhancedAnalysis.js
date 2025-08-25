// Enhanced Analysis with Mistral Integration
const MISTRAL_API_BASE = 'http://localhost:11434/api/generate';

export async function analyzeWithMistral(userText, conversationHistory = []) {
  console.log('🧠 Enhanced analysis started with Mistral...');
  
  // Add artificial delay to simulate thinking
  await new Promise(resolve => setTimeout(resolve, 1500 + Math.random() * 1000));
  
  try {
    // First try Mistral for deep analysis
    const mistralResponse = await callMistralAPI(userText, conversationHistory);
    if (mistralResponse) {
      return mistralResponse;
    }
  } catch (error) {
    console.warn('Mistral unavailable, using enhanced local analysis:', error);
  }
  
  // Enhanced fallback with rich content
  return generateEnhancedLocalAnalysis(userText, conversationHistory);
}

async function callMistralAPI(userText, conversationHistory) {
  try {
    const contextPrompt = buildContextualPrompt(userText, conversationHistory);
    
    const response = await fetch(MISTRAL_API_BASE, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistral:latest',
        prompt: contextPrompt,
        stream: false,
        options: {
          temperature: 0.7,
          max_tokens: 1000
        }
      })
    });

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.status}`);
    }

    const data = await response.json();
    return parseMistralResponse(data.response, userText);
    
  } catch (error) {
    console.error('Mistral API call failed:', error);
    return null;
  }
}

function buildContextualPrompt(userText, conversationHistory) {
  const historyContext = conversationHistory.length > 0 
    ? `Previous conversation context: ${conversationHistory.slice(-3).map(msg => `${msg.from}: ${msg.text}`).join('\n')}`
    : '';

  return `You are an empathetic mental health companion named HealWise. Analyze this user message and provide a detailed response.

${historyContext}

Current user message: "${userText}"

Please provide:
1. Emotional analysis (detect primary emotions and their intensity 0-1)
2. A deeply empathetic, personalized response that shows understanding
3. 3-4 specific, actionable next steps
4. Ask 1-2 thoughtful follow-up questions to understand their situation better
5. Risk assessment (SAFE, LOW, MODERATE, HIGH, CRISIS)

Be warm, understanding, and avoid generic responses. Show that you're really listening and want to understand their unique situation deeper. Ask questions that encourage them to share more about their feelings, circumstances, or what led to this moment.

Format your response as JSON:
{
  "emotions": {"emotion": probability},
  "supportive_message": "detailed empathetic response with follow-up questions",
  "suggested_next_steps": ["specific actionable step 1", "step 2", "step 3"],
  "risk_level": "SAFE|LOW|MODERATE|HIGH|CRISIS",
  "follow_up_questions": ["thoughtful question 1", "question 2"]
}`;
}

function parseMistralResponse(mistralText, originalText) {
  try {
    // Try to extract JSON from Mistral response
    const jsonMatch = mistralText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      
      return {
        probs: parsed.emotions || analyzeEmotionsLocal(originalText),
        risk: parsed.risk_level || 'SAFE',
        supportive_message: parsed.supportive_message || "I hear you and I'm here with you.",
        suggested_next_steps: parsed.suggested_next_steps || generateDefaultSteps(originalText),
        follow_up_questions: parsed.follow_up_questions || [],
        helpful_resources: getHelpfulResources(),
        recommendations: generateRichRecommendations(originalText, parsed.emotions)
      };
    }
  } catch (error) {
    console.error('Failed to parse Mistral response:', error);
  }
  
  // Fallback if parsing fails
  return generateEnhancedLocalAnalysis(originalText);
}

function generateEnhancedLocalAnalysis(userText, conversationHistory = []) {
  const textLower = userText.toLowerCase();
  const emotions = analyzeEmotionsLocal(userText);
  const primaryEmotion = Object.keys(emotions).reduce((a, b) => emotions[a] > emotions[b] ? a : b);
  
  // Generate contextual response with depth
  const response = generateContextualResponse(userText, emotions, primaryEmotion, conversationHistory);
  
  return {
    probs: emotions,
    risk: assessRiskLevel(userText, emotions),
    supportive_message: response.message,
    suggested_next_steps: response.steps,
    follow_up_questions: response.questions,
    helpful_resources: getHelpfulResources(),
    recommendations: generateRichRecommendations(userText, emotions)
  };
}

function generateContextualResponse(userText, emotions, primaryEmotion, conversationHistory) {
  const textLower = userText.toLowerCase();
  const isFirstMessage = conversationHistory.length === 0;
  const messageCount = conversationHistory.length;
  
  // Add randomization to prevent repetitive responses
  const getRandomFromArray = (arr) => arr[Math.floor(Math.random() * arr.length)];
  
  let message, steps, questions;
  
  if (textLower.includes('lonely') || textLower.includes('alone') || textLower.includes('isolated')) {
    const lonelinessResponses = [
      {
        initial: `I can really hear the loneliness in what you've shared, and I want you to know that reaching out like this shows so much courage. Loneliness can feel like you're on an island, surrounded by people but still feeling disconnected. It's one of the most human experiences, yet it can feel so isolating.

The fact that you're here, sharing this with me, tells me you're looking for connection - and that's a beautiful, brave thing. Can you tell me more about what the loneliness feels like for you? Is it that you're physically alone, or is it more about feeling disconnected even when others are around?`,
        followUp: `The loneliness you're describing sounds really profound. It takes a lot of strength to keep reaching out when you're feeling this disconnected.

I'm wondering - when you think about the loneliness, what do you miss most? Is it having someone who really gets you, or is it more about having people around, or something else entirely?`
      },
      {
        initial: `Loneliness has such a unique ache, doesn't it? It's like being hungry for connection, for understanding, for someone to truly see you. I'm really glad you chose to share this with me because that tells me you haven't given up on connection entirely.

What I'm curious about is how this loneliness shows up in your day-to-day life. Do you find yourself craving deeper conversations, or is it more about wanting companionship for simple moments?`,
        followUp: `I can feel how deeply this loneliness is affecting you. It sounds like you're carrying this feeling pretty consistently.

What would it look like if you felt less alone? I don't mean what should happen, but what would you actually feel or experience differently?`
      },
      {
        initial: `There's something so brave about naming loneliness out loud. It's one of those feelings that can make us feel ashamed, like something is wrong with us, when really it's just a very human signal that we need connection.

I'm struck by the fact that you're here, reaching out. Even in feeling alone, you're taking action toward connection. What's it been like for you to carry this feeling? Has it been building up gradually, or did something specific shift recently?`,
        followUp: `The isolation you're describing sounds really heavy to carry. I imagine it touches many parts of your life.

When you think about the people in your life - are there any who you feel like you could reach toward, even if it feels scary or uncertain?`
      }
    ];

    const stepOptions = [
      [
        "Write a letter to yourself from the perspective of a loving friend - what would they say to you right now?",
        "Take a gentle walk in a public space like a park or café, just to be around the energy of others without pressure",
        "Reach out to one person you haven't talked to in a while, even if it's just to say hello",
        "Consider joining an online community or local group that shares one of your interests"
      ],
      [
        "Set up a video call with someone you trust, even if it's just for 10 minutes",
        "Visit a local library, bookstore, or coffee shop where you can be around people peacefully",
        "Write in a journal about what connection means to you and what you're seeking",
        "Join a virtual event or online workshop related to something you enjoy"
      ],
      [
        "Send a text to someone just to check in on them - sometimes giving connection helps us receive it",
        "Spend time in nature where you might encounter others - parks, hiking trails, community gardens",
        "Look into local meetups, classes, or volunteer opportunities that align with your interests",
        "Practice self-compassion by treating yourself with the same kindness you'd give a lonely friend"
      ]
    ];

    const questionOptions = [
      [
        "What does connection mean to you right now? What would it look like?",
        "Are there people in your life who care about you, even if they feel distant right now?"
      ],
      [
        "When was the last time you felt truly seen and understood by someone?",
        "What's one small step toward connection that feels possible for you today?"
      ],
      [
        "If you could have any kind of conversation right now, what would you want to talk about?",
        "What stops you from reaching out to people you know care about you?"
      ]
    ];

    const responseIndex = messageCount % lonelinessResponses.length;
    const selectedResponse = lonelinessResponses[responseIndex];
    
    message = isFirstMessage ? selectedResponse.initial : selectedResponse.followUp;
    steps = stepOptions[responseIndex];
    questions = questionOptions[responseIndex];
  } else if (textLower.includes('anxious') || textLower.includes('anxiety') || textLower.includes('worry')) {
    const anxietyResponses = [
      {
        initial: `I can sense the weight of anxiety in your words. It takes real courage to reach out when you're feeling this way. Anxiety can feel overwhelming, like your mind is racing with worries that seem bigger than you can handle. I want you to know that what you're experiencing is valid, and you're not alone in feeling this way.

Can you tell me more about what's been triggering these anxious feelings lately? Sometimes it helps to explore what specific situations or thoughts are feeding the anxiety.`,
        followUp: `I'm hearing the anxiety continuing in what you've shared. It sounds like this feeling is really persistent for you right now. That must be exhausting to carry.

What does the anxiety feel like in your body right now? Are you noticing it more in certain situations, or does it feel like it's with you most of the time?`
      },
      {
        initial: `Anxiety can feel like your nervous system is constantly on high alert, can't it? Like you're bracing for something but you're not sure what. The mental energy that takes is enormous. I'm really glad you're here talking about it instead of trying to push through it alone.

What's been on your mind most lately? Sometimes anxiety clusters around specific worries, and sometimes it feels more like a general sense of unease.`,
        followUp: `It sounds like the anxiety is really taking up a lot of space in your experience right now. That hypervigilance can be so draining.

I'm curious - are there moments when the anxiety feels a little quieter, or does it feel pretty constant? Sometimes noticing the fluctuations can give us clues about what helps.`
      },
      {
        initial: `There's something about anxiety that can make you feel like you're living in your head, spinning with worries and what-ifs. It's like your mind is trying to solve problems that haven't even happened yet. The fact that you're reaching out tells me you're looking for some relief from that mental storm.

What's it like inside your head when the anxiety is strongest? Are there particular thoughts or scenarios that your mind keeps returning to?`,
        followUp: `The anxiety you're describing sounds really intense and persistent. It's like your nervous system won't let you rest.

What have you noticed helps, even a little bit? It could be anything - a person, a place, an activity, even just a moment when things felt slightly calmer.`
      }
    ];

    const stepOptions = [
      [
        "Try the 4-7-8 breathing technique: breathe in for 4, hold for 7, out for 8 - repeat 4 times",
        "Use the 5-4-3-2-1 grounding technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste",
        "Write down your anxious thoughts on paper to externalize them from your mind",
        "Take a 10-minute walk outside if possible, focusing on your surroundings rather than your thoughts"
      ],
      [
        "Set a timer for 5 minutes of deep belly breathing - place one hand on chest, one on belly",
        "Try progressive muscle relaxation: tense and release each muscle group for 5 seconds",
        "Create an 'anxiety playlist' of calming music or sounds that help ground you",
        "Practice the 'STOP' technique: Stop, Take a breath, Observe your thoughts, Proceed mindfully"
      ],
      [
        "Use cold water on your wrists or splash your face to activate your vagus nerve",
        "Try the 'worry window' technique: schedule 15 minutes to worry, then redirect when anxiety comes up",
        "Engage your senses with something textured, scented, or soothing to touch",
        "Do gentle stretching or yoga poses that open your chest and release tension"
      ]
    ];

    const questionOptions = [
      [
        "What time of day do you notice the anxiety feels strongest?",
        "Are there any activities or places where the anxiety feels less intense?"
      ],
      [
        "When you think about what's making you anxious, what feels most out of control?",
        "Are there people in your life who help you feel calmer, even just by being around?"
      ],
      [
        "If the anxiety could speak, what do you think it would be trying to protect you from?",
        "What would it feel like to have just 10 minutes without that anxious feeling?"
      ]
    ];

    const responseIndex = messageCount % anxietyResponses.length;
    const selectedResponse = anxietyResponses[responseIndex];
    
    message = isFirstMessage ? selectedResponse.initial : selectedResponse.followUp;
    steps = stepOptions[responseIndex];
    questions = questionOptions[responseIndex];
  } else if (textLower.includes('sad') || textLower.includes('depression') || textLower.includes('down')) {
    message = isFirstMessage
      ? `I can feel the heaviness in what you've shared with me. Depression and sadness can make everything feel harder, like you're moving through thick fog where even simple things require enormous effort. Your feelings are completely valid, and I want you to know that reaching out like this shows incredible strength, even when you might not feel strong at all.

What has this sadness been like for you? Has it been building up over time, or did something specific happen that intensified these feelings?`
      : `The sadness you're describing sounds really profound. It takes a lot of energy to keep going when you're feeling this way, and I can see that you're doing your best.

How long have you been carrying this feeling? And are there moments, even small ones, where the weight feels a little lighter?`;
    
    steps = [
      "Allow yourself to feel the sadness without judgment - emotions need space to be processed",
      "Try gentle movement like stretching or a slow walk around your living space",
      "Practice one small act of self-care today, even if it feels difficult",
      "Reach out to one person you trust, even if it's just to say hello"
    ];
    
    questions = [
      "What does a typical day look like for you when the sadness feels heaviest?",
      "Is there anything that used to bring you joy that feels out of reach right now?"
    ];
  } else if (textLower.includes('overwhelmed') || textLower.includes('too much')) {
    message = isFirstMessage
      ? `It sounds like you're carrying an enormous load right now. When life feels overwhelming, it's like trying to juggle too many things at once while everything keeps getting added to the pile. That feeling of "too much" is your system's way of saying it needs some relief and support.

I'd love to understand more about what's contributing to feeling so overwhelmed. Is it work, relationships, responsibilities, or maybe a combination of different pressures?`
      : `The sense of being overwhelmed seems to be really weighing on you. It's like your cup is overflowing and there's no room for anything else.

Can you help me understand what feels like the most pressing thing on your mind right now? Sometimes breaking down the overwhelm can help us find where to start.`;
    
    steps = [
      "Make a list of everything on your mind, then categorize: urgent vs. important vs. can wait",
      "Choose just ONE small task to focus on today - ignore the rest for now",
      "Practice saying 'no' to any new requests or commitments this week",
      "Set a timer for 10 minutes of deep breathing or meditation"
    ];
    
    questions = [
      "If you could remove just one thing from your plate right now, what would it be?",
      "What support do you have around you that maybe you haven't been able to access?"
    ];
  } else if (textLower.includes('angry') || textLower.includes('frustrated') || textLower.includes('mad')) {
    message = isFirstMessage
      ? `I can feel the intensity of your frustration. Anger is often our heart's way of saying 'this matters to me.' Your feelings are completely valid, and there's usually something important underneath that anger that deserves attention.

What's been building up that's brought you to this point? Sometimes anger is protecting us from feeling hurt, or it's responding to something that feels unfair or wrong.`
      : `The anger you're experiencing sounds really intense. It takes courage to sit with those strong feelings and try to understand them.

What do you think your anger is trying to tell you? Is it pointing to something that needs to change, or a boundary that's been crossed?`;
    
    steps = [
      "Channel this energy through physical activity like walking or exercise",
      "Write out your feelings without editing - let the anger flow onto paper",
      "Practice deep breathing to help manage the intensity",
      "Consider what boundary or change might address the source of anger"
    ];
    
    questions = [
      "What's one thing that's been on your mind that you haven't been able to share with anyone?",
      "How have you been taking care of yourself lately?"
    ];
  } else {
    // Generic responses with variety for any other content
    const genericResponses = [
      {
        initial: `Thank you for sharing what's on your mind with me. I can tell there's something weighing on you, and I want you to know that whatever you're experiencing matters. Sometimes it's hard to put feelings into words, and that's okay too.

I'm here to listen and understand better. Would you feel comfortable sharing more about what brought you here today? What's been on your heart or mind lately?`,
        followUp: `I'm continuing to listen and want to understand your experience more deeply. Every feeling and thought you share helps me better support you through whatever you're going through.

What feels most important for you to talk about right now? Is there something specific that's been weighing on your mind?`
      },
      {
        initial: `I'm really glad you chose to share with me today. There's something in what you've said that tells me you're processing something important. It takes courage to reach out, even when you're not sure exactly what you need.

What's been sitting with you lately? Sometimes just having space to think out loud can help us understand our own thoughts and feelings better.`,
        followUp: `I can sense there's more you're working through. It sounds like you're in a space of reflection or maybe some uncertainty about something.

What would feel most helpful to explore right now? Are you looking to understand something better, or maybe just need someone to listen?`
      },
      {
        initial: `Thank you for trusting me with whatever is on your mind right now. Even if you're not sure exactly how to put it into words, the fact that you're here means something important to you is asking for attention.

I'm curious about what's been occupying your thoughts recently. What brought you here today?`,
        followUp: `I'm hearing that there's something you're working through, and I want to make sure I'm understanding you as clearly as possible.

What aspect of what you're experiencing feels most significant to you right now? Sometimes talking through different angles can help clarify things.`
      }
    ];

    const stepOptions = [
      [
        "Take three deep breaths and notice what you're feeling in your body right now",
        "Consider what one small thing might bring you a moment of peace today",
        "Practice gentle self-compassion by speaking to yourself as you would a good friend",
        "Engage in one activity that usually helps you feel grounded or centered"
      ],
      [
        "Spend a few minutes writing freely about whatever is on your mind, without editing",
        "Take a mindful moment to notice your surroundings and what you can see, hear, and feel",
        "Do something kind for yourself today, however small",
        "Reach out to someone who makes you feel understood, even just to say hello"
      ],
      [
        "Set aside 10 minutes to sit quietly and just be with whatever you're feeling",
        "Go for a walk and let your mind wander without trying to solve anything",
        "Create something - draw, write, make music, or work with your hands",
        "Practice one small act of self-care that feels nurturing right now"
      ]
    ];

    const questionOptions = [
      [
        "What's one thing that's been on your mind that you haven't been able to share with anyone?",
        "How have you been taking care of yourself lately?"
      ],
      [
        "If you could change one thing about how you're feeling right now, what would it be?",
        "What does support look like for you when you're working through something?"
      ],
      [
        "What would it feel like to feel completely understood right now?",
        "Is there something you wish someone would ask you about?"
      ]
    ];

    const responseIndex = messageCount % genericResponses.length;
    const selectedResponse = genericResponses[responseIndex];
    
    message = isFirstMessage ? selectedResponse.initial : selectedResponse.followUp;
    steps = stepOptions[responseIndex];
    questions = questionOptions[responseIndex];
  }
  
  return { message, steps, questions };
}

function analyzeEmotionsLocal(text) {
  const textLower = text.toLowerCase();
  let emotions = { neutral: 0.1 };
  
  // Enhanced emotion detection
  if (textLower.match(/lonely|alone|isolated|disconnected|no one understands|by myself/)) {
    emotions.loneliness = 0.8;
    emotions.sadness = 0.4;
  }
  if (textLower.match(/anxious|anxiety|worry|worried|nervous|stress|stressed|panic/)) {
    emotions.anxiety = 0.8;
    emotions.fear = 0.3;
  }
  if (textLower.match(/sad|sadness|depressed|depression|down|low|empty|hopeless/)) {
    emotions.sadness = 0.8;
    emotions.grief = 0.2;
  }
  if (textLower.match(/angry|anger|mad|frustrated|furious|annoyed|irritated/)) {
    emotions.anger = 0.7;
    emotions.frustration = 0.4;
  }
  if (textLower.match(/overwhelmed|too much|can't cope|exhausted|burned out/)) {
    emotions.overwhelmed = 0.8;
    emotions.fatigue = 0.4;
  }
  if (textLower.match(/happy|joy|excited|great|wonderful|amazing|good/)) {
    emotions.joy = 0.7;
    emotions.optimism = 0.5;
  }
  if (textLower.match(/confused|lost|uncertain|don't know|unclear/)) {
    emotions.confusion = 0.6;
  }
  
  return emotions;
}

function assessRiskLevel(text, emotions) {
  const textLower = text.toLowerCase();
  
  if (textLower.match(/suicide|kill myself|end it all|don't want to live|hurt myself/)) {
    return 'CRISIS';
  }
  if (textLower.match(/can't go on|no point|nothing matters|hate myself/)) {
    return 'HIGH';
  }
  if (emotions.sadness > 0.7 || emotions.anxiety > 0.8 || emotions.overwhelmed > 0.7) {
    return 'MODERATE';
  }
  if (emotions.sadness > 0.4 || emotions.anxiety > 0.5) {
    return 'LOW';
  }
  
  return 'SAFE';
}

function generateRichRecommendations(text, emotions) {
  const textLower = text.toLowerCase();
  
  // Rich, contextual recommendations
  const recommendations = {
    activities: [],
    books: [],
    movies: [],
    nutrition: [],
    resources: [],
    quotes: [],
    exercises: []
  };
  
  if (textLower.includes('lonely') || textLower.includes('alone') || emotions.loneliness > 0.5) {
    recommendations.activities = [
      { name: "Video Call a Friend", description: "Reach out to someone you trust for a virtual coffee", duration: "30 minutes", benefit: "Human connection" },
      { name: "Join an Online Community", description: "Find a Discord, Reddit, or Facebook group with shared interests", duration: "15 minutes", benefit: "Sense of belonging" },
      { name: "Visit a Local Café", description: "Be around people without pressure to interact", duration: "30 minutes", benefit: "Social energy" },
      { name: "Write a Letter", description: "Write to a friend, family member, or even yourself", duration: "20 minutes", benefit: "Connection and reflection" }
    ];
    
    recommendations.books = [
      { title: "The Gifts of Imperfection", author: "Brené Brown", description: "Building authentic connections" },
      { title: "Together: The Healing Power of Human Connection", author: "Vivek Murthy", description: "Understanding loneliness and community" },
      { title: "Social: Why Our Brains Are Wired to Connect", author: "Matthew Lieberman", description: "The science of human connection" }
    ];
    
    recommendations.movies = [
      { title: "Lost in Translation", description: "Beautiful exploration of connection and isolation", mood: "thoughtful", duration: "102 min" },
      { title: "Her", description: "Modern relationships and emotional connection", mood: "reflective", duration: "126 min" },
      { title: "The Way Way Back", description: "Finding your place and people", mood: "heartwarming", duration: "103 min" }
    ];
    
    recommendations.nutrition = [
      { name: "Warm Tea Ritual", benefit: "Comforting self-care practice", timing: "Anytime" },
      { name: "Comfort Food in Moderation", benefit: "Emotional soothing", timing: "When needed", examples: "Soup, warm bread, chocolate" },
      { name: "Social Eating", benefit: "Connection opportunity", timing: "Meals", examples: "Order with a friend online, cook while video calling" }
    ];
    
    recommendations.quotes = [
      "The greatest thing in the world is to know how to belong to oneself. - Michel de Montaigne",
      "We are all alone, born alone, die alone, and—in spite of True Romance magazines—we shall all someday look back on our lives and see that, in spite of our company, we were alone the whole way. - Hunter S. Thompson",
      "The eternal quest of the individual human being is to shatter his loneliness. - Norman Cousins"
    ];
    
    recommendations.exercises = [
      { name: "Walking in Public Spaces", description: "Gentle movement around others", duration: "20 minutes" },
      { name: "Group Fitness Class (Online)", description: "Exercise with virtual community", duration: "30 minutes" },
      { name: "Dance to Music", description: "Express yourself freely", duration: "15 minutes" }
    ];
  } else if (textLower.includes('anxious') || emotions.anxiety > 0.5) {
    recommendations.activities = [
      { name: "4-7-8 Breathing", description: "Inhale 4, hold 7, exhale 8 seconds", duration: "5 minutes", benefit: "Activates calm response" },
      { name: "Progressive Muscle Relaxation", description: "Tense and release each muscle group", duration: "15 minutes", benefit: "Physical anxiety relief" },
      { name: "Mindful Walking", description: "Slow walk focusing on each step", duration: "10 minutes", benefit: "Grounds you in present" }
    ];
    
    recommendations.books = [
      { title: "The Anxiety and Worry Workbook", author: "David A. Clark", description: "Practical CBT techniques" },
      { title: "Dare: The New Way to End Anxiety", author: "Barry McDonagh", description: "Face anxiety with acceptance" },
      { title: "When Panic Attacks", author: "David D. Burns", description: "Drug-free techniques for anxiety" }
    ];
    
    recommendations.movies = [
      { title: "Inside Out", description: "Understanding emotions", mood: "calming", duration: "95 min" },
      { title: "My Neighbor Totoro", description: "Peaceful Studio Ghibli film", mood: "serene", duration: "86 min" },
      { title: "The Secret Garden", description: "Healing through nature", mood: "uplifting", duration: "101 min" }
    ];
    
    recommendations.nutrition = [
      { name: "Chamomile Tea", benefit: "Natural calming effects", timing: "Evening" },
      { name: "Dark Chocolate (70%+)", benefit: "Reduces stress hormones", timing: "Afternoon" },
      { name: "Magnesium-rich foods", benefit: "Muscle relaxation", examples: "Almonds, spinach, avocado" }
    ];
    
    recommendations.quotes = [
      "You are braver than you believe, stronger than you seem, and smarter than you think. - A.A. Milne",
      "Anxiety is the dizziness of freedom. - Søren Kierkegaard",
      "Nothing diminishes anxiety faster than action. - Walter Anderson"
    ];
    
    recommendations.exercises = [
      { name: "Gentle Yoga", description: "Child's pose, cat-cow, legs up wall", duration: "20 minutes" },
      { name: "Tai Chi", description: "Slow, flowing movements", duration: "15 minutes" },
      { name: "Swimming", description: "Rhythmic, meditative exercise", duration: "30 minutes" }
    ];
  }
  
  if (textLower.includes('sad') || emotions.sadness > 0.5) {
    recommendations.activities = [
      { name: "Gratitude Journaling", description: "Write 3 things you're grateful for", duration: "10 minutes", benefit: "Shifts focus to positive" },
      { name: "Creative Expression", description: "Draw, paint, write, or sing", duration: "30 minutes", benefit: "Emotional release" },
      { name: "Nature Connection", description: "Sit outside or by a window", duration: "15 minutes", benefit: "Natural mood boost" }
    ];
    
    recommendations.books = [
      { title: "The Upward Spiral", author: "Alex Korb", description: "Neuroscience of depression recovery" },
      { title: "Feeling Good", author: "David D. Burns", description: "CBT for depression" },
      { title: "The Gifts of Imperfection", author: "Brené Brown", description: "Self-compassion and worth" }
    ];
    
    recommendations.movies = [
      { title: "The Pursuit of Happyness", description: "Hope and resilience", mood: "inspiring", duration: "117 min" },
      { title: "Julie & Julia", description: "Finding passion in daily life", mood: "uplifting", duration: "123 min" },
      { title: "Soul", description: "Finding meaning and purpose", mood: "thoughtful", duration: "100 min" }
    ];
    
    recommendations.quotes = [
      "The wound is the place where the Light enters you. - Rumi",
      "Every storm runs out of rain. - Maya Angelou",
      "You are allowed to be both a masterpiece and a work in progress simultaneously. - Sophia Bush"
    ];
  }
  
  // Always include crisis resources
  recommendations.resources = [
    "Crisis Text Line: Text HOME to 741741 (free 24/7 support)",
    "National Suicide Prevention Lifeline: 988",
    "SAMHSA National Helpline: 1-800-662-4357",
    "Mental Health America: mhanational.org",
    "NAMI (National Alliance on Mental Illness): nami.org"
  ];
  
  return recommendations;
}

function getHelpfulResources() {
  return [
    "Crisis Text Line: Text HOME to 741741 (free 24/7 support)",
    "National Suicide Prevention Lifeline: 988",
    "SAMHSA National Helpline: 1-800-662-4357",
    "Mental Health America: mhanational.org",
    "Psychology Today Therapist Finder: psychologytoday.com"
  ];
}
