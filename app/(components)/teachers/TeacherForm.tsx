"use client"

import React, { useState, useEffect } from 'react';
import { Modal, Form, Row, Col, Alert } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

/**
 * Teacher interface
 */
interface Teacher {
  maGV: string;
  hoTen: string;
  ngaySinh: string | null;
  gioiTinh: number | null;
  queQuan: string;
  diaChi: string;
  sdt: number | null;
  email: string;
  maBM: string;
}

/**
 * Form data interface for creating/editing teacher
 */
interface TeacherFormData {
  maGV: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: string;
  queQuan: string;
  diaChi: string;
  sdt: string;
  email: string;
  maBM: string;
}

interface TeacherFormProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
  teacher?: Teacher | null;
}

/**
 * TeacherForm Component
 *
 * A modal form for creating and editing teacher information.
 * Supports both add and edit modes based on whether a teacher prop is provided.
 */
const TeacherForm: React.FC<TeacherFormProps> = ({
  show,
  onHide,
  onSuccess,
  teacher
}) => {
  const isEditMode = !!teacher;

  // Form state
  const [formData, setFormData] = useState<TeacherFormData>({
    maGV: '',
    hoTen: '',
    ngaySinh: '',
    gioiTinh: '',
    queQuan: '',
    diaChi: '',
    sdt: '',
    email: '',
    maBM: '',
  });
  const [departments, setDepartments] = useState<any[]>([]);

  // UI state
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [validated, setValidated] = useState<boolean>(false);

  /**
   * Fetch departments when modal opens
   */
  useEffect(() => {
    if (show) {
      fetch('/api/departments')
        .then(res => res.json())
        .then(data => setDepartments(data))
        .catch(err => console.error('Error fetching departments:', err));
    }
  }, [show]);

  /**
   * Initialize form data when teacher prop changes
   */
  useEffect(() => {
    if (teacher) {
      setFormData({
        maGV: teacher.maGV,
        hoTen: teacher.hoTen,
        ngaySinh: teacher.ngaySinh ? teacher.ngaySinh.split('T')[0] : '',
        gioiTinh: teacher.gioiTinh !== null ? String(teacher.gioiTinh) : '',
        queQuan: teacher.queQuan || '',
        diaChi: teacher.diaChi || '',
        sdt: teacher.sdt ? String(teacher.sdt) : '',
        email: teacher.email || '',
        maBM: teacher.maBM || '',
      });
    } else {
      // Reset form for add mode
      setFormData({
        maGV: '',
        hoTen: '',
        ngaySinh: '',
        gioiTinh: '',
        queQuan: '',
        diaChi: '',
        sdt: '',
        email: '',
        maBM: '',
      });
    }
    setValidated(false);
    setError(null);
  }, [teacher, show]);

  /**
   * Handle input field changes
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError(null);
  };

  /**
   * Validate form data
   */
  const validateForm = (): boolean => {
    // Check required fields
    if (!formData.hoTen.trim()) {
      setError('Vui lòng nhập họ và tên giáo viên');
      return false;
    }

    // Validate email format if provided
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Định dạng email không hợp lệ');
        return false;
      }
    }

    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setValidated(true);

    // Validate form
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const url = isEditMode
        ? `/api/teachers/${teacher.maGV}`
        : '/api/teachers';

      const method = isEditMode ? 'PUT' : 'POST';

      // Prepare data for API (no maGV needed for create, it's auto-generated)
      const apiData = {
        hoTen: formData.hoTen,
        ngaySinh: formData.ngaySinh || null,
        gioiTinh: formData.gioiTinh ? parseInt(formData.gioiTinh) : null,
        queQuan: formData.queQuan || null,
        diaChi: formData.diaChi || null,
        sdt: formData.sdt ? parseInt(formData.sdt) : null,
        email: formData.email || null,
        maBM: formData.maBM || null,
      };

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Có lỗi xảy ra');
      }

      // Success - reset form and notify parent
      setFormData({
        maGV: '',
        hoTen: '',
        ngaySinh: '',
        gioiTinh: '',
        queQuan: '',
        diaChi: '',
        sdt: '',
        email: '',
        maBM: '',
      });
      setValidated(false);
      onSuccess();
      onHide();
    } catch (err) {
      console.error('Error submitting form:', err);
      setError(err instanceof Error ? err.message : 'Có lỗi không xác định xảy ra');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle modal close
   */
  const handleClose = () => {
    if (!loading) {
      setFormData({
        maGV: '',
        hoTen: '',
        ngaySinh: '',
        gioiTinh: '',
        queQuan: '',
        diaChi: '',
        sdt: '',
        email: '',
        maBM: '',
      });
      setValidated(false);
      setError(null);
      onHide();
    }
  };

  return (
    <Modal
      show={show}
      onHide={handleClose}
      size="lg"
      centered
      backdrop={loading ? 'static' : true}
      keyboard={!loading}
      className="teacher-form-modal"
    >
      <Modal.Header closeButton={!loading} className="border-bottom bg-light">
        <Modal.Title className="d-flex align-items-center">
          <div className={`avatar avatar-md ${isEditMode ? 'bg-info-transparent' : 'bg-primary-transparent'} rounded me-3`}>
            <i className={`ri-${isEditMode ? 'edit-2' : 'user-add'}-line fs-5 ${isEditMode ? 'text-info' : 'text-primary'}`}></i>
          </div>
          <div>
            <h5 className="mb-0 fw-semibold">
              {isEditMode ? 'Chỉnh sửa thông tin Giáo viên' : 'Thêm Giáo viên mới'}
            </h5>
            <p className="mb-0 text-muted fs-12">
              {isEditMode ? 'Cập nhật thông tin giáo viên trong hệ thống' : 'Nhập đầy đủ thông tin giáo viên'}
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {/* Error Alert */}
          {error && (
            <Alert variant="danger" dismissible onClose={() => setError(null)} className="shadow-sm border-0">
              <div className="d-flex align-items-center">
                <i className="ri-error-warning-line fs-4 me-3"></i>
                <div>
                  <h6 className="alert-heading mb-1 fw-semibold">Có lỗi xảy ra</h6>
                  <p className="mb-0">{error}</p>
                </div>
              </div>
            </Alert>
          )}

          {/* Form Sections */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-3 text-primary">
              <i className="ri-information-line me-2"></i>
              Thông tin cơ bản
            </h6>

            <Row className="g-3">
              {/* Mã Giáo viên - Show in edit mode only (read-only) */}
              {isEditMode && (
                <Col md={12}>
                  <Form.Group controlId="teacher-form-ma-gv">
                    <Form.Label className="fw-medium">
                      <i className="ri-id-card-line me-1"></i>
                      Mã Giáo viên
                    </Form.Label>
                    <Form.Control
                      type="text"
                      name="maGV"
                      value={formData.maGV}
                      disabled
                      readOnly
                      className="form-control-lg bg-light"
                    />
                    <Form.Text className="text-muted">
                      <i className="ri-information-line me-1"></i>
                      Mã giáo viên được tạo tự động và không thể thay đổi
                    </Form.Text>
                  </Form.Group>
                </Col>
              )}

              {/* Họ và Tên */}
              <Col md={12}>
                <Form.Group controlId="teacher-form-ho-ten">
                  <Form.Label className="fw-medium">
                    <i className="ri-user-3-line me-1"></i>
                    Họ và Tên <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="hoTen"
                    value={formData.hoTen}
                    onChange={handleChange}
                    placeholder="Nhập họ và tên giáo viên"
                    required
                    disabled={loading}
                    isInvalid={validated && !formData.hoTen.trim()}
                    className="form-control-lg"
                  />
                  <Form.Control.Feedback type="invalid">
                    Vui lòng nhập họ và tên giáo viên
                  </Form.Control.Feedback>
                </Form.Group>
              </Col>

              {/* Ngày sinh */}
              <Col md={6}>
                <Form.Group controlId="teacher-form-ngay-sinh">
                  <Form.Label className="fw-medium">
                    <i className="ri-calendar-line me-1"></i>
                    Ngày sinh
                  </Form.Label>
                  <Form.Control
                    type="date"
                    name="ngaySinh"
                    value={formData.ngaySinh}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>

              {/* Giới tính */}
              <Col md={6}>
                <Form.Group controlId="teacher-form-gioi-tinh">
                  <Form.Label className="fw-medium">
                    <i className="ri-user-2-line me-1"></i>
                    Giới tính
                  </Form.Label>
                  <Form.Select
                    name="gioiTinh"
                    value={formData.gioiTinh}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-select-lg"
                  >
                    <option value="">Chọn giới tính</option>
                    <option value="1">👨 Nam</option>
                    <option value="0">👩 Nữ</option>
                  </Form.Select>
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Contact Information Section */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-3 text-info">
              <i className="ri-contacts-line me-2"></i>
              Thông tin liên hệ
            </h6>
            <Row className="g-3">
              {/* Email */}
              <Col md={6}>
                <Form.Group controlId="teacher-form-email">
                  <Form.Label className="fw-medium">
                    <i className="ri-mail-line me-1"></i>
                    Email
                  </Form.Label>
                  <Form.Control
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="example@email.com"
                    disabled={loading}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>

              {/* Số điện thoại */}
              <Col md={6}>
                <Form.Group controlId="teacher-form-sdt">
                  <Form.Label className="fw-medium">
                    <i className="ri-phone-line me-1"></i>
                    Số điện thoại
                  </Form.Label>
                  <Form.Control
                    type="tel"
                    name="sdt"
                    value={formData.sdt}
                    onChange={handleChange}
                    placeholder="0123456789"
                    disabled={loading}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Address Information Section */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-3 text-success">
              <i className="ri-map-pin-line me-2"></i>
              Địa chỉ
            </h6>
            <Row className="g-3">
              {/* Quê quán */}
              <Col md={6}>
                <Form.Group controlId="teacher-form-que-quan">
                  <Form.Label className="fw-medium">
                    <i className="ri-home-heart-line me-1"></i>
                    Quê quán
                  </Form.Label>
                  <Form.Control
                    type="text"
                    name="queQuan"
                    value={formData.queQuan}
                    onChange={handleChange}
                    placeholder="Nhập quê quán"
                    disabled={loading}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>

              {/* Mã bộ môn */}
              <Col md={6}>
                <Form.Group controlId="teacher-form-ma-bm">
                  <Form.Label className="fw-medium">
                    <i className="ri-book-open-line me-1"></i>
                    Bộ môn
                  </Form.Label>
                  <Form.Select
                    name="maBM"
                    value={formData.maBM}
                    onChange={handleChange}
                    disabled={loading}
                    className="form-control-lg"
                    required
                  >
                    <option value="">-- Chọn bộ môn --</option>
                    {departments.map((dept) => (
                      <option key={dept.maBM} value={dept.maBM}>
                        {dept.tenBM}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {/* Địa chỉ */}
              <Col md={12}>
                <Form.Group controlId="teacher-form-dia-chi">
                  <Form.Label className="fw-medium">
                    <i className="ri-home-4-line me-1"></i>
                    Địa chỉ hiện tại
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={3}
                    name="diaChi"
                    value={formData.diaChi}
                    onChange={handleChange}
                    placeholder="Nhập địa chỉ chi tiết (số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố)"
                    disabled={loading}
                    className="form-control-lg"
                  />
                </Form.Group>
              </Col>
            </Row>
          </div>

          {/* Required fields note */}
          <div className="alert alert-light border mb-0" role="alert">
            <i className="ri-information-line me-2 text-muted"></i>
            <small className="text-muted">
              <span className="text-danger fw-semibold">*</span> Các trường bắt buộc phải nhập
            </small>
          </div>
        </Modal.Body>

        <Modal.Footer className="border-top bg-light">
          <div className="d-flex gap-2 w-100 justify-content-end">
            <SpkButton
              Buttonvariant=""
              Customclass="btn btn-light btn-wave"
              onClickfunc={handleClose}
              disabled={loading}
            >
              <i className="ri-close-circle-line me-2"></i>
              Hủy bỏ
            </SpkButton>
            <SpkButton
              Buttonvariant={isEditMode ? 'info' : 'primary'}
              Customclass="btn-wave px-4"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Đang xử lý...
                </>
              ) : (
                <>
                  <i className={`ri-${isEditMode ? 'save' : 'add-circle'}-line me-2`}></i>
                  {isEditMode ? 'Cập nhật thông tin' : 'Thêm giáo viên'}
                </>
              )}
            </SpkButton>
          </div>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default TeacherForm;
