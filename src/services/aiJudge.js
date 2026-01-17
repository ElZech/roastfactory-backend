const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Score two roasts using AI
 * @param {string} prompt - The roast prompt
 * @param {string} roast1 - First player's roast
 * @param {string} roast2 - Second player's roast
 * @returns {Promise<Object>} Scoring results
 */
async function scoreRoasts(prompt, roast1, roast2) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { 
          role: "system", 
          content: `You are a brutal roast battle judge. Score each roast on:
- Savagery (how brutal/cutting)
- Creativity (originality)
- Delivery (flow and word choice)
- Relevance (staying on topic)

Respond ONLY with valid JSON in this exact format:
{
  "roast1_score": 75,
  "roast2_score": 82,
  "roast1_breakdown": "Savagery: 8/10, Creativity: 7/10, Delivery: 7/10, Relevance: 8/10",
  "roast2_breakdown": "Savagery: 9/10, Creativity: 8/10, Delivery: 8/10, Relevance: 8/10",
  "commentary": "Short savage comment about the round winner"
}`
        },
        { 
          role: "user", 
          content: `Prompt: "${prompt}"\n\nRoast 1: "${roast1}"\n\nRoast 2: "${roast2}"\n\nJudge these roasts and respond with JSON only.`
        }
      ],
      max_tokens: 300,
      temperature: 0.8
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // Extract JSON from response
    let jsonStr = aiResponse.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '');
    }
    
    const scores = JSON.parse(jsonStr);
    
    // Ensure no ties
    if (scores.roast1_score === scores.roast2_score) {
      const bonus = Math.floor(Math.random() * 5) + 1;
      scores.roast1_score += bonus;
      console.log(`🎲 Tie broken! Added ${bonus} bonus points to Player 1`);
    }
    
    return scores;
    
  } catch (error) {
    console.error('AI scoring error:', error);
    throw error;
  }
}

module.exports = { scoreRoasts };