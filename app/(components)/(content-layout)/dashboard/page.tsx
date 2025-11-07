"use client"

import React, { Fragment, useState, useEffect } from 'react';
import { Row, Col, Card } from 'react-bootstrap';
import Seo from '@/shared/layouts-components/seo/seo';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState({
    totalTeachers: 0,
    totalFaculties: 0,
    totalDepartments: 0,
    totalCourses: 0,
    totalResearch: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setIsLoading(true);
        const [teachers, faculties, departments] = await Promise.all([
          fetch('/api/teachers').then(res => res.ok ? res.json() : []),
          fetch('/api/faculties').then(res => res.ok ? res.json() : []),
          fetch('/api/departments').then(res => res.ok ? res.json() : [])
        ]);

        setStats({
          totalTeachers: teachers.length || 0,
          totalFaculties: faculties.length || 0,
          totalDepartments: departments.length || 0,
          totalCourses: 0,
          totalResearch: 0
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <Fragment>
      <Seo title="Dashboard - Hệ thống Quản lý Giáo viên" />

      <div className="d-flex align-items-center justify-content-between mb-4">
        <div>
          <h4 className="fw-semibold mb-1">
            <i className="ri-dashboard-line me-2 text-primary"></i>
            Dashboard
          </h4>
          <p className="text-muted mb-0">Tổng quan hệ thống quản lý giáo viên</p>
        </div>
      </div>

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
                      stats.totalTeachers
                    )}
                  </h3>
                </div>
                <div className="avatar avatar-xl bg-primary-transparent rounded-circle">
                  <i className="ri-team-line fs-2 text-primary"></i>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Số Khoa</p>
                  <h3 className="fw-bold mb-0 text-info">
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      stats.totalFaculties
                    )}
                  </h3>
                </div>
                <div className="avatar avatar-xl bg-info-transparent rounded-circle">
                  <i className="ri-building-line fs-2 text-info"></i>
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
                  <p className="mb-2 text-muted fw-medium fs-13">Số Bộ môn</p>
                  <h3 className="fw-bold mb-0 text-success">
                    {isLoading ? (
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                    ) : (
                      stats.totalDepartments
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
                  <p className="mb-2 text-muted fw-medium fs-13">Học phần</p>
                  <h3 className="fw-bold mb-0 text-warning">{stats.totalCourses}</h3>
                </div>
                <div className="avatar avatar-xl bg-warning-transparent rounded-circle">
                  <i className="ri-book-open-line fs-2 text-warning"></i>
                </div>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col xl={8}>
          <Card className="custom-card">
            <Card.Header>
              <Card.Title>Thống kê theo tháng</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5">
                <i className="ri-bar-chart-line fs-1 text-muted"></i>
                <p className="text-muted mt-3">Biểu đồ thống kê sẽ được cập nhật sau</p>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col xl={4}>
          <Card className="custom-card">
            <Card.Header>
              <Card.Title>Hoạt động gần đây</Card.Title>
            </Card.Header>
            <Card.Body>
              <div className="text-center py-5">
                <i className="ri-time-line fs-1 text-muted"></i>
                <p className="text-muted mt-3">Chưa có hoạt động nào</p>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Fragment>
  );
};

export default DashboardPage;
