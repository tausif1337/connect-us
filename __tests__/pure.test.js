// Pure JavaScript test - no Expo dependencies
describe('Pure Logic Tests', () => {
  describe('String Operations', () => {
    it('should concatenate strings correctly', () => {
      const result = 'Hello' + ' ' + 'World';
      expect(result).toBe('Hello World');
    });

    it('should uppercase strings', () => {
      const result = 'test'.toUpperCase();
      expect(result).toBe('TEST');
    });

    it('should check string length', () => {
      expect('test').toHaveLength(4);
      expect('hello world').toHaveLength(11);
    });
  });

  describe('Array Operations', () => {
    it('should filter arrays correctly', () => {
      const numbers = [1, 2, 3, 4, 5];
      const evens = numbers.filter(n => n % 2 === 0);
      expect(evens).toEqual([2, 4]);
    });

    it('should map arrays correctly', () => {
      const numbers = [1, 2, 3];
      const doubled = numbers.map(n => n * 2);
      expect(doubled).toEqual([2, 4, 6]);
    });

    it('should reduce arrays correctly', () => {
      const numbers = [1, 2, 3, 4];
      const sum = numbers.reduce((acc, n) => acc + n, 0);
      expect(sum).toBe(10);
    });
  });

  describe('Object Operations', () => {
    it('should access object properties', () => {
      const obj = { name: 'John', age: 30 };
      expect(obj.name).toBe('John');
      expect(obj.age).toBe(30);
    });

    it('should spread objects', () => {
      const obj1 = { a: 1, b: 2 };
      const obj2 = { ...obj1, c: 3 };
      expect(obj2).toEqual({ a: 1, b: 2, c: 3 });
    });

    it('should destructure objects', () => {
      const obj = { x: 10, y: 20 };
      const { x, y } = obj;
      expect(x).toBe(10);
      expect(y).toBe(20);
    });
  });

  describe('Date Operations', () => {
    it('should create dates', () => {
      const date = new Date('2024-01-01');
      expect(date.getFullYear()).toBe(2024);
      expect(date.getMonth()).toBe(0); // January is 0
    });

    it('should compare dates', () => {
      const date1 = new Date('2024-01-01');
      const date2 = new Date('2024-01-02');
      expect(date2.getTime()).toBeGreaterThan(date1.getTime());
    });
  });

  describe('Async Operations', () => {
    it('should resolve promises', async () => {
      const promise = Promise.resolve(42);
      const result = await promise;
      expect(result).toBe(42);
    });

    it('should handle async/await', async () => {
      const getData = async () => {
        return new Promise(resolve => {
          setTimeout(() => resolve('data'), 10);
        });
      };
      
      const result = await getData();
      expect(result).toBe('data');
    });

    it('should catch errors', async () => {
      const failingPromise = Promise.reject(new Error('test error'));
      await expect(failingPromise).rejects.toThrow('test error');
    });
  });

  describe('Error Handling', () => {
    it('should throw errors', () => {
      const throwError = () => {
        throw new Error('Something went wrong');
      };
      expect(throwError).toThrow('Something went wrong');
    });

    it('should handle try/catch', () => {
      let error;
      try {
        throw new Error('test');
      } catch (e) {
        error = e;
      }
      expect(error).toBeDefined();
      expect(error.message).toBe('test');
    });
  });
});
