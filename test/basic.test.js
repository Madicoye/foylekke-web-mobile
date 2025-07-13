const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../server');

describe('Foy Lekke Backend API', () => {
  beforeAll(async () => {
    // Connect to test database
    await mongoose.connect(process.env.MONGODB_URI_TEST || 'mongodb://localhost:27017/foy-lekke-test');
  });

  afterAll(async () => {
    // Clean up and disconnect
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
  });

  describe('Health Check', () => {
    it('should return 200 for server health', async () => {
      const response = await request(app).get('/api/health');
      expect(response.status).toBe(200);
    });
  });

  describe('Authentication', () => {
    it('should register a new user', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'user'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('token');
      expect(response.body.user).toHaveProperty('email', userData.email);
    });

    it('should login existing user', async () => {
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('Restaurants', () => {
    let authToken;

    beforeAll(async () => {
      // Login to get token
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      authToken = response.body.token;
    });

    it('should get all restaurants', async () => {
      const response = await request(app).get('/api/restaurants');
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
    });

    it('should create a new restaurant', async () => {
      const restaurantData = {
        name: 'Test Restaurant',
        description: 'A test restaurant',
        address: {
          street: '123 Test St',
          city: 'Dakar',
          region: 'Dakar',
          coordinates: {
            type: 'Point',
            coordinates: [-17.4677, 14.7167]
          }
        },
        cuisine: ['african'],
        priceRange: 'medium'
      };

      const response = await request(app)
        .post('/api/restaurants')
        .set('Authorization', `Bearer ${authToken}`)
        .send(restaurantData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', restaurantData.name);
    });
  });
}); 