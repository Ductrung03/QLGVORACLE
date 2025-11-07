"use client"

import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface Faculty {
  maKhoa: string;
  tenKhoa: string;
  diaChi: string;
  maChuNhiemKhoa?: string;
}

interface FacultyFormProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  faculty?: Faculty | null;
}

const FacultyForm: React.FC<FacultyFormProps> = ({ show, onHide, onSuccess, faculty }) => {
  const [formData, setFormData] = useState({
    tenKhoa: '',
    diaChi: '',
    maChuNhiemKhoa: ''
  });
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any>({});

  useEffect(() => {
    if (show) {
      fetchTeachers();
      if (faculty) {
        setFormData({
          tenKhoa: faculty.tenKhoa || '',
          diaChi: faculty.diaChi || '',
          maChuNhiemKhoa: faculty.maChuNhiemKhoa || ''
        });
      } else {
        setFormData({
          tenKhoa: '',
          diaChi: '',
          maChuNhiemKhoa: ''
        });
      }
      setError(null);
      setValidationErrors({});
    }
  }, [show, faculty]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/teachers');
      if (response.ok) {
        const data = await response.json();
        setTeachers(data);
      }
    } catch (error) {
      console.error('Error fetching teachers:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (validationErrors[name]) {
      setValidationErrors((prev: any) => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const errors: any = {};

    if (!formData.tenKhoa.trim()) {
      errors.tenKhoa = 'Tên khoa là bắt buộc';
    }

    if (!formData.diaChi.trim()) {
      errors.diaChi = 'Địa chỉ là bắt buộc';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const url = faculty ? `/api/faculties/${faculty.maKhoa}` : '/api/faculties';
      const method = faculty ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || errorData.error || 'Có lỗi xảy ra');
      }

      onSuccess();
      onHide();
    } catch (error: any) {
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title>
          <div className="d-flex align-items-center gap-2">
            <div className="avatar avatar-md bg-info-transparent rounded">
              <i className="ri-building-line fs-5 text-info"></i>
            </div>
            <div>
              <h5 className="mb-0">{faculty ? 'Chỉnh sửa Khoa' : 'Thêm Khoa mới'}</h5>
              <p className="mb-0 fs-12 text-muted fw-normal">
                {faculty ? 'Cập nhật thông tin khoa' : 'Nhập thông tin khoa mới'}
              </p>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant="danger" className="d-flex align-items-center mb-3">
              <i className="ri-error-warning-line fs-5 me-2"></i>
              <div>
                <strong>Lỗi!</strong> {error}
              </div>
            </Alert>
          )}

          <Row className="g-3">
            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-medium">
                  <i className="ri-building-line me-2 text-info"></i>
                  Tên Khoa <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="tenKhoa"
                  value={formData.tenKhoa}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.tenKhoa}
                  placeholder="Nhập tên khoa (VD: Khoa Công nghệ thông tin)"
                  className="form-control-lg"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.tenKhoa}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-medium">
                  <i className="ri-map-pin-line me-2 text-info"></i>
                  Địa chỉ <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  name="diaChi"
                  value={formData.diaChi}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.diaChi}
                  placeholder="Nhập địa chỉ khoa (VD: Tầng 3, Nhà A1)"
                  className="form-control-lg"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.diaChi}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-medium">
                  <i className="ri-user-star-line me-2 text-info"></i>
                  Chủ nhiệm Khoa
                </Form.Label>
                <Form.Select
                  name="maChuNhiemKhoa"
                  value={formData.maChuNhiemKhoa}
                  onChange={handleInputChange}
                  className="form-select-lg"
                >
                  <option value="">-- Chọn chủ nhiệm khoa --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.maGV} value={teacher.maGV}>
                      {teacher.hoTen} ({teacher.maGV})
                    </option>
                  ))}
                </Form.Select>
                <Form.Text className="text-muted">
                  <i className="ri-information-line me-1"></i>
                  Không bắt buộc - Có thể cập nhật sau
                </Form.Text>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="border-top">
          <SpkButton
            Buttonvariant="light"
            Customclass="btn-wave"
            onClickfunc={onHide}
            disabled={isLoading}
          >
            <i className="ri-close-line me-2"></i>Hủy
          </SpkButton>
          <SpkButton
            Buttonvariant="primary"
            Customclass="btn-wave"
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="ri-save-line me-2"></i>
                {faculty ? 'Cập nhật' : 'Thêm mới'}
              </>
            )}
          </SpkButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default FacultyForm;
