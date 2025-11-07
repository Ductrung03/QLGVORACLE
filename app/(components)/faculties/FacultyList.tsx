"use client"

import React, { useState, useEffect, useMemo } from 'react';
import { Card, Spinner, Alert, Form, Row, Col, InputGroup } from 'react-bootstrap';
import SpkButton from '@/shared/@spk-reusable-components/general-reusable/reusable-uielements/spk-buttons';
import DeleteConfirmationDialog from './DeleteConfirmationDialog';
import FacultyDetailModal from './FacultyDetailModal';
import dynamic from "next/dynamic";
const DataTable = dynamic(() => import("react-data-table-component"), { ssr: false });

interface Faculty {
  maKhoa: string;
  tenKhoa: string;
  diaChi: string;
  maChuNhiemKhoa?: string;
  tenChuNhiem?: string;
}

interface FacultyListProps {
  onEdit?: (faculty: Faculty) => void;
  onDelete?: (facultyId: string) => void;
}

const FacultyList: React.FC<FacultyListProps> = ({ onEdit, onDelete }) => {
  const [faculties, setFaculties] = useState<Faculty[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState<boolean>(false);
  const [facultyToDelete, setFacultyToDelete] = useState<Faculty | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const fetchFaculties = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/faculties');
      if (!response.ok) throw new Error(`Failed to fetch: ${response.statusText}`);
      const data = await response.json();
      setFaculties(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFaculties();
  }, []);

  const handleViewDetail = (faculty: Faculty) => {
    setSelectedFaculty(faculty);
    setShowDetailModal(true);
  };

  const handleEditFromDetail = () => {
    if (selectedFaculty && onEdit) {
      onEdit(selectedFaculty);
    }
  };

  const handleDeleteFromDetail = () => {
    if (selectedFaculty) {
      handleDelete(selectedFaculty);
    }
  };

  const handleEdit = (faculty: Faculty) => {
    if (onEdit) {
      onEdit(faculty);
    }
  };

  const handleDelete = (faculty: Faculty) => {
    setFacultyToDelete(faculty);
    setShowDeleteDialog(true);
    setDeleteError(null);
  };

  const handleCancelDelete = () => {
    setShowDeleteDialog(false);
    setFacultyToDelete(null);
    setDeleteError(null);
  };

  const confirmDelete = async () => {
    if (!facultyToDelete) return;

    try {
      setIsDeleting(true);
      setDeleteError(null);

      const response = await fetch(`/api/faculties/${facultyToDelete.maKhoa}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Không thể xóa khoa');
      }

      if (onDelete) {
        onDelete(facultyToDelete.maKhoa);
      }

      setFaculties((prevFaculties) =>
        prevFaculties.filter((f) => f.maKhoa !== facultyToDelete.maKhoa)
      );

      setShowDeleteDialog(false);
      setFacultyToDelete(null);
    } catch (err) {
      console.error('Error deleting faculty:', err);
      setDeleteError(err instanceof Error ? err.message : 'Lỗi không xác định');
    } finally {
      setIsDeleting(false);
    }
  };

  const columns: any = useMemo(() => [
    {
      name: 'MÃ KHOA',
      cell: (row: Faculty) => (
        <span className="badge bg-info-transparent fw-semibold">{row.maKhoa}</span>
      ),
      sortable: true,
      width: '120px',
    },
    {
      name: 'TÊN KHOA',
      cell: (row: Faculty) => (
        <div className="d-flex align-items-center py-2">
          <div className="me-3">
            <span className="avatar avatar-md avatar-rounded bg-info-transparent">
              <i className="ri-building-line fs-5 text-info"></i>
            </span>
          </div>
          <div>
            <p className="mb-0 fw-semibold text-dark">{row.tenKhoa}</p>
            <p className="mb-0 text-muted fs-12">
              <i className="ri-map-pin-line me-1"></i>
              {row.diaChi || 'Chưa cập nhật'}
            </p>
          </div>
        </div>
      ),
      sortable: true,
      grow: 2.5,
    },
    {
      name: 'ĐỊA CHỈ',
      cell: (row: Faculty) => (
        <div className="text-truncate" style={{ maxWidth: '250px' }} title={row.diaChi || 'Chưa cập nhật'}>
          <i className="ri-home-4-line me-1 text-muted"></i>
          <span className="text-muted fs-13">{row.diaChi || 'Chưa cập nhật'}</span>
        </div>
      ),
      sortable: true,
      grow: 2,
    },
    {
      name: 'CHỦ NHIỆM',
      cell: (row: Faculty) => (
        <div>
          {row.tenChuNhiem ? (
            <span className="badge bg-success-transparent">
              <i className="ri-user-star-line me-1"></i>
              {row.tenChuNhiem}
            </span>
          ) : (
            <span className="text-muted fs-12">Chưa có</span>
          )}
        </div>
      ),
      sortable: true,
      width: '200px',
    },
    {
      name: 'HÀNH ĐỘNG',
      cell: (row: Faculty) => (
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
            onClickfunc={() => handleDelete(row)}
          >
            <i className="ri-delete-bin-line"></i>
          </SpkButton>
        </div>
      ),
      width: '160px',
    },
  ], [onEdit]);

  const filteredFaculties = useMemo(() => {
    let filtered = [...faculties];
    if (searchText) {
      filtered = filtered.filter(faculty =>
        faculty.tenKhoa.toLowerCase().includes(searchText.toLowerCase()) ||
        faculty.maKhoa.toLowerCase().includes(searchText.toLowerCase()) ||
        faculty.diaChi?.toLowerCase().includes(searchText.toLowerCase())
      );
    }
    return filtered;
  }, [faculties, searchText]);

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
          <p className="mt-3 text-muted">Đang tải danh sách khoa...</p>
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
          <SpkButton Buttonvariant="primary" Customclass="btn-sm mt-3" onClickfunc={fetchFaculties}>
            <i className="ri-refresh-line me-2"></i>Thử lại
          </SpkButton>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {deleteError && (
        <Alert variant="danger" dismissible onClose={() => setDeleteError(null)} className="mb-3 shadow-sm">
          <div className="d-flex align-items-center">
            <div className="flex-shrink-0">
              <i className="ri-error-warning-line fs-4"></i>
            </div>
            <div className="flex-grow-1 ms-3">
              <h6 className="alert-heading mb-1 fw-semibold">Lỗi khi xóa khoa</h6>
              <p className="mb-0">{deleteError}</p>
            </div>
          </div>
        </Alert>
      )}

      <Card className="custom-card border-0 shadow-sm">
        <Card.Header className="justify-content-between border-bottom">
          <div className="d-flex align-items-center gap-2">
            <div className="avatar avatar-md bg-info-transparent rounded">
              <i className="ri-building-line fs-5 text-info"></i>
            </div>
            <h5 className="card-title mb-0 fw-semibold">Danh sách Khoa</h5>
            <span className="badge bg-info-transparent fs-12">
              {filteredFaculties.length}/{faculties.length}
            </span>
          </div>

          <Row className="gy-2 align-items-center" style={{ maxWidth: '350px' }}>
            <Col xs="auto">
              <InputGroup size="sm" style={{ minWidth: '250px' }}>
                <InputGroup.Text className="bg-light border-end-0">
                  <i className="ri-search-line text-muted"></i>
                </InputGroup.Text>
                <Form.Control
                  type="search"
                  placeholder="Tìm kiếm khoa..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="border-start-0"
                />
              </InputGroup>
            </Col>
            <Col xs="auto">
              <SpkButton
                Buttonvariant=""
                Customclass="btn btn-icon btn-sm btn-light btn-wave"
                onClickfunc={fetchFaculties}
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
              data={filteredFaculties}
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
      </Card>

      <DeleteConfirmationDialog
        show={showDeleteDialog}
        facultyName={facultyToDelete?.tenKhoa}
        facultyId={facultyToDelete?.maKhoa}
        onConfirm={confirmDelete}
        onCancel={handleCancelDelete}
        isDeleting={isDeleting}
      />

      <FacultyDetailModal
        show={showDetailModal}
        onHide={() => setShowDetailModal(false)}
        faculty={selectedFaculty}
        onEdit={handleEditFromDetail}
        onDelete={handleDeleteFromDetail}
      />
    </>
  );
};

export default FacultyList;
