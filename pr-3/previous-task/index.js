const { getLogger } = require('./Logger');
const { StudentsStorage } = require('./StudentsStorage');
const { Backup } = require('./Backup');
const { Reporter } = require('./Reporter');
const { saveToJSON, loadJSON } = require('./utils');
const { STUDENT_EVENTS, BACKUP_EVENTS } = require('./events');

const args = process.argv.slice(2);
const isVerbose = args.includes('--verbose');
const isQuiet = args.includes('--quiet');

const logger = getLogger(isVerbose, isQuiet);

function attachStudentEventListeners(storage) {
  storage.on(STUDENT_EVENTS.ADDED, (student) => {
    logger.log(`[STUDENTS] added id=${student.id} name=${student.name}`);
  });

  storage.on(STUDENT_EVENTS.REMOVED, (student) => {
    logger.log(`[STUDENTS] removed id=${student.id} name=${student.name}`);
  });

  storage.on(STUDENT_EVENTS.REMOVAL_FAILED, (id, error) => {
    logger.log(`[STUDENTS][error] remove id=${id} -> ${error.message}`);
  });

  storage.on(STUDENT_EVENTS.AVERAGE_AGE_CALCULATED, (averageAge) => {
    logger.log(`[STUDENTS] average age=${averageAge}`);
  });
}

function attachBackupEventListeners(backup) {
  backup.on(BACKUP_EVENTS.STARTED, ({ intervalMs }) => {
    logger.log(`[BACKUP] started interval=${intervalMs}ms`);
  });

  backup.on(BACKUP_EVENTS.COMPLETED, ({ filename }) => {
    logger.log(`[BACKUP] completed file=${filename}`);
  });

  backup.on(BACKUP_EVENTS.SKIPPED, ({ skipCount, reason }) => {
    logger.log(`[BACKUP] skipped #${skipCount} reason=${reason}`);
  });

  backup.on(BACKUP_EVENTS.ERROR, ({ message, skipCount }) => {
    const suffix = skipCount ? ` skips=${skipCount}` : '';
    logger.log(`[BACKUP][error] ${message}${suffix}`);
  });

  backup.on(BACKUP_EVENTS.STOPPED, () => {
    logger.log('[BACKUP] stopped');
  });
}

async function main() {
  const storage = new StudentsStorage();
  attachStudentEventListeners(storage);

  // Demo usage to trigger essential events
  storage.addStudent('Alice', 22, 1);
  storage.addStudent('Bob', 24, 2);
  storage.calculateAverageAge();
  storage.removeStudent('2');

  await saveToJSON(storage.getAllStudents(), './students.json');
  const restored = await loadJSON('./students.json');
  logger.log('[IO] restored snapshot count=', Array.isArray(restored) ? restored.length : 0);

  const backup = new Backup('./backups');
  attachBackupEventListeners(backup);
  backup.start(() => storage.getAllStudents(), 1000);

  // Stop after a short demo window, then print report.
  setTimeout(async () => {
    backup.stop();
    const reporter = new Reporter('./backups');
    await reporter.printReport();
  }, 4000);
}

main().catch((err) => {
  logger.log('Fatal error:', err);
  process.exit(1);
});
