const fs = require('fs/promises');
const path = require('path');
const EventEmitter = require('events');
const { BACKUP_EVENTS } = require('./events');

/**
 * Handles periodic backups of the current students array.
 */
class Backup extends EventEmitter {
  constructor(backupDir = './backups') {
    super();
    this.interval = null;
    this.backupDir = backupDir;
    this.isPending = false;
    this.consecutiveSkips = 0;
  }

  async ensureBackupDirectory() {
    try {
      await fs.mkdir(this.backupDir, { recursive: true });
    } catch (err) {
      this.emit(BACKUP_EVENTS.DIRECTORY_ERROR, { error: err, message: err.message });
      throw err;
    }
  }

  generateBackupFilename() {
    // Format: YYYY-MM-DD_HH-MM-SS.backup.json
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').slice(0, -5);
    return `${timestamp}.backup.json`;
  }

  async saveBackup(students) {
    await this.ensureBackupDirectory();

    const filename = this.generateBackupFilename();
    const filePath = path.join(this.backupDir, filename);
    const jsonData = JSON.stringify(students, null, 2);

    await fs.writeFile(filePath, jsonData, 'utf8');
    this.emit(BACKUP_EVENTS.COMPLETED, { filename, filePath, timestamp: new Date() });
  }

  start(getStudentsFn, intervalMs = 1000) {
    if (this.interval) {
      this.emit(BACKUP_EVENTS.ALREADY_RUNNING);
      return;
    }

    this.interval = setInterval(async () => {
      if (this.isPending) {
        this.consecutiveSkips += 1;
        this.emit(BACKUP_EVENTS.SKIPPED, {
          skipCount: this.consecutiveSkips,
          reason: 'Previous backup still pending',
        });

        if (this.consecutiveSkips >= 3) {
          const error = new Error('Backup pending for 3 intervals in a row');
          this.emit(BACKUP_EVENTS.ERROR, {
            error,
            message: error.message,
            skipCount: this.consecutiveSkips,
          });
          this.stop();
          throw error;
        }
        return;
      }

      this.consecutiveSkips = 0;
      this.isPending = true;

      try {
        const students = getStudentsFn();
        await this.saveBackup(students);
      } catch (err) {
        this.emit(BACKUP_EVENTS.ERROR, { error: err, message: err.message });
      } finally {
        this.isPending = false;
      }
    }, intervalMs);

    this.emit(BACKUP_EVENTS.STARTED, { intervalMs });
  }

  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
      this.emit(BACKUP_EVENTS.STOPPED);
    } else {
      this.emit(BACKUP_EVENTS.NOT_RUNNING);
    }
  }
}

module.exports = { Backup };
