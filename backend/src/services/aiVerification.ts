import OpenAI from 'openai';
import axios from 'axios';

export interface CharityData {
  charityId: number;
  name: string;
  description: string;
  ipfsHash: string;
  walletAddress: string;
}

export interface VerificationResult {
  score: number;
  approved: boolean;
  reasoning: string;
  flags: string[];
}

export class AIVerificationService {
  private openai: OpenAI;

  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY environment variable is required');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Main verification function
   */
  async verifyCharity(charity: CharityData): Promise<VerificationResult> {
    console.log(`🤖 Starting AI verification for charity ID ${charity.charityId}: ${charity.name}`);

    try {
      // Step 1: Analyze charity information
      const analysis = await this.analyzeCharityWithAI(charity);

      // Step 2: Check online presence (optional but recommended)
      const onlinePresence = await this.checkOnlinePresence(charity.name);

      // Step 3: Verify IPFS documents if provided
      const ipfsVerification = charity.ipfsHash
        ? await this.verifyIPFSDocuments(charity.ipfsHash)
        : { valid: false, note: 'No documents provided' };

      // Step 4: Calculate final score
      const finalScore = this.calculateFinalScore(analysis, onlinePresence, ipfsVerification);

      // Step 5: Determine approval
      const approved = finalScore >= 60; // Threshold: 60/100

      const result: VerificationResult = {
        score: finalScore,
        approved,
        reasoning: analysis.reasoning,
        flags: analysis.flags,
      };

      console.log(`✅ Verification complete: Score ${finalScore}/100, Approved: ${approved}`);
      return result;

    } catch (error) {
      console.error('❌ AI Verification error:', error);
      throw error;
    }
  }

  /**
   * Use OpenAI to analyze charity legitimacy
   */
  private async analyzeCharityWithAI(charity: CharityData): Promise<{
    score: number;
    reasoning: string;
    flags: string[];
  }> {
    const prompt = `You are an AI charity verification expert. Analyze the following charity registration and provide a legitimacy assessment.

Charity Name: ${charity.name}
Description: ${charity.description}
Wallet Address: ${charity.walletAddress}
IPFS Documents: ${charity.ipfsHash || 'None provided'}

Evaluate based on:
1. Name credibility (does it sound like a real charity?)
2. Description quality (detailed, specific, professional?)
3. Red flags (scam indicators, vague language, unrealistic claims)
4. Document provision (IPFS hash provided or not)

Provide your response in JSON format:
{
  "baseScore": <number 0-100>,
  "reasoning": "<brief explanation>",
  "flags": ["<any red flags found>"]
}

Be strict but fair. A score of 60+ means likely legitimate.`;

    const response = await this.openai.chat.completions.create({
      model: process.env.AI_MODEL || 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: 'You are a charity verification AI. Respond only with valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      response_format: { type: 'json_object' },
    });

    const result = JSON.parse(response.choices[0].message.content || '{}');

    return {
      score: result.baseScore || 50,
      reasoning: result.reasoning || 'AI analysis completed',
      flags: result.flags || [],
    };
  }

  /**
   * Check if charity has online presence (optional enhancement)
   */
  private async checkOnlinePresence(charityName: string): Promise<{
    found: boolean;
    sources: string[];
  }> {
    // This is a simplified version. For production, use Serper API or similar
    // For now, we'll give a small bonus if the name looks professional

    const hasWebIndicators = charityName.toLowerCase().includes('foundation') ||
                            charityName.toLowerCase().includes('fund') ||
                            charityName.toLowerCase().includes('charity') ||
                            charityName.toLowerCase().includes('relief');

    return {
      found: hasWebIndicators,
      sources: hasWebIndicators ? ['Name includes charity indicators'] : [],
    };
  }

  /**
   * Verify IPFS documents (check if accessible)
   */
  private async verifyIPFSDocuments(ipfsHash: string): Promise<{
    valid: boolean;
    note: string;
  }> {
    if (!ipfsHash || ipfsHash.length < 10) {
      return { valid: false, note: 'Invalid IPFS hash' };
    }

    try {
      // Try to access IPFS content
      const ipfsUrl = ipfsHash.startsWith('http')
        ? ipfsHash
        : `https://ipfs.io/ipfs/${ipfsHash}`;

      const response = await axios.head(ipfsUrl, { timeout: 5000 });

      if (response.status === 200) {
        return { valid: true, note: 'IPFS documents accessible' };
      }
    } catch (error) {
      console.log('IPFS verification failed (not critical):', error);
    }

    return { valid: false, note: 'IPFS documents not accessible' };
  }

  /**
   * Calculate final verification score
   */
  private calculateFinalScore(
    aiAnalysis: { score: number; flags: string[] },
    onlinePresence: { found: boolean },
    ipfsVerification: { valid: boolean }
  ): number {
    let score = aiAnalysis.score;

    // Bonus for online presence
    if (onlinePresence.found) {
      score += 10;
    }

    // Bonus for IPFS documents
    if (ipfsVerification.valid) {
      score += 10;
    }

    // Penalty for red flags
    score -= (aiAnalysis.flags.length * 5);

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
