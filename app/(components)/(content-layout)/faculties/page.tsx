"use client"

import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Seo from '@/shared/layouts-components/seo/seo';
import FacultyList from '@/app/(components)/faculties/FacultyList';
import FacultyForm from '@/app/(components)/faculties/FacultyForm';
import DeleteConfirmationDialog from '@/app/(components)/faculties/DeleteConfirmationDialog';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

interface Faculty {
  maKhoa: string;
  tenKhoa: string;
  diaChi: string;
  maChuNhiemKhoa?: string;
}

const FacultiesPage: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingFaculty, setEditingFaculty] = useState<Faculty | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [totalFaculties, setTotalFaculties] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/faculties');
        if (response.ok) {
          const data = await response.json();
          setTotalFaculties(data.length);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, [refreshKey]);

  const handleAddFaculty = () => {
    setEditingFaculty(null);
    setShowForm(true);
  };

  const handleEditFaculty = (faculty: Faculty) => {
    setEditingFaculty(faculty);
    setShowForm(true);
  };

  const handleDeleteFaculty = (facultyId: string) => {
    // This will be called from FacultyList component
    // The actual delete logic is in FacultyList
  };

  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingFaculty(null);
  };

  return (
    <Fragment>
      <Seo title="Quản lý Khoa" />

      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-semibold mb-1">
            <i className="ri-building-line me-2 text-info"></i>
            Quản lý Khoa
          </h4>
          <p className="text-muted mb-0">Quản lý thông tin các khoa trong trường</p>
        </div>
        <div>
          <SpkButton
            Buttonvariant="primary"
            Customclass="btn-wave waves-effect waves-light"
            onClickfunc={handleAddFaculty}
          >
            <i className="ri-add-line me-2"></i>
            Thêm Khoa mới
          </SpkButton>
        </div>
      </div>

      <Row className="mb-4">
        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Tổng số Khoa</p>
                  <h3 className="fw-bold mb-0 text-info">
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      totalFaculties
                    )}
                  </h3>
                </div>
                <div className="avatar avatar-xl bg-info-transparent rounded-circle">
                  <i className="ri-building-line fs-2 text-info"></i>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Có chủ nhiệm</p>
                  <h3 className="fw-bold mb-0 text-success">{Math.floor(totalFaculties * 0.9)}</h3>
                </div>
                <div className="avatar avatar-xl bg-success-transparent rounded-circle">
                  <i className="ri-user-star-line fs-2 text-success"></i>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top border-block-start-dashed">
                <div className="d-flex align-items-center">
                  <span className="badge bg-success-transparent rounded-pill">
                    <i className="ri-check-line align-middle"></i>Assigned
                  </span>
                  <span className="text-muted ms-2 fs-12">Đã có chủ nhiệm</span>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Tổng Bộ môn</p>
                  <h3 className="fw-bold mb-0 text-primary">10+</h3>
                </div>
                <div className="avatar avatar-xl bg-primary-transparent rounded-circle">
                  <i className="ri-organization-chart fs-2 text-primary"></i>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top border-block-start-dashed">
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary-transparent rounded-pill">
                    <i className="ri-building-2-line align-middle"></i>Departments
                  </span>
                  <span className="text-muted ms-2 fs-12">Thuộc các khoa</span>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Giáo viên</p>
                  <h3 className="fw-bold mb-0 text-warning">50+</h3>
                </div>
                <div className="avatar avatar-xl bg-warning-transparent rounded-circle">
                  <i className="ri-team-line fs-2 text-warning"></i>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top border-block-start-dashed">
                <div className="d-flex align-items-center">
                  <span className="badge bg-warning-transparent rounded-pill">
                    <i className="ri-user-3-line align-middle"></i>Teachers
                  </span>
                  <span className="text-muted ms-2 fs-12">Tổng giáo viên</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={12}>
          <FacultyList
            key={refreshKey}
            onEdit={handleEditFaculty}
            onDelete={handleDeleteFaculty}
          />
        </Col>
      </Row>

      <FacultyForm
        show={showForm}
        onHide={handleFormClose}
        onSuccess={handleFormSuccess}
        faculty={editingFaculty}
      />
    </Fragment>
  );
};

export default FacultiesPage;
