"use client"

import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Seo from '@/shared/layouts-components/seo/seo';
import PositionList from '@/app/(components)/positions/PositionList';
import PositionForm from '@/app/(components)/positions/PositionForm';
import DeleteConfirmationDialog from '@/app/(components)/positions/DeleteConfirmationDialog';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface Position {
  maChucVu: string;
  tenChucVu: string;
  moTa?: string;
}

const PositionsPage: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingPosition, setEditingPosition] = useState<Position | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [totalPositions, setTotalPositions] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [positionToDelete, setPositionToDelete] = useState<Position | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/positions');
        if (response.ok) {
          const data = await response.json();
          setTotalPositions(data.length);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  const handleAddPosition = () => {
    setEditingPosition(null);
    setShowForm(true);
  };

  const handleEditPosition = (position: Position) => {
    setEditingPosition(position);
    setShowForm(true);
  };

  const handleDeletePosition = (position: Position) => {
    setPositionToDelete(position);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!positionToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/positions/${positionToDelete.maChucVu}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRefreshKey(prev => prev + 1);
        setShowDeleteDialog(false);
        setPositionToDelete(null);
      } else {
        const errorData = await response.json();
        alert(`Lỗi: ${errorData.message || 'Không thể xóa chức vụ'}`);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa chức vụ');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setPositionToDelete(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingPosition(null);
  };

  return (
    <Fragment>
      <Seo title="Quản lý Chức vụ" />

      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-semibold mb-1">
            <i className="ri-shield-user-line me-2 text-warning"></i>
            Quản lý Chức vụ
          </h4>
          <p className="text-muted mb-0">Quản lý các chức vụ trong trường</p>
        </div>
        <div>
          <SpkButton
            Buttonvariant="primary"
            Customclass="btn-wave waves-effect waves-light"
            onClickfunc={handleAddPosition}
          >
            <i className="ri-add-line me-2"></i>
            Thêm Chức vụ mới
          </SpkButton>
        </div>
      </div>

      <Row className="mb-4">
        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Tổng số Chức vụ</p>
                  <h3 className="fw-bold mb-0 text-warning">
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      totalPositions
                    )}
                  </h3>
                </div>
                <div className="avatar avatar-xl bg-warning-transparent rounded-circle">
                  <i className="ri-shield-user-line fs-2 text-warning"></i>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top border-block-start-dashed">
                <div className="d-flex align-items-center">
                  <span className="badge bg-success-transparent rounded-pill">
                    <i className="ri-arrow-up-s-line align-middle"></i>Active
                  </span>
                  <span className="text-muted ms-2 fs-12">Đang hoạt động</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Chức vụ lãnh đạo</p>
                  <h3 className="fw-bold mb-0 text-primary">{Math.floor(totalPositions * 0.3)}</h3>
                </div>
                <div className="avatar avatar-xl bg-primary-transparent rounded-circle">
                  <i className="ri-shield-star-line fs-2 text-primary"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Chức vụ giảng dạy</p>
                  <h3 className="fw-bold mb-0 text-info">{Math.floor(totalPositions * 0.7)}</h3>
                </div>
                <div className="avatar avatar-xl bg-info-transparent rounded-circle">
                  <i className="ri-user-star-line fs-2 text-info"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Đã phân công</p>
                  <h3 className="fw-bold mb-0 text-success">{Math.floor(totalPositions * 0.6)}</h3>
                </div>
                <div className="avatar avatar-xl bg-success-transparent rounded-circle">
                  <i className="ri-checkbox-circle-line fs-2 text-success"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <PositionList
            key={refreshKey}
            onEdit={handleEditPosition}
            onDelete={handleDeletePosition}
          />
        </Col>
      </Row>

      <PositionForm
        show={showForm}
        onHide={handleFormClose}
        onSuccess={handleFormSuccess}
        position={editingPosition}
      />

      <DeleteConfirmationDialog
        show={showDeleteDialog}
        positionName={positionToDelete?.tenChucVu}
        positionId={positionToDelete?.maChucVu}
        onConfirm={confirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </Fragment>
  );
};

export default PositionsPage;
