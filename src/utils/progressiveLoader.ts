
import { logger } from "./logger";

export interface LoadingStep {
  id: string;
  name: string;
  description: string;
  weight: number; // relative weight for progress calculation
  status: 'pending' | 'loading' | 'completed' | 'error';
  error?: string;
}

export class ProgressiveLoader {
  private steps: LoadingStep[] = [];
  private totalWeight = 0;
  private onProgressCallback?: (progress: number, currentStep?: LoadingStep) => void;

  constructor(steps: Omit<LoadingStep, 'status'>[], onProgress?: (progress: number, currentStep?: LoadingStep) => void) {
    this.steps = steps.map(step => ({ ...step, status: 'pending' as const }));
    this.totalWeight = steps.reduce((sum, step) => sum + step.weight, 0);
    this.onProgressCallback = onProgress;
    
    logger.debug('ProgressiveLoader', 'Initialized progressive loader', {
      stepsCount: this.steps.length,
      totalWeight: this.totalWeight
    });
  }

  private updateProgress() {
    const completedWeight = this.steps
      .filter(step => step.status === 'completed')
      .reduce((sum, step) => sum + step.weight, 0);
    
    const progress = this.totalWeight > 0 ? (completedWeight / this.totalWeight) * 100 : 0;
    const currentStep = this.steps.find(step => step.status === 'loading');
    
    logger.debug('ProgressiveLoader', 'Progress updated', {
      progress: Math.round(progress),
      currentStep: currentStep?.name,
      completedSteps: this.steps.filter(s => s.status === 'completed').length
    });

    this.onProgressCallback?.(progress, currentStep);
  }

  async executeStep(stepId: string, executor: () => Promise<void>): Promise<void> {
    const step = this.steps.find(s => s.id === stepId);
    if (!step) {
      logger.error('ProgressiveLoader', `Step ${stepId} not found`);
      throw new Error(`Step ${stepId} not found`);
    }

    step.status = 'loading';
    this.updateProgress();

    logger.info('ProgressiveLoader', `Starting step: ${step.name}`, {
      stepId,
      description: step.description
    });

    try {
      await executor();
      step.status = 'completed';
      logger.info('ProgressiveLoader', `Completed step: ${step.name}`, { stepId });
    } catch (error) {
      step.status = 'error';
      step.error = error instanceof Error ? error.message : 'Unknown error';
      logger.error('ProgressiveLoader', `Failed step: ${step.name}`, error instanceof Error ? error : new Error(String(error)), {
        stepId,
        errorMessage: step.error
      });
      throw error;
    } finally {
      this.updateProgress();
    }
  }

  async executeAll(executors: Record<string, () => Promise<void>>): Promise<void> {
    logger.info('ProgressiveLoader', 'Starting progressive execution of all steps');

    for (const step of this.steps) {
      const executor = executors[step.id];
      if (!executor) {
        logger.error('ProgressiveLoader', `No executor found for step ${step.id}`);
        throw new Error(`No executor found for step ${step.id}`);
      }

      await this.executeStep(step.id, executor);
    }

    logger.info('ProgressiveLoader', 'All steps completed successfully');
  }

  getProgress(): number {
    const completedWeight = this.steps
      .filter(step => step.status === 'completed')
      .reduce((sum, step) => sum + step.weight, 0);
    
    return this.totalWeight > 0 ? (completedWeight / this.totalWeight) * 100 : 0;
  }

  getSteps(): LoadingStep[] {
    return [...this.steps];
  }

  getCurrentStep(): LoadingStep | undefined {
    return this.steps.find(step => step.status === 'loading');
  }

  isCompleted(): boolean {
    return this.steps.every(step => step.status === 'completed');
  }

  hasErrors(): boolean {
    return this.steps.some(step => step.status === 'error');
  }
}
