import { Injectable } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { BaseModel } from '@/core/models';

@Injectable()
export class SessionManagerService {
  private activeSessions: Map<string, {
    model: BaseModel<any>,
    abortController: AbortController
  }> = new Map();

  createSession(model: BaseModel<any>): string {
    const sessionId = uuidv4();
    const abortController = new AbortController();
    
    this.activeSessions.set(sessionId, { 
      model, 
      abortController
    });
    
    return sessionId;
  }

  getSession(sessionId: string) {
    return this.activeSessions.get(sessionId);
  }

  abortSession(sessionId: string): boolean {
    const session = this.activeSessions.get(sessionId);
    if (session) {
      session.abortController.abort();
      this.activeSessions.delete(sessionId);
      return true;
    }
    return false;
  }

  cleanupSession(sessionId: string) {
    this.activeSessions.delete(sessionId);
  }
} 