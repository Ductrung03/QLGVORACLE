"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Spinner, Alert, Form, Row, Col, InputGroup } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';
import DepartmentDetailModal from './DepartmentDetailModal';
import dynamic from "next/dynamic";
const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

interface Department {
  maBM: string;
  tenBM: string;
  diaChi: string;
  maKhoa: string;
  tenKhoa?: string;
  maChuNhiemBM?: string;
  tenChuNhiem?: string;
}

interface DepartmentListProps {
  onEdit?: (department: Department) => void;
  onDelete?: (department: Department) => void;
}

const DepartmentList: React.FC<DepartmentListProps> = ({ onEdit, onDelete }) => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [facultyFilter, setFacultyFilter] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/departments');
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const data = await response.json();
      setDepartments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleViewDetail = (department: Department) => {
    setSelectedDepartment(department);
    setShowDetailModal(true);
  };

  const handleEditFromDetail = () => {
    if (selectedDepartment && onEdit) {
      onEdit(selectedDepartment);
    }
  };

  const handleDeleteFromDetail = () => {
    if (selectedDepartment) {
      onDelete?.(selectedDepartment);
    }
  };

  const columns: any = useMemo(() => [
    {
      name: 'MÃ BM',
      cell: (row: Department) => (
        <span className="badge bg-primary-transparent fw-semibold">{row.maBM}</span>
      ),
      sortable: true,
      width: '110px',
    },
    {
      name: 'TÊN BỘ MÔN',
      cell: (row: Department) => (
        <div className="d-flex align-items-center py-2">
          <div className="me-3">
            <span className="avatar avatar-md avatar-rounded bg-success-transparent">
              <i className="ri-organization-chart fs-5 text-success"></i>
            </span>
          </div>
          <div>
            <p className="mb-0 fw-semibold text-dark">{row.tenBM}</p>
            <p className="mb-0 text-muted fs-12">
              <i className="ri-building-line me-1"></i>
              {row.tenKhoa || 'Chưa có khoa'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      grow: 2.5,
    },
    {
      name: 'ĐỊA CHỈ',
      cell: (row: Department) => (
        <div className="text-truncate" style={{ maxWidth: '200px' }} title={row.diaChi || 'Chưa cập nhật'}>
          <i className="ri-home-4-line me-1 text-muted"></i>
          <span className="text-muted fs-13">{row.diaChi || 'Chưa cập nhật'}</span>
        </div>
      ),
      sortable: true,
      grow: 1.8,
    },
    {
      name: 'CHỦ NHIỆM',
      cell: (row: Department) => (
        <div>
          {row.tenChuNhiem ? (
            <span className="badge bg-info-transparent">
              <i className="ri-user-star-line me-1"></i>
              {row.tenChuNhiem}
            </span>
          ) : (
            <span className="text-muted fs-12">Chưa có</span>
          )}
        </div>
      ),
      sortable: true,
      width: '150px',
    },
    {
      name: 'HÀNH ĐỘNG',
      cell: (row: Department) => (
        <div className="d-flex gap-1 justify-content-center">
          <SpkButton
            Buttonvariant=""
            Customclass="btn btn-info-light btn-icon btn-sm btn-wave"
            onClickfunc={() => handleViewDetail(row)}
          >
            <i className="ri-eye-line"></i>
          </SpkButton>
          <SpkButton
            Buttonvariant=""
            Customclass="btn btn-primary-light btn-icon btn-sm btn-wave"
            onClickfunc={() => onEdit?.(row)}
          >
            <i className="ri-edit-line"></i>
          </SpkButton>
          <SpkButton
            Buttonvariant=""
            Customclass="btn btn-danger-light btn-icon btn-sm btn-wave"
            onClickfunc={() => onDelete?.(row)}
          >
            <i className="ri-delete-bin-line"></i>
          </SpkButton>
        </div>
      ),
      width: '160px',
    },
  ], [onEdit, onDelete]);

  const filteredDepartments = useMemo(() => {
    let filtered = [...departments];
    if (searchText) {
      filtered = filtered.filter(dept =>
        dept.tenBM.toLowerCase().includes(searchText.toLowerCase()) ||
        dept.maBM.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    if (facultyFilter) {
      filtered = filtered.filter(dept => dept.maKhoa === facultyFilter);
    }
    return filtered;
  }, [departments, searchText, facultyFilter]);

  const faculties = useMemo(() => {
    const facs = new Set(departments.map(d => d.maKhoa).filter(Boolean));
    return Array.from(facs);
  }, [departments]);

  const customStyles = {
    headRow: {
      style: {
        backgroundColor: '#f8f9fa',
        borderBottom: '2px solid #dee2e6',
        fontSize: '13px',
        fontWeight: '600',
        textTransform: 'uppercase' as const,
      },
    },
    headCells: { style: { paddingLeft: '16px', paddingRight: '16px' } },
    cells: { style: { paddingLeft: '16px', paddingRight: '16px', fontSize: '14px' } },
    rows: {
      style: {
        minHeight: '60px',
        '&:hover': { backgroundColor: '#f8f9fa', transition: 'all 0.3s ease' },
      },
    },
  };

  if (loading) {
    return (
      <Card className="custom-card">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary" />
          <p className="mt-3 text-muted">Đang tải danh sách bộ môn...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="custom-card">
        <Card.Body>
          <Alert variant="danger">
            <Alert.Heading>Lỗi khi tải dữ liệu</Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
          <SpkButton Buttonvariant="primary" Customclass="btn-sm mt-3" onClickfunc={fetchDepartments}>
            <i className="ri-refresh-line me-2"></i>Thử lại
          </SpkButton>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="custom-card border-0 shadow-sm">
      <Card.Header className="justify-content-between border-bottom">
        <div className="d-flex align-items-center gap-2">
          <div className="avatar avatar-md bg-success-transparent rounded">
            <i className="ri-organization-chart fs-5 text-success"></i>
          </div>
          <h5 className="card-title mb-0 fw-semibold">Danh sách Bộ môn</h5>
          <span className="badge bg-success-transparent fs-12">
            {filteredDepartments.length}/{departments.length}
          </span>
        </div>

        <Row className="gy-2 align-items-center" style={{ maxWidth: '450px' }}>
          <Col xs="auto">
            <InputGroup size="sm" style={{ minWidth: '200px' }}>
              <InputGroup.Text className="bg-light border-end-0">
                <i className="ri-search-line text-muted"></i>
              </InputGroup.Text>
              <Form.Control
                type="search"
                placeholder="Tìm kiếm..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                className="border-start-0"
              />
            </InputGroup>
          </Col>
          <Col xs="auto">
            <Form.Select
              size="sm"
              value={facultyFilter}
              onChange={(e) => setFacultyFilter(e.target.value)}
              style={{ minWidth: '140px' }}
            >
              <option value="">Tất cả khoa</option>
              {faculties.map(fac => (
                <option key={fac} value={fac}>{fac}</option>
              ))}
            </Form.Select>
          </Col>
          <Col xs="auto">
            <SpkButton
              Buttonvariant=""
              Customclass="btn btn-icon btn-sm btn-light btn-wave"
              onClickfunc={fetchDepartments}
            >
              <i className="ri-refresh-line"></i>
            </SpkButton>
          </Col>
        </Row>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <DataTable
            columns={columns}
            data={filteredDepartments}
            pagination
            paginationPerPage={10}
            paginationRowsPerPageOptions={[10, 20, 30, 50]}
            highlightOnHover
            responsive
            customStyles={customStyles}
            noDataComponent={
              <div className="text-center py-5">
                <i className="ri-inbox-line fs-1 text-muted"></i>
                <p className="mt-3 text-muted">Không tìm thấy dữ liệu</p>
              </div>
            }
          />
        </div>
      </Card.Body>
      
      <DepartmentDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        department={selectedDepartment}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />
    </Card>
  );
};

export default DepartmentList;
