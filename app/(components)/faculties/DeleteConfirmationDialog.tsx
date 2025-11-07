"use client"

import React from 'react';
import { Modal } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface DeleteConfirmationDialogProps {
  show: boolean;
  facultyName?: string;
  facultyId?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  show,
  facultyName,
  facultyId,
  onConfirm,
  onCancel,
  isDeleting
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered size="sm">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="text-danger">
          <i className="ri-error-warning-line me-2"></i>
          Xác nhận xóa
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="text-center py-4">
        <div className="avatar avatar-xl bg-danger-transparent rounded-circle mx-auto mb-3">
          <i className="ri-delete-bin-line fs-2 text-danger"></i>
        </div>

        <h5 className="mb-2">Bạn có chắc chắn muốn xóa?</h5>

        {facultyName && (
          <div className="bg-light rounded p-3 mb-3">
            <p className="mb-1 fw-semibold text-dark">{facultyName}</p>
            {facultyId && (
              <p className="mb-0 text-muted fs-12">Mã Khoa: {facultyId}</p>
            )}
          </div>
        )}

        <p className="text-muted mb-0">
          Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan sẽ bị xóa vĩnh viễn.
        </p>
      </Modal.Body>

      <Modal.Footer className="border-0 pt-0">
        <SpkButton
          Buttonvariant="light"
          Customclass="btn-wave w-100"
          onClickfunc={onCancel}
          disabled={isDeleting}
        >
          <i className="ri-close-line me-2"></i>
          Hủy
        </SpkButton>
        <SpkButton
          Buttonvariant="danger"
          Customclass="btn-wave w-100"
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
              <i className="ri-delete-bin-line me-2"></i>
              Xóa ngay
            </>
          )}
        </SpkButton>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
