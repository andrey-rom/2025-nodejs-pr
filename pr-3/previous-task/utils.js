const fs = require('fs/promises');
const { getLogger } = require('./Logger');
const { Student } = require('./Student');

const logger = getLogger();

async function saveToJSON(data, filePath) {
  try {
    const jsonData = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonData, 'utf8');
    logger.log(`[IO] saved JSON -> ${filePath}`);
  } catch (err) {
    logger.log('[IO][error] write failed:', err.message);
    throw err;
  }
}

async function loadJSON(filePath) {
  try {
    const content = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(content);

    if (Array.isArray(jsonData)) {
      return jsonData.map(
        (studentData) =>
          new Student(
            studentData.id,
            studentData.name,
            studentData.age,
            studentData.group
          )
      );
    }

    return jsonData;
  } catch (err) {
    if (err.code === 'ENOENT') {
      logger.log(`[IO] file missing: ${filePath}`);
      return null;
    }
    logger.log('[IO][error] read failed:', err.message);
    throw err;
  }
}

module.exports = { saveToJSON, loadJSON };
