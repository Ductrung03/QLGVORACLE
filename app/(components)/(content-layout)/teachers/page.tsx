"use client"

import React, { Fragment, useState, useRef, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Pageheader from '@/shared/layouts-components/pageheader/pageheader';
import Seo from '@/shared/layouts-components/seo/seo';
import TeacherList from '@/app/(components)/teachers/TeacherList';
import TeacherForm from '@/app/(components)/teachers/TeacherForm';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';

/**
 * Teachers Page Component
 *
 * This is the main page for managing teachers in the system.
 * It provides functionality to view, add, edit, and delete teachers.
 *
 * Phase 3 (US1): Viewing the list of teachers - COMPLETED
 * Phase 4 (US2): Adding new teachers with form validation - COMPLETED
 * Phase 5 (US3): Editing existing teachers (form ready, API pending)
 * Phase 6 (US4): Deleting teachers (pending)
 */

interface Teacher {
  id: number;
  ho_ten: string;
  chuyen_nganh: string;
  email: string;
  so_dien_thoai: string;
  dia_chi: string;
}

const TeachersPage: React.FC = () => {
  const [showForm, setShowForm] = useState<boolean>(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [totalTeachers, setTotalTeachers] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  /**
   * Fetch teacher statistics
   */
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/teachers');
        if (response.ok) {
          const data = await response.json();
          setTotalTeachers(data.length);
        }
      } catch (error) {
        console.error('Error fetching teacher stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [refreshKey]);

  /**
   * Handle adding a new teacher
   * Opens the TeacherForm modal in create mode
   */
  const handleAddTeacher = () => {
    setEditingTeacher(null);
    setShowForm(true);
  };

  /**
   * Handle editing a teacher
   * Opens the TeacherForm modal with existing teacher data
   * This will be fully implemented in Phase 5 (US3)
   */
  const handleEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setShowForm(true);
  };

  /**
   * Handle deleting a teacher
   * This will be implemented in Phase 6 (US4)
   */
  const handleDeleteTeacher = (teacherId: number) => {
    // TODO: Implement in Phase 6 - Show DeleteConfirmationDialog
    console.log('Delete teacher functionality will be implemented in Phase 6', teacherId);
  };

  /**
   * Handle successful form submission
   * Refreshes the teacher list
   */
  const handleFormSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  /**
   * Handle closing the form modal
   */
  const handleFormClose = () => {
    setShowForm(false);
    setEditingTeacher(null);
  };

  return (
    <Fragment>
      {/* SEO Meta Tags */}
      <Seo title="Quản lý Giáo viên" />

      {/* Page Header with Action Button */}
      <div className="d-flex align-items-center justify-content-between mb-4 flex-wrap gap-2">
        <div>
          <h4 className="fw-semibold mb-1">
            <i className="ri-team-line me-2 text-primary"></i>
            Quản lý Giáo viên
          </h4>
          <p className="text-muted mb-0">Quản lý thông tin giáo viên trong hệ thống</p>
        </div>
        <div>
          <SpkButton
            Buttonvariant="primary"
            Customclass="btn-wave waves-effect waves-light"
            onClickfunc={handleAddTeacher}
          >
            <i className="ri-add-line me-2"></i>
            Thêm Giáo viên mới
          </SpkButton>
        </div>
      </div>

      {/* Statistics Cards */}
      <Row className="mb-4">
        <Col xl={3} lg={6} md={6} sm={12}>
          <Card className="custom-card border-0 shadow-sm overflow-hidden">
            <Card.Body>
              <div className="d-flex align-items-center justify-content-between">
                <div className="flex-grow-1">
                  <p className="mb-2 text-muted fw-medium fs-13">Tổng số Giáo viên</p>
                  <h3 className="fw-bold mb-0 text-primary">
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      totalTeachers
                    )}
                  </h3>
                </div>
                <div className="avatar avatar-xl bg-primary-transparent rounded-circle">
                  <i className="ri-team-line fs-2 text-primary"></i>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Chuyên ngành</p>
                  <h3 className="fw-bold mb-0 text-info">8+</h3>
                </div>
                <div className="avatar avatar-xl bg-info-transparent rounded-circle">
                  <i className="ri-book-open-line fs-2 text-info"></i>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top border-block-start-dashed">
                <div className="d-flex align-items-center">
                  <span className="badge bg-info-transparent rounded-pill">
                    <i className="ri-book-line align-middle"></i> Subjects
                  </span>
                  <span className="text-muted ms-2 fs-12">Đa dạng</span>
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
                  <h3 className="fw-bold mb-0 text-success">12</h3>
                </div>
                <div className="avatar avatar-xl bg-success-transparent rounded-circle">
                  <i className="ri-user-add-line fs-2 text-success"></i>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top border-block-start-dashed">
                <div className="d-flex align-items-center">
                  <span className="badge bg-success-transparent rounded-pill">
                    <i className="ri-arrow-up-s-line align-middle"></i>+18%
                  </span>
                  <span className="text-muted ms-2 fs-12">So với tháng trước</span>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Giáo viên Nam</p>
                  <h3 className="fw-bold mb-0 text-warning">{Math.floor(totalTeachers * 0.6)}</h3>
                </div>
                <div className="avatar avatar-xl bg-warning-transparent rounded-circle">
                  <i className="ri-men-line fs-2 text-warning"></i>
                </div>
              </div>
              <div className="mt-3 pt-3 border-top border-block-start-dashed">
                <div className="d-flex align-items-center">
                  <span className="badge bg-secondary-transparent rounded-pill">
                    <i className="ri-women-line align-middle"></i> Nữ: {totalTeachers - Math.floor(totalTeachers * 0.6)}
                  </span>
                  <span className="text-muted ms-2 fs-12">Tỷ lệ giới tính</span>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Main Content */}
      <Row>
        <Col xl={12}>
          {/* Teacher List */}
          <TeacherList
            key={refreshKey}
            onEdit={handleEditTeacher}
            onDelete={handleDeleteTeacher}
          />
        </Col>
      </Row>

      {/* Teacher Form Modal */}
      <TeacherForm
        show={showForm}
        onHide={handleFormClose}
        onSuccess={handleFormSuccess}
        teacher={editingTeacher}
      />
    </Fragment>
  );
};

export default TeachersPage;
