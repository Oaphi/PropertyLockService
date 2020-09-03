declare namespace GoogleAppsScript {
  namespace PropertyLock {

    const enum Limits {
        SLEEP = 10,
        MAX_RUNTIME = 30 * 60 * 1e3
    }

    interface PropertyLock {
      hasLock(): boolean;
      releaseLock(): void;
      tryLock(timeoutInMillis: number): boolean;
      waitLock(timeoutInMillis: number): void;
    }

    interface PropertyLockService {
      getScriptLock(): PropertyLock;
    }

  }
}

declare var PropertyLockService: GoogleAppsScript.PropertyLock.PropertyLockService;