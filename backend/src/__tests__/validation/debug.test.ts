import { RegisterSchema } from '../../shared/schemas/auth.validation';

it('debug Zod error structure', () => {
  const result = RegisterSchema.safeParse({
    email: 'john@example.com',
    password: 'SecurePass123!',
  });

  console.log('result:', result);
  console.log('success:', result.success);
  if (!result.success) {
    console.log('error:', result.error);
    console.log('error.errors:', result.error.errors);
    console.log('error.issues:', result.error.issues);
    console.log('error.format():', result.error.format());
  }
  expect(result.success).toBe(false);
});
