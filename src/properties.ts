/// <reference path="../index.d.ts" />

var PropertyLock_ = (): GoogleAppsScript.PropertyLock.PropertyLock => {
  const store = PropertiesService.getScriptProperties();

  const propertyName = "locked";
  const triggerName = "PropertyLock.releaseLock";

  const toSleep = GoogleAppsScript.PropertyLock.Limits.SLEEP;
  const currentGSuiteRuntimeLimit =
    GoogleAppsScript.PropertyLock.Limits.MAX_RUNTIME;

  let locked = false;
  let timeout = 0;

  const Lock: GoogleAppsScript.PropertyLock.PropertyLock = Object.freeze({
    hasLock() {
      return locked;
    },

    tryLock(timeoutInMillis) {
      //emulates "no effect if the lock has already been acquired"
      if (locked) {
        return true;
      }

      timeout === 0 && (timeout = timeoutInMillis);

      const stored = store.getProperty(propertyName);
      const isLocked = stored ? JSON.parse(stored) : false;

      const canWait = timeout > 0;

      if (isLocked && canWait) {
        Utilities.sleep(toSleep);

        timeout -= toSleep;

        return timeout > 0 ? Lock.tryLock(timeoutInMillis) : false;
      }

      if (!canWait) {
        return false;
      }

      try {
        store.setProperty(propertyName, "true");

        ScriptApp.newTrigger(triggerName)
          .timeBased()
          .after(currentGSuiteRuntimeLimit)
          .create();

        locked = true;

        return locked;
      } catch (error) {
        console.error(error);
        return false;
      }
    },

    releaseLock() {
      try {
        store.setProperty(propertyName, "false");

        const trigger = ScriptApp.getProjectTriggers().find(
          (n) => n.getHandlerFunction() === triggerName
        );

        trigger && ScriptApp.deleteTrigger(trigger);
      } catch (error) {
        console.error(error);
      }
    },

    waitLock(timeoutInMillis) {
      const hasLock = Lock.tryLock(timeoutInMillis);

      if (!hasLock) {
        throw new Error("Could not obtain lock");
      }

      return hasLock;
    },
  });

  return Lock;
};

var PropertyLockService = (() => {
  const service: GoogleAppsScript.PropertyLock.PropertyLockService = Object.freeze(
    {
      getScriptLock() {
        return PropertyLock_();
      },
    }
  );

  return service;
})();