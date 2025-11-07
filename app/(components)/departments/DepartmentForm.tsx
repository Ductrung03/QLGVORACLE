"use client"

import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface Department {
  maBM: string;
  tenBM: string;
  diaChi: string;
  maKhoa: string;
  maChuNhiemBM?: string;
}

interface DepartmentFormProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  department?: Department | null;
}

const DepartmentForm: React.FC<DepartmentFormProps> = ({ show, onHide, onSuccess, department }) => {
  const [formData, setFormData] = useState({
    TENBM: '',
    DIACHI: '',
    MAKHOA: '',
    MACHUNHIEMBM: ''
  });
  const [faculties, setFaculties] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<any>({});

  useEffect(() => {
    if (show) {
      fetchData();
      if (department) {
        setFormData({
          TENBM: department.tenBM || '',
          DIACHI: department.diaChi || '',
          MAKHOA: department.maKhoa || '',
          MACHUNHIEMBM: department.maChuNhiemBM || ''
        });
      } else {
        setFormData({
          TENBM: '',
          DIACHI: '',
          MAKHOA: '',
          MACHUNHIEMBM: ''
        });
      }
      setError(null);
      setValidationErrors({});
    }
  }, [show, department]);

  const fetchData = async () => {
    try {
      const [facultiesRes, teachersRes] = await Promise.all([
        fetch('/api/faculties'),
        fetch('/api/teachers')
      ]);
      
      if (facultiesRes.ok) {
        const facultiesData = await facultiesRes.json();
        setFaculties(facultiesData);
      }
      
      if (teachersRes.ok) {
        const teachersData = await teachersRes.json();
        setTeachers(teachersData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (validationErrors[name]) {
      setValidationErrors((prev: any) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors: any = {};

    if (!formData.TENBM.trim()) {
      errors.TENBM = 'Tên bộ môn là bắt buộc';
    }

    if (!formData.MAKHOA) {
      errors.MAKHOA = 'Khoa là bắt buộc';
    }

    if (!formData.DIACHI.trim()) {
      errors.DIACHI = 'Địa chỉ là bắt buộc';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsLoading(true);
    setError(null);

    try {
      const url = department ? `/api/departments/${department.maBM}` : '/api/departments';
      const method = department ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Có lỗi xảy ra');
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
      <Modal.Header closeButton>
        <Modal.Title>
          <i className="ri-organization-chart me-2"></i>
          {department ? 'Chỉnh sửa Bộ môn' : 'Thêm Bộ môn mới'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          {error && (
            <Alert variant="danger" className="d-flex align-items-center">
              <i className="ri-error-warning-line me-2"></i>
              {error}
            </Alert>
          )}

          <Row>
            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Tên Bộ môn <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="TENBM"
                  value={formData.TENBM}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.TENBM}
                  placeholder="Nhập tên bộ môn"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.TENBM}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Khoa <span className="text-danger">*</span></Form.Label>
                <Form.Select
                  name="MAKHOA"
                  value={formData.MAKHOA}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.MAKHOA}
                >
                  <option value="">-- Chọn khoa --</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.maKhoa} value={faculty.maKhoa}>
                      {faculty.tenKhoa}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  {validationErrors.MAKHOA}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3">
                <Form.Label>Chủ nhiệm Bộ môn</Form.Label>
                <Form.Select
                  name="MACHUNHIEMBM"
                  value={formData.MACHUNHIEMBM}
                  onChange={handleInputChange}
                >
                  <option value="">-- Chọn chủ nhiệm --</option>
                  {teachers.map((teacher) => (
                    <option key={teacher.maGV || teacher.MAGV} value={teacher.maGV || teacher.MAGV}>
                      {teacher.hoTen || teacher.HOTEN} ({teacher.maGV || teacher.MAGV})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group className="mb-3">
                <Form.Label>Địa chỉ <span className="text-danger">*</span></Form.Label>
                <Form.Control
                  type="text"
                  name="DIACHI"
                  value={formData.DIACHI}
                  onChange={handleInputChange}
                  isInvalid={!!validationErrors.DIACHI}
                  placeholder="Nhập địa chỉ bộ môn"
                />
                <Form.Control.Feedback type="invalid">
                  {validationErrors.DIACHI}
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <SpkButton Buttonvariant="light" onClickfunc={onHide} disabled={isLoading}>
            Hủy
          </SpkButton>
          <SpkButton Buttonvariant="primary" type="submit" disabled={isLoading}>
            {isLoading ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                Đang xử lý...
              </>
            ) : (
              <>
                <i className="ri-save-line me-2"></i>
                {department ? 'Cập nhật' : 'Thêm mới'}
              </>
            )}
          </SpkButton>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default DepartmentForm;
