import request from 'supertest';
import app from '../app'; // import your express app
import AuthModel from '../models/AuthModel'; // import your AuthModel

jest.mock('../models/AuthModel'); // Mock the AuthModel

describe('POST /auth/email_register', () => {
  it('should register a new user', async () => {
    const mockUser = {
      email: 'test@test.com',
      password: 'password',
    };

    AuthModel.findOne.mockResolvedValue(null);

    const res = await request(app)
      .post('/auth/email_register')
      .send(mockUser);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('message', 'User created');
  });

  it('should not register a user if the email already exists', async () => {
    const mockUser = {
      email: 'test@test.com',
      password: 'password',
    };

    AuthModel.findOne.mockResolvedValue(mockUser);

    const res = await request(app)
      .post('/auth/email_register')
      .send(mockUser);

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('message', 'User already exists');
  });

  it('should return a server error if registration fails', async () => {
    const mockUser = {
      email: 'test@test.com',
      password: 'password',
    };

    AuthModel.findOne.mockRejectedValue(new Error('Server error'));

    const res = await request(app)
      .post('/auth/email_register')
      .send(mockUser);

    expect(res.statusCode).toEqual(500);
    expect(res.body).toHaveProperty('message', 'Server error');
  });
});