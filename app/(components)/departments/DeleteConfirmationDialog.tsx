"use client"

import React from 'react';
import { Modal } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface DeleteConfirmationDialogProps {
  show: boolean;
  departmentName?: string;
  departmentId?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  show,
  departmentName,
  departmentId,
  onConfirm,
  onCancel,
  isDeleting
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered size="sm">
      <Modal.Header closeButton className="bg-danger-transparent">
        <Modal.Title className="text-danger">
          <i className="ri-delete-bin-line me-2"></i>
          Xác nhận xóa
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="text-center py-4">
        <div className="avatar avatar-xl bg-danger-transparent rounded-circle mx-auto mb-3">
          <i className="ri-delete-bin-line fs-2 text-danger"></i>
        </div>
        
        <h6 className="fw-semibold mb-2">Bạn có chắc chắn muốn xóa bộ môn này?</h6>
        
        {departmentName && (
          <div className="mb-3">
            <p className="text-muted mb-1">Tên bộ môn:</p>
            <p className="fw-medium text-dark mb-0">{departmentName}</p>
          </div>
        )}
        
        {departmentId && (
          <div className="mb-3">
            <p className="text-muted mb-1">Mã bộ môn:</p>
            <span className="badge bg-danger-transparent">{departmentId}</span>
          </div>
        )}
        
        <div className="alert alert-warning-transparent d-flex align-items-start text-start">
          <i className="ri-alert-line me-2 mt-1 text-warning"></i>
          <div>
            <strong>Cảnh báo:</strong> Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
          </div>
        </div>
      </Modal.Body>
      
      <Modal.Footer className="justify-content-center border-top-0">
        <SpkButton
          Buttonvariant="light"
          onClickfunc={onCancel}
          disabled={isDeleting}
          Customclass="me-2"
        >
          <i className="ri-close-line me-1"></i>
          Hủy
        </SpkButton>
        
        <SpkButton
          Buttonvariant="danger"
          onClickfunc={onConfirm}
          disabled={isDeleting}
        >
          {isDeleting ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
              Đang xóa...
            </>
          ) : (
            <>
              <i className="ri-delete-bin-line me-1"></i>
              Xóa bộ môn
            </>
          )}
        </SpkButton>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
