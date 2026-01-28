import fs from "fs";

// watch directory for changes
export const watchDirectory = (targetDir, onChange) => {
  const watcher = fs.watch(
    targetDir,
    { recursive: true },
    (eventType, filename) => {
      if (eventType === "change" && filename) {
        console.log(`file changed: ${filename}`);
        if (onChange) onChange(filename);
      }
    },
  );

  console.log(`file watcher started for: ${targetDir}`);

  return watcher;
};
