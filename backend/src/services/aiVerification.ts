import OpenAI from 'openai';
import axios from 'axios';

export interface CharityData {
  charityId: number;
  name: string;
  description: string;
  ipfsHash: string;
  walletAddress: string;
  imageUrls?: string[]; // Optional: uploaded campaign images
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

      // Step 4: Verify uploaded images if provided
      const imageVerification = charity.imageUrls && charity.imageUrls.length > 0
        ? await this.verifyImagesWithAI(charity)
        : { score: 0, valid: false, reasoning: 'No images provided' };

      // Step 5: Calculate final score
      const finalScore = this.calculateFinalScore(
        analysis,
        onlinePresence,
        ipfsVerification,
        imageVerification
      );

      // Step 6: Determine approval
      const approved = finalScore >= 60; // Threshold: 60/100

      const result: VerificationResult = {
        score: finalScore,
        approved,
        reasoning: `${analysis.reasoning} | Image Analysis: ${imageVerification.reasoning}`,
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
   * Verify uploaded images using GPT-4 Vision API
   */
  private async verifyImagesWithAI(charity: CharityData): Promise<{
    score: number;
    valid: boolean;
    reasoning: string;
  }> {
    if (!charity.imageUrls || charity.imageUrls.length === 0) {
      return { score: 0, valid: false, reasoning: 'No images provided' };
    }

    console.log(`📸 Analyzing ${charity.imageUrls.length} uploaded images with AI Vision...`);

    try {
      // Prepare image content for GPT-4 Vision
      const imageContent = charity.imageUrls.map(url => ({
        type: 'image_url' as const,
        image_url: {
          url: url,
          detail: 'high' as const
        }
      }));

      const prompt = `You are an AI image verification expert for a charity platform. Analyze the following images uploaded for this charity campaign:

Charity Name: ${charity.name}
Stated Purpose: ${charity.description}

Your task is to verify:
1. **Relevance**: Do the images relate to the charity's stated purpose?
2. **Authenticity**: Do the images appear genuine (not stock photos, AI-generated, or misleading)?
3. **Appropriateness**: Are the images professional and suitable for a charity campaign?
4. **Quality**: Are the images clear, well-composed, and trustworthy?
5. **Consistency**: Do all images support the same charitable cause?

Evaluate strictly but fairly. Look for:
- ✅ Real photos of charity work, beneficiaries, facilities, or activities
- ✅ Images that directly support the stated mission
- ✅ Professional yet authentic documentation
- ❌ Stock photos or generic images
- ❌ AI-generated or heavily edited misleading images
- ❌ Images unrelated to the cause
- ❌ Low-quality or suspicious content

Provide your response in JSON format:
{
  "imageScore": <number 0-100>,
  "valid": <boolean>,
  "reasoning": "<brief explanation of what you see and whether it matches the cause>",
  "concerns": ["<any concerns or red flags>"]
}

A score of 70+ means images strongly support the charity's legitimacy.`;

      const response = await this.openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              ...imageContent
            ]
          }
        ],
        max_tokens: 1000,
        temperature: 0.3,
      });

      const content = response.choices[0].message.content || '{}';

      // Extract JSON from response
      let result: any;
      try {
        // Try to parse as JSON directly
        result = JSON.parse(content);
      } catch {
        // If not pure JSON, try to extract JSON from markdown code block
        const jsonMatch = content.match(/```json\s*([\s\S]*?)\s*```/) || content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[1] || jsonMatch[0]);
        } else {
          throw new Error('Failed to parse AI response');
        }
      }

      const imageScore = result.imageScore || result.score || 50;
      const valid = result.valid || imageScore >= 70;
      const reasoning = result.reasoning || 'Image analysis completed';

      console.log(`📸 Image verification: Score ${imageScore}/100, Valid: ${valid}`);

      return {
        score: imageScore,
        valid,
        reasoning
      };

    } catch (error) {
      console.error('Image verification error:', error);
      // Don't fail the entire verification if image analysis fails
      return {
        score: 0,
        valid: false,
        reasoning: 'Image analysis failed - technical error'
      };
    }
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
    ipfsVerification: { valid: boolean },
    imageVerification: { score: number; valid: boolean }
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

    // Image verification - SIGNIFICANT impact on score
    if (imageVerification.score > 0) {
      // Images are weighted heavily (up to +20 or -10 points)
      if (imageVerification.valid && imageVerification.score >= 70) {
        // Great images = significant boost
        score += 20;
      } else if (imageVerification.score >= 50) {
        // Decent images = small boost
        score += 10;
      } else if (imageVerification.score < 30) {
        // Bad/misleading images = penalty
        score -= 15;
      }
    }

    // Penalty for red flags
    score -= (aiAnalysis.flags.length * 5);

    // Ensure score is between 0-100
    return Math.max(0, Math.min(100, Math.round(score)));
  }
}
