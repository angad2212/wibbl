const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const { registerUser } = require('../controllers/userControllers'); // Adjust path as needed

// Mock User Model & Token Generator
jest.mock('../models/userModel', () => ({
    findOne: jest.fn(),
    create: jest.fn()
}));
jest.mock('../config/generateToken', () => jest.fn(() => 'mocked-token'));

const User = require('../models/userModel');
const generateToken = require('../config/generateToken');

// Express App Setup
const app = express();
app.use(bodyParser.json());
app.post('/api/user/', registerUser);

describe('POST /api/user/', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should return 400 if required fields are missing', async () => {
      const res = await request(app).post('/api/user/').send({
          email: 'advait@gmail.com',
          password: 'advait'
      });
  
      expect(res.statusCode).toBe(400);
      expect(res.body.message).toBe('please enter all the details');
  });
  

    it('should return 400 if user already exists', async () => {
        User.findOne.mockResolvedValue({ email: 'test@example.com' });

        const res = await request(app).post('/api/user/').send({
            name: 'John Doe',
            email: 'test@example.com',
            password: 'password123'
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('user already exists');
    });

    it('should create a user and return 201 with user data', async () => {
      User.findOne.mockResolvedValue(null); // No existing user
      User.create.mockResolvedValue({
          _id: '67b9e918a0817ef010ed83dc',
          name: 'advait',
          email: 'advait@123',
          pic: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg'
      });
  
      const res = await request(app).post('/api/user/').send({
          name: 'advait',
          email: 'advait@123',
          password: 'advait'
      });
  
      expect(res.statusCode).toBe(201);
      expect(res.body).toEqual({
          _id: '67b9e918a0817ef010ed83dc',
          name: 'advait',
          email: 'advait@123',
          pic: 'https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg',
          token: 'mocked-token'  
        });
  });

    it('should return 400 if user creation fails', async () => {
        User.findOne.mockResolvedValue(null);
        User.create.mockResolvedValue(null);

        const res = await request(app).post('/api/user/').send({
            name: 'John Doe',
            email: 'test@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(400);
        expect(res.body.message).toBe('error creating user');
    });
});
