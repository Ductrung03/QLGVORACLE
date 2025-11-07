/**
 * Unit Tests for TeacherForm Component
 *
 * This test suite validates the functionality of the TeacherForm component,
 * including form rendering, validation, submission, and user interactions.
 */

import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import TeacherForm from '@/app/(components)/teachers/TeacherForm';

// Mock fetch API
global.fetch = jest.fn();

// Mock teacher data
const mockTeacher = {
  id: 1,
  ho_ten: 'Nguyễn Văn A',
  chuyen_nganh: 'Toán học',
  email: 'nguyenvana@example.com',
  so_dien_thoai: '0123456789',
  dia_chi: 'Hà Nội',
};

describe('TeacherForm Component', () => {
  const mockOnHide = jest.fn();
  const mockOnSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe('Component Rendering', () => {
    it('should not render when show prop is false', () => {
      const { container } = render(
        <TeacherForm
          show={false}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      expect(container.querySelector('.modal')).not.toBeInTheDocument();
    });

    it('should render modal when show prop is true', () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Thêm Giáo viên mới')).toBeInTheDocument();
    });

    it('should display correct title for add mode', () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByText('Thêm Giáo viên mới')).toBeInTheDocument();
    });

    it('should display correct title for edit mode', () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
          teacher={mockTeacher}
        />
      );

      expect(screen.getByText('Chỉnh sửa thông tin Giáo viên')).toBeInTheDocument();
    });

    it('should render all form fields', () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      expect(screen.getByLabelText(/Họ và Tên/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Chuyên ngành/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Số điện thoại/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Địa chỉ/i)).toBeInTheDocument();
    });

    it('should show required field indicators', () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const requiredMarkers = screen.getAllByText('*');
      expect(requiredMarkers.length).toBeGreaterThanOrEqual(2); // ho_ten and email
    });
  });

  describe('Form Initialization', () => {
    it('should initialize form with empty values in add mode', () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;

      expect(hoTenInput.value).toBe('');
      expect(emailInput.value).toBe('');
    });

    it('should populate form with teacher data in edit mode', () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
          teacher={mockTeacher}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i) as HTMLInputElement;
      const emailInput = screen.getByLabelText(/Email/i) as HTMLInputElement;
      const chuyenNganhInput = screen.getByLabelText(/Chuyên ngành/i) as HTMLInputElement;

      expect(hoTenInput.value).toBe(mockTeacher.ho_ten);
      expect(emailInput.value).toBe(mockTeacher.email);
      expect(chuyenNganhInput.value).toBe(mockTeacher.chuyen_nganh);
    });

    it('should reset form when modal is reopened', () => {
      const { rerender } = render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
          teacher={mockTeacher}
        />
      );

      // Close modal
      rerender(
        <TeacherForm
          show={false}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
          teacher={mockTeacher}
        />
      );

      // Reopen in add mode
      rerender(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i) as HTMLInputElement;
      expect(hoTenInput.value).toBe('');
    });
  });

  describe('Form Validation', () => {
    it('should show error when submitting with empty required fields', async () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Vui lòng điền đầy đủ các trường bắt buộc/i)).toBeInTheDocument();
      });
    });

    it('should show error for invalid email format', async () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(hoTenInput, 'Nguyễn Văn A');
      await userEvent.type(emailInput, 'invalid-email');

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Định dạng email không hợp lệ/i)).toBeInTheDocument();
      });
    });

    it('should accept valid email formats', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Teacher created successfully', id: 1 }),
      });

      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(hoTenInput, 'Nguyễn Văn A');
      await userEvent.type(emailInput, 'test@example.com');

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });

    it('should allow optional fields to be empty', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Teacher created successfully', id: 1 }),
      });

      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(hoTenInput, 'Nguyễn Văn A');
      await userEvent.type(emailInput, 'test@example.com');
      // Leave optional fields empty

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalled();
      });
    });
  });

  describe('Form Submission - Add Mode', () => {
    it('should submit form with correct data in add mode', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Teacher created successfully', id: 1 }),
      });

      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      const emailInput = screen.getByLabelText(/Email/i);
      const chuyenNganhInput = screen.getByLabelText(/Chuyên ngành/i);

      await userEvent.type(hoTenInput, 'Nguyễn Văn A');
      await userEvent.type(emailInput, 'test@example.com');
      await userEvent.type(chuyenNganhInput, 'Toán học');

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          '/api/teachers',
          expect.objectContaining({
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: expect.stringContaining('Nguyễn Văn A'),
          })
        );
      });
    });

    it('should call onSuccess and onHide after successful submission', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Teacher created successfully', id: 1 }),
      });

      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(hoTenInput, 'Nguyễn Văn A');
      await userEvent.type(emailInput, 'test@example.com');

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSuccess).toHaveBeenCalledTimes(1);
        expect(mockOnHide).toHaveBeenCalledTimes(1);
      });
    });

    it('should show loading state during submission', async () => {
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(submitPromise);

      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(hoTenInput, 'Nguyễn Văn A');
      await userEvent.type(emailInput, 'test@example.com');

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Đang xử lý/i)).toBeInTheDocument();
      });

      // Resolve the promise
      resolveSubmit!({
        ok: true,
        json: async () => ({ message: 'Teacher created successfully', id: 1 }),
      });
    });

    it('should handle API errors gracefully', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Email already exists' }),
      });

      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(hoTenInput, 'Nguyễn Văn A');
      await userEvent.type(emailInput, 'test@example.com');

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Email already exists/i)).toBeInTheDocument();
      });

      expect(mockOnSuccess).not.toHaveBeenCalled();
      expect(mockOnHide).not.toHaveBeenCalled();
    });
  });

  describe('Form Submission - Edit Mode', () => {
    it('should submit form with correct data in edit mode', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Teacher updated successfully' }),
      });

      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
          teacher={mockTeacher}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      await userEvent.clear(hoTenInput);
      await userEvent.type(hoTenInput, 'Nguyễn Văn B');

      const submitButton = screen.getByText(/Cập nhật/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
          `/api/teachers/${mockTeacher.id}`,
          expect.objectContaining({
            method: 'PUT',
          })
        );
      });
    });

    it('should display update button in edit mode', () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
          teacher={mockTeacher}
        />
      );

      expect(screen.getByText(/Cập nhật/i)).toBeInTheDocument();
      expect(screen.queryByText(/Thêm mới/i)).not.toBeInTheDocument();
    });
  });

  describe('User Interactions', () => {
    it('should update form fields on user input', async () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i) as HTMLInputElement;
      await userEvent.type(hoTenInput, 'Test Name');

      expect(hoTenInput.value).toBe('Test Name');
    });

    it('should clear error message when user starts typing', async () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      // Trigger validation error
      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Vui lòng điền đầy đủ các trường bắt buộc/i)).toBeInTheDocument();
      });

      // Start typing
      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      await userEvent.type(hoTenInput, 'A');

      await waitFor(() => {
        expect(screen.queryByText(/Vui lòng điền đầy đủ các trường bắt buộc/i)).not.toBeInTheDocument();
      });
    });

    it('should call onHide when cancel button is clicked', () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const cancelButton = screen.getByText(/Hủy/i);
      fireEvent.click(cancelButton);

      expect(mockOnHide).toHaveBeenCalledTimes(1);
    });

    it('should dismiss error alert when user starts typing after error', async () => {
      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      // Trigger validation error
      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Vui lòng điền đầy đủ các trường bắt buộc/i)).toBeInTheDocument();
      });

      // Start typing to clear error
      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      await userEvent.type(hoTenInput, 'Test');

      await waitFor(() => {
        expect(screen.queryByText(/Vui lòng điền đầy đủ các trường bắt buộc/i)).not.toBeInTheDocument();
      });
    });

    it('should disable form controls during submission', async () => {
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(submitPromise);

      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(hoTenInput, 'Nguyễn Văn A');
      await userEvent.type(emailInput, 'test@example.com');

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByLabelText(/Họ và Tên/i)).toBeDisabled();
        expect(screen.getByLabelText(/Email/i)).toBeDisabled();
      });

      // Resolve the promise
      resolveSubmit!({
        ok: true,
        json: async () => ({ message: 'Teacher created successfully', id: 1 }),
      });
    });
  });

  describe('Modal Behavior', () => {
    it('should prevent closing modal during submission', async () => {
      let resolveSubmit: (value: any) => void;
      const submitPromise = new Promise((resolve) => {
        resolveSubmit = resolve;
      });

      (global.fetch as jest.Mock).mockReturnValueOnce(submitPromise);

      render(
        <TeacherForm
          show={true}
          onHide={mockOnHide}
          onSuccess={mockOnSuccess}
        />
      );

      const hoTenInput = screen.getByLabelText(/Họ và Tên/i);
      const emailInput = screen.getByLabelText(/Email/i);

      await userEvent.type(hoTenInput, 'Nguyễn Văn A');
      await userEvent.type(emailInput, 'test@example.com');

      const submitButton = screen.getByText(/Thêm mới/i);
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/Đang xử lý/i)).toBeInTheDocument();
      });

      // Try to click cancel during submission
      const cancelButton = screen.getByText(/Hủy/i);
      expect(cancelButton).toBeDisabled();

      // Resolve the promise
      resolveSubmit!({
        ok: true,
        json: async () => ({ message: 'Teacher created successfully', id: 1 }),
      });
    });
  });
});
