/**
 * Unit Tests for TeacherList Component
 *
 * This test suite validates the functionality of the TeacherList component,
 * including rendering, data fetching, and user interactions.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import TeacherList from '@/app/(components)/teachers/TeacherList';

// Mock fetch API
global.fetch = jest.fn();

// Mock teacher data
const mockTeachers = [
  {
    id: 1,
    ho_ten: 'Nguyễn Văn A',
    chuyen_nganh: 'Toán học',
    email: 'nguyenvana@example.com',
    so_dien_thoai: '0123456789',
    dia_chi: 'Hà Nội',
  },
  {
    id: 2,
    ho_ten: 'Trần Thị B',
    chuyen_nganh: 'Vật lý',
    email: 'tranthib@example.com',
    so_dien_thoai: '0987654321',
    dia_chi: 'TP. Hồ Chí Minh',
  },
];

describe('TeacherList Component', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching data', () => {
      // Mock fetch to never resolve
      (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));

      render(<TeacherList />);

      expect(screen.getByText(/Đang tải danh sách giáo viên/i)).toBeInTheDocument();
      expect(screen.getByRole('status')).toBeInTheDocument();
    });
  });

  describe('Success State', () => {
    it('should display teachers list when data is fetched successfully', async () => {
      // Mock successful fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeachers,
      });

      render(<TeacherList />);

      // Wait for the data to load
      await waitFor(() => {
        expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      });

      // Check if all teachers are rendered
      expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      expect(screen.getByText('Trần Thị B')).toBeInTheDocument();
      expect(screen.getByText('Toán học')).toBeInTheDocument();
      expect(screen.getByText('Vật lý')).toBeInTheDocument();
    });

    it('should display teacher count in header', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeachers,
      });

      render(<TeacherList />);

      await waitFor(() => {
        expect(screen.getByText(/Danh sách Giáo viên \(2\)/i)).toBeInTheDocument();
      });
    });

    it('should display edit and delete buttons for each teacher', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeachers,
      });

      render(<TeacherList />);

      await waitFor(() => {
        const editButtons = screen.getAllByLabelText(/Chỉnh sửa giáo viên/i);
        const deleteButtons = screen.getAllByLabelText(/Xóa giáo viên/i);

        expect(editButtons).toHaveLength(2);
        expect(deleteButtons).toHaveLength(2);
      });
    });
  });

  describe('Error State', () => {
    it('should display error message when fetch fails', async () => {
      // Mock failed fetch
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      render(<TeacherList />);

      await waitFor(() => {
        expect(screen.getByText(/Lỗi khi tải dữ liệu/i)).toBeInTheDocument();
        expect(screen.getByText(/Failed to fetch teachers: Internal Server Error/i)).toBeInTheDocument();
      });
    });

    it('should display retry button when fetch fails', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      render(<TeacherList />);

      await waitFor(() => {
        expect(screen.getByText(/Thử lại/i)).toBeInTheDocument();
      });
    });

    it('should retry fetching when retry button is clicked', async () => {
      // First fetch fails
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        statusText: 'Internal Server Error',
      });

      render(<TeacherList />);

      await waitFor(() => {
        expect(screen.getByText(/Lỗi khi tải dữ liệu/i)).toBeInTheDocument();
      });

      // Second fetch succeeds
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeachers,
      });

      const retryButton = screen.getByText(/Thử lại/i);
      fireEvent.click(retryButton);

      await waitFor(() => {
        expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      });
    });
  });

  describe('Empty State', () => {
    it('should display empty state message when no teachers exist', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [],
      });

      render(<TeacherList />);

      await waitFor(() => {
        expect(screen.getByText(/Chưa có giáo viên nào trong hệ thống/i)).toBeInTheDocument();
      });
    });
  });

  describe('User Interactions', () => {
    it('should call onEdit callback when edit button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeachers,
      });

      const mockOnEdit = jest.fn();
      render(<TeacherList onEdit={mockOnEdit} />);

      await waitFor(() => {
        expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      });

      const editButtons = screen.getAllByLabelText(/Chỉnh sửa giáo viên/i);
      fireEvent.click(editButtons[0]);

      expect(mockOnEdit).toHaveBeenCalledWith(mockTeachers[0]);
      expect(mockOnEdit).toHaveBeenCalledTimes(1);
    });

    it('should open delete confirmation dialog when delete button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeachers,
      });

      const mockOnDelete = jest.fn();
      render(<TeacherList onDelete={mockOnDelete} />);

      await waitFor(() => {
        expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      });

      const deleteButtons = screen.getAllByLabelText(/Xóa giáo viên/i);
      fireEvent.click(deleteButtons[0]);

      // Should show confirmation dialog
      await waitFor(() => {
        expect(screen.getByText(/Xác nhận xóa giáo viên/i)).toBeInTheDocument();
      });
    });

    it('should refresh data when refresh button is clicked', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTeachers,
      });

      render(<TeacherList />);

      await waitFor(() => {
        expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      });

      // Mock second fetch with updated data
      const updatedTeachers = [...mockTeachers, {
        id: 3,
        ho_ten: 'Lê Văn C',
        chuyen_nganh: 'Hóa học',
        email: 'levanc@example.com',
        so_dien_thoai: '0111222333',
        dia_chi: 'Đà Nẵng',
      }];

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => updatedTeachers,
      });

      const refreshButtons = screen.getAllByRole('button');
      const refreshButton = refreshButtons.find(
        (button) => button.querySelector('.ri-refresh-line')
      );

      if (refreshButton) {
        fireEvent.click(refreshButton);
      }

      await waitFor(() => {
        expect(screen.getByText('Lê Văn C')).toBeInTheDocument();
      });
    });
  });

  describe('Data Display', () => {
    it('should handle missing optional fields gracefully', async () => {
      const teacherWithMissingFields = {
        id: 1,
        ho_ten: 'Nguyễn Văn A',
        chuyen_nganh: '',
        email: 'nguyenvana@example.com',
        so_dien_thoai: '',
        dia_chi: '',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [teacherWithMissingFields],
      });

      render(<TeacherList />);

      await waitFor(() => {
        expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      });

      // Check for "Chưa cập nhật" text for missing fields
      const emptyFieldMarkers = screen.getAllByText(/Chưa cập nhật/i);
      expect(emptyFieldMarkers.length).toBeGreaterThan(0);
    });

    it('should truncate long addresses and show title attribute', async () => {
      const teacherWithLongAddress = {
        id: 1,
        ho_ten: 'Nguyễn Văn A',
        chuyen_nganh: 'Toán học',
        email: 'nguyenvana@example.com',
        so_dien_thoai: '0123456789',
        dia_chi: 'Số 123, Đường ABC, Phường XYZ, Quận DEF, Thành phố GHI, Tỉnh JKL',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => [teacherWithLongAddress],
      });

      render(<TeacherList />);

      await waitFor(() => {
        expect(screen.getByText('Nguyễn Văn A')).toBeInTheDocument();
      });

      // Check if address is truncated (longer than 30 characters)
      const addressElement = screen.getByTitle(teacherWithLongAddress.dia_chi);
      expect(addressElement).toBeInTheDocument();
    });
  });
});
