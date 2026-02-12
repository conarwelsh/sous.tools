import { Injectable, Inject } from '@nestjs/common';
import { DatabaseService } from '../../core/database/database.service.js';
import {
  recipes,
  recipeIngredients,
  ingredients,
  recipeSteps,
} from '../../core/database/schema.js';
import { eq, and } from 'drizzle-orm';
import { logger } from '@sous/logger';
import { config } from '@sous/config';
import { GoogleGenerativeAI } from '@google/generative-ai';

@Injectable()
export class IngestionService {
  private genAI: GoogleGenerativeAI | undefined;

  constructor(
    @Inject(DatabaseService) private readonly dbService: DatabaseService,
  ) {
    const apiKey = config.ai.googleGenerativeAiApiKey;
    if (apiKey) {
      logger.info(
        `[AI Ingestion] Initializing Gemini with API Key (length: ${apiKey.length})`,
      );
      this.genAI = new GoogleGenerativeAI(apiKey);
    } else {
      logger.warn(
        '[AI Ingestion] GOOGLE_GENERATIVE_AI_API_KEY is not set in configuration.',
      );
    }
  }

  async processGoogleDriveRecipe(
    recipeId: string,
    organizationId: string,
    driver: any,
  ) {
    logger.info(
      `[AI Ingestion] Processing Google Drive recipe ${recipeId} for org ${organizationId}`,
    );

    if (!this.genAI) {
      logger.error(
        '[AI Ingestion] Cannot process recipe: Gemini AI not initialized (check API key)',
      );
      return { success: false, error: 'AI_NOT_CONFIGURED' };
    }

    const recipe = await this.dbService.db.query.recipes.findFirst({
      where: and(
        eq(recipes.id, recipeId),
        eq(recipes.organizationId, organizationId),
      ),
    });

    if (!recipe) throw new Error('Recipe not found');
    if (!recipe.sourceId || !recipe.sourceType)
      throw new Error('Recipe source missing');

    try {
      // 1. Download Content
      const fileMetadata = await driver.getFile(recipe.sourceId);
      logger.debug(
        `[AI Ingestion] Downloading file ${recipe.sourceId} (${fileMetadata.mimeType})`,
      );
      const content = await driver.downloadFile(
        recipe.sourceId,
        fileMetadata.mimeType,
      );

      // 2. Initialize Gemini
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
      });

      // 3. Prepare Prompt
      const prompt = `
        You are a professional culinary IP extractor. Your goal is to convert unstructured recipe documents into structured data.
        Analyze the provided document and extract the following:
        - name: A clean, descriptive name for the recipe (e.g., "Sourdough Boule").
        - yieldAmount: The numeric quantity the recipe produces.
        - yieldUnit: The unit of yield (e.g., "portions", "loaves", "kg").
        - ingredients: An array of objects with { name, amount, unit }. Normalize units where possible (g, ml, each).
        - steps: An array of objects with { order, instruction, timerDuration (in seconds, or null) }.

        Return ONLY a strictly valid JSON object. No markdown formatting, no conversational text.
      `;

      let result;
      try {
        if (content.type === 'text') {
          result = await model.generateContent([prompt, content.data]);
        } else {
          result = await model.generateContent([
            prompt,
            {
              inlineData: {
                data: content.data.toString('base64'),
                mimeType: content.mimeType,
              },
            },
          ]);
        }
      } catch (aiError: any) {
        logger.error(
          `[AI Ingestion] Gemini API Call failed: ${aiError.message}`,
          {
            status: aiError.status,
            statusText: aiError.statusText,
            details: aiError.errorDetails,
          },
        );

        if (aiError.status === 404) {
          logger.error(
            '[AI Ingestion] 404 Error: This usually means the "Generative Language API" is not enabled in your Google Cloud Project or the model ID is restricted for your key.',
          );
        }

        throw aiError;
      }

      const response = result.response;
      const text = response.text();

      // Clean up potential markdown formatting if Gemini included it
      let jsonStr = text.trim();
      if (jsonStr.includes('```')) {
        const match = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (match) {
          jsonStr = match[1];
        }
      }

      // If it still fails, try to find the first { and last }
      try {
        const firstBrace = jsonStr.indexOf('{');
        const lastBrace = jsonStr.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1) {
          jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
        }
      } catch (e) {
        // Fallback to original string
      }

      const extractedData = JSON.parse(jsonStr);

      // 4. Update Database in a Transaction
      await this.dbService.db.transaction(async (tx) => {
        // Update recipe metadata
        await tx
          .update(recipes)
          .set({
            name: extractedData.name || recipe.name,
            yieldAmount: extractedData.yieldAmount,
            yieldUnit: extractedData.yieldUnit,
            updatedAt: new Date(),
          })
          .where(eq(recipes.id, recipeId));

        // Delete existing ingredients/steps if re-processing
        await tx
          .delete(recipeIngredients)
          .where(eq(recipeIngredients.recipeId, recipeId));
        await tx.delete(recipeSteps).where(eq(recipeSteps.recipeId, recipeId));

        // Upsert Ingredients and Link to Recipe
        if (extractedData.ingredients) {
          for (const ing of extractedData.ingredients) {
            // Find or Create Ingredient
            let ingredient = await tx.query.ingredients.findFirst({
              where: and(
                eq(ingredients.name, ing.name),
                eq(ingredients.organizationId, organizationId),
              ),
            });

            if (!ingredient) {
              const [newIng] = await tx
                .insert(ingredients)
                .values({
                  name: ing.name,
                  organizationId,
                  baseUnit: ing.unit || 'each',
                })
                .returning();
              ingredient = newIng;
            }

            // Link to Recipe
            await tx.insert(recipeIngredients).values({
              recipeId,
              ingredientId: ingredient.id,
              amount: ing.amount || 0,
              unit: ing.unit || (ingredient as any).baseUnit,
            });
          }
        }

        // Insert Steps
        if (extractedData.steps) {
          for (const step of extractedData.steps) {
            await tx.insert(recipeSteps).values({
              recipeId,
              order: step.order,
              instruction: step.instruction,
              timerDuration: step.timerDuration,
            });
          }
        }
      });

      logger.info(
        `[AI Ingestion] Successfully processed and structured recipe: ${extractedData.name}`,
      );
      return { success: true };
    } catch (error) {
      logger.error(
        `[AI Ingestion] Failed to process recipe ${recipeId}`,
        error,
      );
      throw error;
    }
  }
}
