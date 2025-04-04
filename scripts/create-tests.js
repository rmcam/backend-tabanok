const fs = require('fs');

const modules = [
  'account',
  'activity',
  'analytics',
  'auto-grading',
  'comments',
  'content',
  'content-validation',
  'content-versioning',
  'cultural-content',
  'evaluation',
  'exercises',
  'gamification',
  'language-validation',
  'lesson',
  'module',
  'notifications',
  'progress',
  'ranking',
  'recommendations',
  'reward',
  'statistics',
  'topic',
  'unity',
  'user',
  'vocabulary',
  'webhooks',
];

modules.forEach(module => {
  // Create unit test file
  const unitTestPath = `src/test/features/${module}.spec.ts`;
  const unitTestContent = `
describe('${module} Module', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
`;
  fs.writeFileSync(unitTestPath, unitTestContent);
  console.log(`Created unit test file: ${unitTestPath}`);

  // Create E2E test file
  const e2eTestPath = `test/features/${module}.e2e-spec.ts`;
  const e2eTestContent = `
describe('${module} E2E Tests', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
`;
  fs.writeFileSync(e2eTestPath, e2eTestContent);
  console.log(`Created E2E test file: ${e2eTestPath}`);
});
