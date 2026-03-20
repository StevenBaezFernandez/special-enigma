import { Injectable, Logger, Optional } from '@nestjs/common';

export interface SagaStep<T> {
  name: string;
  invoke(context: T): Promise<void>;
  compensate(context: T): Promise<void>;
}

export abstract class Saga<T> {
  protected steps: SagaStep<T>[] = [];

  constructor(public readonly context: T) {}

  addStep(step: SagaStep<T>): void {
    this.steps.push(step);
  }

  getSteps(): SagaStep<T>[] {
    return this.steps;
  }
}

export interface SagaState {
  id: string;
  sagaName: string;
  context: any;
  currentStepIndex: number;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'COMPENSATING' | 'COMPENSATED' | 'FAILED';
  executedSteps: string[];
}

export abstract class SagaPersistence {
  abstract save(state: SagaState): Promise<void>;
  abstract findById(id: string): Promise<SagaState | null>;
}

@Injectable()
export class SagaOrchestrator {
  private readonly logger = new Logger(SagaOrchestrator.name);

  constructor(
    @Optional()
    private readonly persistence?: SagaPersistence
  ) {}

  /**
   * Executes a Saga.
   */
  async execute<T>(saga: Saga<T>): Promise<void> {
    const executedSteps: SagaStep<T>[] = [];
    const steps = saga.getSteps();
    const sagaId = `saga-${Date.now()}`; // logic to generate ID

    this.logger.log(`Starting Saga execution ${sagaId} with ${steps.length} steps`);

    try {
      for (let i = 0; i < steps.length; i++) {
        const step = steps[i];
        await this.persistState(sagaId, { currentStepIndex: i, status: 'RUNNING' });

        this.logger.debug(`Executing step: ${step.name}`);
        await step.invoke(saga.context);
        executedSteps.push(step);

        await this.persistState(sagaId, { status: i === steps.length - 1 ? 'COMPLETED' : 'RUNNING', executedSteps: executedSteps.map(s => s.name) });
      }
      this.logger.log(`Saga ${sagaId} completed successfully`);
    } catch (error) {
      this.logger.error(`Saga ${sagaId} step failed, initiating compensation...`, error);
      await this.persistState(sagaId, { status: 'COMPENSATING' });
      // Compensate in reverse order
      for (const step of executedSteps.reverse()) {
        this.logger.warn(`Compensating step: ${step.name}`);
        try {
          await step.compensate(saga.context);
          await this.persistState(sagaId, { status: 'COMPENSATING' });
        } catch (compError) {
          this.logger.error(`Compensation failed for step ${step.name}`, compError);
          // In production, this should probably alert or save to a dead-letter queue for manual intervention
        }
      }
      await this.persistState(sagaId, { status: 'COMPENSATED' });
      throw error;
    }
  }

  private async persistState(id: string, state: Partial<SagaState>): Promise<void> {
    if (this.persistence) {
       const existing = await this.persistence.findById(id);
       const newState: SagaState = {
         id,
         sagaName: existing?.sagaName || 'unknown',
         context: state.context || existing?.context,
         currentStepIndex: state.currentStepIndex ?? existing?.currentStepIndex ?? 0,
         status: state.status || existing?.status || 'PENDING',
         executedSteps: state.executedSteps || existing?.executedSteps || []
       };
       await this.persistence.save(newState);
    }
    this.logger.verbose(`[Saga Persistence] State updated for ${id}: ${state.status}`);
  }
}
