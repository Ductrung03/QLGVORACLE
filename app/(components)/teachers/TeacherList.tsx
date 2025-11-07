"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Spinner, Alert, Form, Row, Col, InputGroup } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';
import Link from 'next/link';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import TeacherDetailModal from './TeacherDetailModal';
import dynamic from "next/dynamic";
const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

/**
 * Teacher interface matching API response
 */
interface Teacher {
  maGV: string;
  hoTen: string;
  ngaySinh: string | null;
  gioiTinh: number | null;
  queQuan: string;
  diaChi: string;
  sdt: number | null;
  email: string;
  maBM: string;
}

interface TeacherListProps {
  onEdit?: (teacher: Teacher) => void;
  onDelete?: (teacherId: string) => void;
}

/**
 * TeacherList Component
 *
 * Displays a list of teachers in a table format with options to edit and delete.
 * Fetches teacher data from the /api/teachers endpoint.
 */
const TeacherList: React.FC<TeacherListProps> = ({ onEdit, onDelete }) => {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [teacherToDelete, setTeacherToDelete] = useState<Teacher | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [genderFilter, setGenderFilter] = useState<string>('');
  const [departmentFilter, setDepartmentFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('');

  /**
   * Fetch teachers from the API
   */
  const fetchTeachers = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/teachers');

      if (!response.ok) {
        throw new Error(`Failed to fetch teachers: ${response.statusText}`);
      }

      const data = await response.json();
      setTeachers(data);
    } catch (err) {
      console.error('Error fetching teachers:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Load teachers on component mount
   */
  useEffect(() => {
    fetchTeachers();
  }, []);

  /**
   * DataTable columns configuration (theo style template)
   * IMPORTANT: useMemo must be called before any conditional returns to follow React Hooks rules
   */
  const columns: any = useMemo(() => [
    {
      name: 'MÃ GV',
      cell: (row: Teacher) => (
        <div>
          <span className="badge bg-primary-transparent fw-semibold">{row.maGV}</span>
        </div>
      ),
      sortable: true,
      width: '110px',
    },
    {
      name: 'HỌ VÀ TÊN',
      cell: (row: Teacher) => (
        <div className="d-flex align-items-center py-2">
          <div className="me-3">
            <span className="avatar avatar-md avatar-rounded bg-primary-transparent">
              <i className="ri-user-3-line fs-5 text-primary"></i>
            </span>
          </div>
          <div>
            <p className="mb-0 fw-semibold text-dark">{row.hoTen}</p>
            <p className="mb-0 text-muted fs-12">
              <i className="ri-map-pin-line me-1"></i>
              {row.queQuan || 'Chưa cập nhật'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      grow: 2.5,
    },
    {
      name: 'GIỚI TÍNH',
      cell: (row: Teacher) => {
        if (row.gioiTinh === 1) {
          return <span className="badge bg-info-transparent"><i className="ri-men-line me-1"></i>Nam</span>;
        } else if (row.gioiTinh === 0) {
          return <span className="badge bg-pink-transparent"><i className="ri-women-line me-1"></i>Nữ</span>;
        }
        return <span className="text-muted fs-12">-</span>;
      },
      sortable: true,
      width: '120px',
    },
    {
      name: 'LIÊN HỆ',
      cell: (row: Teacher) => (
        <div>
          <p className="mb-1 fw-medium">
            {row.email ? (
              <a href={`mailto:${row.email}`} className="text-primary text-decoration-none">
                <i className="ri-mail-line me-1"></i>
                {row.email}
              </a>
            ) : (
              <span className="text-muted fs-12">Chưa có email</span>
            )}
          </p>
          <p className="mb-0 text-muted fs-12">
            {row.sdt ? (
              <>
                <i className="ri-phone-line me-1"></i>
                {row.sdt}
              </>
            ) : (
              'Chưa có SĐT'
            )}
          </p>
        </div>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: 'ĐỊA CHỈ',
      cell: (row: Teacher) => (
        <div className="text-truncate" style={{ maxWidth: '200px' }} title={row.diaChi || 'Chưa cập nhật'}>
          <i className="ri-home-4-line me-1 text-muted"></i>
          <span className="text-muted fs-13">{row.diaChi || 'Chưa cập nhật'}</span>
        </div>
      ),
      sortable: true,
      grow: 1.8,
    },
    {
      name: 'HÀNH ĐỘNG',
      cell: (row: Teacher) => (
        <div className="d-flex gap-1 justify-content-center">
          <SpkButton
            Buttonvariant=""
            Customclass="btn btn-info-light btn-icon btn-sm btn-wave"
            onClickfunc={() => handleViewDetail(row)}
            aria-label="Xem chi tiết giáo viên"
          >
            <i className="ri-eye-line"></i>
          </SpkButton>
          <SpkButton
            Buttonvariant=""
            Customclass="btn btn-primary-light btn-icon btn-sm btn-wave"
            onClickfunc={() => handleEdit(row)}
            aria-label="Chỉnh sửa giáo viên"
          >
            <i className="ri-edit-line"></i>
          </SpkButton>
          <SpkButton
            Buttonvariant=""
            Customclass="btn btn-danger-light btn-icon btn-sm btn-wave"
            onClickfunc={() => handleDelete(row)}
            aria-label="Xóa giáo viên"
          >
            <i className="ri-delete-bin-line"></i>
          </SpkButton>
        </div>
      ),
      width: '160px',
    },
  ], []);

  /**
   * Filter and search teachers
   */
  const filteredTeachers = useMemo(() => {
    let filtered = [...teachers];

    // Search filter
    if (searchText) {
      filtered = filtered.filter(teacher =>
        teacher.hoTen.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.maGV.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.email?.toLowerCase().includes(searchText.toLowerCase()) ||
        teacher.sdt?.toString().includes(searchText)
      );
    }

    // Gender filter
    if (genderFilter) {
      filtered = filtered.filter(teacher => {
        if (genderFilter === '1') return teacher.gioiTinh === 1;
        if (genderFilter === '0') return teacher.gioiTinh === 0;
        return true;
      });
    }

    // Department filter
    if (departmentFilter) {
      filtered = filtered.filter(teacher => teacher.maBM === departmentFilter);
    }

    // Sort
    if (sortBy === 'name') {
      filtered.sort((a, b) => a.hoTen.localeCompare(b.hoTen));
    } else if (sortBy === 'date') {
      filtered.sort((a, b) => (a.maGV > b.maGV ? -1 : 1));
    }

    return filtered;
  }, [teachers, searchText, genderFilter, departmentFilter, sortBy]);

  /**
   * Get unique departments from teachers
   */
  const departments = useMemo(() => {
    const depts = new Set(teachers.map(t => t.maBM).filter(Boolean));
    return Array.from(depts);
  }, [teachers]);

  /**
   * Custom pagination styles
   */
  const paginationComponentOptions = {
    rowsPerPageText: 'Số dòng mỗi trang:',
    rangeSeparatorText: 'của',
    selectAllRowsItem: true,
    selectAllRowsItemText: 'Tất cả',
  };

  /**
   * Custom styles for DataTable (styled like GridJS template)
   */
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
    headCells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
      },
    },
    cells: {
      style: {
        paddingLeft: '16px',
        paddingRight: '16px',
        fontSize: '14px',
      },
    },
    rows: {
      style: {
        minHeight: '60px',
        '&:hover': {
          backgroundColor: '#f8f9fa',
          transition: 'all 0.3s ease',
        },
      },
    },
    pagination: {
      style: {
        borderTop: '1px solid #dee2e6',
        padding: '15px',
      },
      pageButtonsStyle: {
        borderRadius: '4px',
        height: '35px',
        width: '35px',
        padding: '8px',
        margin: '0 2px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        border: '1px solid #e9ecef',
        backgroundColor: '#ffffff',
        color: '#495057',
        fill: '#495057',
        '&:hover:not(:disabled)': {
          backgroundColor: 'var(--primary-color)',
          color: '#ffffff',
          borderColor: 'var(--primary-color)',
        },
        '&:disabled': {
          cursor: 'not-allowed',
          opacity: '0.5',
        },
      },
    },
  };

  /**
   * Handle view detail button click
   */
  const handleViewDetail = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setShowDetailModal(true);
  };

  /**
   * Handle edit button click from detail modal
   */
  const handleEditFromDetail = () => {
    if (selectedTeacher && onEdit) {
      onEdit(selectedTeacher);
    }
  };

  /**
   * Handle delete button click from detail modal
   */
  const handleDeleteFromDetail = () => {
    if (selectedTeacher) {
      handleDelete(selectedTeacher);
    }
  };

  /**
   * Handle edit button click
   */
  const handleEdit = (teacher: Teacher) => {
    if (onEdit) {
      onEdit(teacher);
    }
  };

  /**
   * Handle delete button click - opens confirmation dialog
   */
  const handleDelete = (teacher: Teacher) => {
    setTeacherToDelete(teacher);
    setShowDeleteDialog(true);
    setDeleteError(null);
  };

  /**
   * Handle delete cancellation
   */
  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setTeacherToDelete(null);
    setDeleteError(null);
  };

  /**
   * Confirm and execute delete operation
   */
  const confirmDelete = async () => {
    if (!teacherToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(`/api/teachers/${teacherToDelete.maGV}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể xóa giáo viên');
      }

      // Call the onDelete callback if provided
      if (onDelete) {
        onDelete(teacherToDelete.maGV);
      }

      // Remove the deleted teacher from the list
      setTeachers((prevTeachers) =>
        prevTeachers.filter((t) => t.maGV !== teacherToDelete.maGV)
      );

      // Close the dialog
      setShowDeleteDialog(false);
      setTeacherToDelete(null);
    } catch (err) {
      console.error('Error deleting teacher:', err);
      setDeleteError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsDeleting(false);
    }
  };

  /**
   * Render loading state
   */
  if (loading) {
    return (
      <Card className="custom-card">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" role="status" variant="primary">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-3 text-muted">Đang tải danh sách giáo viên...</p>
        </Card.Body>
      </Card>
    );
  }

  /**
   * Render error state
   */
  if (error) {
    return (
      <Card className="custom-card">
        <Card.Body>
          <Alert variant="danger">
            <Alert.Heading>Lỗi khi tải dữ liệu</Alert.Heading>
            <p className="mb-0">{error}</p>
          </Alert>
          <SpkButton
            Buttonvariant="primary"
            Customclass="btn-sm mt-3"
            onClickfunc={fetchTeachers}
          >
            <i className="ri-refresh-line me-2"></i>Thử lại
          </SpkButton>
        </Card.Body>
      </Card>
    );
  }

  /**
   * Render empty state
   */
  if (teachers.length === 0) {
    return (
      <Card className="custom-card">
        <Card.Body className="text-center py-5">
          <i className="ri-team-line fs-1 text-muted"></i>
          <p className="mt-3 text-muted">Chưa có giáo viên nào trong hệ thống</p>
        </Card.Body>
      </Card>
    );
  }

  /**
   * Render main component
   */
  return (
    <>
      {deleteError && (
        <Alert variant="danger" dismissible onClose={() => setDeleteError(null)} className="mb-3 shadow-sm">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <i className="ri-error-warning-line fs-4"></i>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="alert-heading mb-1 fw-semibold">Lỗi khi xóa giáo viên</h6>
              <p className="mb-0">{deleteError}</p>
            </div>
          </div>
        </Alert>
      )}

      <Card className="custom-card border-0 shadow-sm">
        <Card.Header className="justify-content-between border-bottom">
          {/* Search Bar */}
          <div className="d-flex align-items-center gap-2">
            <div className="avatar avatar-md bg-primary-transparent rounded">
              <i className="ri-team-line fs-5 text-primary"></i>
            </div>
            <h5 className="card-title mb-0 fw-semibold">Danh sách Giáo viên</h5>
            <span className="badge bg-primary-transparent fs-12">
              {filteredTeachers.length}/{teachers.length}
            </span>
          </div>

          {/* Filters Section */}
          <Row className="gy-2 align-items-center" style={{ maxWidth: '850px' }}>
            {/* Search */}
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

            {/* Gender Filter */}
            <Col xs="auto">
              <Form.Select
                size="sm"
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value)}
                style={{ minWidth: '130px' }}
              >
                <option value="">Giới tính</option>
                <option value="1">👨 Nam</option>
                <option value="0">👩 Nữ</option>
              </Form.Select>
            </Col>

            {/* Department Filter */}
            <Col xs="auto">
              <Form.Select
                size="sm"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
                style={{ minWidth: '140px' }}
              >
                <option value="">Bộ môn</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </Form.Select>
            </Col>

            {/* Sort By */}
            <Col xs="auto">
              <Form.Select
                size="sm"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{ minWidth: '140px' }}
              >
                <option value="">Sắp xếp</option>
                <option value="name">Theo tên</option>
                <option value="date">Mới nhất</option>
              </Form.Select>
            </Col>

            {/* Refresh Button */}
            <Col xs="auto">
              <SpkButton
                Buttonvariant=""
                Customclass="btn btn-icon btn-sm btn-light btn-wave"
                onClickfunc={fetchTeachers}
                aria-label="Refresh"
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
              data={filteredTeachers}
              pagination
              paginationComponentOptions={paginationComponentOptions}
              paginationPerPage={10}
              paginationRowsPerPageOptions={[10, 20, 30, 50, 100]}
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
      </Card>

      <DeleteConfirmationDialog
        show={showDeleteDialog}
        teacherName={teacherToDelete?.hoTen}
        teacherId={teacherToDelete?.maGV}
        onConfirm={confirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      <TeacherDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        teacher={selectedTeacher}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />
    </>
  );
};

export default TeacherList;
