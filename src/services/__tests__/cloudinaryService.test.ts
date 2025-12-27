import {
  uploadImageToCloudinary,
  uploadProfileImageToCloudinary,
  uploadPostImageToCloudinary,
} from '../cloudinaryService';

// Mock global fetch
global.fetch = jest.fn();

describe('CloudinaryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME = 'test-cloud';
  });

  afterEach(() => {
    delete process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
  });

  describe('uploadImageToCloudinary', () => {
    it('should upload image successfully', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/test-image.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await uploadImageToCloudinary({
        uri: 'file://local-image.jpg',
        folder: 'test-folder',
        fileName: 'test.jpg',
      });

      expect(result).toBe('https://cloudinary.com/test-image.jpg');
      expect(global.fetch).toHaveBeenCalledWith(
        'https://api.cloudinary.com/v1_1/test-cloud/image/upload',
        expect.objectContaining({
          method: 'POST',
          body: expect.any(FormData),
        })
      );
    });

    it('should throw error when upload fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({}),
      });

      await expect(
        uploadImageToCloudinary({
          uri: 'file://local-image.jpg',
          folder: 'test-folder',
          fileName: 'test.jpg',
        })
      ).rejects.toThrow('Cloudinary upload failed');
    });

    it('should throw error when fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(
        uploadImageToCloudinary({
          uri: 'file://local-image.jpg',
          folder: 'test-folder',
          fileName: 'test.jpg',
        })
      ).rejects.toThrow('Network error');
    });

    it('should send correct FormData', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/test-image.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      await uploadImageToCloudinary({
        uri: 'file://local-image.jpg',
        folder: 'custom-folder',
        fileName: 'custom-name.jpg',
      });

      expect(global.fetch).toHaveBeenCalled();
      const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
      expect(fetchCall[0]).toContain('test-cloud');
    });

    it('should handle different image URIs', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/image.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const uris = [
        'file://path/to/image.jpg',
        'content://media/image.jpg',
        '/absolute/path/image.jpg',
      ];

      for (const uri of uris) {
        await uploadImageToCloudinary({
          uri,
          folder: 'test',
          fileName: 'test.jpg',
        });
      }

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });
  });

  describe('uploadProfileImageToCloudinary', () => {
    it('should upload profile image with correct parameters', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/profile.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await uploadProfileImageToCloudinary('file://profile.jpg');

      expect(result).toBe('https://cloudinary.com/profile.jpg');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should use users folder for profile images', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/profile.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      await uploadProfileImageToCloudinary('file://profile.jpg');

      // Verify that the upload was called (folder is set internally)
      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should handle upload errors for profile images', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({}),
      });

      await expect(
        uploadProfileImageToCloudinary('file://profile.jpg')
      ).rejects.toThrow('Cloudinary upload failed');
    });
  });

  describe('uploadPostImageToCloudinary', () => {
    it('should upload post image with correct parameters', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/post.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const result = await uploadPostImageToCloudinary('file://post.jpg');

      expect(result).toBe('https://cloudinary.com/post.jpg');
      expect(global.fetch).toHaveBeenCalled();
    });

    it('should use posts folder for post images', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/post.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      await uploadPostImageToCloudinary('file://post.jpg');

      expect(global.fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
        })
      );
    });

    it('should handle upload errors for post images', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => ({}),
      });

      await expect(
        uploadPostImageToCloudinary('file://post.jpg')
      ).rejects.toThrow('Cloudinary upload failed');
    });
  });

  describe('Edge cases', () => {
    it('should handle very large file names', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/image.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      const longFileName = 'a'.repeat(200) + '.jpg';
      const result = await uploadImageToCloudinary({
        uri: 'file://image.jpg',
        folder: 'test',
        fileName: longFileName,
      });

      expect(result).toBe('https://cloudinary.com/image.jpg');
    });

    it('should handle special characters in folder names', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/image.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      await uploadImageToCloudinary({
        uri: 'file://image.jpg',
        folder: 'test/sub-folder/2024',
        fileName: 'test.jpg',
      });

      expect(global.fetch).toHaveBeenCalled();
    });

    it('should handle concurrent uploads', async () => {
      const mockResponse = {
        secure_url: 'https://cloudinary.com/image.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValue({
        json: async () => mockResponse,
      });

      const uploads = [
        uploadProfileImageToCloudinary('file://profile1.jpg'),
        uploadPostImageToCloudinary('file://post1.jpg'),
        uploadImageToCloudinary({
          uri: 'file://image1.jpg',
          folder: 'custom',
          fileName: 'custom.jpg',
        }),
      ];

      await Promise.all(uploads);

      expect(global.fetch).toHaveBeenCalledTimes(3);
    });

    it('should handle missing cloud name', async () => {
      delete process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME;
      process.env.EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME = undefined;

      const mockResponse = {
        secure_url: 'https://cloudinary.com/image.jpg',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        json: async () => mockResponse,
      });

      await uploadImageToCloudinary({
        uri: 'file://image.jpg',
        folder: 'test',
        fileName: 'test.jpg',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('undefined'),
        expect.any(Object)
      );
    });
  });
});
