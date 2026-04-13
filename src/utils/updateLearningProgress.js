export const updateLearningProgress = async (learning, content, moduleId) => {
  if (!learning.modulesCompleted.includes(moduleId)) {
    learning.modulesCompleted.push(moduleId);
    // update the learning progress
    if (learning.progress < 100) {
      // Calculate new progress and ensure it doesn't exceed 100
      learning.progress = Math.min(
        100,
        (learning.modulesCompleted.length / content.modules.length) * 100,
      );
    }
  }

  if (learning.progress === 100) {
    learning.status = "completed";
    learning.completedAt = Date.now();
  }

  await learning.save();
};
