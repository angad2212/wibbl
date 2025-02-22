const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');
const request = require('supertest');
const app = require('../index'); // Your Express app

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();

    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterEach(async () => {
    // Clear collections after each test
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[key].deleteMany();
    }
});

afterAll(async () => {
    await mongoose.disconnect(); // Disconnect mongoose
    await mongoServer.stop();    // Stop in-memory MongoDB
});

describe('POST /api/user/', () => {
    it('should register a new user and return full user data', async () => {
        const res = await request(app)
            .post('/api/user/')
            .send({
                name: 'John Doe',
                email: 'john@example.com',
                password: 'password123',
            });

        expect(res.statusCode).toBe(201);
        expect(res.body).toHaveProperty('name', 'John Doe');
    });

    it('should return 400 if required fields are missing', async () => {
        const res = await request(app).post('/api/user/').send({
            name: '',
            email: '',
        });

        expect(res.statusCode).toBe(400);
    });

    it('should return 400 if user already exists', async () => {
        await request(app).post('/api/user/').send({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        });

        const res = await request(app).post('/api/user/').send({
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
        });

        expect(res.statusCode).toBe(400);
    });
});
