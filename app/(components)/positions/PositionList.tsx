"use client"

import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Spinner, Badge } from 'react-bootstrap';

interface Position {
  maChucVu: string;
  tenChucVu: string;
  moTa?: string;
}

interface PositionListProps {
  onEdit: (position: Position) => void;
  onDelete: (position: Position) => void;
}

const PositionList: React.FC<PositionListProps> = ({ onEdit, onDelete }) => {
  const [positions, setPositions] = useState<Position[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPositions();
  }, []);

  const fetchPositions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch('/api/positions');

      if (!response.ok) {
        throw new Error('Không thể tải danh sách chức vụ');
      }

      const data = await response.json();
      setPositions(data);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching positions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredPositions = positions.filter(position =>
    position.tenChucVu.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.maChucVu.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <Card className="custom-card">
        <Card.Body className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3 text-muted">Đang tải dữ liệu...</p>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="custom-card">
        <Card.Body>
          <div className="alert alert-danger" role="alert">
            <i className="ri-error-warning-line me-2"></i>
            {error}
          </div>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="custom-card">
      <Card.Header className="d-flex justify-content-between align-items-center">
        <Card.Title className="mb-0">
          <i className="ri-shield-user-line me-2"></i>
          Danh sách Chức vụ ({filteredPositions.length})
        </Card.Title>
        <div className="search-box">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Tìm kiếm chức vụ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ minWidth: '250px' }}
          />
        </div>
      </Card.Header>
      <Card.Body className="p-0">
        <div className="table-responsive">
          <Table className="table text-nowrap mb-0" hover>
            <thead>
              <tr>
                <th className="bg-light" style={{ width: '5%' }}>STT</th>
                <th className="bg-light" style={{ width: '15%' }}>Mã chức vụ</th>
                <th className="bg-light" style={{ width: '25%' }}>Tên chức vụ</th>
                <th className="bg-light" style={{ width: '40%' }}>Mô tả</th>
                <th className="bg-light text-center" style={{ width: '15%' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredPositions.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-5 text-muted">
                    <i className="ri-inbox-line fs-2 d-block mb-2"></i>
                    {searchTerm ? 'Không tìm thấy chức vụ phù hợp' : 'Chưa có chức vụ nào'}
                  </td>
                </tr>
              ) : (
                filteredPositions.map((position, index) => (
                  <tr key={position.maChucVu}>
                    <td className="fw-medium">{index + 1}</td>
                    <td>
                      <Badge bg="primary-transparent" className="fs-11">
                        {position.maChucVu}
                      </Badge>
                    </td>
                    <td className="fw-semibold">{position.tenChucVu}</td>
                    <td className="text-muted">
                      {position.moTa || <span className="text-muted fst-italic">Chưa có mô tả</span>}
                    </td>
                    <td className="text-center">
                      <div className="btn-group btn-group-sm" role="group">
                        <Button
                          variant="info-transparent"
                          size="sm"
                          onClick={() => onEdit(position)}
                          title="Chỉnh sửa"
                        >
                          <i className="ri-edit-line"></i>
                        </Button>
                        <Button
                          variant="danger-transparent"
                          size="sm"
                          onClick={() => onDelete(position)}
                          title="Xóa"
                        >
                          <i className="ri-delete-bin-line"></i>
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
      {filteredPositions.length > 0 && (
        <Card.Footer className="border-top-0">
          <div className="d-flex align-items-center justify-content-between">
            <div className="text-muted">
              Hiển thị {filteredPositions.length} chức vụ
            </div>
          </div>
        </Card.Footer>
      )}
    </Card>
  );
};

export default PositionList;
