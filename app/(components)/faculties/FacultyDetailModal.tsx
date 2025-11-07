"use client"

import React from 'react';
import { Modal, Row, Col, Badge } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface Faculty {
  maKhoa: string;
  tenKhoa: string;
  diaChi: string;
  maChuNhiemKhoa?: string;
  tenChuNhiem?: string;
}

interface FacultyDetailModalProps {
  show: boolean;
  onHide: () => void;
  faculty: Faculty | null;
  onEdit?: () => void;
  onDelete?: () => void;
}

const FacultyDetailModal: React.FC<FacultyDetailModalProps> = ({
  show,
  onHide,
  faculty,
  onEdit,
  onDelete
}) => {
  if (!faculty) return null;

  const handleEdit = () => {
    onHide();
    if (onEdit) onEdit();
  };

  const handleDelete = () => {
    onHide();
    if (onDelete) onDelete();
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
              <h5 className="mb-0">Chi tiết Khoa</h5>
              <p className="mb-0 fs-12 text-muted fw-normal">Thông tin chi tiết về khoa</p>
            </div>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Row className="g-4">
          {/* Mã Khoa */}
          <Col md={6}>
            <div className="detail-item">
              <label className="text-muted mb-2 fw-medium fs-13">
                <i className="ri-key-2-line me-2"></i>Mã Khoa
              </label>
              <div>
                <Badge bg="info-transparent" className="fs-14 fw-semibold px-3 py-2">
                  {faculty.maKhoa}
                </Badge>
              </div>
            </div>
          </Col>

          {/* Tên Khoa */}
          <Col md={6}>
            <div className="detail-item">
              <label className="text-muted mb-2 fw-medium fs-13">
                <i className="ri-building-line me-2"></i>Tên Khoa
              </label>
              <p className="mb-0 fw-semibold text-dark fs-15">{faculty.tenKhoa}</p>
            </div>
          </Col>

          {/* Địa chỉ */}
          <Col md={12}>
            <div className="detail-item">
              <label className="text-muted mb-2 fw-medium fs-13">
                <i className="ri-map-pin-line me-2"></i>Địa chỉ
              </label>
              <p className="mb-0 text-dark">{faculty.diaChi || 'Chưa cập nhật'}</p>
            </div>
          </Col>

          {/* Chủ nhiệm Khoa */}
          <Col md={12}>
            <div className="detail-item">
              <label className="text-muted mb-2 fw-medium fs-13">
                <i className="ri-user-star-line me-2"></i>Chủ nhiệm Khoa
              </label>
              {faculty.tenChuNhiem ? (
                <div className="d-flex align-items-center gap-2">
                  <div className="avatar avatar-sm bg-success-transparent rounded-circle">
                    <i className="ri-user-3-line text-success"></i>
                  </div>
                  <div>
                    <p className="mb-0 fw-semibold text-dark">{faculty.tenChuNhiem}</p>
                    <p className="mb-0 text-muted fs-12">Mã GV: {faculty.maChuNhiemKhoa}</p>
                  </div>
                </div>
              ) : (
                <p className="mb-0 text-muted">Chưa có chủ nhiệm</p>
              )}
            </div>
          </Col>

          {/* Trạng thái */}
          <Col md={12}>
            <div className="detail-item">
              <label className="text-muted mb-2 fw-medium fs-13">
                <i className="ri-checkbox-circle-line me-2"></i>Trạng thái
              </label>
              <div>
                <Badge bg="success-transparent" className="fs-13 px-3 py-2">
                  <i className="ri-check-line me-1"></i>Đang hoạt động
                </Badge>
              </div>
            </div>
          </Col>
        </Row>
      </Modal.Body>

      <Modal.Footer className="border-top">
        <SpkButton
          Buttonvariant="light"
          Customclass="btn-wave"
          onClickfunc={onHide}
        >
          <i className="ri-close-line me-2"></i>Đóng
        </SpkButton>
        {onDelete && (
          <SpkButton
            Buttonvariant="danger"
            Customclass="btn-wave"
            onClickfunc={handleDelete}
          >
            <i className="ri-delete-bin-line me-2"></i>Xóa
          </SpkButton>
        )}
        {onEdit && (
          <SpkButton
            Buttonvariant="primary"
            Customclass="btn-wave"
            onClickfunc={handleEdit}
          >
            <i className="ri-edit-line me-2"></i>Chỉnh sửa
          </SpkButton>
        )}
      </Modal.Footer>
    </Modal>
  );
};

export default FacultyDetailModal;
