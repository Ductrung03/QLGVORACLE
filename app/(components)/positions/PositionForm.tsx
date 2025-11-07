"use client"

import React, { useState, useEffect } from 'react';
import { Modal, Button, Form, Alert } from 'react-bootstrap';

interface Position {
  maChucVu: string;
  tenChucVu: string;
  moTa?: string;
}

interface PositionFormProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  position?: Position | null;
}

const PositionForm: React.FC<PositionFormProps> = ({ show, onHide, onSuccess, position }) => {
  const [formData, setFormData] = useState({
    maChucVu: '',
    tenChucVu: '',
    moTa: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isEditMode = !!position;

  useEffect(() => {
    if (position) {
      setFormData({
        maChucVu: position.maChucVu,
        tenChucVu: position.tenChucVu,
        moTa: position.moTa || ''
      });
    } else {
      setFormData({
        maChucVu: '',
        tenChucVu: '',
        moTa: ''
      });
    }
    setErrors({});
    setSubmitError(null);
  }, [position, show]);

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.maChucVu.trim()) {
      newErrors.maChucVu = 'Mã chức vụ là bắt buộc';
    }

    if (!formData.tenChucVu.trim()) {
      newErrors.tenChucVu = 'Tên chức vụ là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const url = isEditMode
        ? `/api/positions/${position.maChucVu}`
        : '/api/positions';

      const method = isEditMode ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Có lỗi xảy ra');
      }

      onSuccess();
      onHide();
    } catch (error: any) {
      setSubmitError(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} centered size="lg">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title>
          <i className={`ri-${isEditMode ? 'edit' : 'add'}-line me-2`}></i>
          {isEditMode ? 'Chỉnh sửa Chức vụ' : 'Thêm Chức vụ mới'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {submitError && (
            <Alert variant="danger" dismissible onClose={() => setSubmitError(null)}>
              <i className="ri-error-warning-line me-2"></i>
              {submitError}
            </Alert>
          )}

          <div className="row g-3">
            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Mã chức vụ <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="maChucVu"
                  value={formData.maChucVu}
                  onChange={handleChange}
                  isInvalid={!!errors.maChucVu}
                  disabled={isEditMode}
                  placeholder="Nhập mã chức vụ"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.maChucVu}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-md-6">
              <Form.Group>
                <Form.Label className="fw-semibold">
                  Tên chức vụ <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="tenChucVu"
                  value={formData.tenChucVu}
                  onChange={handleChange}
                  isInvalid={!!errors.tenChucVu}
                  placeholder="Nhập tên chức vụ"
                />
                <Form.Control.Feedback type="invalid">
                  {errors.tenChucVu}
                </Form.Control.Feedback>
              </Form.Group>
            </div>

            <div className="col-12">
              <Form.Group>
                <Form.Label className="fw-semibold">Mô tả</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="moTa"
                  value={formData.moTa}
                  onChange={handleChange}
                  placeholder="Nhập mô tả chức vụ"
                />
              </Form.Group>
            </div>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-top">
          <Button
            variant="light"
            onClick={onHide}
            disabled={isSubmitting}
          >
            <i className="ri-close-line me-1"></i>
            Hủy
          </Button>
          <Button
            variant="primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className={`ri-${isEditMode ? 'save' : 'add'}-line me-1`}></i>
                {isEditMode ? 'Cập nhật' : 'Thêm mới'}
              </>
            )}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default PositionForm;
