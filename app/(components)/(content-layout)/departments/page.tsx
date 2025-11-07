"use client"

import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Seo from '@/shared/layouts-components/seo/seo';
import DepartmentList from '@/app/(components)/departments/DepartmentList';
import DepartmentForm from '@/app/(components)/departments/DepartmentForm';
import DeleteConfirmationDialog from '@/app/(components)/departments/DeleteConfirmationDialog';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface Department {
  maBM: string;
  tenBM: string;
  diaChi: string;
  maKhoa: string;
  maChuNhiemBM?: string;
}

const DepartmentsPage: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingDepartment, setEditingDepartment] = useState<Department | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [totalDepartments, setTotalDepartments] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [departmentToDelete, setDepartmentToDelete] = useState<Department | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/departments');
        if (response.ok) {
          const data = await response.json();
          setTotalDepartments(data.length);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  const handleAddDepartment = () => {
    setEditingDepartment(null);
    setShowForm(true);
  };

  const handleEditDepartment = (department: Department) => {
    setEditingDepartment(department);
    setShowForm(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setDepartmentToDelete(department);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!departmentToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/departments/${departmentToDelete.maBM}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setRefreshKey(prev => prev + 1);
        setShowDeleteDialog(false);
        setDepartmentToDelete(null);
      } else {
        const errorData = await response.json();
        alert(`Lỗi: ${errorData.message || 'Không thể xóa bộ môn'}`);
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa bộ môn');
      console.error('Delete error:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setDepartmentToDelete(null);
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingDepartment(null);
  };

  return (
    <Fragment>
      <Seo title="Quản lý Bộ môn" />

      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-semibold mb-1">
            <i className="ri-organization-chart me-2 text-primary"></i>
            Quản lý Bộ môn
          </h4>
          <p className="text-muted mb-0">Quản lý thông tin các bộ môn thuộc khoa</p>
        </div>
        <div>
          <SpkButton
            Buttonvariant="primary"
            Customclass="btn-wave waves-effect waves-light"
            onClickfunc={handleAddDepartment}
          >
            <i className="ri-add-line me-2"></i>
            Thêm Bộ môn mới
          </SpkButton>
        </div>
      </div>

      <Row className="mb-4">
        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Tổng số Bộ môn</p>
                  <h3 className="fw-bold mb-0 text-success">
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      totalDepartments
                    )}
                  </h3>
                </div>
                <div className="avatar avatar-xl bg-success-transparent rounded-circle">
                  <i className="ri-organization-chart fs-2 text-success"></i>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Có chủ nhiệm</p>
                  <h3 className="fw-bold mb-0 text-info">{Math.floor(totalDepartments * 0.8)}</h3>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Hoạt động</p>
                  <h3 className="fw-bold mb-0 text-primary">{totalDepartments}</h3>
                </div>
                <div className="avatar avatar-xl bg-primary-transparent rounded-circle">
                  <i className="ri-check-double-line fs-2 text-primary"></i>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Thêm mới tháng này</p>
                  <h3 className="fw-bold mb-0 text-warning">3</h3>
                </div>
                <div className="avatar avatar-xl bg-warning-transparent rounded-circle">
                  <i className="ri-add-circle-line fs-2 text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <DepartmentList
            key={refreshKey}
            onEdit={handleEditDepartment}
            onDelete={handleDeleteDepartment}
          />
        </Col>
      </Row>

      <DepartmentForm
        show={showForm}
        onHide={handleFormClose}
        onSuccess={handleFormSuccess}
        department={editingDepartment}
      />

      <DeleteConfirmationDialog
        show={showDeleteDialog}
        departmentName={departmentToDelete?.tenBM}
        departmentId={departmentToDelete?.maBM}
        onConfirm={confirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />
    </Fragment>
  );
};

export default DepartmentsPage;
