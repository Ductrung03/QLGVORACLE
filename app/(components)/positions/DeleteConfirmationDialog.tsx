"use client"

import React from 'react';
import { Modal, Button } from 'react-bootstrap';

interface DeleteConfirmationDialogProps {
  show: boolean;
  positionName?: string;
  positionId?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  show,
  positionName,
  positionId,
  onConfirm,
  onCancel,
  isDeleting
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton className="bg-danger text-white">
        <Modal.Title>
          <i className="ri-delete-bin-line me-2"></i>
          Xác nhận xóa
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="text-center py-3">
          <div className="avatar avatar-xl bg-danger-transparent rounded-circle mb-3 mx-auto">
            <i className="ri-delete-bin-line fs-1 text-danger"></i>
          </div>
          <h5 className="mb-3">Bạn có chắc chắn muốn xóa chức vụ này?</h5>
          <p className="text-muted mb-2">
            <strong>{positionName}</strong>
            <br />
            <small className="text-muted">Mã: {positionId}</small>
          </p>
          <div className="alert alert-warning mt-3" role="alert">
            <i className="ri-alert-line me-2"></i>
            Hành động này không thể hoàn tác!
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer className="border-top">
        <Button
          variant="light"
          onClick={onCancel}
          disabled={isDeleting}
        >
          <i className="ri-close-line me-1"></i>
          Hủy
        </Button>
        <Button
          variant="danger"
          onClick={onConfirm}
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
              Xác nhận xóa
            </>
          )}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
