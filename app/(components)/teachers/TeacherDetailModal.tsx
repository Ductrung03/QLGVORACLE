"use client"

import React from 'react';
import { Modal, Row, Col, Badge } from 'react-bootstrap';
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

interface TeacherDetailModalProps {
  show: boolean;
  onHide: () => void;
  teacher: Teacher | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

/**
 * TeacherDetailModal Component
 *
 * Hiển thị chi tiết thông tin giáo viên trong modal
 */
const TeacherDetailModal: React.FC<TeacherDetailModalProps> = ({
  show,
  onHide,
  teacher,
  onEdit,
  onDelete
}) => {
  if (!teacher) return null;

  /**
   * Format date to Vietnamese format
   */
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Chưa cập nhật';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <Modal
      show={show}
      onHide={onHide}
      size="lg"
      centered
      className="teacher-detail-modal"
    >
      <Modal.Header closeButton className="border-bottom bg-light">
        <Modal.Title className="d-flex align-items-center">
          <div className="avatar avatar-lg bg-primary-transparent rounded me-3">
            <i className="ri-user-3-line fs-3 text-primary"></i>
          </div>
          <div>
            <h5 className="mb-0 fw-semibold">Chi tiết Giáo viên</h5>
            <p className="mb-0 text-muted fs-12">
              Thông tin chi tiết của giáo viên
            </p>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Header Info */}
        <div className="text-center mb-4 pb-4 border-bottom">
          <div className="avatar avatar-xxl bg-primary-transparent rounded-circle mb-3 mx-auto">
            <i className="ri-user-3-fill fs-1 text-primary"></i>
          </div>
          <h4 className="fw-bold mb-2">{teacher.hoTen}</h4>
          <Badge bg="primary-transparent" className="fs-13 px-3 py-2">
            <i className="ri-id-card-line me-1"></i>
            {teacher.maGV}
          </Badge>
        </div>

        {/* Thông tin cơ bản */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-3 text-primary border-bottom pb-2">
            <i className="ri-information-line me-2"></i>
            Thông tin cơ bản
          </h6>
          <Row className="g-3">
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <p className="text-muted mb-1 fs-12">
                  <i className="ri-calendar-line me-1"></i>
                  Ngày sinh
                </p>
                <p className="mb-0 fw-semibold">{formatDate(teacher.ngaySinh)}</p>
              </div>
            </Col>
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <p className="text-muted mb-1 fs-12">
                  <i className="ri-user-2-line me-1"></i>
                  Giới tính
                </p>
                <p className="mb-0 fw-semibold">
                  {teacher.gioiTinh === 1 ? (
                    <Badge bg="info-transparent">
                      <i className="ri-men-line me-1"></i>Nam
                    </Badge>
                  ) : teacher.gioiTinh === 0 ? (
                    <Badge bg="pink-transparent">
                      <i className="ri-women-line me-1"></i>Nữ
                    </Badge>
                  ) : (
                    'Chưa cập nhật'
                  )}
                </p>
              </div>
            </Col>
            <Col md={12}>
              <div className="p-3 bg-light rounded">
                <p className="text-muted mb-1 fs-12">
                  <i className="ri-book-open-line me-1"></i>
                  Mã bộ môn
                </p>
                <p className="mb-0 fw-semibold">{teacher.maBM || 'Chưa cập nhật'}</p>
              </div>
            </Col>
          </Row>
        </div>

        {/* Thông tin liên hệ */}
        <div className="mb-4">
          <h6 className="fw-semibold mb-3 text-info border-bottom pb-2">
            <i className="ri-contacts-line me-2"></i>
            Thông tin liên hệ
          </h6>
          <Row className="g-3">
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <p className="text-muted mb-1 fs-12">
                  <i className="ri-mail-line me-1"></i>
                  Email
                </p>
                {teacher.email ? (
                  <a href={`mailto:${teacher.email}`} className="text-decoration-none fw-semibold">
                    {teacher.email}
                  </a>
                ) : (
                  <p className="mb-0 text-muted">Chưa cập nhật</p>
                )}
              </div>
            </Col>
            <Col md={6}>
              <div className="p-3 bg-light rounded">
                <p className="text-muted mb-1 fs-12">
                  <i className="ri-phone-line me-1"></i>
                  Số điện thoại
                </p>
                {teacher.sdt ? (
                  <a href={`tel:${teacher.sdt}`} className="text-decoration-none fw-semibold">
                    {teacher.sdt}
                  </a>
                ) : (
                  <p className="mb-0 text-muted">Chưa cập nhật</p>
                )}
              </div>
            </Col>
          </Row>
        </div>

        {/* Địa chỉ */}
        <div className="mb-0">
          <h6 className="fw-semibold mb-3 text-success border-bottom pb-2">
            <i className="ri-map-pin-line me-2"></i>
            Địa chỉ
          </h6>
          <Row className="g-3">
            <Col md={12}>
              <div className="p-3 bg-light rounded">
                <p className="text-muted mb-1 fs-12">
                  <i className="ri-home-heart-line me-1"></i>
                  Quê quán
                </p>
                <p className="mb-0 fw-semibold">{teacher.queQuan || 'Chưa cập nhật'}</p>
              </div>
            </Col>
            <Col md={12}>
              <div className="p-3 bg-light rounded">
                <p className="text-muted mb-1 fs-12">
                  <i className="ri-home-4-line me-1"></i>
                  Địa chỉ hiện tại
                </p>
                <p className="mb-0 fw-semibold">{teacher.diaChi || 'Chưa cập nhật'}</p>
              </div>
            </Col>
          </Row>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top bg-light">
        <div className="d-flex gap-2 w-100 justify-content-between">
          <SpkButton
            Buttonvariant=""
            Customclass="btn btn-light btn-wave"
            onClickfunc={onHide}
          >
            <i className="ri-close-line me-2"></i>
            Đóng
          </SpkButton>
          <div className="d-flex gap-2">
            {onEdit && (
              <SpkButton
                Buttonvariant="info"
                Customclass="btn-wave"
                onClickfunc={() => {
                  onHide();
                  onEdit();
                }}
              >
                <i className="ri-edit-line me-2"></i>
                Chỉnh sửa
              </SpkButton>
            )}
            {onDelete && (
              <SpkButton
                Buttonvariant="danger"
                Customclass="btn-wave"
                onClickfunc={() => {
                  onHide();
                  onDelete();
                }}
              >
                <i className="ri-delete-bin-line me-2"></i>
                Xóa
              </SpkButton>
            )}
          </div>
        </div>
      </Modal.Footer>
    </Modal>
  );
};

export default TeacherDetailModal;
