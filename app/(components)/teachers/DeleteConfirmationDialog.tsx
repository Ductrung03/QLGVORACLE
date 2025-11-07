"use client"

import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

/**
 * Props for DeleteConfirmationDialog component
 */
interface DeleteConfirmationDialogProps {
  show: boolean;
  teacherName?: string;
  teacherId?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

/**
 * DeleteConfirmationDialog Component
 *
 * A modal dialog that asks for user confirmation before deleting a teacher.
 * Displays the teacher's name for clarity and prevents accidental deletions.
 */
const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
  show,
  teacherName,
  teacherId,
  onConfirm,
  onCancel,
  isDeleting = false
}) => {
  return (
    <Modal
      show={show}
      onHide={onCancel}
      centered
      backdrop={isDeleting ? 'static' : true}
      keyboard={!isDeleting}
    >
      <Modal.Header closeButton={!isDeleting}>
        <Modal.Title>
          <i className="ri-alert-line text-danger me-2"></i>
          Xác nhận xóa giáo viên
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <div className="text-center py-3">
          <div className="mb-3">
            <i className="ri-delete-bin-5-line text-danger" style={{ fontSize: '3rem' }}></i>
          </div>

          <h5 className="mb-3">Bạn có chắc chắn muốn xóa giáo viên này?</h5>

          {teacherName && (
            <div className="alert alert-warning mb-3">
              <strong>Giáo viên:</strong> {teacherName}
              {teacherId && (
                <span className="text-muted"> (Mã GV: {teacherId})</span>
              )}
            </div>
          )}

          <p className="text-muted mb-0">
            <i className="ri-error-warning-line me-1"></i>
            Hành động này không thể hoàn tác. Tất cả dữ liệu liên quan đến giáo viên này sẽ bị xóa vĩnh viễn.
          </p>
        </div>
      </Modal.Body>

      <Modal.Footer>
        <SpkButton
          Buttonvariant="secondary-light"
          Customclass="btn-sm"
          onClickfunc={onCancel}
          disabled={isDeleting}
        >
          <i className="ri-close-line me-1"></i>
          Hủy
        </SpkButton>

        <SpkButton
          Buttonvariant="danger"
          Customclass="btn-sm"
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
              <i className="ri-delete-bin-5-line me-1"></i>
              Xác nhận xóa
            </>
          )}
        </SpkButton>
      </Modal.Footer>
    </Modal>
  );
};

export default DeleteConfirmationDialog;
