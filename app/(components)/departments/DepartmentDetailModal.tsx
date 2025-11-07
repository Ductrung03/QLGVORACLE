"use client"

import React from 'react';
import { Modal, Row, Col, Badge } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface Department {
  maBM: string;
  tenBM: string;
  diaChi: string;
  maKhoa: string;
  tenKhoa?: string;
  maChuNhiemBM?: string;
  tenChuNhiem?: string;
}

interface DepartmentDetailModalProps {
  show: boolean;
  onHide: () => void;
  department: Department | null;
  onEdit: () => void;
  onDelete: () => void;
}

const DepartmentDetailModal: React.FC<DepartmentDetailModalProps> = ({
  show,
  onHide,
  department,
  onEdit,
  onDelete
}) => {
  if (!department) return null;

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton className="bg-primary-transparent">
        <Modal.Title className="d-flex align-items-center">
          <div className="avatar avatar-md bg-primary-transparent rounded me-3">
            <i className="ri-organization-chart fs-5 text-primary"></i>
          </div>
          <div>
            <h5 className="mb-0 text-primary">Chi tiết Bộ môn</h5>
            <small className="text-muted">{department.maBM}</small>
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        <Row className="g-4">
          <Col md={6}>
            <div className="info-item">
              <label className="form-label text-muted fw-medium mb-1">
                <i className="ri-hashtag me-2"></i>Mã Bộ môn
              </label>
              <div className="info-value">
                <Badge bg="primary-transparent" className="fs-13 px-3 py-2">
                  {department.maBM}
                </Badge>
              </div>
            </div>
          </Col>

          <Col md={6}>
            <div className="info-item">
              <label className="form-label text-muted fw-medium mb-1">
                <i className="ri-building-line me-2"></i>Thuộc Khoa
              </label>
              <div className="info-value">
                {department.tenKhoa ? (
                  <Badge bg="info-transparent" className="fs-13 px-3 py-2">
                    {department.tenKhoa}
                  </Badge>
                ) : (
                  <span className="text-muted">Chưa có khoa</span>
                )}
              </div>
            </div>
          </Col>

          <Col md={12}>
            <div className="info-item">
              <label className="form-label text-muted fw-medium mb-1">
                <i className="ri-organization-chart me-2"></i>Tên Bộ môn
              </label>
              <div className="info-value">
                <h6 className="mb-0 text-dark">{department.tenBM}</h6>
              </div>
            </div>
          </Col>

          <Col md={12}>
            <div className="info-item">
              <label className="form-label text-muted fw-medium mb-1">
                <i className="ri-map-pin-line me-2"></i>Địa chỉ
              </label>
              <div className="info-value">
                <p className="mb-0 text-dark">{department.diaChi || 'Chưa cập nhật'}</p>
              </div>
            </div>
          </Col>

          <Col md={12}>
            <div className="info-item">
              <label className="form-label text-muted fw-medium mb-1">
                <i className="ri-user-star-line me-2"></i>Chủ nhiệm Bộ môn
              </label>
              <div className="info-value">
                {department.tenChuNhiem ? (
                  <div className="d-flex align-items-center">
                    <div className="avatar avatar-sm bg-success-transparent rounded-circle me-2">
                      <i className="ri-user-line fs-6 text-success"></i>
                    </div>
                    <span className="fw-medium text-dark">{department.tenChuNhiem}</span>
                  </div>
                ) : (
                  <span className="text-muted">Chưa có chủ nhiệm</span>
                )}
              </div>
            </div>
          </Col>
        </Row>

        <div className="mt-4 pt-3 border-top">
          <div className="d-flex align-items-center justify-content-between">
            <div className="d-flex align-items-center">
              <Badge bg="success-transparent" className="me-2">
                <i className="ri-check-line me-1"></i>Hoạt động
              </Badge>
              <small className="text-muted">Trạng thái bộ môn</small>
            </div>
          </div>
        </div>
      </Modal.Body>

      <Modal.Footer className="border-top">
        <SpkButton
          Buttonvariant="light"
          Customclass="btn-sm"
          onClickfunc={onHide}
        >
          <i className="ri-close-line me-1"></i>Đóng
        </SpkButton>
        <SpkButton
          Buttonvariant="primary"
          Customclass="btn-sm"
          onClickfunc={onEdit}
        >
          <i className="ri-edit-line me-1"></i>Chỉnh sửa
        </SpkButton>
        <SpkButton
          Buttonvariant="danger"
          Customclass="btn-sm"
          onClickfunc={onDelete}
        >
          <i className="ri-delete-bin-line me-1"></i>Xóa
        </SpkButton>
      </Modal.Footer>
    </Modal>
  );
};

export default DepartmentDetailModal;
